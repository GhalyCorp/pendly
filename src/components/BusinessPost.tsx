'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import EditProfileButtonWrapper from './EditProfileButtonWrapper';
import ShareButton from './ShareButton';
import Image from 'next/image';

type RewardTier = {
  minAmount: number;
  coupon: string;
};

type Business = {
  id: string;
  businessName: string;
  campaignTitle: string;
  campaignDescription: string;
  donated: number;
  goal: number;
  email: string;
  rewardTiers?: RewardTier[];
  images?: string[];
  stripeAccountStatus?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string | number | Date | null;
};
type FirestoreTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

function isFirestoreTimestamp(obj: unknown): obj is FirestoreTimestamp {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'toDate' in obj &&
    typeof (obj as { toDate?: unknown }).toDate === 'function'
  );
}

function isPlainTimestamp(obj: unknown): obj is { seconds: number; nanoseconds: number } {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'seconds' in obj &&
    'nanoseconds' in obj &&
    typeof (obj as { seconds?: unknown }).seconds === 'number' &&
    typeof (obj as { nanoseconds?: unknown }).nanoseconds === 'number'
  );
}

interface BusinessPostProps {
  business: Business;
  showActions?: boolean;
}

export default function BusinessPost({ business, showActions = true }: BusinessPostProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [donorsCount, setDonorsCount] = useState(0);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
  const progress = (business.donated / business.goal) * 100;

  const getCampaignAge = () => {
    if (business.createdAt) {
      const getDate = (timestamp: { seconds: number; nanoseconds: number } | string | number | Date | null): Date => {
        if (!timestamp) return new Date(0);
        if (isFirestoreTimestamp(timestamp)) {
          return timestamp.toDate();
        } else if (isPlainTimestamp(timestamp)) {
          return new Date(timestamp.seconds * 1000);
        }
        return new Date(timestamp as string | number | Date);
      };
      const createdDate = getDate(business.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }
    return 'Recently';
  };

  useEffect(() => {
    async function fetchDonationData() {
      try {
        const donationsRef = collection(db, 'businesses', business.id, 'donations');
        const donationsSnapshot = await getDocs(donationsRef);
        setDonorsCount(donationsSnapshot.size);
        
        if (donationsSnapshot.size > 0) {
          const lastDonation = donationsSnapshot.docs[donationsSnapshot.docs.length - 1];
          const lastDonationData = lastDonation.data();
          if (lastDonationData.timestamp) {
            const getDonationDate = (timestamp: FirestoreTimestamp | { seconds: number; nanoseconds: number } | string | number | Date): Date => {
              if (isFirestoreTimestamp(timestamp)) {
                return timestamp.toDate();
              } else if (isPlainTimestamp(timestamp)) {
                return new Date(timestamp.seconds * 1000);
              }
              return new Date(timestamp as string | number | Date);
            };
            const lastDate = getDonationDate(lastDonationData.timestamp);
            const now = new Date();
            const diffTime = now.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) setLastDonationDate('Today');
            else if (diffDays === 1) setLastDonationDate('Yesterday');
            else if (diffDays < 7) setLastDonationDate(`${diffDays} days ago`);
            else if (diffDays < 30) setLastDonationDate(`${Math.floor(diffDays / 7)} weeks ago`);
            else setLastDonationDate(`${Math.floor(diffDays / 30)} months ago`);
          }
        }
      } catch (error) {
        console.error('Error fetching donation data:', error);
        setDonorsCount(0);
      }
    }
    fetchDonationData();
  }, [business.id]);

  const getStatusColor = () => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusText = () => {
    if (progress >= 100) return 'Goal Reached! 🎉';
    if (progress >= 75) return 'Almost There! 🚀';
    if (progress >= 50) return 'Halfway There! 💪';
    return 'Just Getting Started! 🌱';
  };

  return (
    <article 
      className={`w-full max-w-4xl relative group transition-all duration-500 ${
        isHovered ? 'transform scale-[1.01]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Professional card design */}
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Hero section with campaign info */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-4 lg:p-6">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor()} text-white shadow-md backdrop-blur-sm`}>
              {getStatusText()}
            </span>
          </div>

          {/* Campaign title and description */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-xl lg:text-2xl font-bold mb-3 text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              {business.campaignTitle}
            </h1>
            
            {/* Campaign description with proper typography */}
            <div className="prose prose-sm prose-invert max-w-none mx-auto">
              <p className="text-sm lg:text-base text-blue-100 text-center leading-relaxed font-light max-w-4xl mx-auto">
                {business.campaignDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Images Section - Compact for campaigns tab */}
        {business.images && business.images.length > 0 && (
          <div className="p-3 lg:p-4">
            <div className="relative w-full h-32 lg:h-40 rounded-lg overflow-hidden">
              <Image
                src={business.images?.[0] || ''}
                alt={`${business.campaignTitle} - Main image`}
                fill
                className="object-cover bg-gray-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  console.error('BusinessPost image failed to load:', business.images?.[0]);
                }}
              />
              {business.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  +{business.images.length - 1} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campaign details section */}
        <div className="p-4 lg:p-6">
          {/* Progress section */}
          <div className="mb-6">
            {/* Enhanced progress bar */}
            <div className="relative mb-4">
              <div className="h-6 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                <div
                  className={`h-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl transition-all duration-1000 ease-out shadow-lg ${
                    isHovered ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {/* Progress percentage overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800 bg-white/90 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
                  {progress.toFixed(1)}% Complete
                </span>
              </div>
            </div>

            {/* Professional stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-sm">
                <div className="text-lg lg:text-xl font-bold text-emerald-700 mb-1">
                  ${(business.donated / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Raised</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                <div className="text-lg lg:text-xl font-bold text-blue-700 mb-1">
                  ${(business.goal / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Goal</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-lg lg:text-xl font-bold text-slate-700 mb-1">
                  {donorsCount.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Supporters</div>
              </div>
            </div>

            {/* Campaign timeline info */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold shadow-sm">
                <span className="mr-1">📅</span>
                Campaign started {getCampaignAge()}
                {lastDonationDate && (
                  <span className="ml-2 text-slate-600 border-l border-slate-300 pl-2">
                    Last donation: {lastDonationDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Professional Perks & Benefits */}
          {business.rewardTiers && business.rewardTiers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
                Perks & Benefits
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {business.rewardTiers.map((tier, idx) => (
                  <div 
                    key={idx} 
                    className="group/tier relative p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-sm">${(tier.minAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Support Level {idx + 1}</h3>
                          <p className="text-xs text-slate-500">Minimum contribution</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-slate-700 font-medium text-sm leading-relaxed">{tier.coupon}</p>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover/tier:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business attribution */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
              <span className="mr-2">By:</span>
              <Link 
                href={`/profile/${business.id}`}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
              >
                {business.businessName}
              </Link>
            </div>
          </div>

          {/* Action buttons with professional styling */}
          {showActions && (
            <div className="flex flex-col gap-3 justify-center items-center">
              <div className="flex gap-2">
                <EditProfileButtonWrapper businessEmail={business.email} businessId={business.id} />
                <ShareButton profileUrl={`https://yourdomain.com/business/${business.id}`} />
              </div>
              <Link 
                href={`/business/${business.id}/donate`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-base font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="mr-2">💝</span>
                Support This Campaign
              </Link>
            </div>
          )}
        </div>

        {/* Professional bottom accent */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"></div>
      </div>
    </article>
  );
} 