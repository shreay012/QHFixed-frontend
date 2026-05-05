'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios/axiosInstance';

// Fetch CMS banners filtered by position + active country.
// Backend: GET /api/cms-x/banners?position=<position>&country=<country>
// Returns active banners within their valid date range.
//
// Used to power CMS-driven hero/announcement strips on user-end pages so
// admins can change copy/CTA/imagery without a deploy.
const cache = new Map();
const inflight = new Map();

function readCountryFromCookie() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)qh_country=([A-Z]{2})/);
  return m ? m[1] : null;
}

export function useCmsBanners(position, fallback = []) {
  const country = readCountryFromCookie() || 'IN';
  const cacheKey = `banners:${position}:${country}`;

  const [banners, setBanners] = useState(() => cache.get(cacheKey) || fallback);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (cache.has(cacheKey)) {
      setBanners(cache.get(cacheKey));
      setLoading(false);
      return;
    }
    let promise = inflight.get(cacheKey);
    if (!promise) {
      promise = axiosInstance
        .get('/cms-x/banners', { params: { position, country } })
        .then((res) => Array.isArray(res?.data?.data) ? res.data.data : [])
        .finally(() => inflight.delete(cacheKey));
      inflight.set(cacheKey, promise);
    }
    promise
      .then((data) => {
        if (cancelled) return;
        cache.set(cacheKey, data);
        setBanners(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [cacheKey, position, country]);

  return { banners, loading, error };
}
