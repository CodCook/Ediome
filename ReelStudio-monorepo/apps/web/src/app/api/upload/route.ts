import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const publicMediaDir = path.join(process.cwd(), 'public', 'media');
    if (!fs.existsSync(publicMediaDir)) {
      fs.mkdirSync(publicMediaDir, { recursive: true });
    }

    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name).toLowerCase();
      
      // Generate a unique filename to avoid collisions
      const filename = `${uuidv4()}${ext}`;
      const destPath = path.join(publicMediaDir, filename);
      const publicPath = `/media/${filename}`;

      fs.writeFileSync(destPath, buffer);

      const mediaType = ['.mp4', '.mov'].includes(ext) ? 'video' : 'photo';
      
      const stmt = db.prepare(`
        INSERT INTO media_files (filename, file_path, public_path, media_type, status, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(file.name, destPath, publicPath, mediaType, 'new', null);
      results.push(file.name);
    }

    return NextResponse.json({ success: true, uploaded: results.length });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
