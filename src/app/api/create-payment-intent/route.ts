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
    console.log('Create Payment Intent API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { amount, email, businessName, businessId } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      console.error('Invalid email:', email);
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!businessName || typeof businessName !== 'string') {
      console.error('Invalid business name:', businessName);
      return NextResponse.json({ error: 'Invalid business name' }, { status: 400 });
    }
    if (!businessId || typeof businessId !== 'string') {
      console.error('Invalid business ID:', businessId);
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }

    console.log('Creating payment intent for business:', businessId);

    // Fetch business from Firestore to get Stripe account ID and platform fee
    if (!db) {
      console.log('Firebase Admin not available, using default values');
      // Return a basic payment intent without business data
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: { 
          email, 
          businessName, 
          businessId,
          platformFee: '0',
          businessAmount: amount.toString(),
          platformFeePercentage: '0',
        },
      });
      
      return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret,
        platformFee: 0,
        businessAmount: amount,
        platformFeePercentage: 0,
        transferType: 'manual'
      });
    }
    if (!db) {
      console.error('Firestore not initialized');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const businessRef = db.collection('businesses').doc(businessId);
    const businessSnap = await businessRef.get();
    
    if (!businessSnap.exists) {
      console.error('Business not found:', businessId);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    const business = businessSnap.data();
    if (!business) {
      console.error('Business data not found:', businessId);
      return NextResponse.json({ error: 'Business data not found' }, { status: 404 });
    }
    
    // Check for Stripe account info in business document first, then fall back to user document
    let stripeAccountId = business.stripeAccountId || null;
    let stripeAccountStatus = business.stripeAccountStatus || null;
    
    // If not found in business document, check the user document
    if (!stripeAccountId || !stripeAccountStatus) {
      console.log('Stripe account info not found in business document, checking user document');
      
      // Get the user ID from the business document
      const userId = business.userId || business.ownerId;
      if (userId) {
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        
        if (userSnap.exists) {
          const userData = userSnap.data();
          if (userData) {
            stripeAccountId = stripeAccountId || userData.stripeAccountId || null;
            stripeAccountStatus = stripeAccountStatus || userData.stripeAccountStatus || null;
            console.log('Found Stripe account info in user document:', {
              stripeAccountId: userData.stripeAccountId,
              stripeAccountStatus: userData.stripeAccountStatus
            });
          }
        }
      }
    }
    
    const platformFeePercentage = business.platformFeePercentage || 10;
    
    // Calculate platform fee (10% for you, 90% to business)
    const platformFee = Math.round(amount * (platformFeePercentage / 100));
    const businessAmount = amount - platformFee;
    
    console.log('Platform fee calculation:', { 
      platformFee, 
      businessAmount, 
      platformFeePercentage,
      stripeAccountId,
      businessStripeStatus: stripeAccountStatus,
      businessData: {
        businessName: business.businessName,
        stripeAccountId: stripeAccountId,
        stripeAccountStatus: stripeAccountStatus,
        platformFeePercentage: platformFeePercentage
      }
    });

    // Create payment intent with Stripe Connect if business has active Stripe account
    if (stripeAccountId && stripeAccountStatus === 'active') {
      console.log('Creating Stripe Connect payment intent with transfer to business account');
      console.log('Stripe Connect details:', {
        stripeAccountId,
        amount,
        platformFee,
        businessAmount,
        currency: 'usd'
      });
      
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          receipt_email: email,
          application_fee_amount: platformFee, // Platform fee (your 10%)
          transfer_data: {
            destination: stripeAccountId, // Business's Stripe account
          },
          metadata: { 
            email, 
            businessName, 
            businessId,
            platformFee: platformFee.toString(),
            businessAmount: businessAmount.toString(),
            platformFeePercentage: platformFeePercentage.toString(),
          },
        });
        
        console.log('Stripe Connect payment intent created successfully:', {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          application_fee_amount: paymentIntent.application_fee_amount,
          transfer_data: paymentIntent.transfer_data
        });
        
        return NextResponse.json({ 
          clientSecret: paymentIntent.client_secret,
          platformFee,
          businessAmount,
          platformFeePercentage,
          transferType: 'automatic'
        });
      } catch (stripeError) {
        console.error('Error creating Stripe Connect payment intent:', stripeError);
        console.log('Falling back to regular payment intent');
        
        // Fallback to regular payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          receipt_email: email,
          metadata: { 
            email, 
            businessName, 
            businessId,
            platformFee: platformFee.toString(),
            businessAmount: businessAmount.toString(),
            platformFeePercentage: platformFeePercentage.toString(),
          },
        });
        
        console.log('Regular payment intent created as fallback:', paymentIntent.id);
        
        return NextResponse.json({ 
          clientSecret: paymentIntent.client_secret,
          platformFee,
          businessAmount,
          platformFeePercentage,
          transferType: 'manual'
        });
      }
      
    } else {
      console.log('Creating regular payment intent (no Stripe Connect)');
      
      // Fallback to regular payment intent if Stripe account not set up
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: { 
          email, 
          businessName, 
          businessId,
          platformFee: platformFee.toString(),
          businessAmount: businessAmount.toString(),
          platformFeePercentage: platformFeePercentage.toString(),
        },
      });
      
      console.log('Regular payment intent created:', paymentIntent.id);
      
      return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret,
        platformFee,
        businessAmount,
        platformFeePercentage,
        transferType: 'manual'
      });
    }
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'PaymentIntent creation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
}