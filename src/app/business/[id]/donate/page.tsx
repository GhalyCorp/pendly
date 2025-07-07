'use client';

import { useParams } from 'next/navigation';
import DonateForm from '../../../../components/DonateForm';
import { useState } from 'react';

export default function DonatePage() {
  const params = useParams();
  const businessId = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const [locked, setLocked] = useState(false);
  return (
    <main className={
      locked
        ? 'w-full py-10 flex justify-center'
        : 'w-full min-h-screen flex flex-col items-center pt-32'
    }>
      <div
        className={`w-full max-w-md card-bg rounded-xl shadow-lg p-8 flex flex-col min-h-0 overflow-visible transition-all duration-700 ${locked ? 'min-h-[600px]' : 'min-h-[450px]'}`}
      >
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Donate to this Business</h1>
        <p className="text-blue-700 mb-6 text-center">Support this business and receive a reward for your generosity!</p>
        <DonateForm businessId={businessId} onShowPayment={() => setLocked(true)} />
      </div>
    </main>
  );
}
