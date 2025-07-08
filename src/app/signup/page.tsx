'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's business name as display name
      if (businessName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: businessName.trim()
        });
      }
      
      router.push('/setup-stripe');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message);
      } else {
        setError('Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md card-bg rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Create Your Account</h1>
        <p className="text-blue-700 mb-6 text-center">Sign up to start your business campaign on <span className='font-bold text-red-700'>Pendly</span>.</p>
        <form onSubmit={handleSignup} className="space-y-4 w-full">
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-blue-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              required
              className="accent-blue-700 w-4 h-4"
            />
            <label htmlFor="agree" className="text-xs text-blue-900 select-none">
              I agree to the <a href="/terms-of-service" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy-policy" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full px-4 py-3 bg-blue-700/90 text-white rounded-lg font-bold hover:bg-blue-800/90 shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-blue-900">Already have an account? <Link href="/login" className="text-blue-700 underline">Log in</Link></p>
      </div>
    </main>
  );
}
