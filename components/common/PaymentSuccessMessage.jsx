'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useTranslations } from 'next-intl';

const PaymentSuccessMessage = () => {
  const t = useTranslations("paymentSuccess");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    const timer = setTimeout(() => {
      if (jobId) {
        router.push(`/booking-workspace/${jobId}`);
      } else {
        // Fallback: profile bookings listing
        router.push('/profile?section=bookings');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        backgroundImage: "linear-gradient(358deg, rgb(255, 255, 255), #78eb541a), linear-gradient(0.01deg, rgb(255, 255, 255) 0.01%, rgb(221, 239, 218) 99.99%)",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Confetti Background Overlay */}
      <div className="absolute inset-x-0 top-0 h-1/2 z-0 overflow-hidden">
        <img 
          src="/images/cart/successlines.svg" 
          alt="confetti" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-auto">
        {/* Checkmark Circle */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center justify-center">
          <img 
              src="/images/cart/successcheck.svg" 
              alt="success checkmark"
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
            />
          </div>
        </div>

        {/* Main Title */}
        <h1 
          style={{
            color: '#484848',
            fontWeight: 700,
          }}
          className="text-lg sm:text-xl md:text-xl lg:text-2xl mb-3 text-center"
        >
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: '#909090',
            fontWeight: 500,
          }}
          className="text-xs sm:text-sm md:text-sm lg:text-sm mb-6 text-center"
        >
          {t("subtitle")}
        </p>

        {/* Description */}
        <p
          style={{
            color: '#909090',
            fontWeight: 500,
          }}
          className="text-xs sm:text-sm md:text-sm lg:text-sm text-center max-w-2xl"
        >
          {t("desc")}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessMessage;
