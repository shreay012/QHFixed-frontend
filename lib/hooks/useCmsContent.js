'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios/axiosInstance';
import { ENDPOINTS } from '@/lib/endpoints';

// Lightweight in-memory cache so multiple components asking for the same
// CMS key only fire one request per page-load.
const cache = new Map();
const inflight = new Map();

export function useCmsContent(key, fallback = []) {
  const [items, setItems] = useState(() => cache.get(key) || fallback);
  const [loading, setLoading] = useState(() => !cache.has(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (cache.has(key)) {
      setItems(cache.get(key));
      setLoading(false);
      return;
    }
    let promise = inflight.get(key);
    if (!promise) {
      promise = axiosInstance
        .get(ENDPOINTS.CMS.GET(key))
        .then((res) => res?.data?.data?.items || [])
        .finally(() => inflight.delete(key));
      inflight.set(key, promise);
    }
    promise
      .then((data) => {
        if (cancelled) return;
        cache.set(key, data);
        setItems(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { items, loading, error };
}
