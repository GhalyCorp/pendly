'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

interface StripeSettingsProps {
  user: User;
}

export default function StripeSettings({ user }: StripeSettingsProps) {
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [stripeAccountStatus, setStripeAccountStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchStripeData() {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setStripeAccountId(data.stripeAccountId || '');
          setStripeAccountStatus(data.stripeAccountStatus || '');
        }
      } catch {
        console.error('Error fetching Stripe data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStripeData();
  }, [user.uid]);

  const handleStripeSetup = async () => {
    setIsCreatingLink(true);
    setError('');
    try {
      const response = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          businessId: user.uid, // Using user ID as business ID for user-level Stripe setup
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create account link');
      }
      
      const data = await response.json();
      window.location.href = data.accountLink;
    } catch {
      setError('Failed to start Stripe setup. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const checkStripeStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-stripe-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStripeAccountStatus(data.status);
        setSuccess('Stripe status updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to check Stripe status');
      }
    } catch {
      setError('Error checking Stripe status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Settings</h2>
        <p className="text-gray-600">Manage your Stripe Connect account to receive donations</p>
      </div>

      {/* Stripe Account Status */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stripe Connect Account</h3>
          <button
            onClick={checkStripeStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-600">
                {stripeAccountStatus === 'active' 
                  ? 'Your account is ready to receive payments'
                  : 'Complete setup to start receiving payments'
                }
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              stripeAccountStatus === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {stripeAccountStatus === 'active' ? '✅ Active' : '⏳ Setup Required'}
            </div>
          </div>

          {stripeAccountId && (
            <div className="p-4 bg-white rounded-lg border">
              <p className="font-medium text-gray-900 mb-1">Account ID</p>
              <p className="text-sm text-gray-600 font-mono">{stripeAccountId}</p>
            </div>
          )}
        </div>

        {stripeAccountStatus !== 'active' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Complete Your Setup</h4>
            <p className="text-blue-700 text-sm mb-4">
              To receive donations, you need to complete your Stripe account setup. This allows you to receive payments directly to your bank account.
            </p>
            <button
              onClick={handleStripeSetup}
              disabled={isCreatingLink}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isCreatingLink ? 'Setting up...' : 'Complete Stripe Setup'}
            </button>
          </div>
        )}
      </div>

      {/* Platform Fee Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Fees</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-700">Platform Fee</span>
            <span className="font-semibold text-gray-900">10%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-700">You Receive</span>
            <span className="font-semibold text-green-600">90%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          For every donation, you receive 90% of the amount, while 10% goes to platform fees.
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
} 