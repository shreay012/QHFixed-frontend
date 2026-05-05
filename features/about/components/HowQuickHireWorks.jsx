'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCmsContent } from '@/lib/hooks/useCmsContent';
import { useCmsTranslate } from '@/lib/i18n/useCmsTranslate';

export default function HowQuickHireWorks({ hideVideo }) {
  const t = useTranslations('howVideo');
  const tCms = useCmsTranslate();
  const { items: steps } = useCmsContent('process_steps', []);
  return (
    <section
      className="py-16 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/aboutusbg.png)',
        // backgroundColor: '#26472B',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="font-bold text-(--bg-primary) leading-[150%] tracking-[0px] capitalize text-3xl md:text-[44px]"
          >
            {t('title')} <span style={{ color: 'var(--quickhire-green)' }}>{t('titleHighlight')}</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Mobile: Vertical Layout with Dotted Lines */}
          <div className="md:hidden flex flex-col">
            {steps.filter(step => step && step.number).map((step, index) => (
              <div key={step.number} className="relative">
                <Box
                  className="rounded-2xl p-6"
                  sx={{
                    backgroundColor: '#396340',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#78EB54' }}
                    >
                      <span className="text-black font-bold text-lg">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: '20px' }}
                      >
                        {tCms(step.title)}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: '14px' }}
                      >
                        {tCms(step.description)}
                      </p>
                    </div>
                  </div>
                </Box>
                
                {/* Vertical Dotted Line - Only show if not last step */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center gap-1 py-4">
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Original Layout */}
          <div className="hidden md:block relative">
            {/* First Row - 3 Steps */}
            <div className="grid grid-cols-3 gap-14 mb-16 relative">
              {steps.filter(step => step && step.number).slice(0, 3).map((step, index) => (
                <Box
                  key={step.number}
                  className="rounded-2xl p-6 relative"
                  sx={{
                    backgroundColor: '#396340',
                  }}
                >
                  {index < 2 && (
                    <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex gap-1 z-10">
                      <div className="w-2.5 h-0.5 bg-white"></div>
                      <div className="w-2.5 h-0.5 bg-white"></div>
                      <div className="w-2.5 h-0.5 bg-white"></div>
                    </div>
                  )}
                  {/* Vertical connector from card 3 */}
                  {index === 2 && (
                    <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 flex flex-col gap-1 items-center z-10">
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#78EB54' }}
                    >
                      <span className="text-black font-bold text-sm">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: '24px' }}
                      >
                        {tCms(step.title)}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: '16px' }}
                      >
                        {tCms(step.description)}
                      </p>
                    </div>
                  </div>
                </Box>
              ))}
            </div>

            {/* Second Row - 2 Steps (cards 5 and 4) */}
            <div className="grid grid-cols-2 gap-14 relative">
              {steps[4] && (
                <Box
                  key={steps[4].number}
                  className="rounded-2xl p-6 relative"
                  sx={{
                    backgroundColor: '#396340',
                  }}
                >
                  <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex gap-1 z-10">
                    <div className="w-2.5 h-0.5 bg-white"></div>
                    <div className="w-2.5 h-0.5 bg-white"></div>
                    <div className="w-2.5 h-0.5 bg-white"></div>
                  </div>
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#78EB54' }}
                    >
                      <span className="text-black font-bold text-sm">{steps[4].number}</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: '24px' }}
                      >
                        {steps[4].title}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: '16px' }}
                      >
                        {steps[4].description}
                      </p>
                    </div>
                  </div>
                </Box>
              )}
              {steps[3] && (
                <Box
                  key={steps[3].number}
                  className="rounded-2xl p-6 relative"
                  sx={{
                    backgroundColor: '#396340',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#78EB54' }}
                    >
                      <span className="text-black font-bold text-sm">{steps[3].number}</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: '24px' }}
                      >
                        {steps[3].title}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: '16px' }}
                      >
                        {steps[3].description}
                      </p>
                    </div>
                  </div>
                </Box>
              )}
            </div>
          </div>
        </div>

        {/* Video/Content Section - Only show if not hidden */}
        {!hideVideo && (
          <Box
            className="overflow-hidden mx-auto"
            sx={{
              backgroundColor: 'white',
              width: '1240px',
              height: '698px',
              borderRadius: '24px',
              opacity: 1,
              position: 'relative',
              top: '-0.43px',
              transform: 'rotate(0deg)',
              maxWidth: '100%',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 text-lg">
                Video placeholder - How QuickHire Works
              </p>
            </div>
          </Box>
        )}
      </div>
    </section>
  );
}
