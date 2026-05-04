import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { transcribeVideo } from '@/lib/whisper';
import { trimVideo } from '@/lib/ffmpeg';
import { withCors, preflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  let uploadedPath: string | undefined;
  let trimmedPath: string | undefined;

  try {
    const formData = await req.formData();
    console.log("formData", formData);
    const file = formData.get('video');
    console.log("file", file);

    if (!file || typeof file === 'string') {
      return withCors(NextResponse.json({ error: 'No video file provided' }, { status: 400 }));
    }

    const buffer = Buffer.from(await new Response(file).arrayBuffer());
    const ext = path.extname((file as File).name ?? '') || '.mp4';
    uploadedPath = path.join(os.tmpdir(), `video-${randomUUID()}${ext}`);
    await writeFile(uploadedPath, buffer);

    const startTimeStr = formData.get('startTime');
    const endTimeStr = formData.get('endTime');
    const startTime = startTimeStr ? parseFloat(startTimeStr as string) : null;
    const endTime = endTimeStr ? parseFloat(endTimeStr as string) : null;

    let processPath = uploadedPath;
    if (startTime !== null && endTime !== null && (startTime > 0 || endTime !== null)) {
      trimmedPath = path.join(os.tmpdir(), `trimmed-${randomUUID()}.mp4`);
      await trimVideo(uploadedPath, trimmedPath, startTime, endTime);
      await unlink(uploadedPath);
      uploadedPath = undefined;
      processPath = trimmedPath;
    }

    const { segments, srt } = await transcribeVideo(processPath);

    return withCors(NextResponse.json({ filePath: processPath, segments, srt }));
  } catch (err) {
    console.error('[upload]', err);
    if (uploadedPath) await unlink(uploadedPath).catch(() => null);
    if (trimmedPath) await unlink(trimmedPath).catch(() => null);
    return withCors(NextResponse.json({ error: 'Processing failed' }, { status: 500 }));
  }
}
