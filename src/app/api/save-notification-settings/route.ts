import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';

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

export async function POST(request: NextRequest) {
  try {
    const { notificationSettings } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Save notification settings to Firestore
    await db.collection('users').doc(userId).set({
      notificationSettings,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to save notification settings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get notification settings from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // Return default settings if user doesn't exist
      return NextResponse.json({
        notificationSettings: {
          emailNotifications: true,
          donationAlerts: true,
          campaignUpdates: true,
          marketingEmails: false,
          weeklyReports: true,
        }
      });
    }

    const userData = userDoc.data();
    return NextResponse.json({
      notificationSettings: userData?.notificationSettings || {
        emailNotifications: true,
        donationAlerts: true,
        campaignUpdates: true,
        marketingEmails: false,
        weeklyReports: true,
      }
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to get notification settings' },
      { status: 500 }
    );
  }
} 