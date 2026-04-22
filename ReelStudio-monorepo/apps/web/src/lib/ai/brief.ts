import Groq from 'groq-sdk';
import { MediaFile, BriefOptions, VideoBrief } from '@reelstudio/types';
import db from '../db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import MusicTempo from 'music-tempo';
import { AudioContext } from 'node-web-audio-api';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder' });

const calcTempo = function (buffer: AudioBuffer) {
  let audioData: number[] | Float32Array = [];
  if (buffer.numberOfChannels === 2) {
    const channel1Data = buffer.getChannelData(0);
    const channel2Data = buffer.getChannelData(1);
    const length = channel1Data.length;
    for (let i = 0; i < length; i++) {
      audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
    }
  } else {
    audioData = buffer.getChannelData(0);
  }
  const mt = new MusicTempo(audioData);
  return mt.tempo;
};

export async function generateVideoBrief(
  mediaFiles: MediaFile[],
  options: BriefOptions
): Promise<VideoBrief> {
  if (mediaFiles.length === 0) {
    throw new Error('No media files provided to generate brief.');
  }

  const descriptions = mediaFiles.map((m) => {
    let metaStr = '';
    try {
      if (m.metadata_json) {
        metaStr = JSON.stringify(JSON.parse(m.metadata_json));
      }
    } catch (e) {
      metaStr = '{}';
    }

    return `ID: ${m.id} | Type: ${m.media_type} | Metadata: ${metaStr}`;
  });

  const systemPrompt = `You are a professional video editor. Given a list of analyzed media files with mood scores and descriptions, create a compelling social media video brief.
The user wants a video with aspect ratio ${options.aspect_ratio} and style ${options.style}. Max shots allowed: ${options.max_shots}.
Respond ONLY with a valid JSON object matching the required schema. DO NOT wrap the JSON in markdown code blocks.`;

  const userPrompt = `
Here are the analyzed media files:
${descriptions.join('\n')}

Select the best ${Math.min(15, options.max_shots)} shots ranked by quality and narrative flow.
Assign a Remotion template to each shot (choose from: 'fade_slide', 'ken_burns', 'zoom_in', 'split_reveal', 'text_overlay').
Write a caption for each shot (max 8 words).
Suggest an overall music_mood (e.g., 'cinematic', 'playful', 'emotional', 'epic', 'minimal').
Set aspect_ratio to '${options.aspect_ratio}'.
Set duration_seconds to an appropriate total duration based on the shots selected.

Return exactly this JSON schema:
{
  "title": "A catchy title for the video",
  "style": "${options.style}",
  "shots": [
    {
      "media_file_id": number,
      "template": "fade_slide" | "ken_burns" | "zoom_in" | "split_reveal" | "text_overlay",
      "duration": number (in seconds),
      "caption": "short caption",
      "transition": "crossfade" | "cut" | "wipe"
    }
  ],
  "music_mood": "string",
  "aspect_ratio": "${options.aspect_ratio}",
  "duration_seconds": number
}
  `;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error('No text response from Groq');
    }

    const rawJsonStr = textContent;
    const jsonStr = rawJsonStr.replace(/```json\n?|\n?```/g, '').trim();

    const partialBrief = JSON.parse(jsonStr);
    const briefId = crypto.randomUUID();

    // Beat sync logic
    const musicPath = path.join(process.cwd(), 'public', 'music', `${partialBrief.music_mood}.mp3`);
    let hasMusic = false;

    if (fs.existsSync(musicPath)) {
      hasMusic = true;
      try {
        const audioData = fs.readFileSync(musicPath);
        const context = new AudioContext();
        const buffer = await context.decodeAudioData(audioData.buffer);
        const bpm = calcTempo(buffer);
        
        // 1 beat duration in seconds
        const beatDuration = 60 / Math.round(bpm);
        
        // Snap shots to nearest beat
        let newTotalDuration = 0;
        partialBrief.shots.forEach((shot: { duration: number }) => {
          // Snap duration to nearest multiple of beatDuration
          const beatsInShot = Math.max(1, Math.round(shot.duration / beatDuration));
          shot.duration = parseFloat((beatsInShot * beatDuration).toFixed(2));
          newTotalDuration += shot.duration;
        });
        
        // Slightly adjust total duration
        partialBrief.duration_seconds = Math.round(newTotalDuration);
        console.log(`Beat-synced shots to ${Math.round(bpm)} BPM.`);
      } catch (err) {
        console.warn('Failed to beat-sync, ignoring:', err);
      }
    }

    const finalBrief: VideoBrief = {
      id: briefId,
      ...partialBrief,
      has_music: hasMusic
    };

    // Save to sqlite DB
    const stmt = db.prepare(`
      INSERT INTO video_briefs (title, style, shots_json, music_mood, aspect_ratio, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      finalBrief.title,
      finalBrief.style,
      JSON.stringify(finalBrief.shots),
      finalBrief.music_mood,
      finalBrief.aspect_ratio,
      finalBrief.duration_seconds
    );

    return finalBrief;
  } catch (error) {
    console.error('Failed to generate video brief:', error);
    throw error;
  }
}
