import { NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const stmt = db.prepare('SELECT * FROM media_files ORDER BY created_at DESC');
  const files = stmt.all();
  return NextResponse.json(files);
}

export async function DELETE() {
  try {
    // Get all media records
    const stmt = db.prepare('SELECT * FROM media_files');
    const mediaFiles = stmt.all() as any[];

    // Delete all files from the public directory
    for (const media of mediaFiles) {
      const publicFilePath = path.join(process.cwd(), 'public', media.public_path);
      if (fs.existsSync(publicFilePath)) {
        fs.unlinkSync(publicFilePath);
      }
    }

    // Delete all records from DB
    db.prepare('DELETE FROM media_files').run();

    return NextResponse.json({ success: true, deleted_count: mediaFiles.length });
  } catch (error) {
    console.error('Failed to delete all media:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
