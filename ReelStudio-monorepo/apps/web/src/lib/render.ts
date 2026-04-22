import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import ffmpeg from 'fluent-ffmpeg';

interface RenderJob {
  jobId: string;
  briefId: string;
}

const renderQueue: RenderJob[] = [];
let isRendering = false;

const REELSTUDIO_DIR = path.join(os.homedir(), 'ReelStudio');
const LOGS_DIR = path.join(REELSTUDIO_DIR, 'logs');
const OUTPUTS_DIR = path.join(REELSTUDIO_DIR, 'outputs');

// Ensure dirs exist
[LOGS_DIR, OUTPUTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export function clearQueue(): number {
  // Remove queued jobs from in-memory queue
  const queuedJobs = renderQueue.length;
  renderQueue.length = 0;
  
  // Update DB status for queued jobs to 'cancelled'
  const result = db.prepare("UPDATE render_jobs SET status = 'cancelled', finished_at = CURRENT_TIMESTAMP WHERE status = 'queued'").run();
  
  return queuedJobs;
}

export function triggerRender(briefId: string): string {
  const jobId = uuidv4();
  
  // Create DB record
  const stmt = db.prepare(`
    INSERT INTO render_jobs (id, brief_id, status, log_path)
    VALUES (?, ?, ?, ?)
  `);
  
  const logPath = path.join(LOGS_DIR, `${jobId}.log`);
  stmt.run(jobId, briefId, 'queued', logPath);

  renderQueue.push({ jobId, briefId });
  
  // Kick off queue without waiting
  processQueue();

  return jobId;
}

async function processQueue() {
  if (isRendering || renderQueue.length === 0) return;
  isRendering = true;

  const job = renderQueue.shift()!;
  
  try {
    // 1. Fetch brief from DB
    const briefRow = db.prepare('SELECT * FROM video_briefs WHERE id = ?').get(job.briefId) as any;
    if (!briefRow) throw new Error('Brief not found');

    const shots = JSON.parse(briefRow.shots_json) as any[];

    // Resolve each shot's media_file_id to its public_path
    const mediaStmt = db.prepare('SELECT id, public_path FROM media_files WHERE id = ?');
    for (const shot of shots) {
      if (shot.media_file_id) {
        const media = mediaStmt.get(shot.media_file_id) as { id: number; public_path: string } | undefined;
        if (media) {
          shot.public_path = media.public_path;
        }
      }
    }

    const brief = {
      ...briefRow,
      shots,
    };

    // 2. Write brief to apps/renderer/brief.json (which is actually mapped to monorepo root)
    const rootDir = path.join(process.cwd(), '../..');
    const briefJsonPath = path.join(rootDir, 'brief.json');
    fs.writeFileSync(briefJsonPath, JSON.stringify(brief, null, 2));

    // 3. Update status
    db.prepare('UPDATE render_jobs SET status = ? WHERE id = ?').run('rendering', job.jobId);

    // 4. Spawn remotion render
    const logPath = path.join(LOGS_DIR, `${job.jobId}.log`);
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });

    const remotionProcess = spawn('pnpm', ['--filter', 'renderer', 'render'], {
      cwd: rootDir,
    });

    remotionProcess.stdout.pipe(logStream);
    remotionProcess.stderr.pipe(logStream);

    await new Promise<void>((resolve, reject) => {
      remotionProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Render failed with code ${code}`));
      });
    });

    // 5. Move output
    const rendererOutPath = path.join(rootDir, 'apps', 'renderer', 'out', 'video.mp4');
    const finalOutputPath = path.join(OUTPUTS_DIR, `${job.jobId}.mp4`);
    
    if (fs.existsSync(rendererOutPath)) {
      fs.copyFileSync(rendererOutPath, finalOutputPath);
    } else {
      throw new Error('Output file not found after render');
    }

    // 6. Post-process compression
    const compressedOutputPath = path.join(OUTPUTS_DIR, `${job.jobId}_compressed.mp4`);
    logStream.write('\n\n--- Starting Compression ---\n');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(finalOutputPath)
        .outputOptions([
          '-vcodec libx264',
          '-crf 23',
          '-preset fast',
          '-acodec aac'
        ])
        .output(compressedOutputPath)
        .on('end', () => resolve())
        .on('error', (err) => {
          logStream.write(`Compression error: ${err.message}\n`);
          reject(err);
        })
        .run();
    });

    logStream.write('Compression finished successfully.\n');
    logStream.end();

    // 7. Mark as done
    db.prepare('UPDATE render_jobs SET status = ?, finished_at = CURRENT_TIMESTAMP, output_path = ? WHERE id = ?')
      .run('done', compressedOutputPath, job.jobId);

  } catch (error) {
    console.error(`Job ${job.jobId} failed:`, error);
    db.prepare('UPDATE render_jobs SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('failed', job.jobId);
  } finally {
    isRendering = false;
    processQueue();
  }
}
