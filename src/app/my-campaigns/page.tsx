"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import ShareButton from '../../components/ShareButton';
import EditProfileButtonWrapper from '../../components/EditProfileButtonWrapper';
import Link from 'next/link';

type Business = {
  id: string;
  businessName: string; // Account/business name
  campaignTitle: string; // Campaign title
  campaignDescription: string; // Campaign description
  donated: number;
  goal: number;
  email: string;
  rewardTiers?: { minAmount: number; coupon: string }[];
  images?: string[];
  stripeAccountStatus?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string | number | Date | null;
};

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const q = query(collection(db, "businesses"), where("email", "==", u.email));
          const querySnapshot = await getDocs(q);
          const campaignsData: Business[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            campaignsData.push({
              id: doc.id,
              businessName: data.businessName || data.name || "Unknown Business", // Handle legacy data
              campaignTitle: data.campaignTitle || data.description || "Untitled Campaign", // Handle legacy data
              campaignDescription: data.campaignDescription || data.description || "No description available", // Handle legacy data
              donated: data.donated || 0,
              goal: data.goal || 0,
              email: data.email || "",
              rewardTiers: data.rewardTiers || [],
              images: data.images || [],
              stripeAccountStatus: data.stripeAccountStatus || "",
              createdAt: data.createdAt ? {
                seconds: data.createdAt.seconds,
                nanoseconds: data.createdAt.nanoseconds
              } : null,
            });
          });
          
          setCampaigns(campaignsData);
          
          // Set business name for the title (use the first campaign's business name)
          if (campaignsData.length > 0) {
            setBusinessName(campaignsData[0].businessName);
          }
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="flex flex-col items-center homepage-blue-gradient pt-14 relative overflow-x-hidden pb-32 w-full">
          <div className="w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white border-t-transparent"></div>
              <span className="ml-4 text-white font-bold text-xl">Loading campaigns...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center homepage-blue-gradient pt-14 relative overflow-x-hidden pb-32 w-full">
        <div className="w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] mx-auto">
        <section className="flex flex-col items-center mt-10 mb-8 w-full z-10">
          <h2 className="text-5xl font-bold text-red-700 mb-5 text-center">
            {businessName ? `${businessName}'s Campaigns` : 'My Campaigns'}
          </h2>
          <p className="max-w-4xl text-center text-2xl text-white mb-10">
            All campaigns you have started are shown below. You can start a new campaign anytime.
          </p>
        </section>

        <section className="w-full flex flex-col items-center gap-8 pb-16">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Campaigns Yet</h3>
              <p className="text-white/80 text-lg mb-6">Start your first campaign and begin your fundraising journey!</p>
              <Link 
                href="/business/create" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="mr-2">✨</span>
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl px-4" style={{ alignItems: 'start' }}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative">
                  {/* Campaign Image */}
                  {campaign.images && campaign.images.length > 0 && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={campaign.images[0]}
                        alt={campaign.campaignTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Campaign Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {campaign.campaignTitle}
                    </h3>
                    
                    <p className="text-gray-600 text-base mb-4 line-clamp-3">
                      {campaign.campaignDescription}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-semibold">${(campaign.donated / 100).toFixed(2)} raised</span>
                        <span className="font-semibold">${(campaign.goal / 100).toFixed(2)} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((campaign.donated / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Campaign Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                      <span>{campaign.rewardTiers?.length || 0} reward tiers</span>
                      <span>{campaign.createdAt ? 'Active' : 'New'}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 relative z-20">
                      <Link 
                        href={`/business/${campaign.id}`}
                        className="flex-1 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                      >
                        View Campaign
                      </Link>
                      <ShareButton 
                        profileUrl={`https://pendly.org/business/${campaign.id}`}
                      />
                      <EditProfileButtonWrapper 
                        businessEmail={campaign.email} 
                        businessId={campaign.id}
                      />
                    </div>
                  </div>
                  
                  {/* Clickable overlay for the entire card */}
                  <Link 
                    href={`/business/${campaign.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View ${campaign.campaignTitle} campaign`}
              />
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
      </main>
    </>
  );
}
