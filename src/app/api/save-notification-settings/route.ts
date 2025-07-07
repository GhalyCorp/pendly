import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import path from 'path';

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