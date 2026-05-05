'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Breadcrumb = ({ activeSection = 'profile' }) => {
  const t = useTranslations('breadcrumb');

  const getSectionLabel = () => {
    switch (activeSection) {
      case 'bookings':
        return t('bookings');
      case 'payments':
        return t('payments');
      case 'support':
        return t('supportHelp');
      case 'profile':
      default:
        return t('profile');
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm font-opensauce mb-6">
      <Link href="/" className="text-gray-600 hover:text-[#45A735] transition-colors">
        {t('home')}
      </Link>
      <span className="text-gray-400">/</span>
      {activeSection !== 'profile' ? (
        <>
          <Link
            href="/profile?section=profile"
            className="text-gray-600 hover:text-[#45A735] transition-colors"
          >
            {t('profile')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#45A735] font-medium">{getSectionLabel()}</span>
        </>
      ) : (
        <span className="text-[#45A735] font-medium">{t('profile')}</span>
      )}
    </div>
  );
};

export default Breadcrumb;
