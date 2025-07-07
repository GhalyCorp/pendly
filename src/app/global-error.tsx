'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">⚠️ Something went wrong!</h1>
            <p className="text-xl mb-6">We're sorry, but something unexpected happened.</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-mono">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-white/60 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 