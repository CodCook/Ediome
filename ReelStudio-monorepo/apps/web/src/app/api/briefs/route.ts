import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM video_briefs ORDER BY created_at DESC');
    const briefs = stmt.all();

    const formattedBriefs = briefs.map((b: any) => ({
      ...b,
      shots: JSON.parse(b.shots_json)
    }));

    return NextResponse.json(formattedBriefs);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
