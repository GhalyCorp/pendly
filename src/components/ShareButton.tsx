'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export default function ShareButton({ profileUrl }: { profileUrl: string }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Support this local business on Pendly!',
          url: profileUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setShowModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <span className="mr-2">📤</span>
        Share
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Share this Business</h2>
            <div className="flex justify-center mb-4">
              <QRCode value={profileUrl} size={160} />
            </div>
            <div className="mb-4 text-center break-all text-sm text-gray-600 bg-gray-50 p-2 rounded">{profileUrl}</div>
            <button
              onClick={copyToClipboard}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
