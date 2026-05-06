'use client';

import { forwardRef } from 'react';
import { parseVideoUrl } from '@/lib/utils/videoUrl';

/**
 * Renders the right element for a CMS-managed video URL:
 *   - YouTube / Vimeo → <iframe>
 *   - .mp4 / direct file → <video>
 *
 * The DOM ref is forwarded only for native <video>; for iframes, ref is null
 * (YouTube/Vimeo have their own players, programmatic play/pause controls
 * from the parent component will be no-ops). Parents should hide their
 * custom overlay controls when {provider !== 'file'} — pass a render-prop
 * via children if needed.
 */
const SmartVideo = forwardRef(function SmartVideo(
  {
    src,
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    playsInline = true,
    className,
    style,
    poster,
    title = 'Video',
    onLoadedMetadata,
    children,
  },
  ref,
) {
  const { type, embedUrl } = parseVideoUrl(src, { autoplay: autoPlay, muted, loop, controls });

  if (type === 'youtube' || type === 'vimeo') {
    return (
      <iframe
        title={title}
        src={embedUrl}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={className}
        style={style}
        frameBorder="0"
      />
    );
  }

  return (
    <video
      ref={ref}
      src={embedUrl}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      className={className}
      style={style}
      poster={poster || undefined}
      onLoadedMetadata={onLoadedMetadata}
    >
      {children}
    </video>
  );
});

export default SmartVideo;
