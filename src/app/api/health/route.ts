import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStripeKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    firebaseConfig: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'set' : 'not set',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'not set',
    },
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
    }
  };

  return NextResponse.json(healthCheck);
} 