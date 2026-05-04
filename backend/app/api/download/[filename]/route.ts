import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { withCors, preflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    // Allow only output-<uuid>.mp4 — prevent path traversal
    if (!/^output-[a-f0-9-]{36}\.mp4$/.test(filename)) {
      return withCors(NextResponse.json({ error: 'Invalid filename' }, { status: 400 }));
    }

    const filePath = path.join(os.tmpdir(), filename);
    const buffer = await readFile(filePath);

    unlink(filePath).catch(() => {});

    return withCors(new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="subtitled-video.mp4"',
        'Content-Length': buffer.length.toString(),
      },
    }));
  } catch (err) {
    console.error('[download]', err);
    return withCors(NextResponse.json({ error: 'File not found' }, { status: 404 }));
  }
}
