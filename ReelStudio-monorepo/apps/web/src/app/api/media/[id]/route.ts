import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the media record
    const stmt = db.prepare('SELECT * FROM media_files WHERE id = ?');
    const media = stmt.get(id) as any;

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete the file from the public directory
    const publicFilePath = path.join(process.cwd(), 'public', media.public_path);
    if (fs.existsSync(publicFilePath)) {
      fs.unlinkSync(publicFilePath);
    }

    // Optional: if it was copied from the watcher, we could delete the source,
    // but for safety we'll only delete the app's copy and the DB record.

    // Delete from DB
    db.prepare('DELETE FROM media_files WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
