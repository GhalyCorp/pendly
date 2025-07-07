'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import DeleteBusinessButton from '../../../../components/DeleteBusinessButton';
import ImageUpload from '../../../../components/ImageUpload';

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [businessName, setBusinessName] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const invalidId = !businessId || typeof businessId !== 'string';

  useEffect(() => {
    async function fetchBusiness() {
      if (invalidId) {
        setLoading(false);
        setError('Invalid business ID.');
        return;
      }
      setLoading(true);
      const ref = doc(db, 'businesses', businessId as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setBusinessName(data.businessName || data.name || '');
        setCampaignTitle(data.campaignTitle || data.description || '');
        setCampaignDescription(data.campaignDescription || data.description || '');
        setGoal(data.goal ? (data.goal / 100).toString() : '');
        setStripeAccountId(data.stripeAccountId || '');
        setEmail(data.email || '');
        setImages(data.images || []);
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [businessId, invalidId]);

  // Check if we should show Stripe setup
  useEffect(() => {
    const setup = searchParams.get('setup');
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');
    
    if (setup === 'stripe') {
      setShowStripeSetup(true);
    }
    
    if (success === 'true') {
      setSuccess('Stripe account setup completed successfully!');
      setShowStripeSetup(false);
    }
    
    if (refresh === 'true') {
      // Refresh the page to get updated status
      window.location.reload();
    }
  }, [searchParams]);

  const handleStripeSetup = async () => {
    setIsCreatingLink(true);
    try {
      const response = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          businessId: businessId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create account link');
      }
      
      const data = await response.json();
      window.location.href = data.accountLink;
    } catch {
      setError('Failed to start Stripe setup. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    // Input validation
    if (!businessName.trim()) {
      setError('Please enter a business name.');
      setIsSubmitting(false);
      return;
    }
    
    if (!campaignTitle.trim()) {
      setError('Please enter a campaign title.');
      setIsSubmitting(false);
      return;
    }
    
    if (!campaignDescription.trim()) {
      setError('Please enter a campaign description.');
      setIsSubmitting(false);
      return;
    }
    
    if (campaignDescription.length > 1000) {
      setError('Campaign description must be 1000 characters or less.');
      setIsSubmitting(false);
      return;
    }
    
    if (!goal || isNaN(parseFloat(goal)) || parseFloat(goal) <= 0) {
      setError('Please enter a valid goal amount greater than 0.');
      setIsSubmitting(false);
      return;
    }
    
    const goalCents = Math.round(parseFloat(goal) * 100);
    try {
      const ref = doc(db, 'businesses', businessId as string);
      await updateDoc(ref, { 
        businessName, 
        campaignTitle, 
        campaignDescription, 
        goal: goalCents, 
        images 
      });
      setSuccess('Campaign updated!');
      setTimeout(() => router.push(`/business/${businessId}`), 1500);
    } catch {
      setError('Error updating campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (invalidId) {
    return <div className="text-center py-10 text-red-600">Invalid business ID.</div>;
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <main className="min-h-screen flex flex-col items-center homepage-blue-gradient py-10">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Edit Campaign</h1>
        <p className="text-blue-700 mb-6 text-center">Update your campaign details and business information.</p>
        
        {/* Stripe Connect Setup Section */}
        {showStripeSetup && (
          <div className="w-full mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Complete Payment Setup</h2>
            <p className="text-blue-700 text-sm mb-4">
              To receive donations, you need to complete your Stripe account setup. This allows you to receive payments directly to your bank account.
            </p>
            <button
              onClick={handleStripeSetup}
              disabled={isCreatingLink}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {isCreatingLink ? 'Setting up...' : 'Complete Stripe Setup'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Business Name"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                required
              />
              <p className="text-sm text-blue-600">This is your account name and appears as &quot;By: [Business Name]&quot; on campaigns.</p>
              
              <input
                type="text"
                placeholder="Campaign Title"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                required
              />
              
              <input
                type="number"
                placeholder="Donation Goal (in dollars)"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                min="0"
                step="0.01"
                required
              />
              
              <textarea
                placeholder="Campaign Description"
                value={campaignDescription}
                onChange={e => setCampaignDescription(e.target.value)}
                className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 min-h-[100px]"
                maxLength={1000}
                required
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600">Maximum 1000 characters</span>
                <span className={`${campaignDescription.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                  {campaignDescription.length}/1000
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <ImageUpload 
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </div>
          </div>
          
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-700 text-center">{success}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
        {/* Delete button for owner */}
        <DeleteBusinessButton businessId={businessId} businessEmail={email} />
      </div>
    </main>
  );
}
