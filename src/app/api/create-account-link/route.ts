import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: Request) {
  try {
    console.log('Create Account Link API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { accountId, businessId } = body;

    if (!accountId || typeof accountId !== 'string') {
      console.error('Invalid account ID:', accountId);
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    console.log('Creating account link for account:', accountId);

    // Determine the return and refresh URLs based on whether this is setup or business edit
    let returnUrl, refreshUrl;
    
    if (businessId === 'setup') {
      // This is for new user setup
      returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-stripe?success=true`;
      refreshUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-stripe?refresh=true`;
    } else {
      // This is for existing business edit
      returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/business/${businessId}/edit?success=true`;
      refreshUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/business/${businessId}/edit?refresh=true`;
    }

    console.log('Return URL:', returnUrl);
    console.log('Refresh URL:', refreshUrl);

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);

    // For now, skip Firebase Admin update
    // The frontend will handle updating the user profile

    return NextResponse.json({ accountLink: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json({ 
      error: 'Failed to create account link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 