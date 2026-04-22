import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const stmt = db.prepare('SELECT * FROM render_jobs WHERE id = ?');
    const job = stmt.get(jobId) as any;

    if (!job || !job.output_path || !fs.existsSync(job.output_path)) {
      return new NextResponse('File not found or not finished', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(job.output_path);

    const res = new NextResponse(fileBuffer);
    res.headers.set('Content-Type', 'video/mp4');
    res.headers.set('Content-Disposition', `attachment; filename="${jobId}_compressed.mp4"`);

    return res;
  } catch (error) {
    return new NextResponse(String(error), { status: 500 });
  }
}
