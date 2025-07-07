export default function TestDeployment() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">✅ Deployment Test</h1>
        <p className="text-xl">Your Pendly app is working correctly!</p>
        <p className="text-sm mt-4">Build: {new Date().toISOString()}</p>
      </div>
    </div>
  );
} 