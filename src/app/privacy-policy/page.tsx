'use client';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10 homepage-blue-gradient">
      <div className="w-full max-w-2xl card-bg rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Privacy Policy</h1>
        <p className="text-blue-900 mb-6 text-center">
          Effective Date: {new Date().getFullYear()}<br/>
          This Privacy Policy explains how Pendly ("we", "us", or "our") collects, uses, stores, and shares your information when you use our website and services.
        </p>
        <div className="text-blue-900 space-y-4 text-sm">
          <h2 className="font-bold text-lg">1. Information We Collect</h2>
          <ul className="list-disc ml-6">
            <li>Personal information: name, email, business name, donation amounts, business descriptions, and any info you provide when creating an account or campaign.</li>
            <li>Payment information: processed securely by Stripe. We do not store your full payment details.</li>
            <li>Usage data: analytics, cookies, and device info (via Vercel analytics and similar tools).</li>
          </ul>
          <h2 className="font-bold text-lg">2. How We Use Your Information</h2>
          <ul className="list-disc ml-6">
            <li>To create and manage your account and campaigns.</li>
            <li>To process donations and payments (via Stripe).</li>
            <li>To send you notifications and updates (via SendGrid or similar services).</li>
            <li>To improve our services and analyze usage (via Vercel analytics).</li>
          </ul>
          <h2 className="font-bold text-lg">3. How We Store and Protect Your Information</h2>
          <ul className="list-disc ml-6">
            <li>Data is stored securely using Firebase, Stripe, and other trusted providers.</li>
            <li>We use industry-standard security measures to protect your data.</li>
            <li>We comply with the NY SHIELD Act and other applicable data security regulations.</li>
          </ul>
          <h2 className="font-bold text-lg">4. Sharing Your Information</h2>
          <ul className="list-disc ml-6">
            <li>We share your data only with trusted partners (Firebase, Stripe, SendGrid, Vercel) as needed to provide our services.</li>
            <li>We do not sell your personal information.</li>
          </ul>
          <h2 className="font-bold text-lg">5. Cookies and Tracking</h2>
          <ul className="list-disc ml-6">
            <li>We use cookies and analytics tools (including Vercel analytics) to understand site usage and improve our services.</li>
          </ul>
          <h2 className="font-bold text-lg">6. Children’s Privacy</h2>
          <ul className="list-disc ml-6">
            <li>Pendly is not intended for children under 13. We do not knowingly collect data from children under 13. We follow Stripe’s rules regarding children’s data.</li>
          </ul>
          <h2 className="font-bold text-lg">7. Accessing or Deleting Your Data</h2>
          <ul className="list-disc ml-6">
            <li>You may request access to or deletion of your data by contacting us at <a href="mailto:support@pendly.org" className="text-blue-700 underline">support@pendly.org</a>.</li>
          </ul>
          <h2 className="font-bold text-lg">8. Changes to This Policy</h2>
          <ul className="list-disc ml-6">
            <li>We may update this Privacy Policy. We will notify users of significant changes via email or a notice on our site.</li>
          </ul>
          <h2 className="font-bold text-lg">9. Contact Us</h2>
          <ul className="list-disc ml-6">
            <li>If you have questions, contact us at <a href="mailto:support@pendly.org" className="text-blue-700 underline">support@pendly.org</a>.</li>
          </ul>
        </div>
        <Link href="/" className="mt-8 text-blue-700 underline">Back to Home</Link>
      </div>
    </main>
  );
} 