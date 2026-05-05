'use client';
import StaffShell from '@/components/staff/StaffShell';

const links = [
  { href: '/resource', label: 'Dashboard' },
  { href: '/resource/assignments', label: 'Assignments' },
  { href: '/resource/time-logs', label: 'Time Logs' },
];

export default function ResourceLayout({ children }) {
  return <StaffShell role="resource" links={links}>{children}</StaffShell>;
}
