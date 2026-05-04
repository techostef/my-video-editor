import { NextResponse } from 'next/server';

const HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function withCors(res: NextResponse): NextResponse {
  Object.entries(HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export function preflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}
