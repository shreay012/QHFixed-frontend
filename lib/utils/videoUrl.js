// videoUrl.js — detect external video providers and produce embed URLs.
//
// Used by useSiteVideo callsites so admin can paste a YouTube/Vimeo
// share link from the CMS and we'll render the right element:
//   - .mp4 / .webm / .ogg / .mov → <video src>
//   - youtube / vimeo            → <iframe src=embedUrl>

const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;
const FILE_RE = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;

export function parseVideoUrl(rawUrl, opts = {}) {
  const url = (rawUrl || '').trim().replace(/&amp;/g, '&');
  if (!url) return { type: 'none', embedUrl: '', originalUrl: '' };

  const ytMatch = url.match(YT_RE);
  if (ytMatch) {
    const id = ytMatch[1];
    const params = new URLSearchParams({
      autoplay: opts.autoplay ? '1' : '0',
      mute: opts.muted ? '1' : '0',
      loop: opts.loop ? '1' : '0',
      controls: opts.controls === false ? '0' : '1',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    });
    if (opts.loop) params.set('playlist', id); // YT requires this for loop
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}?${params.toString()}`,
      originalUrl: url,
      videoId: id,
    };
  }

  const vimeoMatch = url.match(VIMEO_RE);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    const params = new URLSearchParams({
      autoplay: opts.autoplay ? '1' : '0',
      muted: opts.muted ? '1' : '0',
      loop: opts.loop ? '1' : '0',
      controls: opts.controls === false ? '0' : '1',
      title: '0',
      byline: '0',
      portrait: '0',
    });
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}?${params.toString()}`,
      originalUrl: url,
      videoId: id,
    };
  }

  if (FILE_RE.test(url) || url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
    return { type: 'file', embedUrl: url, originalUrl: url };
  }

  // Unknown — fall back to file. Browsers with a recognisable mp4 stream will
  // play; otherwise the user sees a broken video frame which is the right
  // signal to fix the CMS URL.
  return { type: 'file', embedUrl: url, originalUrl: url };
}

export function isEmbedded(rawUrl) {
  const t = parseVideoUrl(rawUrl).type;
  return t === 'youtube' || t === 'vimeo';
}
