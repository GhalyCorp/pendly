import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

console.log('DEBUG: send-reward-email endpoint loaded');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST() {
  console.log('DEBUG: send-reward-email endpoint DISABLED - use Firebase function instead');
  return NextResponse.json({ error: 'This endpoint is disabled. Use Firebase function instead.' }, { status: 410 });
} 