'use client';
import StaffShell from '@/components/staff/StaffShell';

const links = [
  { href: '/pm', label: 'Dashboard' },
  { href: '/pm/bookings', label: 'My Bookings' },
];

export default function PmLayout({ children }) {
  return <StaffShell role="pm" links={links}>{children}</StaffShell>;
}
