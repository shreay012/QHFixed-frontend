'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { Breadcrumb, ProfileSidebar } from './index';

// Lazy load section components
const ProfileForm = dynamic(() => import('./ProfileForm'), {
  loading: () => <SectionLoader />,
  ssr: true,
});

const BookingsSection = dynamic(() => import('./BookingsSection'), {
  loading: () => <SectionLoader />,
  ssr: true,
});

const PaymentsSection = dynamic(() => import('./PaymentsSection'), {
  loading: () => <SectionLoader />,
  ssr: true,
});

const SupportSection = dynamic(() => import('./SupportSection'), {
  loading: () => <SectionLoader />,
  ssr: true,
});

// Fallback loading component
const SectionLoader = () => (
  <div className="w-full lg:flex-1 bg-white rounded-2xl p-6 lg:p-8 animate-pulse">
    <div className="space-y-6">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function ProfilePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const handleSectionChange = (section) => {
    // Update state immediately for instant breadcrumb update
    setActiveSection(section);
    // Update URL with section parameter (non-blocking)
    router.push(`?section=${section}`, { scroll: false });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileForm />;
      case 'bookings':
        return <BookingsSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'support':
        return <SupportSection />;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full px-4 py-6 lg:px-20 lg:py-8">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden lg:block mb-0">
          <Breadcrumb activeSection={activeSection} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <ProfileSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

          {/* Dynamic Content with Lazy Loading */}
          <Suspense fallback={<SectionLoader />}>
            {renderSection()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
