'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import CampaignCard from '../components/CampaignCard';
import NavBar from '../components/NavBar';
import StartCampaignButton from '../components/StartCampaignButton';
import Link from 'next/link';

type FirestoreTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

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

// Force new deployment
export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Business[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const querySnapshot = await getDocs(collection(db, 'businesses'));
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
            createdAt: data.createdAt,
          });
        });
        
        // Sort by most recent first
        campaignsData.sort((a, b) => {
          const getDate = (timestamp: { seconds: number; nanoseconds: number } | string | number | Date | null | undefined): Date => {
            if (!timestamp) return new Date(0);
            if (isFirestoreTimestamp(timestamp)) {
              return timestamp.toDate();
            } else if (isPlainTimestamp(timestamp)) {
              return new Date(timestamp.seconds * 1000);
            }
            return new Date(timestamp as string | number | Date);
          };
          
          const aDate = getDate(a.createdAt);
          const bDate = getDate(b.createdAt);
          return bDate.getTime() - aDate.getTime();
        });
        
        setCampaigns(campaignsData);
        setFilteredCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Filter campaigns based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCampaigns(campaigns);
    } else {
      const searchLower = search.toLowerCase();
      const filtered = campaigns.filter(campaign => 
        campaign.businessName.toLowerCase().includes(searchLower) ||
        campaign.campaignTitle.toLowerCase().includes(searchLower) ||
        campaign.campaignDescription.toLowerCase().includes(searchLower)
      );
      setFilteredCampaigns(filtered);
    }
  }, [search, campaigns]);

  return (
    <>
      <NavBar search={search} setSearch={setSearch} />
      <main className="flex flex-col items-center relative overflow-x-hidden pb-32 w-full">
        <div className="w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] mx-auto relative">
        {/* Large soft red circle accents with floating animation */}
        {/* Circle 1 */}
        <div className="absolute top-[-20px] md:top-[-40px] right-[-20px] md:right-[-40px] w-[80px] h-[80px] md:w-[160px] md:h-[160px] pointer-events-none z-0">
          <div className="circle float-animate-1" style={{width: '100%', height: '100%', opacity: 0.6, background: 'rgba(255, 60, 60, 0.6)'}}></div>
        </div>
        {/* Circle 2 */}
        <div className="absolute bottom-[-20px] md:bottom-[-40px] left-[-20px] md:left-[-40px] w-[65px] h-[65px] md:w-[130px] md:h-[130px] pointer-events-none z-0">
          <div className="circle float-animate-2" style={{width: '100%', height: '100%', opacity: 0.6, background: 'rgba(255, 60, 60, 0.6)'}}></div>
        </div>
        {/* Circle 3 */}
        <div className="absolute top-[30%] left-[-20px] md:left-[-40px] w-[45px] h-[45px] md:w-[90px] md:h-[90px] pointer-events-none z-0">
          <div className="circle float-animate-3" style={{width: '100%', height: '100%', opacity: 0.4}}></div>
        </div>
        {/* Circle 4 */}
        <div className="absolute top-[-15px] md:top-[-30px] left-[-15px] md:left-[-30px] w-[45px] h-[45px] md:w-[90px] md:h-[90px] pointer-events-none z-0">
          <div className="circle float-animate-2" style={{width: '100%', height: '100%', opacity: 0.6}}></div>
        </div>
        {/* Circle 5 */}
        <div className="absolute bottom-[-15px] md:bottom-[-30px] right-[-15px] md:right-[-30px] w-[55px] h-[55px] md:w-[110px] md:h-[110px] pointer-events-none z-0">
          <div className="circle float-animate-1" style={{width: '100%', height: '100%', opacity: 0.6}}></div>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col items-center mt-24 mb-16 w-full z-10 px-4">
          <div className="text-center max-w-5xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Pendly
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Connect with your community and raise funds through compelling campaigns. 
              Create, share, and succeed with Pendly&apos;s modern fundraising platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <StartCampaignButton />
              <Link 
                href="/about" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="w-full max-w-6xl mx-auto px-4 mb-16 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">{campaigns.length}</div>
              <div className="text-white/80">Active Campaigns</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">${(campaigns.reduce((sum, campaign) => sum + campaign.donated, 0) / 100).toLocaleString()}</div>
              <div className="text-white/80">Total Raised</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">{campaigns.filter(c => (c.donated / c.goal) >= 1).length}</div>
              <div className="text-white/80">Goals Reached</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-6xl mx-auto px-4 mb-16 z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Pendly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-3">Quick Setup</h3>
              <p className="text-white/80">Get your campaign live in minutes with our streamlined process and instant payment processing.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Payments</h3>
              <p className="text-white/80">Built on Stripe&apos;s secure infrastructure with transparent fees and real-time transaction tracking.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-white mb-3">Community Focused</h3>
              <p className="text-white/80">Strengthen bonds between businesses and communities through meaningful fundraising campaigns.</p>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section className="w-full max-w-6xl mx-auto px-4 z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Discover Campaigns</h2>
            <p className="text-white/80 text-lg">Support local businesses and organizations making a difference</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white border-t-transparent"></div>
              <span className="ml-4 text-white font-bold text-xl">Loading campaigns...</span>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-16">
              {search ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-white font-bold text-xl mb-2">No campaigns found</p>
                  <p className="text-white/70 mb-4">Try searching for a different business name or campaign title.</p>
                  <button 
                    onClick={() => setSearch('')}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-white font-bold text-xl mb-2">Be the First!</p>
                  <p className="text-white/70 mb-4">No campaigns yet. Start the first one and inspire others!</p>
                  <StartCampaignButton />
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((business) => (
                <CampaignCard key={business.id} business={business} showStatus={false} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto px-4 mt-16 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Campaign?</h2>
            <p className="text-white/80 text-lg mb-8">
              Join hundreds of businesses already raising funds with Pendly
            </p>
            <StartCampaignButton />
          </div>
        </section>
        </div>
      </main>
    </>
  );
}
