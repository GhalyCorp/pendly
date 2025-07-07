'use client';

import StripeProvider from './StripeProvider';
import DonateForm from './DonateForm';

export default function BusinessDonationSection({ businessId }: { businessId: string }) {
  return (
    <StripeProvider>
      <DonateForm businessId={businessId} />
    </StripeProvider>
  );
}
