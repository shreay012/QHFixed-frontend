// /frontend/app/admin/ops/fraud/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { PageHeader, Spinner, ErrorBox, Button } from '@/components/staff/ui';

/* ── helpers ────────────────────────────────────────────────────────────────── */
function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtAmount(v) {
  if (v == null) return '—';
  return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/* ── Risk score gauge ────────────────────────────────────────────────────────── */
function RiskGauge({ score }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  const color =
    pct >= 75 ? '#DC2626' :   // red
    pct >= 50 ? '#EA580C' :   // orange
    pct >= 25 ? '#D97706' :   // amber
               '#16A34A';     // green
  const label =
    pct >= 75 ? 'Critical' :
    pct >= 50 ? 'High' :
    pct >= 25 ? 'Medium' :
               'Low';

  return (
    <div className="bg-white border border-[#E5F1E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,71,43,0.04)] flex flex-col items-center gap-4">
      <div className="text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold">
        Overall Risk Score
      </div>

      {/* Semicircle gauge */}
      <div className="relative w-44 h-24 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full" style={{ overflow: 'visible' }}>
          {/* Track */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#F0F4F0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 157} 157`}
            style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.4s ease' }}
          />
          {/* Needle dot */}
          <circle
            cx={60 + 50 * Math.cos(Math.PI - (pct / 100) * Math.PI)}
            cy={60 - 50 * Math.sin((pct / 100) * Math.PI)}
            r="5"
            fill={color}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-open-sauce-bold" style={{ color }}>{pct}</span>
          <span className="text-[11px] font-open-sauce-semibold" style={{ color }}>{label}</span>
        </div>
      </div>

      <p className="text-xs text-[#909090] font-open-sauce text-center max-w-xs">
        Composite score (0 = no risk · 100 = critical). Derived from velocity spikes,
        failed payments, repeated amounts and cancellation patterns.
      </p>
    </div>
  );
}

/* ── Metric card ─────────────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, color = 'green', pulse = false }) {
  const colorMap = {
    green:  { bg: 'bg-[#F2F9F1]', border: 'border-[#D6EBCF]', text: 'text-[#26472B]' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
    slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700' },
  };
  const { bg, border, text } = colorMap[color] || colorMap.green;

  return (
    <div className={`${bg} border ${border} rounded-2xl p-5 flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold">{label}</span>
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div className={`text-3xl font-open-sauce-bold ${text}`}>{value ?? '—'}</div>
      {sub && <div className="text-xs text-[#909090] font-open-sauce">{sub}</div>}
    </div>
  );
}

/* ── Section card wrapper ─────────────────────────────────────────────────────── */
function SectionCard({ title, count, countColor = 'text-[#484848]', children }) {
  return (
    <div className="bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF5EC]">
        <h3 className="text-sm font-open-sauce-semibold text-[#26472B]">{title}</h3>
        {count != null && (
          <span className={`text-sm font-open-sauce-bold ${countColor}`}>{count}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Empty section ───────────────────────────────────────────────────────────── */
function SectionEmpty({ message = 'No data' }) {
  return (
    <div className="py-6 text-center text-sm text-[#909090] font-open-sauce italic">{message}</div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────────── */
export default function FraudMonitorPage() {
  const [report, setReport]   = useState(null);   // aggregated fraud report object
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    staffApi
      .get('/admin-ops/fraud')
      .then((r) => {
        // Backend returns: { data: { timestamp, riskScore, failedPayments24h, velocitySpike15m, repeatedPaymentAmounts, cancelAfterPayment1h } }
        setReport(r.data?.data || r.data || null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Destructure report safely */
  const {
    timestamp,
    riskScore              = 0,
    failedPayments24h      = { count: 0, items: [] },
    velocitySpike15m       = { count: 0, users: [] },
    repeatedPaymentAmounts = { count: 0, items: [] },
    cancelAfterPayment1h   = 0,
  } = report || {};

  const riskColor =
    riskScore >= 75 ? 'red' :
    riskScore >= 50 ? 'orange' :
    riskScore >= 25 ? 'amber' :
    'green';

  return (
    <div className="min-h-screen bg-[#F7FBF6]">
      <PageHeader
        title="Fraud Monitor"
        subtitle="Live aggregated fraud risk report"
        actions={
          <Button
            variant="subtle"
            size="sm"
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Last updated */}
        {timestamp && (
          <p className="text-xs text-[#909090] font-open-sauce">
            Last updated: <span className="font-open-sauce-semibold text-[#636363]">{fmt(timestamp)}</span>
          </p>
        )}

        <ErrorBox error={error} />
        {loading && <Spinner />}

        {!loading && report && (
          <>
            {/* ── Top row: gauge + metric cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <RiskGauge score={riskScore} />
              </div>
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
                <MetricCard
                  label="Failed Payments (24h)"
                  value={failedPayments24h.count ?? 0}
                  sub="Transactions declined"
                  color={failedPayments24h.count >= 10 ? 'red' : failedPayments24h.count >= 5 ? 'orange' : 'amber'}
                  pulse={failedPayments24h.count >= 10}
                />
                <MetricCard
                  label="Velocity Spikes (15m)"
                  value={velocitySpike15m.count ?? 0}
                  sub="Rapid-fire users"
                  color={velocitySpike15m.count >= 5 ? 'red' : velocitySpike15m.count >= 2 ? 'orange' : 'slate'}
                  pulse={velocitySpike15m.count >= 5}
                />
                <MetricCard
                  label="Repeated Amounts"
                  value={repeatedPaymentAmounts.count ?? 0}
                  sub="Duplicate payment patterns"
                  color={repeatedPaymentAmounts.count >= 3 ? 'orange' : 'amber'}
                />
                <MetricCard
                  label="Cancel-after-Pay (1h)"
                  value={cancelAfterPayment1h ?? 0}
                  sub="Paid then cancelled"
                  color={cancelAfterPayment1h >= 5 ? 'red' : cancelAfterPayment1h >= 2 ? 'orange' : 'green'}
                  pulse={cancelAfterPayment1h >= 5}
                />
              </div>
            </div>

            {/* ── Failed Payments detail ── */}
            <SectionCard
              title="Failed Payments (Last 24 Hours)"
              count={failedPayments24h.count ?? 0}
              countColor={failedPayments24h.count > 0 ? 'text-orange-600' : 'text-[#26472B]'}
            >
              {(!failedPayments24h.items || failedPayments24h.items.length === 0) ? (
                <SectionEmpty message="No failed payments in the last 24 hours." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-open-sauce">
                    <thead>
                      <tr className="text-left">
                        {['User', 'Amount', 'Gateway', 'Error', 'Date'].map((h) => (
                          <th key={h} className="text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold px-3 py-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF5EC]">
                      {failedPayments24h.items.map((item, i) => (
                        <tr key={item._id || i} className="hover:bg-[#F7FBF6] transition-colors">
                          <td className="px-3 py-2.5 align-top">
                            <div className="font-open-sauce-semibold text-[#26472B] text-xs">{item.userName || item.userId || '—'}</div>
                            {item.userId && (
                              <code className="text-[11px] text-[#909090] font-mono">{String(item.userId).slice(-8)}</code>
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-[#484848] text-xs">
                            {fmtAmount(item.amount)}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span className="text-xs bg-[#F5F7F5] text-[#484848] px-2 py-0.5 rounded-md font-open-sauce">
                              {item.gateway || item.provider || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-top max-w-[200px]">
                            <span className="text-xs text-red-600 font-open-sauce break-words">{item.error || item.reason || '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-xs text-[#636363]">
                            {fmtDate(item.createdAt || item.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* ── Velocity Spikes detail ── */}
            <SectionCard
              title="Velocity Spikes (Last 15 Minutes)"
              count={velocitySpike15m.count ?? 0}
              countColor={velocitySpike15m.count > 0 ? 'text-red-600' : 'text-[#26472B]'}
            >
              {(!velocitySpike15m.users || velocitySpike15m.users.length === 0) ? (
                <SectionEmpty message="No velocity spikes detected in the last 15 minutes." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-open-sauce">
                    <thead>
                      <tr className="text-left">
                        {['User', 'Requests', 'Endpoint / Action', 'First Seen', 'Last Seen'].map((h) => (
                          <th key={h} className="text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold px-3 py-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF5EC]">
                      {velocitySpike15m.users.map((u, i) => (
                        <tr key={u._id || u.userId || i} className="hover:bg-[#F7FBF6] transition-colors">
                          <td className="px-3 py-2.5 align-top">
                            <div className="font-open-sauce-semibold text-[#26472B] text-xs">{u.userName || '—'}</div>
                            {u.userId && (
                              <code className="text-[11px] text-[#909090] font-mono">{String(u.userId).slice(-8)}</code>
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span className="text-sm font-open-sauce-bold text-red-600">{u.count ?? u.requests ?? '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 align-top max-w-[200px]">
                            <code className="text-xs text-[#484848] font-mono bg-[#F5F7F5] px-1.5 py-0.5 rounded break-all">
                              {u.endpoint || u.action || '—'}
                            </code>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-xs text-[#636363]">
                            {fmt(u.firstSeen)}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-xs text-[#636363]">
                            {fmt(u.lastSeen)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* ── Repeated Payment Amounts detail ── */}
            <SectionCard
              title="Repeated Payment Amounts"
              count={repeatedPaymentAmounts.count ?? 0}
              countColor={repeatedPaymentAmounts.count > 0 ? 'text-amber-600' : 'text-[#26472B]'}
            >
              {(!repeatedPaymentAmounts.items || repeatedPaymentAmounts.items.length === 0) ? (
                <SectionEmpty message="No suspicious repeated payment amounts detected." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-open-sauce">
                    <thead>
                      <tr className="text-left">
                        {['Amount', 'Occurrences', 'Users', 'Time Window', 'Date'].map((h) => (
                          <th key={h} className="text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold px-3 py-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF5EC]">
                      {repeatedPaymentAmounts.items.map((item, i) => (
                        <tr key={item._id || i} className="hover:bg-[#F7FBF6] transition-colors">
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span className="font-open-sauce-bold text-[#26472B] text-sm">
                              {fmtAmount(item.amount)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span className="text-sm font-open-sauce-bold text-amber-600">×{item.count ?? item.occurrences ?? '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 align-top max-w-[220px]">
                            {Array.isArray(item.users) && item.users.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.users.slice(0, 5).map((u, j) => (
                                  <span key={j} className="text-[11px] bg-[#F2F9F1] text-[#26472B] border border-[#E5F1E2] rounded-md px-1.5 py-0.5 font-open-sauce">
                                    {u.name || u.userName || String(u.id || u).slice(-6)}
                                  </span>
                                ))}
                                {item.users.length > 5 && (
                                  <span className="text-[11px] text-[#909090] font-open-sauce">+{item.users.length - 5} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#909090] text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-xs text-[#636363]">
                            {item.window || item.timeWindow || '—'}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-xs text-[#636363]">
                            {fmtDate(item.detectedAt || item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* ── Cancel-after-Payment callout ── */}
            <div className={`rounded-2xl border px-6 py-4 flex items-center justify-between ${
              cancelAfterPayment1h >= 5
                ? 'bg-red-50 border-red-200'
                : cancelAfterPayment1h >= 2
                ? 'bg-orange-50 border-orange-200'
                : 'bg-[#F2F9F1] border-[#E5F1E2]'
            }`}>
              <div>
                <div className="text-sm font-open-sauce-semibold text-[#26472B]">
                  Cancel-after-Payment (last 1 hour)
                </div>
                <div className="text-xs text-[#636363] font-open-sauce mt-0.5">
                  Bookings where payment was collected then immediately cancelled
                </div>
              </div>
              <div className={`text-3xl font-open-sauce-bold ${
                cancelAfterPayment1h >= 5 ? 'text-red-600' :
                cancelAfterPayment1h >= 2 ? 'text-orange-600' :
                'text-[#26472B]'
              }`}>
                {cancelAfterPayment1h ?? 0}
              </div>
            </div>
          </>
        )}

        {!loading && !report && !error && (
          <div className="py-20 text-center text-[#909090] font-open-sauce text-sm">
            No fraud report data available.
          </div>
        )}
      </div>
    </div>
  );
}
