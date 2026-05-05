'use client';

import Image from 'next/image';
import { SectionWrapper, SectionHeader } from '@/components/common';
import { useCmsContent } from '@/lib/hooks/useCmsContent';
import { useTranslations } from 'next-intl';

export default function WhoWeServeSection() {
  const t = useTranslations("aboutUs");
  const { items: segments } = useCmsContent('segments', []);

  const SegmentCard = ({ segment }) => (
    <div className="flex flex-col items-center text-center p-6  ">
      <div className="w-32 h-32 md:w-40 md:h-40 p-6 rounded-xl border border-[#78EB54] bg-white flex items-center justify-center">
        <Image
          src={segment.icon}
          alt={segment.title}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <h3 
        className="mt-4 font-bold"
        style={{ fontSize: '16px', color: '#484848' }}
      >
        {segment.title}
      </h3>
      <p 
        className="mt-2 leading-relaxed font-normal"
        style={{ fontSize: '14px', color: '#636363' }}
      >
        {segment.description}
      </p>
    </div>
  );

  return (
    <SectionWrapper className="py-0!">
      <SectionHeader
        title={t("whoWeServeTitle")}
        subtitle={t("whoWeServeSubtitle")}
      />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {segments.map((segment, index) => (
          <SegmentCard key={index} segment={segment} />
        ))}
      </div>
    </SectionWrapper>
  );
}
