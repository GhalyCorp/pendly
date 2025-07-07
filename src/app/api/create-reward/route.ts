import { NextResponse } from 'next/server';

export async function POST() {
  console.log('DEBUG: create-reward endpoint DISABLED - use Firebase function instead');
  return NextResponse.json({ error: 'This endpoint is disabled. Use Firebase function instead.' }, { status: 410 });
} 