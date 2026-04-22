import { NextResponse } from 'next/server';
import { startWatcher } from '@/lib/watcher';

export async function GET() {
  startWatcher();
  return NextResponse.json({ status: 'Watcher started' });
}
