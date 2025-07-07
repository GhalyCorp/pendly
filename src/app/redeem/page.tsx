'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Firestore timestamp type
type FirestoreTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

type Reward = {
  id: string;
  donorName?: string;
  businessName?: string;
  campaignTitle?: string;
  rewardTitle?: string;
  donationAmount?: number;
  used?: boolean;
  usedAt?: FirestoreTimestamp | string | number | Date | null;
  // add other fields as needed
};

export default function RedeemPage() {
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get reward ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      fetchReward(id);
    }
  }, []);

  const fetchReward = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const rewardDoc = await getDoc(doc(db, 'rewards', id));
      
      if (rewardDoc.exists()) {
        const rewardData = rewardDoc.data();
        setReward({
          id: rewardDoc.id,
          ...rewardData
        } as Reward);
        
        if (rewardData.used) {
          setRedeemed(true);
        }
      } else {
        setError('Reward not found');
      }
    } catch (err) {
      setError('Error loading reward');
      console.error('Error fetching reward:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!reward || reward.used) return;
    
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'rewards', reward.id), {
        used: true,
        usedAt: new Date(),
        usedBy: 'store_clerk' // Could be enhanced with clerk authentication
      });
      
      setRedeemed(true);
      setReward({ ...reward, used: true });
    } catch (err) {
      setError('Error marking reward as used');
      console.error('Error updating reward:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reward...</p>
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

  if (!reward) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">🎫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Redemption</h1>
          <p className="text-gray-600">Scan a QR code to redeem a reward</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card-bg rounded-xl shadow-lg p-8">
        <div className="text-center">
          {redeemed ? (
            <>
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Already Used</h1>
              <p className="text-gray-600 mb-6">
                This reward has already been redeemed and cannot be used again.
              </p>
            </>
          ) : (
            <>
              <div className="text-blue-500 text-6xl mb-4">🎁</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Reward Redemption</h1>
              <p className="text-gray-600 mb-6">
                Customer is redeeming their reward
              </p>
            </>
          )}

          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">Reward Details</h2>
            
            <div className="space-y-3 text-left">
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <p className="text-gray-900">{reward.donorName}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Business:</span>
                <p className="text-gray-900">{reward.businessName}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Campaign:</span>
                <p className="text-gray-900">{reward.campaignTitle}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Reward:</span>
                <p className="text-gray-900">{reward.rewardTitle}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Donation Amount:</span>
                <p className="text-gray-900">${((reward.donationAmount || 0) / 100).toFixed(2)}</p>
              </div>
              
              {reward.used && (
                <div>
                  <span className="font-medium text-gray-700">Used On:</span>
                  <p className="text-gray-900">
                    {reward.usedAt && typeof reward.usedAt === 'object' && 'toDate' in reward.usedAt 
                      ? reward.usedAt.toDate().toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!redeemed && (
            <button
              onClick={markAsUsed}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Processing...' : 'Mark as Redeemed'}
            </button>
          )}

          <p className="text-sm text-gray-500 mt-4">
            This QR code is unique to this reward and cannot be reused.
          </p>
        </div>
      </div>
    </main>
  );
} 