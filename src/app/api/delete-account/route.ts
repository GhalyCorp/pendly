import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
const auth = getAuth();

export async function POST(request: Request) {
  try {
    console.log('Delete Account API called');
    
    const body = await request.json();
    const { userId, userEmail } = body;

    if (!userId || !userEmail) {
      console.error('Missing userId or userEmail:', { userId, userEmail });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Deleting account for user:', userId, userEmail);

    // 1. Delete all business posts associated with this user's email
    const businessesQuery = db.collection('businesses').where('email', '==', userEmail);
    const businessesSnapshot = await businessesQuery.get();
    
    console.log(`Found ${businessesSnapshot.docs.length} business posts to delete`);
    
    // Delete each business post
    const deletePromises = businessesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${businessesSnapshot.docs.length} business posts`);

    // 2. Delete user profile if it exists
    try {
      const userProfileRef = db.collection('users').doc(userId);
      await userProfileRef.delete();
      console.log('Deleted user profile');
    } catch {
      console.log('No user profile found to delete');
    }

    // 3. Delete the Firebase Auth user account
    try {
      await auth.deleteUser(userId);
      console.log('Deleted Firebase Auth user account');
    } catch (authError) {
      console.error('Error deleting Firebase Auth user:', authError);
      // Continue even if auth deletion fails - the data is already cleaned up
    }

    console.log('Account deletion completed successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully',
      deletedBusinesses: businessesSnapshot.docs.length
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Account deletion failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
} 