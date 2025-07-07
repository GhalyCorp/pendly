'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to my-campaigns after login
      router.push('/my-campaigns');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message);
      } else {
        setError('Login failed.');
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md card-bg rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Log In</h1>
        <p className="text-blue-700 mb-6 text-center">Access your business campaign on <span className='font-bold text-red-700'>Pendly</span>.</p>
        <form onSubmit={handleLogin} className="space-y-4 w-full">
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
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-700/90 text-white rounded-lg font-bold hover:bg-blue-800/90 shadow-md transition"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-sm text-blue-900">Don&apos;t have an account? <Link href="/signup" className="text-red-700 underline">Sign up</Link></p>
      </div>
    </main>
  );
}
