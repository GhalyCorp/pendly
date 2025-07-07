'use client';

import { useState, useEffect } from 'react';
import { generateRewardQRCode } from '../lib/qrCode';

interface QRCodeDisplayProps {
  rewardId: string;
  businessName: string;
  rewardTitle: string;
  donorName: string;
  donationAmount: number;
}

export default function QRCodeDisplay({ 
  rewardId, 
  businessName, 
  rewardTitle, 
  donorName, 
  donationAmount 
}: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const qrCode = await generateRewardQRCode(rewardId);
        setQrCodeDataUrl(qrCode);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('Error generating QR code:', err);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [rewardId]);

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Generating QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reward QR Code</h3>
        
        <div className="mb-4">
          <img 
            src={qrCodeDataUrl} 
            alt="Reward QR Code" 
            className="mx-auto border-2 border-gray-200 rounded-lg"
            style={{ maxWidth: '250px' }}
          />
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Business:</strong> {businessName}</p>
          <p><strong>Reward:</strong> {rewardTitle}</p>
          <p><strong>Customer:</strong> {donorName}</p>
          <p><strong>Amount:</strong> ${(donationAmount / 100).toFixed(2)}</p>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Scan this QR code at <strong>pendly.org/redeem</strong> to mark as redeemed
        </p>
      </div>
    </div>
  );
} 