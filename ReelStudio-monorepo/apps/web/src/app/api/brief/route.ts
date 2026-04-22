import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateVideoBrief } from '@/lib/ai/brief';
import { MediaFile, BriefOptions } from '@reelstudio/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BriefOptions;
    
    if (!body.aspect_ratio || !body.style || !body.max_shots) {
      return NextResponse.json({ error: 'Missing aspect_ratio, style, or max_shots' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM media_files WHERE status = ?');
    const analyzedFiles = stmt.all('analyzed') as MediaFile[];

    if (analyzedFiles.length === 0) {
      return NextResponse.json({ error: 'No analyzed media files found' }, { status: 400 });
    }

    const brief = await generateVideoBrief(analyzedFiles, body);

    return NextResponse.json(brief);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
