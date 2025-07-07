import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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