import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Initialize Firebase Admin with environment variables
if (getApps().length === 0) {
  try {
    console.log('Initializing Firebase Admin with environment variables...');
    
    // Only initialize if we have the required environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      };
      
      initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.log('Firebase Admin environment variables not found, skipping initialization');
    }
  } catch (initError) {
    console.error('Firebase Admin initialization failed:', initError);
    // Don't throw error, just log it
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