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
    const businessRef = db.collection('businesses').doc(businessId);
    const businessSnap = await businessRef.get();
    
    if (!businessSnap.exists) {
      console.error('Business not found for manual transfer:', businessId);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    const business = businessSnap.data();
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
    
  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json({ 
      error: 'Transfer failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 