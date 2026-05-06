'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { isSuperAdmin } from '@/lib/utils/role';

const COUNTRIES = [
  { code: '', flag: '🌍', name: 'All Countries (global)' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'US', flag: '🇺🇸', name: 'United States' },
];

/**
 * Super-admin-only country switcher. Selecting a country appends
 * `?asCountry=<CC>` to the current URL — the backend's countryScope
 * middleware honours this override only for super_admin tokens, simulating
 * a country_admin's view for that request. Selecting "All" removes the
 * param and restores global view.
 *
 * Renders nothing for non-super_admin roles.
 */
export default function CountrySelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShow(isSuperAdmin());
  }, []);

  if (!mounted || !show) return null;

  const current = searchParams.get('asCountry') || '';

  const onChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('asCountry', value);
    } else {
      params.delete('asCountry');
    }
    const qs = params.toString();
    // Hard reload so every page-level useEffect / loader re-runs against
    // the new scope. Soft router.push + router.refresh() doesn't reliably
    // re-trigger client-side data fetches that depend on search params,
    // and the staffApi interceptor reads window.location.search directly.
    if (typeof window !== 'undefined') {
      window.location.href = qs ? `${pathname}?${qs}` : pathname;
    } else {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }
  };

  const sel = COUNTRIES.find((c) => c.code === current) || COUNTRIES[0];

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-[#636363] font-medium">View as:</span>
      <select
        value={current}
        onChange={onChange}
        className="border border-[#E5F1E2] rounded-lg px-2.5 py-1.5 text-sm bg-white text-[#242424] focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none cursor-pointer"
        title="Switch view to a specific country (super_admin debug aid)"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code || 'all'} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
      <span className="text-xs text-[#909090]">
        {sel.code ? `(filtering ${sel.code})` : ''}
      </span>
    </label>
  );
}
