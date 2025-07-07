'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import Image from 'next/image';

type BusinessData = {
  businessName: string;
  campaignTitle: string;
  campaignDescription: string;
  donated: number;
  goal: number;
  id: string;
  email: string;
  rewardTiers?: { minAmount: number; coupon: string }[];
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function PrintPage() {
  const params = useParams();
  const businessId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      if (!businessId) return;
      
      try {
        const docRef = doc(db, 'businesses', businessId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const businessData: BusinessData = {
            id: businessId,
            businessName: data.businessName || data.name || "Unknown Business",
            campaignTitle: data.campaignTitle || data.description || "Untitled Campaign",
            campaignDescription: data.campaignDescription || data.description || "No description available",
            donated: data.donated || 0,
            goal: data.goal || 0,
            email: data.email || "",
            rewardTiers: data.rewardTiers || [],
            createdAt: data.createdAt ? {
              seconds: data.createdAt.seconds,
              nanoseconds: data.createdAt.nanoseconds
            } : null,
          };
          
          setBusiness(businessData);
          
          // Generate QR code - smaller size for better fit
          const campaignUrl = `https://pendly.org/business/${businessId}`;
          const qrCodeDataUrl = await QRCode.toDataURL(campaignUrl, {
            width: 150,
            margin: 2,
            color: { dark: '#2563eb', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          setQrCodeUrl(qrCodeDataUrl);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusiness();
  }, [businessId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600">The campaign you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen homepage-blue-gradient flex items-start justify-center p-4 pt-8">
      {/* Print button - moved higher to avoid navigation bar */}
      <div className="print:hidden fixed top-20 right-4 z-50">
        <button
          onClick={handlePrint}
          className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all duration-300 shadow-xl text-lg"
        >
          🖨️ PRINT PAGE
        </button>
      </div>

      {/* Main content - White box sized for printer paper */}
      <div className="bg-white w-full max-w-[8.5in] h-[11in] print:w-full print:h-full print:max-w-none print:shadow-none shadow-xl rounded-lg p-8 print:p-6 flex flex-col print-page">
        {/* Header with actual Pendly logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <Image 
              src="/pendly-logo.png" 
              alt="Pendly" 
              width={56}
              height={56}
              className="h-14 print:h-10 w-auto"
            />
            <div className="flex items-center justify-center mb-3 hidden">
              <div className="text-3xl font-bold text-blue-600 mr-2">P</div>
              <div className="text-3xl font-bold text-red-600">endly</div>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Campaign Details</h1>
          <p className="text-gray-600 text-sm">Scan the QR code to support this campaign</p>
        </div>

        {/* Campaign information - everything on one line */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{business.campaignTitle}</h2>
          
          {/* Everything side by side */}
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 leading-relaxed text-sm break-words mb-2">{business.campaignDescription}</p>
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-gray-700 text-sm">Business:</span>
                  <span className="ml-2 text-blue-600 font-medium text-sm">{business.businessName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 text-sm">Goal:</span>
                  <span className="ml-2 text-gray-600 text-sm">${(business.goal / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* QR code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <Image 
                  src={qrCodeUrl} 
                  alt="QR Code for campaign" 
                  width={128}
                  height={128}
                  className="mx-auto border-2 border-gray-300 rounded-lg w-32 h-32 print:w-28 print:h-28"
                />
                <p className="text-xs text-gray-600 mt-2">Scan to visit campaign</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reward tiers */}
        {business.rewardTiers && business.rewardTiers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-3 text-center">Reward Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {business.rewardTiers.map((tier, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center mb-1">
                    <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-xs">${(tier.minAmount / 100).toFixed(0)}</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-xs">Support Level {idx + 1}</span>
                  </div>
                  <p className="text-gray-600 text-xs">{tier.coupon}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-4">
          <p>Powered by Pendly - Supporting local businesses and communities</p>
          <p className="mt-1">Visit pendly.org to learn more</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            background: white !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:h-full {
            height: 100% !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          /* Hide any buttons or interactive elements in print */
          button, a[href], .print\\:hidden {
            display: none !important;
          }
          /* Hide support button specifically */
          .print-page a[href*="donate"], .print-page a[href*="Support"], .print-page a[href*="Donate"], .print-page button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 