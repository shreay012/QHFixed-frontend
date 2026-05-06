import { useEffect, useState } from 'react';
import axiosInstance from '../axios/axiosInstance';

// Module-level cache so multiple components mounting at once share a single
// network request and re-renders don't re-trigger.
let cachedVideos = null;
let inflight = null;

const FALLBACK_BY_ID = {
  'how-we-hire': '/videos/howWeHire.mp4',
  intro: 'https://quickhire.services/backend/backend/videos/Quick-Hire-new-intro-video.mp4',
};

function readCountryCookie() {
  if (typeof document === 'undefined') return 'IN';
  const m = document.cookie.match(/(?:^|;\s*)qh_country=([A-Z]{2})/);
  return m ? m[1] : 'IN';
}

function pickCountryUrl(item, country) {
  if (!item) return '';
  // Country-specific URL takes precedence; falls back to default `url` field
  // when the country slot is empty/unset.
  return (item.urls && item.urls[country]) || item.url || '';
}

async function fetchVideos() {
  if (cachedVideos) return cachedVideos;
  if (inflight) return inflight;
  inflight = axiosInstance
    .get('/cms/videos')
    .then((res) => {
      const items = res?.data?.data?.items || [];
      cachedVideos = items;
      inflight = null;
      return items;
    })
    .catch(() => {
      inflight = null;
      return [];
    });
  return inflight;
}

/**
 * Returns the URL for a CMS-managed site video by id. Picks the
 * country-specific URL (if admin has set one for the user's country)
 * before falling back to the default URL and finally the bundled video.
 *
 * Country resolution: reads `qh_country` cookie set by edge proxy /
 * country selector. Cookie change does not auto-refetch (URL is cached
 * module-level) but re-renders will pick the new country immediately.
 *
 * @param {string} id  Video id from CMS (e.g. "how-we-hire", "intro")
 * @returns {string}   Resolved video URL for the current country
 */
export function useSiteVideo(id = 'how-we-hire') {
  const [url, setUrl] = useState(() => {
    const country = readCountryCookie();
    const found = cachedVideos?.find((v) => v.id === id);
    return pickCountryUrl(found, country) || FALLBACK_BY_ID[id] || FALLBACK_BY_ID['how-we-hire'];
  });

  useEffect(() => {
    let cancelled = false;
    fetchVideos().then((items) => {
      if (cancelled) return;
      const country = readCountryCookie();
      const found = items.find((v) => v.id === id);
      const resolved = pickCountryUrl(found, country);
      if (resolved) setUrl(resolved);
    });
    return () => { cancelled = true; };
  }, [id]);

  return url;
}
