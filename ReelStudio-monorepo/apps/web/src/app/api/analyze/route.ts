import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { analyzeMediaFile } from '@/lib/ai/analyze';
import { MediaFile } from '@reelstudio/types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST() {
  try {
    const stmt = db.prepare('SELECT * FROM media_files WHERE status = ?');
    const newFiles = stmt.all('new') as MediaFile[];

    const results = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const result = await analyzeMediaFile(file);
        results.push({ id: file.id, status: 'success', metadata: result });
      } catch (error) {
        results.push({ id: file.id, status: 'error', error: String(error) });
      }
      
      // Delay 3 seconds between each file to respect free tier rate limits
      if (i < newFiles.length - 1) {
        await sleep(3000);
      }
    }

    return NextResponse.json({
      analyzed_count: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error'),
      results
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
