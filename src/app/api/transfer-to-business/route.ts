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

// Only get Firestore if Firebase Admin is initialized
let db: FirebaseFirestore.Firestore | null = null;
try {
  db = getFirestore();
} catch {
  console.log('Firebase Admin not initialized, skipping Firestore operations');
}

export async function POST(request: Request) {
  try {
    console.log('Transfer to Business API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { paymentIntentId, businessId, businessAmount, transferType } = body;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      console.error('Invalid payment intent ID:', paymentIntentId);
      return NextResponse.json({ error: 'Invalid payment intent ID' }, { status: 400 });
    }
    if (!businessId || typeof businessId !== 'string') {
      console.error('Invalid business ID:', businessId);
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }
    if (!businessAmount || typeof businessAmount !== 'number') {
      console.error('Invalid business amount:', businessAmount);
      return NextResponse.json({ error: 'Invalid business amount' }, { status: 400 });
    }

    console.log('Processing transfer for business:', businessId, 'amount:', businessAmount, 'type:', transferType);

    // If transfer was automatic (Stripe Connect), no manual transfer needed
    if (transferType === 'automatic') {
      console.log('Transfer was automatic via Stripe Connect - no manual transfer needed');
      return NextResponse.json({ 
        success: true,
        message: 'Transfer handled automatically by Stripe Connect',
        businessAmount,
        businessId,
        transferType: 'automatic'
      });
    }

    // For manual transfers, fetch the business's Stripe account ID
    if (!db) {
      console.log('Firebase Admin not available, skipping manual transfer');
      return NextResponse.json({ 
        success: true,
        message: 'Manual transfer skipped - Firebase Admin not available',
        businessAmount,
        businessId,
        transferType: 'manual_skipped'
      });
    }
    
    const businessRef = db.collection('businesses').doc(businessId);
    const businessSnap = await businessRef.get();
    
    if (!businessSnap.exists) {
      console.error('Business not found for manual transfer:', businessId);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    const business = businessSnap.data() as { stripeAccountId?: string } | undefined;
    const stripeAccountId = business?.stripeAccountId;
    
    if (!stripeAccountId) {
      console.log('No Stripe account ID found - manual transfer required');
      return NextResponse.json({ 
        success: true,
        message: 'Manual transfer required - no Stripe account found',
        businessAmount,
        businessId,
        transferType: 'manual_required'
      });
    }

    // Create manual transfer to business's Stripe account
    console.log('Creating manual transfer to Stripe account:', stripeAccountId);
    
    const transfer = await stripe.transfers.create({
      amount: businessAmount,
      currency: 'usd',
      destination: stripeAccountId,
      source_transaction: paymentIntentId,
      metadata: {
        businessId,
        paymentIntentId,
        transferType: 'manual',
      },
    });
    
    console.log('Manual transfer created:', transfer.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Manual transfer completed successfully',
      transferId: transfer.id,
      businessAmount,
      businessId,
      transferType: 'manual_completed'
    });
    
  } catch (err) {
    console.error('Error processing transfer:', err);
    return NextResponse.json({ 
      error: 'Transfer failed',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 