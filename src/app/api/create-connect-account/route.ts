import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    console.log('Create Connect Account API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { businessName, businessEmail, userId } = body;

    if (!businessName || typeof businessName !== 'string') {
      console.error('Invalid business name:', businessName);
      return NextResponse.json({ error: 'Invalid business name' }, { status: 400 });
    }
    if (!businessEmail || typeof businessEmail !== 'string') {
      console.error('Invalid business email:', businessEmail);
      return NextResponse.json({ error: 'Invalid business email' }, { status: 400 });
    }
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid user ID:', userId);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    console.log('Creating Stripe Connect account for:', businessEmail);

    // Create a Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: businessEmail,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pendly.org',
      },
    });

    console.log('Stripe account created:', account.id);

    // For now, skip Firebase Admin and return the account info
    // The frontend will handle storing this information
    return NextResponse.json({ 
      accountId: account.id,
      accountLink: account.id, // We'll create the account link in the frontend
      success: true
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json({ 
      error: 'Failed to create Connect account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 