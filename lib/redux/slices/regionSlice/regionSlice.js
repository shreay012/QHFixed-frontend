/**
 * Region slice — country / locale / currency state.
 *
 * Source of truth priority (per 09-geo-detection-routing.md):
 *  1. URL path segment  (/in/, /ae/, …)  – detected on hydration
 *  2. qh_country cookie  – set by Next.js middleware (middleware.js)
 *  3. DEFAULT_COUNTRY_CODE ('IN')
 *
 * The Next.js middleware (middleware.js) automatically sets the three
 * cookies (qh_country / qh_locale / qh_currency) on every request before
 * the page loads, so hydration here is always reading middleware-resolved values.
 */
import { createSlice } from "@reduxjs/toolkit";
import {
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  LOCALE_CODES,
  CURRENCY_CODES,
} from "@/lib/i18n/config";

const SUPPORTED_COUNTRIES = new Set(['IN', 'AE', 'DE', 'US', 'AU']);
const DEFAULT_COUNTRY = 'IN';

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; samesite=lax`;
}

/**
 * Detect country from the URL path segment (e.g. /in/ → 'IN').
 * Returns null when path has no country prefix.
 */
function countryFromPath() {
  if (typeof window === "undefined") return null;
  const seg = window.location.pathname.split('/').filter(Boolean)[0]?.toUpperCase();
  return seg && SUPPORTED_COUNTRIES.has(seg) ? seg : null;
}

const initialState = {
  country: DEFAULT_COUNTRY,
  locale: DEFAULT_LOCALE,
  currency: DEFAULT_CURRENCY,
  hydrated: false,
};

const regionSlice = createSlice({
  name: "region",
  initialState,
  reducers: {
    /**
     * Called once on app boot (ClientProviders or root layout effect).
     * Reads from URL path first, then cookies set by middleware.
     */
    hydrateFromCookies(state) {
      // URL path takes highest priority
      const pathCountry = countryFromPath();
      const c = pathCountry || readCookie("qh_country");
      const l = readCookie("qh_locale");
      const cur = readCookie("qh_currency");

      if (c && SUPPORTED_COUNTRIES.has(c.toUpperCase())) {
        state.country = c.toUpperCase();
      } else {
        state.country = DEFAULT_COUNTRY;
      }
      if (l && LOCALE_CODES.includes(l)) state.locale = l;
      if (cur && CURRENCY_CODES.includes(cur)) state.currency = cur;
      state.hydrated = true;
    },
    /**
     * Programmatically switch country (country-switcher component).
     * Writes the cookie so the middleware picks it up on the next request.
     */
    setCountry(state, action) {
      const next = action.payload?.toUpperCase();
      if (next && SUPPORTED_COUNTRIES.has(next)) {
        state.country = next;
        writeCookie("qh_country", next);
      }
    },
    setLocale(state, action) {
      const next = action.payload;
      if (LOCALE_CODES.includes(next)) {
        state.locale = next;
        writeCookie("qh_locale", next);
      }
    },
    setCurrency(state, action) {
      const next = action.payload;
      if (CURRENCY_CODES.includes(next)) {
        state.currency = next;
        writeCookie("qh_currency", next);
      }
    },
  },
});

export const { hydrateFromCookies, setCountry, setLocale, setCurrency } = regionSlice.actions;
export default regionSlice.reducer;

// Selectors
export const selectLocale   = (s) => s.region?.locale   || DEFAULT_LOCALE;
export const selectCurrency = (s) => s.region?.currency || DEFAULT_CURRENCY;
export const selectCountry  = (s) => s.region?.country  || DEFAULT_COUNTRY;

import { COUNTRY_REGIONS, FALLBACK_REGION } from "@/lib/i18n/config";
export const selectTaxInfo = (s) => {
  const country = s.region?.country;
  const region = country ? (COUNTRY_REGIONS[country] || FALLBACK_REGION) : FALLBACK_REGION;
  return { taxRate: region.taxRate, taxLabel: region.taxLabel };
};
