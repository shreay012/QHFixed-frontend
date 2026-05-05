'use client';

import React from 'react';
import Image from 'next/image';

const ExpertCardV3 = ({ service, iconUrl }) => {
  if (!service) return null;

  const subServicesText = service.technologies?.length
    ? service.technologies.map((tech) => tech.name).join(' | ')
    : service.description || '';

  return (
    <div
      onClick={() => {}}
      className="relative w-full cursor-pointer overflow-hidden rounded-[24px] border border-[#E6E6E6] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group"
      style={{ minHeight: '380px' }}
    >
      <div
        className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "url('/images/resource-services/book-resource-bg.png')",
          backgroundSize: 'cover',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F1F1F1] bg-white shrink-0">
            <Image
              src={iconUrl || '/images/resource-services/developer.svg'}
              alt={service.name || 'Service'}
              width={30}
              height={30}
            />
          </div>
          <div className="h-[1px] flex-1 bg-[#F1F1F1]" />
        </div>

        <h3 className="text-[24px] font-bold leading-tight text-[#000000] font-['Open_Sauce_One_Bold'] mb-4">
          {service.name}
        </h3>

        <div className="flex-grow">
          <p className="text-[14px] leading-[1.8] text-[#636363] font-['Open_Sauce_One_Regular'] line-clamp-5">
            {subServicesText}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#45A735] transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/images/explore-arrow-v3.svg"
              alt="arrow"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertCardV3;
