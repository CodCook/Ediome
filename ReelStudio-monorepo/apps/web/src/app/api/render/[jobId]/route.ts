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

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    let logTail = '';
    if (job.log_path && fs.existsSync(job.log_path)) {
      const logs = fs.readFileSync(job.log_path, 'utf8');
      const lines = logs.split('\n');
      logTail = lines.slice(Math.max(lines.length - 20, 0)).join('\n');
    }

    return NextResponse.json({ ...job, logTail });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
