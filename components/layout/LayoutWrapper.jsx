'use client';

import { usePathname } from 'next/navigation';
import { Header, Footer } from './';

// Strip a `/in|/ae|/de|/us|/au` country prefix so route-matching below works
// the same whether the URL is /admin or /de/admin (next.config.js rewrites
// the latter to the former at the server, but pathname in the browser still
// reads as /de/admin and would otherwise leak the customer Header/Footer
// into staff portals).
const COUNTRY_PREFIX_RE = /^\/(?:in|ae|de|us|au)(?=\/|$)/i;
function normalizePath(p) {
  if (!p) return p;
  return p.replace(COUNTRY_PREFIX_RE, '') || '/';
}

export default function LayoutWrapper({ children }) {
  const pathname = normalizePath(usePathname());

  // Don't show header/footer on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Staff portals (admin/pm/resource) use their own layout
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/pm') ||
    pathname.startsWith('/resource') ||
    pathname.startsWith('/staff-login')
  ) {
    return <>{children}</>;
  }

  // Don't show footer on service-details, booking-workspace, and support-chat pages
  const showFooter =
    !pathname.startsWith('/service-details') &&
    !pathname.startsWith('/booking-workspace') &&
    !pathname.startsWith('/support-chat');

  return (
    <>
      <Header />
      {children}
      {showFooter && <Footer />}
    </>
  );
}
