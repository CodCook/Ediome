import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import os from 'os';
import db from './db';
import { MediaFile } from '@reelstudio/types';
import { execSync } from 'child_process';

let isWatching = false;

function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch (error) {
    console.error('\n======================================================');
    console.error('ERROR: ffmpeg is not installed or not in PATH.');
    console.error('Reel Studio requires ffmpeg to process video files.');
    console.error('Please install it (e.g., `brew install ffmpeg` on macOS) and restart the app.');
    console.error('======================================================\n');
  }
}

export function startWatcher() {
  if (isWatching) return;
  isWatching = true;

  checkFfmpeg();

  const watchDir = path.join(os.homedir(), 'ReelStudio', 'media');
  const publicMediaDir = path.join(process.cwd(), 'public', 'media');

  if (!fs.existsSync(watchDir)) {
    fs.mkdirSync(watchDir, { recursive: true });
  }
  if (!fs.existsSync(publicMediaDir)) {
    fs.mkdirSync(publicMediaDir, { recursive: true });
  }

  const watcher = chokidar.watch(watchDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: true,
  });

  watcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.mp4', '.mov'].includes(ext)) {
      const filename = path.basename(filePath);
      const publicPath = `/media/${filename}`;
      const destPath = path.join(publicMediaDir, filename);

      fs.copyFileSync(filePath, destPath);

      const mediaType = ['.mp4', '.mov'].includes(ext) ? 'video' : 'photo';
      
      const stmt = db.prepare(`
        INSERT INTO media_files (filename, file_path, public_path, media_type, status, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(filename, filePath, publicPath, mediaType, 'new', null);
      console.log(`Added and logged media: ${filename}`);
    }
  });

  console.log(`Started watching ${watchDir}`);
}
