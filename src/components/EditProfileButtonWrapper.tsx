'use client';
import EditProfileButton from './EditProfileButton';

export default function EditProfileButtonWrapper({ businessEmail, businessId }: { businessEmail: string; businessId: string }) {
  return <EditProfileButton businessEmail={businessEmail} businessId={businessId} />;
}
