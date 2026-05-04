import type { Segment } from '../types';

function parseTimestamp(ts: string): number {
  const [hms = '0:0:0', msStr = '0'] = ts.trim().split(',');
  const [h = 0, m = 0, s = 0] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(msStr) / 1000;
}

export function parseSrt(srt: string): Segment[] {
  return srt
    .trim()
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, i) => {
      const lines = block.split('\n');
      const timeLine = lines[1] ?? '';
      const [startStr = '', endStr = ''] = timeLine.split(' --> ');
      return {
        id: i + 1,
        start: parseTimestamp(startStr),
        end: parseTimestamp(endStr),
        text: lines.slice(2).join('\n').trim(),
      };
    });
}
