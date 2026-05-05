'use client';

import Image from 'next/image';
import { SectionWrapper } from '@/components/common';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function WhoWeAreFullSection() {
  const t = useTranslations('aboutUs.readySection');
  return (
    <SectionWrapper>
      <div className="relative rounded-3xl overflow-hidden" >
        {/* Background Image - Full Coverage */}
        <div className=" smaterbg  inset-0">
          <Image
            src="/images/about/bgaboutus.png"
            alt="Professional"
            fill
            className="object-cover object-right"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="readybg z-10 flex items-center h-full px-8 py-16 ">
          {/* Text Content - Left Side */}
          <div className="max-w-2xl">
            <h2
              className="text-2xl md:text-4xl font-bold text-white leading-tight mb-6"
              style={{
                fontWeight: "var(--font-weight-700)"
              }}
            >
              {t('title')}
            </h2>
            <p
              className="text-xl text-white mb-10"
              style={{
                fontSize:"var(--font-size-20 )",
                color:"var(--text-tertiary)",
                fontWeight: "var( --font-weight-400)"
              }}
            >
              {t('subtitle')}
            </p>

            {/* Get Started Button */}
            <Link
              href="/book-your-resource"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: "'OpenSauceOne', sans-serif",
                fontWeight: 600
              }}
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
