import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { burnSubtitles } from '@/lib/ffmpeg';
import { withCors, preflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  const id = randomUUID();
  const srtPath = path.join(os.tmpdir(), `subs-${id}.srt`);
  const outputPath = path.join(os.tmpdir(), `output-${id}.mp4`);

  try {
    const { filePath, srt } = await req.json();

    if (!filePath || !srt) {
      return withCors(NextResponse.json({ error: 'Missing filePath or srt' }, { status: 400 }));
    }

    await writeFile(srtPath, srt, 'utf-8');
    await burnSubtitles(filePath, srtPath, outputPath);

    return withCors(NextResponse.json({
      videoUrl: `/api/download/${path.basename(outputPath)}`,
    }));
  } catch (err) {
    console.error('[render]', err);
    await unlink(outputPath).catch(() => {});
    return withCors(NextResponse.json({ error: 'Render failed' }, { status: 500 }));
  } finally {
    await unlink(srtPath).catch(() => {});
  }
}
