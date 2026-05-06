'use client';

import { useEffect, useState } from 'react';
import { getActiveCountry, isCountryAdmin } from '@/lib/utils/role';

const COUNTRY_FLAGS = {
  IN: '🇮🇳',
  AE: '🇦🇪',
  DE: '🇩🇪',
  AU: '🇦🇺',
  US: '🇺🇸',
  GB: '🇬🇧',
  SG: '🇸🇬',
  CA: '🇨🇦',
  SA: '🇸🇦',
};

const COUNTRY_NAMES = {
  IN: 'India',
  AE: 'United Arab Emirates',
  DE: 'Germany',
  AU: 'Australia',
  US: 'United States',
  GB: 'United Kingdom',
  SG: 'Singapore',
  CA: 'Canada',
  SA: 'Saudi Arabia',
};

/**
 * Non-interactive label shown to country_admin users so they always know
 * which country's data they're viewing. Renders nothing for other roles.
 */
export default function CountryBadge() {
  const [mounted, setMounted] = useState(false);
  const [country, setCountry] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCountry(getActiveCountry());
    setShow(isCountryAdmin());
  }, []);

  if (!mounted || !show || !country) return null;

  const flag = COUNTRY_FLAGS[country] || '🌍';
  const name = COUNTRY_NAMES[country] || country;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2F9F1] border border-[#45A735]/20 text-sm font-medium text-[#26472B]"
      title={`Managing: ${name}`}
    >
      <span style={{ fontSize: 16 }}>{flag}</span>
      <span>Managing: {name}</span>
    </div>
  );
}
