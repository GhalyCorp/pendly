import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(account);
        break;
      
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleAccountUpdate(account: Stripe.Account) {
  // Update business document when Stripe account status changes
  if (getApps().length === 0) {
    initializeApp();
  }
  
  const db = getFirestore();
  
  const status = account.charges_enabled && account.payouts_enabled ? 'active' : 'pending';
  
  // Find and update businesses with this Stripe account ID
  const businessesRef = db.collection('businesses');
  const businessQuery = businessesRef.where('stripeAccountId', '==', account.id);
  const businessSnapshot = await businessQuery.get();
  
  if (!businessSnapshot.empty) {
    const businessDoc = businessSnapshot.docs[0];
    await businessDoc.ref.update({
      stripeAccountStatus: status,
      stripeAccountUpdated: new Date(),
    });
    
    console.log(`Updated business ${businessDoc.id} Stripe status to ${status}`);
  }
  
  // Find and update user profiles with this Stripe account ID
  const usersRef = db.collection('users');
  const userQuery = usersRef.where('stripeAccountId', '==', account.id);
  const userSnapshot = await userQuery.get();
  
  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({
      stripeAccountStatus: status,
      stripeAccountUpdated: new Date(),
    });
    
    console.log(`Updated user ${userDoc.id} Stripe status to ${status}`);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('=== PAYMENT SUCCESS WEBHOOK ===');
  console.log('Payment succeeded:', paymentIntent.id);
  console.log('Payment intent metadata:', paymentIntent.metadata);
  
  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      initializeApp();
    }
    
    const db = getFirestore();
    
    // Extract metadata from payment intent
    const { businessId, email, businessName, platformFee, businessAmount } = paymentIntent.metadata;
    
    if (!businessId) {
      console.error('No businessId in payment intent metadata');
      return;
    }
    
    console.log('Processing donation for business:', businessId);
    console.log('Donation details:', {
      amount: paymentIntent.amount,
      email,
      businessName,
      platformFee,
      businessAmount
    });
    
    // Update business donated amount
    const businessRef = db.collection('businesses').doc(businessId);
    await businessRef.update({
      donated: FieldValue.increment(paymentIntent.amount)
    });
    
    console.log('Updated business donated amount');
    
    // Create donation record
    const donationData = {
      amount: paymentIntent.amount,
      email: email || 'anonymous@example.com',
      name: email ? email.split('@')[0] : 'Anonymous',
      businessAmount: parseInt(businessAmount) || paymentIntent.amount,
      platformFee: parseInt(platformFee) || 0,
      timestamp: new Date(),
      paymentIntentId: paymentIntent.id,
      status: 'completed'
    };
    
    await businessRef.collection('donations').add(donationData);
    
    console.log('Created donation record');
    
    // Reward creation and email sending will be handled by Firebase function
    console.log('Donation record created - Firebase function will handle reward and email');
    
    console.log('Payment processing completed successfully');
    
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
} 