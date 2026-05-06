import { useEffect, useState } from 'react';
import axiosInstance from '../axios/axiosInstance';

// Module-level cache so multiple components mounting at once share a single
// network request and re-renders don't re-trigger.
let cachedVideos = null;
let inflight = null;

const FALLBACK = '/videos/howWeHire.mp4';

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
 * Returns the URL for a CMS-managed site video by id, falling back to the
 * bundled /videos/howWeHire.mp4 if the API hasn't loaded yet or the id
 * isn't found. Admin controls the URL from /admin/cms/videos.
 *
 * @param {string} id  Video id from CMS (e.g. "how-we-hire")
 * @returns {string}   Video URL
 */
export function useSiteVideo(id = 'how-we-hire') {
  const [url, setUrl] = useState(() => {
    const found = cachedVideos?.find((v) => v.id === id);
    return found?.url || FALLBACK;
  });

  useEffect(() => {
    let cancelled = false;
    fetchVideos().then((items) => {
      if (cancelled) return;
      const found = items.find((v) => v.id === id);
      if (found?.url) setUrl(found.url);
    });
    return () => { cancelled = true; };
  }, [id]);

  return url;
}
