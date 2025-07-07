'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import EditProfileButtonWrapper from './EditProfileButtonWrapper';
import ShareButton from './ShareButton';



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

interface IndividualCampaignPostProps {
  business: Business;
  showActions?: boolean;
}

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

export default function IndividualCampaignPost({ business, showActions = true }: IndividualCampaignPostProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [donorsCount, setDonorsCount] = useState(0);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
  const [liveBusiness, setLiveBusiness] = useState(business);
  const [selectedImage, setSelectedImage] = useState(0);


  useEffect(() => {
    if (business.images && business.images.length > 0) {
      const validIndex = Math.min(Math.max(selectedImage, 0), business.images.length - 1);
      if (validIndex !== selectedImage) {
        setSelectedImage(validIndex);
      }
    } else {
      if (selectedImage !== 0) {
        setSelectedImage(0);
      }
    }
  }, [business.images, selectedImage]);

  
  const donated = liveBusiness.donated || 0;
  const goal = liveBusiness.goal || 1;
  const progress = useMemo(() => Math.min((donated / goal) * 100, 100), [donated, goal]);
  useEffect(() => {
    console.log('IndividualCampaignPost - Business data:', {
      id: business.id,
      businessName: business.businessName,
      donated: business.donated,
      goal: business.goal,
      progress: progress,
      createdAt: business.createdAt,
      createdAtType: typeof business.createdAt,
      images: business.images,
      imagesLength: business.images?.length,
      selectedImage: selectedImage,
      firstImageUrl: business.images?.[0],
      firstImageType: typeof business.images?.[0]
    });
  }, [business, progress, selectedImage]);

  useEffect(() => {
    console.log('IndividualCampaignPost - Live business data updated:', {
      id: liveBusiness.id,
      businessName: liveBusiness.businessName,
      donated: liveBusiness.donated,
      goal: liveBusiness.goal,
      progress: progress,
      isDifferent: liveBusiness.donated !== business.donated
    });
  }, [liveBusiness, business, progress]);

  useEffect(() => {
    console.log('Setting up real-time listener for business:', business.id);
    const businessRef = doc(db, 'businesses', business.id);
    const unsubscribe = onSnapshot(businessRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedData = docSnap.data();
        console.log('Real-time update received:', {
          businessId: business.id,
          oldDonated: liveBusiness.donated,
          newDonated: updatedData.donated,
          oldGoal: liveBusiness.goal,
          newGoal: updatedData.goal
        });
        setLiveBusiness({ ...business, ...updatedData });
      }
    }, (error) => {
      console.error('Real-time listener error:', error);
    });
    return () => unsubscribe();
  }, [business.id, business]);

  const getCampaignAge = () => {
    console.log('getCampaignAge called with createdAt:', business.createdAt);
    
    if (!business.createdAt) {
      console.log('No createdAt field, returning Recently');
      return 'Recently';
    }
    
    try {
      let createdDate: Date;
      
      if (isFirestoreTimestamp(business.createdAt)) {
        console.log('Converting Firestore timestamp to Date');
        createdDate = business.createdAt.toDate();
      } else if (isPlainTimestamp(business.createdAt)) {
        console.log('Converting plain timestamp to Date');
        createdDate = new Date(business.createdAt.seconds * 1000);
      } else if (typeof business.createdAt === 'string') {
        console.log('Converting string timestamp to Date');
        createdDate = new Date(business.createdAt);
      } else if (typeof business.createdAt === 'number') {
        console.log('Converting number timestamp to Date');
        createdDate = new Date(business.createdAt);
      } else if (business.createdAt instanceof Date) {
        console.log('Using existing Date object');
        createdDate = business.createdAt;
      } else {
        console.log('Unknown timestamp type, using current date');
        return 'Recently';
      }
      
      const now = new Date();
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      console.log('Campaign age calculation:', {
        createdDate,
        now,
        diffTime,
        diffDays
      });
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      console.error('Error calculating campaign age:', error);
      return 'Recently';
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDonationData() {
      try {
        console.log('Fetching donation data for business:', business.id);
        const donationsRef = collection(db, 'businesses', business.id, 'donations');
        const donationsSnapshot = await getDocs(donationsRef);
        
        if (!isMounted) return;
        
        setDonorsCount(donationsSnapshot.size);
        
        console.log('Found donations:', donationsSnapshot.size);
        
        if (donationsSnapshot.size > 0) {
          const lastDonation = donationsSnapshot.docs[donationsSnapshot.docs.length - 1];
          const lastDonationData = lastDonation.data();
          console.log('Last donation data:', lastDonationData);
          
          if (lastDonationData.timestamp && isMounted) {
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
            
            if (!isMounted) return;
            
            if (diffDays === 0) setLastDonationDate('Today');
            else if (diffDays === 1) setLastDonationDate('Yesterday');
            else if (diffDays < 7) setLastDonationDate(`${diffDays} days ago`);
            else if (diffDays < 30) setLastDonationDate(`${Math.floor(diffDays / 7)} weeks ago`);
            else setLastDonationDate(`${Math.floor(diffDays / 30)} months ago`);
          }
        }
      } catch (error) {
        console.error('Error fetching donation data:', error);
        if (isMounted) {
        setDonorsCount(0);
        }
      }
    }
    
    fetchDonationData();
    
    return () => {
      isMounted = false;
    };
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Post */}
        <div className="lg:col-span-2">
          <article 
            className={`w-full relative group transition-all duration-500 ${
              isHovered ? 'transform scale-[1.01]' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Professional card design */}
            <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Hero section with campaign info */}
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-5 lg:p-6">
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

              {/* Images Section - Full gallery for individual page */}
              {business.images && business.images.length > 0 && (
                <div className="p-4">
                  {/* Main image */}
                  <div className="relative w-full h-72 lg:h-80 rounded-lg overflow-hidden mb-3">
                    <img
                      src={business.images[selectedImage]}
                      alt={`${business.campaignTitle} - Image ${selectedImage + 1}`}
                      className="w-full h-full object-cover bg-gray-200"
                      onError={(e) => {
                        console.error('Image failed to load:', business.images?.[selectedImage]);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Thumbnail gallery */}
                  {business.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {business.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-14 h-14 bg-white border border-gray-200 rounded overflow-hidden ${
                            selectedImage === index 
                              ? 'border-blue-500 shadow-lg' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover bg-gray-200"
                            onError={(e) => {
                              console.error('Thumbnail failed to load:', image);
                              console.error('Thumbnail URL type:', typeof image);
                              console.error('Thumbnail URL length:', image?.length);
                              e.currentTarget.replaceWith(Object.assign(document.createElement('div'), {
                                className: 'flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-xs',
                                innerText: 'Image not found',
                              }));
                            }}
                            onLoad={() => {
                              console.log('Thumbnail loaded successfully:', image);
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Campaign details section */}
              <div className="p-4 lg:p-6">
                {/* Progress section */}
                <div className="mb-6">
                  {/* Professional stats grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-sm">
                      <div className="text-lg lg:text-xl font-bold text-emerald-700 mb-1">
                        ${(donated / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {liveBusiness.donated !== business.donated && (
                          <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Raised</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-lg lg:text-xl font-bold text-blue-700 mb-1">
                        ${(goal / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

                  {/* Enhanced progress bar */}
                  <div className="relative mb-4">
                    <div className="h-6 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                      <div
                        className={`h-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl transition-all duration-1000 ease-out shadow-lg ${
                          isHovered ? 'animate-pulse' : ''
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {/* Progress percentage overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-800 bg-white/90 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
                        {progress.toFixed(1)}% Complete
                      </span>
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
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
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

                {/* Business attribution - Link to business public profile */}
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
                      <ShareButton profileUrl={`https://pendly.org/business/${business.id}`} />
                      <Link 
                        href={`/business/${business.id}/print`}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <span className="mr-2">🖨️</span>
                        Print
                      </Link>
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
        </div>

        {/* Right Column - Donation Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3 text-center">
                Support This Campaign
              </h3>
              <p className="text-slate-600 text-center mb-4 text-sm">
                Every contribution helps {business.businessName} reach their goal and make a difference.
              </p>
              
              {/* Quick stats */}
              <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-700 mb-1">
                    ${(donated / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {liveBusiness.donated !== business.donated && (
                      <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-600">raised of ${(goal / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} goal</div>
                </div>
              </div>

              {/* CTA Button */}
              <Link 
                href={`/business/${business.id}/donate`}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-base font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="mr-2">💝</span>
                Donate Now
              </Link>

              {/* Additional info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 mb-1">
                  Secure payment powered by Stripe
                </p>
                <p className="text-xs text-slate-400">
                  90% goes to {business.businessName} • 10% platform fee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
} 