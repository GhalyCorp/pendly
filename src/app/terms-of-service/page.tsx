'use client';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10 homepage-blue-gradient">
      <div className="w-full max-w-2xl card-bg rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Terms of Service</h1>
        <p className="text-blue-900 mb-6 text-center">
          Effective Date: {new Date().getFullYear()}<br/>
          By using Pendly, you agree to these Terms of Service. Please read them carefully.
        </p>
        <div className="text-blue-900 space-y-4 text-sm">
          <h2 className="font-bold text-lg">1. User Responsibilities</h2>
          <ul className="list-disc ml-6">
            <li>Provide accurate, truthful information when creating an account or campaign.</li>
            <li>No scams, abuse, or fraudulent activity is permitted.</li>
            <li>Respect other users and businesses on the platform.</li>
          </ul>
          <h2 className="font-bold text-lg">2. Our Rights</h2>
          <ul className="list-disc ml-6">
            <li>We may ban accounts, change features, or cancel campaigns at our discretion.</li>
            <li>We may modify or discontinue any part of the service at any time.</li>
          </ul>
          <h2 className="font-bold text-lg">3. Donation Policy</h2>
          <ul className="list-disc ml-6">
            <li>All donations are final. No refunds will be issued.</li>
            <li>Funds go directly to the business or campaign you support.</li>
          </ul>
          <h2 className="font-bold text-lg">4. Reward Limitations</h2>
          <ul className="list-disc ml-6">
            <li>Pendly is not responsible if a business does not honor a reward or offer.</li>
          </ul>
          <h2 className="font-bold text-lg">5. Account Rules</h2>
          <ul className="list-disc ml-6">
            <li>One account per person or business. No impersonation or abuse.</li>
            <li>We reserve the right to remove accounts that violate these terms.</li>
          </ul>
          <h2 className="font-bold text-lg">6. Limitation of Liability</h2>
          <ul className="list-disc ml-6">
            <li>Pendly is not liable for financial loss, server outages, or any damages resulting from use of the platform.</li>
          </ul>
          <h2 className="font-bold text-lg">7. Modifications</h2>
          <ul className="list-disc ml-6">
            <li>We may update these Terms of Service at any time. Continued use of Pendly means you accept the new terms.</li>
          </ul>
          <h2 className="font-bold text-lg">8. Contact</h2>
          <ul className="list-disc ml-6">
            <li>For legal questions, contact us at <a href="mailto:support@pendly.org" className="text-blue-700 underline">support@pendly.org</a>.</li>
          </ul>
        </div>
        <Link href="/" className="mt-8 text-blue-700 underline">Back to Home</Link>
      </div>
    </main>
  );
} 