export default function StatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-blue-700">
      <div className="text-center text-white p-8">
        <h1 className="text-6xl font-bold mb-4">✅</h1>
        <h2 className="text-3xl font-bold mb-4">Deployment Working!</h2>
        <p className="text-xl mb-4">Your Pendly app is successfully deployed.</p>
        <div className="text-sm opacity-80">
          <p>Build Time: {new Date().toISOString()}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Vercel Environment: {process.env.VERCEL_ENV || 'not set'}</p>
        </div>
      </div>
    </div>
  );
} 