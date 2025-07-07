// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { db } from '../../../lib/firebase';
import IndividualCampaignPost from '../../../components/IndividualCampaignPost';

type BusinessData = {
  businessName: string; // Account/business name
  campaignTitle: string; // Campaign title
  campaignDescription: string; // Campaign description
  donated: number;
  goal: number;
  id: string;
  email: string;
  images?: string[];
  stripeAccountStatus?: string;
  platformFeePercentage?: number;
  rewardTiers?: { minAmount: number; coupon: string }[];
  createdAt?: { seconds: number; nanoseconds: number } | null; // Firestore timestamp
};

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('BusinessPage - Fetching business with ID:', id);
  
  const docRef = doc(db, 'businesses', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.log('BusinessPage - Business not found:', id);
    notFound();
  }

  const data = docSnap.data();
  console.log('BusinessPage - Raw Firestore data:', data);
  
  // Handle legacy data structure and convert timestamps
  const businessData: BusinessData = {
    id: id,
    businessName: data.businessName || data.name || "Unknown Business",
    campaignTitle: data.campaignTitle || data.description || "Untitled Campaign",
    campaignDescription: data.campaignDescription || data.description || "No description available",
    donated: data.donated || 0,
    goal: data.goal || 0,
    email: data.email || "",
    images: data.images || [],
    stripeAccountStatus: data.stripeAccountStatus || "",
    platformFeePercentage: data.platformFeePercentage || 10,
    rewardTiers: data.rewardTiers || [],
    createdAt: data.createdAt ? {
      seconds: data.createdAt.seconds,
      nanoseconds: data.createdAt.nanoseconds
    } : null,
  };

  console.log('BusinessPage - Processed business data:', businessData);

  return (
    <main className="min-h-screen homepage-blue-gradient py-8 px-4">
      <IndividualCampaignPost business={businessData} />
    </main>
  );
}
