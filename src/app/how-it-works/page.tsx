'use client';

import { useState, useEffect } from 'react';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function HowItWorksPage() {
  const [testRewardId, setTestRewardId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createTestReward = async () => {
      try {
        setLoading(true);
        
        // Create a real demo reward for testing
        const rewardData = {
          businessId: 'demo-business-123',
          businessName: 'Demo Coffee Shop',
          campaignTitle: 'Help Us Expand!',
          donorName: 'Sarah Johnson',
          donorEmail: 'demo@example.com',
          donationAmount: 5000, // $50.00
          rewardTitle: 'Free Coffee & Pastry',
          rewardDescription: 'Thank you for your generous donation!',
          used: false,
          createdAt: serverTimestamp(),
        };

        const rewardRef = await addDoc(collection(db, 'rewards'), rewardData);
        setTestRewardId(rewardRef.id);
        
      } catch (err) {
        console.error('Error creating demo reward:', err);
        // Fallback to a static ID if creation fails
        setTestRewardId('demo-reward-123');
      } finally {
        setLoading(false);
      }
    };

    createTestReward();
  }, []);

  return (
    <main className="min-h-screen py-10">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-5xl font-bold text-blue-900 mb-6 drop-shadow-sm">How Pendly Works</h1>
          <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover how our QR code reward system connects donors with local businesses 
            through secure, one-time-use digital rewards.
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">The Complete Process</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">1. Make a Donation</h3>
                <p className="text-gray-700">
                  Support a local business by making a secure donation through Stripe. 
                  Your payment is processed instantly with transparent 90/10 splits.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">2. Receive Reward Email</h3>
                <p className="text-gray-700">
                  Get an email with your unique QR code, reward details, and 
                  step-by-step instructions for redemption.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">3. Redeem Your Reward</h3>
                <p className="text-gray-700">
                  Show your QR code to the business. They scan it and mark it as redeemed. 
                  One-time use prevents fraud.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Preview Section */}
        <section className="mb-16">
          <div className="card-bg rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">What Donors Receive</h2>
            <p className="text-center text-gray-800 mb-8 max-w-2xl mx-auto font-medium">
              After making a donation, donors receive a beautiful email with their unique QR code and all the information they need to redeem their reward.
            </p>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto" style={{borderRadius: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)'}}>
              <div className="bg-blue-600 text-white p-10 text-center" style={{borderRadius: '18px 18px 0 0'}}>
                <h3 className="text-3xl font-bold mb-2">🎁 Your Reward</h3>
                <p className="text-lg opacity-90">Thank you for your donation!</p>
              </div>
              <div className="p-10">
                <p className="text-lg mb-5 text-gray-800 font-semibold">Hi Sarah Johnson,</p>
                <p className="text-base mb-8 text-gray-700">
                  Thank you for your donation of <strong style={{color: '#2563eb'}}>$50.00</strong> to <strong style={{color: '#2563eb'}}>Demo Coffee Shop</strong>!
                </p>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-3">🎉 You&apos;ve Earned a Reward!</div>
                  <div className="text-lg text-blue-600">Free Coffee & Pastry</div>
                  <div className="text-sm text-blue-600 mt-3">Minimum donation: $50.00+</div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-lg font-semibold text-blue-600 mb-5">Show this QR code to redeem your reward:</div>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 inline-block shadow-lg">
                    <div className="bg-gray-200 w-48 h-48 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">[QR Code Image]</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-4">This QR code is unique to your reward and cannot be reused.</div>
                  <div className="mt-4">
                    <a href="#" className="text-blue-600 font-semibold">Click here to redeem online</a>
                  </div>
                </div>
                
                <div className="bg-gray-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
                  <div className="text-lg font-bold text-blue-600 mb-4">📋 Donation Details</div>
                  <div className="space-y-2">
                    <div><span className="font-semibold text-gray-700">Amount:</span> <span className="text-blue-600">$50.00</span></div>
                    <div><span className="font-semibold text-gray-700">Date:</span> <span className="text-blue-600">{new Date().toLocaleDateString()}</span></div>
                    <div><span className="font-semibold text-gray-700">Campaign:</span> <span className="text-blue-600">Help Us Expand!</span></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 text-blue-600 rounded-lg p-5 mb-8 text-center border border-blue-200">
                  <div className="font-semibold">Important: This QR code can only be used once. Once scanned by the business, it will be marked as redeemed.</div>
                </div>
                
                <div className="text-center text-blue-600 mb-6">
                  Thank you again for supporting local businesses through Pendly!<br/><br/>
                  Best regards,<br/>
                  The Pendly Team
                </div>
                
                <div className="text-center text-gray-500 text-sm">
                  This email was sent from Pendly - Supporting local businesses and communities.<br/>
                  Need help? Contact us at <a href="mailto:adamghaly@pendly.org" className="text-blue-600">adamghaly@pendly.org</a><br/>
                  <strong>Reward ID:</strong> demo-reward-123
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR Code Demo Section */}
        <section className="mb-16">
          <div className="card-bg rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">QR Code System Demo</h2>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Customer&apos;s QR Code</h3>
                <p className="text-gray-800 mb-6 font-medium">
                  This is what customers receive in their email. Each QR code is unique and contains 
                  all the reward information. Customers simply show this to the business staff.
                </p>
                
                {loading ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading demo QR code...</p>
                  </div>
                ) : (
                  <QRCodeDisplay
                    rewardId={testRewardId}
                    businessName="Demo Coffee Shop"
                    rewardTitle="Free Coffee & Pastry"
                    donorName="Sarah Johnson"
                    donationAmount={5000}
                  />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Business Redemption Process</h3>
                <p className="text-gray-800 mb-6 font-medium">
                  When a customer shows their QR code, the business scans it with their phone camera. 
                  This opens the redemption page where they can verify and mark the reward as used.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">How it works:</h4>
                  <ol className="text-blue-800 space-y-2 text-sm">
                    <li>1. Customer shows QR code to business staff</li>
                    <li>2. Staff scans QR code with phone camera</li>
                    <li>3. Phone opens pendly.org/redeem?id=[unique-id]</li>
                    <li>4. Staff sees customer details and reward information</li>
                    <li>5. Staff clicks &quot;Mark as Redeemed&quot; button</li>
                    <li>6. Reward is permanently marked as used</li>
                    <li>7. Same QR code cannot be used again</li>
                  </ol>
                </div>
                
                {testRewardId && (
                  <div className="mt-6">
                    <a 
                      href={`/redeem?id=${testRewardId}`}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Try the Redemption Page →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="mb-16">
          <div className="card-bg rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Security & Anti-Fraud Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Unique QR Codes</h3>
                <p className="text-sm text-gray-800 font-medium">Each reward gets a unique QR code that cannot be duplicated</p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">⏰</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">One-Time Use</h3>
                <p className="text-sm text-gray-800 font-medium">Once redeemed, QR codes are permanently marked as used</p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Database Tracking</h3>
                <p className="text-sm text-gray-800 font-medium">All redemptions are logged with timestamps and details</p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">✅</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Business Verification</h3>
                <p className="text-sm text-gray-800 font-medium">Businesses can see customer details before redemption</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="card-bg rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Benefits for Everyone</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">For Donors</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Instant reward delivery via email</li>
                  <li>• No physical coupons to carry</li>
                  <li>• Secure, fraud-proof system</li>
                  <li>• Clear redemption instructions</li>
                  <li>• Professional, branded experience</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">For Businesses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• No paper coupon management</li>
                  <li>• Real-time redemption tracking</li>
                  <li>• Fraud prevention built-in</li>
                  <li>• Customer verification system</li>
                  <li>• Professional redemption process</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="card-bg rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-800 mb-6 font-medium">
              Join Pendly and start supporting local businesses with secure, digital rewards.
            </p>
            <div className="space-x-4">
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Browse Campaigns
              </Link>
              <Link 
                href="/business/create"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Start a Campaign
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 