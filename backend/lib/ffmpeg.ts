import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const ffmpegPath = path.join(
  process.cwd(),
  'node_modules',
  'ffmpeg-static',
  process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
);

export async function burnSubtitles(
  videoPath: string,
  srtPath: string,
  outputPath: string
): Promise<void> {
  // On Windows the colon in drive letters must be escaped as \: inside the filter graph
  const escapedSrt = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  const cmd = `"${ffmpegPath}" -i "${videoPath}" -vf "subtitles='${escapedSrt}'" -c:a copy "${outputPath}" -y`;
  await execAsync(cmd, { timeout: 300_000 });
}

// Uses input-side seeking (-ss before -i) for fast seek, then re-encodes a short
// segment so the output starts exactly at a keyframe boundary.
export async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number
): Promise<void> {
  const duration = endTime - startTime;
  const cmd = `"${ffmpegPath}" -ss ${startTime} -i "${inputPath}" -t ${duration} -c:v libx264 -preset ultrafast -c:a aac "${outputPath}" -y`;
  await execAsync(cmd, { timeout: 300_000 });
}
