'use client';

/**
 * Ticket SLA dashboard — surfaces tickets that have breached the support
 * response SLA windows (open: 2h, escalated: 4h, in_progress: 24h).
 * Wires backend GET /admin-ops/tickets/sla.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import staffApi from '@/lib/axios/staffApi';
import { PageHeader, Spinner, ErrorBox, Button, EmptyState } from '@/components/staff/ui';

function fmtAge(d) {
  if (!d) return '—';
  const ms = Date.now() - new Date(d).getTime();
  const hours = Math.floor(ms / 3600_000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${Math.floor((ms % 3600_000) / 60000)}m`;
  return `${Math.floor(ms / 60000)}m`;
}

function StatusPill({ status }) {
  const map = {
    open:        { bg: 'bg-amber-50',   ring: 'ring-amber-200',  text: 'text-amber-700' },
    in_progress: { bg: 'bg-blue-50',    ring: 'ring-blue-200',   text: 'text-blue-700' },
    escalated:   { bg: 'bg-orange-50',  ring: 'ring-orange-200', text: 'text-orange-700' },
  };
  const cls = map[status] || { bg: 'bg-slate-50', ring: 'ring-slate-200', text: 'text-slate-700' };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 ${cls.bg} ${cls.text} ${cls.ring}`}>
      {String(status || '').replace('_', ' ')}
    </span>
  );
}

export default function SlaDashboardPage() {
  const router = useRouter();
  const [breaches, setBreaches] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi.get('/admin-ops/tickets/sla')
      .then((r) => setBreaches(r.data?.data || []))
      .catch((err) => { setError(err); setBreaches([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = (breaches || []).reduce((acc, t) => {
    const k = t.status || 'unknown';
    (acc[k] = acc[k] || []).push(t);
    return acc;
  }, {});

  const totalBreaches = (breaches || []).length;

  return (
    <div className="min-h-screen bg-[#F7FBF6]">
      <PageHeader
        title="SLA Dashboard"
        subtitle="Tickets breaching response-time targets"
        action={
          <Button variant="subtle" size="sm" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Summary card */}
        <div className={`rounded-2xl border px-6 py-5 flex items-center justify-between ${
          totalBreaches >= 10 ? 'bg-red-50 border-red-200'
          : totalBreaches >= 1 ? 'bg-orange-50 border-orange-200'
          : 'bg-[#F2F9F1] border-[#E5F1E2]'
        }`}>
          <div>
            <div className="text-sm font-open-sauce-semibold text-[#26472B]">Total Breaches</div>
            <div className="text-xs text-[#636363] font-open-sauce mt-0.5">
              SLA targets · open ≤ 2h · escalated ≤ 4h · in-progress ≤ 24h
            </div>
          </div>
          <div className={`text-4xl font-open-sauce-bold ${
            totalBreaches >= 10 ? 'text-red-600'
            : totalBreaches >= 1 ? 'text-orange-600'
            : 'text-[#26472B]'
          }`}>
            {loading ? '…' : totalBreaches}
          </div>
        </div>

        <ErrorBox error={error} />

        {loading && <Spinner />}

        {!loading && totalBreaches === 0 && (
          <EmptyState message="No SLA breaches. Support team is on top of it." />
        )}

        {!loading && totalBreaches > 0 && (
          <div className="space-y-6">
            {Object.entries(groups).map(([status, tickets]) => (
              <div key={status} className="bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF5EC]">
                  <div className="flex items-center gap-3">
                    <StatusPill status={status} />
                    <span className="text-sm font-open-sauce-bold text-[#26472B]">
                      {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} breaching
                    </span>
                  </div>
                  <span className="text-xs text-[#909090] font-open-sauce">
                    SLA window: {tickets[0]?.slaHours}h
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-open-sauce">
                    <thead className="bg-[#F7FBF6]">
                      <tr>
                        {['Subject', 'Last Updated', 'Age', 'Action'].map((h) => (
                          <th key={h} className="text-left text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold px-4 py-2.5 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF5EC]">
                      {tickets.map((t) => (
                        <tr key={String(t._id)} className="hover:bg-[#F7FBF6]">
                          <td className="px-4 py-3 align-top max-w-md">
                            <div className="text-sm font-open-sauce-semibold text-[#26472B] truncate">
                              {t.subject || '—'}
                            </div>
                            <code className="text-[11px] text-[#909090] font-mono">#{String(t._id).slice(-8)}</code>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-[#636363]">
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            }) : '—'}
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            <span className="text-sm font-open-sauce-bold text-red-600">
                              {fmtAge(t.updatedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => router.push(`/admin/tickets/${t._id}`)}
                            >
                              Open
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
