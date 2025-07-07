'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [buildInfo, setBuildInfo] = useState<Record<string, string | boolean | undefined>>({});
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    // Set build info
    setBuildInfo({
      buildTime: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStripeKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });

    // Set environment variables (only public ones)
    setEnvVars({
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'set' : 'not set',
    });

    setTimestamp(new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 Debug Information</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Build Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Build Information</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Build Time:</strong> {buildInfo.buildTime}</div>
                <div><strong>Node Environment:</strong> {buildInfo.nodeEnv}</div>
                <div><strong>Vercel Environment:</strong> {buildInfo.vercelEnv}</div>
                <div><strong>Firebase Project ID:</strong> {buildInfo.hasFirebaseProjectId ? '✅ Set' : '❌ Missing'}</div>
                <div><strong>Stripe Key:</strong> {buildInfo.hasStripeKey ? '✅ Set' : '❌ Missing'}</div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="bg-green-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-800 mb-3">Environment Variables</h2>
              <div className="space-y-2 text-sm">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-800 mb-3">System Information</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Current Time:</strong> {timestamp}</div>
                <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</div>
                <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">Status Check</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span>Page Loading: ✅ Working</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span>Build: ✅ Successful</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span>Environment: ⚠️ Check Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Next Steps</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Check if Firebase Project ID is set in Vercel environment variables</p>
              <p>2. Verify Stripe keys are configured in Vercel</p>
              <p>3. Check Vercel deployment logs for any errors</p>
              <p>4. Ensure all required environment variables are set</p>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex gap-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
            <Link 
              href="/test-deployment"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Deployment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 