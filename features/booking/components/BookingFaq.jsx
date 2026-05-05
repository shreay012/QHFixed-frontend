'use client';

import { useTranslations } from 'next-intl';
import FaqSection from '@/components/common/FaqSection';

const BookingFaq = () => {
  const t = useTranslations('bookingFaq');
  const faqs = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
  ];

  return (
    <FaqSection
      title={t('title')}
      description={t('description')}
      faqs={faqs}
    />
  );
};

export default BookingFaq;
