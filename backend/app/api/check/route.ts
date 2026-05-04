import { NextResponse } from 'next/server';
import { withCors, preflight } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function GET() {
  return withCors(NextResponse.json({ message: 'Hello from check API' }));
}

