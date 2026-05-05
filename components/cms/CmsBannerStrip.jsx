'use client';

import Link from 'next/link';
import { useCmsBanners } from '@/lib/hooks/useCmsBanners';

/**
 * CmsBannerStrip — renders all active banners at the given position.
 * Banners are managed by admin via /admin/cms/banners (backend: cms-x/banners).
 *
 * Each banner schema (from cmsExpanded.routes.js):
 *   { title, body, ctaLabel, ctaUrl, imageUrl, position, country,
 *     validFrom, validTo, active }
 *
 * Renders nothing if no banners are active for the given position/country.
 */
export default function CmsBannerStrip({ position = 'hero', className = '' }) {
  const { banners, loading } = useCmsBanners(position);

  if (loading || !banners?.length) return null;

  return (
    <div className={className}>
      {banners.map((b) => (
        <BannerCard key={String(b._id)} banner={b} />
      ))}
    </div>
  );
}

function BannerCard({ banner }) {
  const { title, body, ctaLabel, ctaUrl, imageUrl } = banner || {};
  if (!title && !body && !imageUrl) return null;

  const Wrapper = ctaUrl ? Link : 'div';
  const wrapperProps = ctaUrl ? { href: ctaUrl } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="block bg-gradient-to-r from-[#26472B] via-[#2E5A33] to-[#45A735] text-white rounded-2xl shadow-lg overflow-hidden mb-4"
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title || ''} className="w-full sm:w-48 h-32 sm:h-auto object-cover" />
        )}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center gap-2">
          {title && <h3 className="text-lg sm:text-xl font-bold leading-tight">{title}</h3>}
          {body && <p className="text-sm text-white/85">{body}</p>}
          {ctaLabel && (
            <span className="mt-2 inline-flex items-center self-start text-xs sm:text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors rounded-full px-4 py-1.5 ring-1 ring-white/25">
              {ctaLabel} →
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
