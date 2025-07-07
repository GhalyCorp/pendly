'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import RewardTiersForm from '../../../components/RewardTiersForm';
import ImageUpload from '../../../components/ImageUpload';
import { getAuth, User } from 'firebase/auth';

export default function CreateBusinessPage() {
  const router = useRouter();

  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [rewardTiers, setRewardTiers] = useState([
    { minAmount: '', coupon: '' },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation
    if (!campaignTitle.trim()) {
      alert('Please enter a campaign title.');
      return;
    }
    
    if (!campaignDescription.trim()) {
      alert('Please enter a campaign description.');
      return;
    }
    
    if (campaignDescription.length > 1000) {
      alert('Campaign description must be 1000 characters or less.');
      return;
    }
    
    if (!goal || isNaN(parseFloat(goal)) || parseFloat(goal) <= 0) {
      alert('Please enter a valid goal amount greater than 0.');
      return;
    }
    
    if (rewardTiers.some(t => !t.minAmount.trim() || !t.coupon.trim())) {
      alert('Please fill all reward tiers.');
      return;
    }
    
    // Validate reward tier amounts
    for (let i = 0; i < rewardTiers.length; i++) {
      const tier = rewardTiers[i];
      const amount = parseFloat(tier.minAmount);
      if (isNaN(amount) || amount <= 0) {
        alert(`Please enter a valid amount for reward tier ${i + 1}.`);
        return;
      }
    }

    // Convert dollars to cents
    const goalCents = Math.round(parseFloat(goal) * 100);
    const tiers = rewardTiers.map(t => ({
      minAmount: Math.round(parseFloat(t.minAmount) * 100),
      coupon: t.coupon.trim(),
    }));

    try {
      setIsCreating(true);
      const email = user?.email || '';
      
      // Get user's Stripe account info from their profile
      let stripeAccountId = null;
      let stripeAccountStatus = null;
      
      if (user?.uid) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            stripeAccountId = userData.stripeAccountId || null;
            stripeAccountStatus = userData.stripeAccountStatus || null;
            console.log('Found Stripe account info for business creation:', {
              stripeAccountId,
              stripeAccountStatus
            });
          }
        } catch (error) {
          console.error('Error fetching user Stripe info:', error);
        }
      }
      
      // Create business document with campaign info and Stripe account info
      const docRef = await addDoc(collection(db, 'businesses'), {
        businessName: user?.displayName || 'Business', // Use displayName (which is the business name)
        campaignTitle, // This is the campaign title
        campaignDescription, // This is the campaign description
        goal: goalCents,
        donated: 0,
        rewardTiers: tiers,
        images,
        email,
        userId: user?.uid, // Link to user
        platformFeePercentage: 10, // 10% platform fee (you)
        stripeAccountId, // Copy from user profile
        stripeAccountStatus, // Copy from user profile
        createdAt: new Date(),
      });

      alert('Campaign created successfully!');
      router.push(`/business/${docRef.id}`);
    } catch (error) {
      alert('Error creating campaign.');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center homepage-blue-gradient py-10">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Create Campaign</h1>
        <p className="text-blue-700 mb-6 text-center">Set up your business profile and create your first campaign on <span className='font-bold text-red-700'>Pendly</span>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-900 font-semibold mb-2">Business Name</p>
                <p className="text-blue-700 text-sm">
                  {user?.displayName || 'Not set'} 
                  <span className="text-blue-500 ml-2">(Set during account creation)</span>
                </p>
              </div>
              
              <label className="block text-blue-900 font-semibold mb-1 mt-4" htmlFor="campaign-title">Campaign Title</label>
              <input
                id="campaign-title"
                type="text"
                placeholder="Campaign Title"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                required
              />
              
              <label className="block text-blue-900 font-semibold mb-1 mt-4" htmlFor="campaign-description">Campaign Description</label>
              <textarea
                id="campaign-description"
                placeholder="Tell your story and explain your campaign..."
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                rows={4}
                maxLength={1000}
                required
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">Maximum 1000 characters</span>
                <span className={`${campaignDescription.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                  {campaignDescription.length}/1000
                </span>
              </div>
              
              <label className="block text-blue-900 font-semibold mb-1 mt-4" htmlFor="donation-goal">Donation Goal (in dollars)</label>
              <input
                id="donation-goal"
                type="number"
                placeholder="Donation Goal (in dollars)"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                min="0"
                step="0.01"
                required
              />
              <RewardTiersForm rewardTiers={rewardTiers} setRewardTiersAction={setRewardTiers} />
            </div>
            
            <div className="space-y-4">
              <ImageUpload 
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </main>
  );
}
