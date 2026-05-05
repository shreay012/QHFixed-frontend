import { Suspense } from 'react';
import ProfilePageClient from '@/features/profile/components/ProfilePageClient';

export const metadata = {
  title: 'My Profile - QuickHire',
  description: 'Manage your profile information and settings on QuickHire.',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white"></div>}>
      <ProfilePageClient />
    </Suspense>
  );
}
