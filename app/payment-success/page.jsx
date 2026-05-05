import { Suspense } from 'react';
import PaymentSuccessMessage from '@/components/common/PaymentSuccessMessage';

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessMessage />
    </Suspense>
  );
}
