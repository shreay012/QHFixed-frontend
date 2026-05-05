"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LOCALES, CURRENCIES } from "@/lib/i18n/config";
import {
  setLocale,
  setCurrency,
  selectLocale,
  selectCurrency,
} from "@/lib/redux/slices/regionSlice/regionSlice";

/**
 * Header dropdown that lets the user pick UI language + display currency.
 * - Updates Redux + cookie immediately.
 * - Reloads the page so server components (next-intl messages) re-render
 *   with the new locale.
 */
export default function LocaleCurrencySwitcher({ compact = false, mobile = false }) {
  const dispatch = useDispatch();
  const locale = useSelector(selectLocale);
  const currency = useSelector(selectCurrency);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const activeLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];
  const activeCur = CURRENCIES[currency] || CURRENCIES.INR;

  const onPickLocale = (code) => {
    dispatch(setLocale(code));
    // next-intl needs a navigation to load new server messages
    if (typeof window !== "undefined") window.location.reload();
  };

  const onPickCurrency = (code) => {
    dispatch(setCurrency(code));
    setOpen(false);
  };

  if (mobile) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Language
        </p>
        <div className="grid grid-cols-2 gap-1">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onPickLocale(l.code)}
              className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-start ${
                l.code === locale
                  ? "bg-[#45A735]/10 text-[#45A735] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="truncate">{l.name}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mt-3 mb-2">
          Currency
        </p>
        <div className="grid grid-cols-2 gap-1">
          {Object.values(CURRENCIES).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onPickCurrency(c.code)}
              className={`flex items-center justify-between px-2 py-2 rounded-md text-sm ${
                c.code === currency
                  ? "bg-[#45A735]/10 text-[#45A735] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{c.code}</span>
              <span className="text-gray-500">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-[#45A735] hover:text-[#45A735] transition-all ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
        aria-label="Language and currency"
      >
        <span className="text-base leading-none">{activeLocale.flag}</span>
        <span className="font-medium">{activeLocale.code.toUpperCase()}</span>
        <span className="text-gray-400">·</span>
        <span className="font-medium">{activeCur.code}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-60">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50">
          <div className="px-4 pb-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Language
            </div>
            <div className="grid grid-cols-2 gap-1">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onPickLocale(l.code)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm text-start ${
                    l.code === locale
                      ? "bg-[#45A735]/10 text-[#45A735] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span className="truncate">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 mt-2 pt-2 px-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Currency
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(CURRENCIES).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onPickCurrency(c.code)}
                  className={`flex items-center justify-between px-2 py-2 rounded-md text-sm ${
                    c.code === currency
                      ? "bg-[#45A735]/10 text-[#45A735] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">{c.code}</span>
                  <span className="text-gray-500">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
