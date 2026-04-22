import Groq from 'groq-sdk';
import { MediaFile, MediaAnalysis } from '@reelstudio/types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import imageSize from 'image-size';
import db from '../db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder' });

interface VideoMeta {
  duration: number;
  width: number;
  height: number;
}

// Helper to get video duration and dimensions
function getVideoMetadata(filePath: string): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find(s => s.codec_type === 'video');
      resolve({
        duration: metadata.format.duration || 0,
        width: stream?.width || 1920,
        height: stream?.height || 1080
      });
    });
  });
}

// Helper to extract first frame from video
function extractFirstFrame(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const filename = `frame-${Date.now()}.jpg`;
    const outputPath = path.join(tempDir, filename);

    ffmpeg(filePath)
      .screenshots({
        timestamps: ['00:00:00.100'], // take frame at 0.1s
        filename,
        folder: tempDir,
        size: '1280x720', // scale down to save token cost
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
}

// Convert local file to base64
function fileToBase64(filePath: string): string {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

// Helper for sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzeMediaFile(mediaFile: MediaFile, retryCount = 0): Promise<any> {
  try {
    let imagePath = mediaFile.file_path;
    let videoDuration = 0;
    let width = 0;
    let height = 0;

    if (mediaFile.media_type === 'video') {
      imagePath = await extractFirstFrame(mediaFile.file_path);
      const meta = await getVideoMetadata(mediaFile.file_path);
      videoDuration = meta.duration;
      width = meta.width;
      height = meta.height;
    } else {
      const dims = imageSize(fs.readFileSync(mediaFile.file_path));
      width = dims.width || 0;
      height = dims.height || 0;
    }

    let orientation: 'portrait' | 'landscape' | 'square' = 'square';
    if (width > height * 1.1) orientation = 'landscape';
    else if (height > width * 1.1) orientation = 'portrait';

    const base64Image = fileToBase64(imagePath);
    
    // Dynamic MIME type resolution based on file extension
    let mediaType = 'image/jpeg';
    const ext = path.extname(imagePath).toLowerCase();
    if (ext === '.png') {
      mediaType = 'image/png';
    } else if (ext === '.webp') {
      mediaType = 'image/webp';
    }

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert media analyst. Analyze the provided image and extract its properties. Return only a valid JSON object.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and return a JSON object matching this schema exactly:\n{\n  "scene_description": "detailed description of the scene",\n  "mood": "one of: cinematic, playful, emotional, epic, calm, energetic, minimal",\n  "quality_score": number between 1 and 10,\n  "dominant_colors": ["color1", "color2"],\n  "has_people": boolean,\n  "suggested_caption": "short caption, max 8 words"\n}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            }
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Cleanup temp file
    if (mediaFile.media_type === 'video' && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error('No text response from Groq');
    }

    // Try to parse the JSON
    const jsonStr = textContent.replace(/```json\n?|\n?```/g, '').trim();
    const analysis: MediaAnalysis = JSON.parse(jsonStr);

    // If it's a video, add duration into metadata. Always add dimensions.
    const finalMetadata = {
      ...analysis,
      width,
      height,
      orientation,
      ...(mediaFile.media_type === 'video' ? { duration: videoDuration } : {}),
    };

    // Save to database
    const stmt = db.prepare('UPDATE media_files SET status = ?, metadata_json = ? WHERE id = ?');
    stmt.run('analyzed', JSON.stringify(finalMetadata), mediaFile.id);

    return finalMetadata;

  } catch (error: any) {
    // Check if it's a rate limit error (429)
    if (error?.status === 429 && retryCount < 3) {
      console.log(`[Rate Limit Hit] Waiting 20 seconds before retrying (Attempt ${retryCount + 1}/3)...`);
      await sleep(20000); // Wait 20 seconds
      return analyzeMediaFile(mediaFile, retryCount + 1);
    }

    console.error(`Failed to analyze media file ${mediaFile.id}:`, error);
    const stmt = db.prepare('UPDATE media_files SET status = ? WHERE id = ?');
    stmt.run('error', mediaFile.id);
    throw error;
  }
}
