import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl mb-8">The page you're looking for doesn't exist.</p>
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Go Home
          </Link>
          <div className="text-sm text-white/60">
            <p>Or try one of these pages:</p>
            <div className="mt-2 space-x-4">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/business/create" className="hover:text-white transition-colors">Create Campaign</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 