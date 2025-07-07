'use client';

import { useState, useEffect } from 'react';
import QRCodeDisplay from '../../components/QRCodeDisplay';

export default function TestQRPage() {
  const [testRewardId, setTestRewardId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const createTestReward = async () => {
      try {
        setLoading(true);
        
        // Test reward creation disabled to prevent duplicate emails
        // const rewardData = {
        //   businessId: 'test-business-123',
        //   businessName: 'Test Coffee Shop',
        //   campaignTitle: 'Test Campaign',
        //   donorName: 'John Doe',
        //   donorEmail: 'john@example.com',
        //   donationAmount: 2500, // $25.00
        //   rewardTitle: 'Free Coffee',
        //   rewardDescription: 'Thank you for your generous donation!',
        //   used: false,
        //   createdAt: serverTimestamp(),
        // };

        // const rewardRef = await addDoc(collection(db, 'rewards'), rewardData);
        // setTestRewardId(rewardRef.id);
        
        // Use a static test ID instead
        setTestRewardId('test-reward-123');
        
      } catch (err) {
        setError('Failed to create test reward');
        console.error('Error creating test reward:', err);
      } finally {
        setLoading(false);
      }
    };

    createTestReward();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating test reward...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-2xl card-bg rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">QR Code Reward System Test</h1>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              This page demonstrates the QR code reward system. When a customer makes a donation, 
              they receive an email with a unique QR code that links to the redeem page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Customer View</h2>
              <p className="text-gray-700 mb-4">
                Customers receive this QR code in their email after donating. They can show it to 
                the business to redeem their reward.
              </p>
              <QRCodeDisplay
                rewardId={testRewardId}
                businessName="Test Coffee Shop"
                rewardTitle="Free Coffee"
                donorName="John Doe"
                donationAmount={2500} // $25.00
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Business View</h2>
              <p className="text-gray-700 mb-4">
                When a customer shows their QR code, the business can scan it and go to the redeem page 
                to mark the reward as used.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Customer shows QR code to business</li>
                  <li>2. Business scans QR code with phone</li>
                  <li>3. Phone opens pendly.org/redeem?id=[reward-id]</li>
                  <li>4. Business clicks &quot;Mark as Redeemed&quot;</li>
                  <li>5. Reward is marked as used (cannot be reused)</li>
                </ol>
              </div>

              <div className="mt-4">
                <a 
                  href={`/redeem?id=${testRewardId}`}
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Redeem Page
                </a>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Test Reward Created!</h3>
            <p className="text-green-700 text-sm">
              A test reward has been created in the database with ID: <code className="bg-green-100 px-1 rounded">{testRewardId}</code>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
            <p className="text-yellow-700 text-sm">
              This is a test page. In production, each donation would generate a unique reward ID and QR code. 
              The email system is currently logging to console - you&apos;ll need to integrate with a real email service 
              like SendGrid or Mailgun for actual email delivery.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 