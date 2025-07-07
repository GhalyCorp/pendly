'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../../lib/firebase';

function SetupStripeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Check if we should show Stripe setup
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');
    
    if (success === 'true') {
      // Stripe setup completed successfully - redirect to campaigns
      router.push('/my-campaigns');
    }
    
    if (refresh === 'true') {
      // Refresh the page to get updated status
      window.location.reload();
    }
  }, [searchParams, router]);

  const handleCreateStripeAccount = async () => {
    if (!user) return;
    
    setIsCreatingAccount(true);
    setError('');
    
    try {
      // Create Stripe Connect account
      const connectResponse = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Your Business', // Generic name, will be updated when they create actual business
          businessEmail: user.email,
          userId: user.uid,
        }),
      });
      
      if (!connectResponse.ok) {
        const errorData = await connectResponse.json();
        throw new Error(errorData.error || 'Failed to create Stripe account');
      }
      
      const connectData = await connectResponse.json();
      console.log('Stripe account created:', connectData);
      
      // Store the Stripe account information in the user's profile using client-side Firebase
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      await setDoc(doc(db, 'users', user.uid), {
        stripeAccountId: connectData.accountId,
        stripeAccountStatus: 'pending',
        email: user.email,
        createdAt: new Date(),
      }, { merge: true });
      
      console.log('Stripe account info stored in user profile');
      
      // Create account link for onboarding
      const linkResponse = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: connectData.accountId,
          businessId: 'setup', // Temporary ID for setup
          userId: user.uid,
        }),
      });
      
      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(errorData.error || 'Failed to create account link');
      }
      
      const linkData = await linkResponse.json();
      console.log('Account link created:', linkData);
      window.location.href = linkData.accountLink;
    } catch (error) {
      console.error('Error in handleCreateStripeAccount:', error);
      setError(error instanceof Error ? error.message : 'Failed to start Stripe setup. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSkipForNow = () => {
    router.push('/business/create');
  };

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center homepage-blue-gradient py-10">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Set Up Your Payment Account</h1>
        <p className="text-blue-700 mb-6 text-center">
          To receive donations, you&apos;ll need to connect a Stripe account. This allows you to receive payments directly to your bank account.
        </p>
        
        <div className="w-full space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What you&apos;ll need:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Business information (name, address, etc.)</li>
              <li>• Bank account details for receiving payments</li>
              <li>• Government ID for verification</li>
              <li>• About 5-10 minutes to complete</li>
            </ul>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleCreateStripeAccount}
              disabled={isCreatingAccount}
              className="w-full px-4 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingAccount ? 'Setting Up...' : 'Connect Stripe Account'}
            </button>
            
            <button
              onClick={handleSkipForNow}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Skip for Now
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can always set up your payment account later from your profile settings.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SetupStripePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-700">Loading...</p>
        </div>
      </main>
    }>
      <SetupStripeContent />
    </Suspense>
  );
} 