'use client';

/**
 * CountrySwitcher
 *
 * Lets users override their auto-detected country/currency.
 * Writes to qh_country + qh_currency cookies, then reloads to
 * trigger middleware re-detection and Redux regionSlice refresh.
 *
 * Usage:
 *   <CountrySwitcher />                    — icon button with dropdown
 *   <CountrySwitcher variant="full" />     — full label + flag version
 */

import { useState, useRef, useEffect } from 'react';

const MARKETS = [
  { code: 'IN', flag: '🇮🇳', label: 'India',              currency: 'INR', locale: 'en' },
  { code: 'AE', flag: '🇦🇪', label: 'UAE',                currency: 'AED', locale: 'ar' },
  { code: 'DE', flag: '🇩🇪', label: 'Germany',            currency: 'EUR', locale: 'de' },
  { code: 'US', flag: '🇺🇸', label: 'United States',      currency: 'USD', locale: 'en' },
  { code: 'AU', flag: '🇦🇺', label: 'Australia',          currency: 'AUD', locale: 'en' },
];

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;samesite=lax;max-age=${maxAge}`;
}

export default function CountrySwitcher({ variant = 'icon' }) {
  const [open, setOpen]     = useState(false);
  const [current, setCurrent] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const code = readCookie('qh_country') || 'IN';
    setCurrent(MARKETS.find((m) => m.code === code) || MARKETS[0]);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(market) {
    setCookie('qh_country', market.code);
    setCookie('qh_currency', market.currency);
    setCookie('qh_locale', market.locale);
    setOpen(false);
    // Reload to re-initialize Redux regionSlice and re-run middleware
    window.location.reload();
  }

  if (!current) return null;

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch country"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
                   hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2
                   focus:ring-[#45A735] focus:ring-offset-1"
      >
        <span className="text-lg leading-none" aria-hidden="true">{current.flag}</span>
        {variant === 'full' && (
          <>
            <span className="font-medium text-gray-700">{current.code}</span>
            <span className="text-gray-400 text-xs">{current.currency}</span>
          </>
        )}
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute end-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100
                     z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Select market</p>
          </div>
          {MARKETS.map((market) => (
            <button
              key={market.code}
              type="button"
              onClick={() => select(market)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                          ${current.code === market.code
                            ? 'bg-[#45A735]/10 text-[#26472B] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
            >
              <span className="text-xl leading-none w-6 text-center">{market.flag}</span>
              <div className="flex-1 text-start">
                <div className="font-medium">{market.label}</div>
                <div className="text-xs text-gray-400">{market.currency}</div>
              </div>
              {current.code === market.code && (
                <svg className="w-4 h-4 text-[#45A735]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
