import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { db } from '../../../lib/firebase';
import NavBar from '../../../components/NavBar';
import Link from 'next/link';

type Business = {
  id: string;
  businessName: string;
  campaignTitle: string;
  campaignDescription: string;
  donated: number;
  goal: number;
  email: string;
  rewardTiers?: { minAmount: number; coupon: string }[];
  images?: string[];
  createdAt?: { seconds: number; nanoseconds: number } | string | number | Date | null;
};

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('PublicProfilePage - Fetching business with ID:', id);
  
  // Get the business document
  const businessRef = doc(db, 'businesses', id);
  const businessSnap = await getDoc(businessRef);

  if (!businessSnap.exists()) {
    console.log('PublicProfilePage - Business not found:', id);
    notFound();
  }

  const businessData = businessSnap.data();
  const businessName = businessData.businessName || businessData.name || "Unknown Business";
  const businessEmail = businessData.email;

  // Get all campaigns for this business
  const campaignsQuery = query(collection(db, 'businesses'), where("email", "==", businessEmail));
  const campaignsSnapshot = await getDocs(campaignsQuery);
  
  const campaigns: Business[] = [];
  campaignsSnapshot.forEach((doc) => {
    const data = doc.data();
    campaigns.push({
      id: doc.id,
      businessName: data.businessName || data.name || "Unknown Business",
      campaignTitle: data.campaignTitle || data.description || "Untitled Campaign",
      campaignDescription: data.campaignDescription || data.description || "No description available",
      donated: data.donated || 0,
      goal: data.goal || 0,
      email: data.email || "",
      rewardTiers: data.rewardTiers || [],
      images: data.images || [],
              createdAt: data.createdAt ? {
          seconds: data.createdAt.seconds,
          nanoseconds: data.createdAt.nanoseconds
        } : null,
    });
  });

  console.log('PublicProfilePage - Found campaigns:', campaigns.length);

  return (
    <>
      <NavBar />
      <main className="min-h-screen flex flex-col items-center homepage-blue-gradient pt-14 relative overflow-x-hidden pb-32">
        <section className="flex flex-col items-center mt-10 mb-8 w-full z-10">
          <h2 className="text-5xl font-bold text-red-700 mb-5 text-center">
            {businessName}&apos;s Campaigns
          </h2>
          <p className="max-w-4xl text-center text-2xl text-white mb-10">
            Support {businessName} by contributing to their campaigns below.
          </p>
        </section>

        <section className="w-full flex flex-col items-center gap-8 pb-16">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Campaigns Yet</h3>
              <p className="text-white/80 text-lg mb-6">This business hasn&apos;t started any campaigns yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4" style={{ alignItems: 'start' }}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Campaign Image */}
                  {campaign.images && campaign.images.length > 0 && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={campaign.images[0]}
                        alt={campaign.campaignTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Campaign Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {campaign.campaignTitle}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {campaign.campaignDescription}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${(campaign.donated / 100).toFixed(2)} raised</span>
                        <span>${(campaign.goal / 100).toFixed(2)} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((campaign.donated / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Campaign Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                      <span>{campaign.rewardTiers?.length || 0} reward tiers</span>
                      <span>{campaign.createdAt ? 'Active' : 'New'}</span>
                    </div>
                    
                    {/* Action Button */}
                    <Link 
                      href={`/business/${campaign.id}`}
                      className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                    >
                      View Campaign
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
} 