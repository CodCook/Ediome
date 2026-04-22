import { NextRequest, NextResponse } from 'next/server';
import { triggerRender, clearQueue } from '@/lib/render';

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json();
    if (!briefId) {
      return NextResponse.json({ error: 'Missing briefId' }, { status: 400 });
    }

    const jobId = triggerRender(briefId);
    return NextResponse.json({ jobId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const clearedCount = clearQueue();
    return NextResponse.json({ success: true, cleared_count: clearedCount });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
