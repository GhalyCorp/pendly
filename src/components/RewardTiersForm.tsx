'use client';

// import { useState } from 'react';

type RewardTier = {
  minAmount: string;
  coupon: string;
};

type Props = {
  rewardTiers: RewardTier[];
  setRewardTiersAction: (tiers: RewardTier[]) => void;
};

export default function RewardTiersForm({ rewardTiers, setRewardTiersAction }: Props) {
  const handleTierChange = (idx: number, field: keyof RewardTier, value: string) => {
    const updated = [...rewardTiers];
    updated[idx][field] = value;
    setRewardTiersAction(updated);
  };

  const addTier = () => {
    setRewardTiersAction([...rewardTiers, { minAmount: '', coupon: '' }]);
  };

  const removeTier = (idx: number) => {
    setRewardTiersAction(rewardTiers.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-blue-900">Reward Tiers</h2>
      {rewardTiers.map((tier, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Min Donation ($)"
            value={tier.minAmount}
            onChange={e => handleTierChange(idx, 'minAmount', e.target.value)}
            className="border rounded p-2 w-32 text-gray-900 placeholder-gray-500"
            required
          />
          <input
            type="text"
            placeholder="Coupon/Reward"
            value={tier.coupon}
            onChange={e => handleTierChange(idx, 'coupon', e.target.value)}
            className="border rounded p-2 flex-1 text-gray-900 placeholder-gray-500"
            required
          />
          {rewardTiers.length > 1 && (
            <button type="button" onClick={() => removeTier(idx)} className="text-red-600">Remove</button>
          )}
        </div>
      ))}
      <button type="button" onClick={addTier} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add another section</button>
    </div>
  );
}
