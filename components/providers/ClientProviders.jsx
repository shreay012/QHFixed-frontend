'use client';

import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LegalAcceptanceProvider } from './LegalAcceptanceProvider';
import { SocketProvider } from './SocketProvider';

/**
 * Client-only providers wrapper.
 * Keeps layout.jsx (server component) free of client imports.
 *
 * Provider order (outer-most first):
 *   ErrorBoundary → SocketProvider → LegalAcceptanceProvider
 *
 * <Toaster /> is the single global toast surface (react-hot-toast).
 * SocketProvider lives at the root so realtime notifications + sound work
 * across every page (customer, /admin, /pm, /resource, /staff-login).
 */
export default function ClientProviders({ children }) {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <LegalAcceptanceProvider>
          {children}
        </LegalAcceptanceProvider>
      </SocketProvider>
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ zIndex: 9999 }}
        toastOptions={{
          duration: 5000,
          style: { fontFamily: 'inherit', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#45A735', secondary: '#fff' } },
        }}
      />
    </ErrorBoundary>
  );
}
