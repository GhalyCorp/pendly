import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Initialize Firebase Admin with service account file
if (getApps().length === 0) {
  try {
    console.log('Initializing Firebase Admin with service account file...');
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    console.log('Service account path:', serviceAccountPath);
    
    initializeApp({
      credential: cert(serviceAccountPath),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (initError) {
    console.error('Firebase Admin initialization failed:', initError);
    throw initError;
  }
}

const db = getFirestore();

export async function POST(request: Request) {
  try {
    console.log('Check Stripe Status API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      console.error('Invalid user ID:', userId);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    console.log('Checking Stripe status for user:', userId);

    // Get user's Stripe account info from Firestore
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userSnap.data();
    const stripeAccountId = userData?.stripeAccountId;
    
    if (!stripeAccountId) {
      console.log('No Stripe account found for user:', userId);
      return NextResponse.json({ 
        status: 'not_setup',
        message: 'No Stripe account found'
      });
    }

    console.log('Checking Stripe account status for:', stripeAccountId);

    // Retrieve the account from Stripe to get the current status
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    console.log('Stripe account details:', {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    });

    // Determine the status based on Stripe's account state
    let status = 'pending';
    let message = 'Account is being reviewed by Stripe';
    
    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active';
      message = 'Account is fully active and ready to receive payments';
    } else if (account.details_submitted) {
      status = 'pending';
      message = 'Account details submitted, waiting for Stripe review';
    } else {
      status = 'incomplete';
      message = 'Account setup incomplete - needs more information';
    }

    // Update the user's Stripe status in Firestore
    await userRef.update({
      stripeAccountStatus: status,
      stripeAccountUpdated: new Date(),
    });

    console.log(`Updated user ${userId} Stripe status to ${status}`);

    return NextResponse.json({ 
      stripeAccountId: account.id,
      status,
      message,
      account: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      }
    });
    
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    return NextResponse.json({ 
      error: 'Failed to check Stripe status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 