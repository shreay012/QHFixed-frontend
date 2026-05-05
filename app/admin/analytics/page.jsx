'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import {
  PageHeader,
  SectionCard,
  Spinner,
  ErrorBox,
  EmptyState,
} from '@/components/staff/ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(n) {
  if (n == null || isNaN(Number(n))) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function shortMonth(str) {
  // str like '2024-01' or a Date string
  try {
    const [y, m] = String(str).split('-');
    if (y && m) {
      return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', { month: 'short' });
    }
    return new Date(str).toLocaleString('en-US', { month: 'short' });
  } catch {
    return str;
  }
}

// ─── Period Config ────────────────────────────────────────────────────────────

const PERIOD_TABS = [
  { key: '7d',   label: '7 Days',    months: 1,  weeks: 2 },
  { key: '30d',  label: '30 Days',   months: 1,  weeks: 4 },
  { key: '3m',   label: '3 Months',  months: 3,  weeks: 12 },
  { key: '6m',   label: '6 Months',  months: 6,  weeks: 24 },
  { key: '12m',  label: '12 Months', months: 12, weeks: 52 },
];

// ─── Period Pill Tabs ─────────────────────────────────────────────────────────

function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PERIOD_TABS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-open-sauce-semibold transition-all duration-200 cursor-pointer ${
            value === p.key
              ? 'bg-[#45A735] text-white shadow-[0_2px_8px_rgba(69,167,53,0.30)]'
              : 'bg-white border border-[#E5F1E2] text-[#636363] hover:border-[#45A735] hover:text-[#26472B]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────

function RevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState message="No revenue data available." />;
  }

  const maxRev = Math.max(...data.map((r) => r.revenue ?? 0), 1);
  const total = data.reduce((sum, r) => sum + (r.revenue ?? 0), 0);

  return (
    <div>
      {/* Chart */}
      <div className="flex items-end gap-1.5 h-48 w-full relative">
        {/* Max label */}
        <span className="absolute top-0 right-0 text-[10px] text-[#909090] font-open-sauce">
          Max: {fmtINR(maxRev)}
        </span>

        {data.map((r) => {
          const barH = Math.max(4, Math.round(((r.revenue ?? 0) / maxRev) * 180));
          const label = r.month ? shortMonth(r.month) : r.label ?? '';
          return (
            <div
              key={r.month ?? r.label ?? Math.random()}
              className="flex flex-col items-center gap-1 flex-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#26472B] text-white text-[10px] font-open-sauce-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                {fmtINR(r.revenue ?? 0)}
              </div>
              <div
                className="w-full bg-[#45A735] rounded-t-lg hover:bg-[#26472B] transition-all duration-500 cursor-default"
                style={{ height: `${barH}px`, minHeight: '4px' }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex items-center gap-1.5 mt-2">
        {data.map((r) => (
          <div
            key={r.month ?? r.label ?? Math.random()}
            className="flex-1 text-center text-[10px] text-[#909090] font-open-sauce"
          >
            {r.month ? shortMonth(r.month) : r.label ?? ''}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-5 pt-4 border-t border-[#E5F1E2] flex items-end justify-between">
        <div>
          <p className="text-xs text-[#636363] font-open-sauce mb-0.5">Total revenue this period</p>
          <p className="text-2xl font-open-sauce-bold text-[#26472B]">{fmtINR(total)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#636363] font-open-sauce">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#45A735]" />
          Monthly revenue
        </div>
      </div>
    </div>
  );
}

// ─── Booking Funnel ───────────────────────────────────────────────────────────

const FUNNEL_FALLBACK = [
  { name: 'View',     pct: 100 },
  { name: 'Cart',     pct: 80  },
  { name: 'Checkout', pct: 65  },
  { name: 'Payment',  pct: 45  },
  { name: 'Complete', pct: 30  },
];

// Green darkens stage by stage
const FUNNEL_COLORS = [
  '#45A735',
  '#3D9430',
  '#35812A',
  '#2D6E24',
  '#26472B',
];

function FunnelChart({ stages }) {
  const items = stages && stages.length > 0 ? stages : null;

  if (!items) {
    // Skeleton
    return (
      <div className="space-y-2.5">
        {FUNNEL_FALLBACK.map((s, i) => (
          <div key={s.name} className="space-y-1">
            <div className="h-4 w-24 rounded bg-[#E5F1E2] animate-pulse" />
            <div
              className="h-10 rounded-lg bg-[#E5F1E2] animate-pulse"
              style={{ width: `${s.pct}%`, animationDelay: `${i * 80}ms` }}
            />
          </div>
        ))}
        <p className="text-xs text-[#909090] font-open-sauce mt-3">
          Funnel data loading or unavailable — showing structure preview.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((s) => s.count ?? 0), 1);

  return (
    <div className="space-y-2">
      {items.map((stage, i) => {
        const widthPct = Math.max(10, Math.round(((stage.count ?? 0) / maxCount) * 100));
        const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length];
        return (
          <div key={stage.name ?? i}>
            <div
              className="h-10 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
              style={{ width: `${widthPct}%`, background: color, minWidth: '200px' }}
            >
              <span className="text-sm font-open-sauce-semibold text-white truncate pr-2">
                {stage.name}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white/90 text-xs font-open-sauce">
                  {(stage.count ?? 0).toLocaleString()}
                </span>
                {stage.dropoff != null && stage.dropoff !== 0 && (
                  <span className="bg-white/25 text-white text-[10px] font-open-sauce-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    -{Number(stage.dropoff).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {items[items.length - 1] != null && (
        <p className="text-xs text-[#636363] font-open-sauce pt-1">
          Overall conversion:{' '}
          <strong className="text-[#26472B]">
            {items[0]?.count
              ? `${((items[items.length - 1].count / items[0].count) * 100).toFixed(1)}%`
              : '—'}
          </strong>
        </p>
      )}
    </div>
  );
}

// ─── RFM Segment Cards ────────────────────────────────────────────────────────

const RFM_META = [
  {
    key: 'champions',
    label: 'Champions',
    icon: '🏆',
    desc: 'Bought recently, buy often, spend the most',
    bg: 'bg-[#F2F9F1]',
    border: 'border-[#45A735]',
    text: 'text-[#26472B]',
  },
  {
    key: 'loyal',
    label: 'Loyal',
    icon: '⭐',
    desc: 'Spend good money and respond well to promotions',
    bg: 'bg-[#EFF6FF]',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  {
    key: 'at_risk',
    label: 'At Risk',
    icon: '⚠️',
    desc: 'Spent big money, booked often — but long ago',
    bg: 'bg-[#FFF7ED]',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  {
    key: 'lost',
    label: 'Lost',
    icon: '💔',
    desc: 'Lowest scores in recency, frequency, spend',
    bg: 'bg-[#FFF5F5]',
    border: 'border-red-200',
    text: 'text-red-700',
  },
];

function RfmGrid({ data }) {
  // Support both flat counts and nested {segments}
  const counts = data?.segments ?? data ?? {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {RFM_META.map((m) => {
        const count = counts[m.key] ?? data?.[m.key] ?? null;
        return (
          <div
            key={m.key}
            className={`${m.bg} border ${m.border} rounded-2xl p-5 flex items-start gap-4`}
          >
            <div className="text-3xl leading-none select-none flex-shrink-0" role="img" aria-label={m.label}>
              {m.icon}
            </div>
            <div className="min-w-0">
              <div className={`text-[11px] uppercase tracking-wider font-open-sauce-semibold ${m.text} opacity-70 mb-0.5`}>
                {m.label}
              </div>
              <div className={`text-3xl font-open-sauce-bold ${m.text} leading-tight`}>
                {count != null ? count.toLocaleString() : '—'}
              </div>
              <div className="text-xs text-[#636363] font-open-sauce mt-1 leading-snug">
                {m.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Cohort Table ─────────────────────────────────────────────────────────────

function CohortTable({ cohorts }) {
  // cohorts can be object {bucketDate: {users, totalBookings, totalSpend}} or array
  let rows = [];

  if (cohorts && typeof cohorts === 'object' && !Array.isArray(cohorts)) {
    rows = Object.entries(cohorts).map(([bucketDate, vals]) => ({
      bucketDate,
      users: vals.users ?? 0,
      totalBookings: vals.totalBookings ?? 0,
      totalSpend: vals.totalSpend ?? 0,
      avgBookings: vals.users > 0 ? (vals.totalBookings / vals.users).toFixed(2) : '—',
      avgSpend: vals.users > 0 ? vals.totalSpend / vals.users : null,
    }));
  } else if (Array.isArray(cohorts)) {
    rows = cohorts.map((c) => ({
      bucketDate: c.bucketDate ?? c.cohort ?? c.week ?? '—',
      users: c.users ?? 0,
      totalBookings: c.totalBookings ?? c.bookings ?? 0,
      totalSpend: c.totalSpend ?? c.spend ?? 0,
      avgBookings: (c.users > 0 && c.totalBookings != null)
        ? (c.totalBookings / c.users).toFixed(2)
        : '—',
      avgSpend: (c.users > 0 && (c.totalSpend ?? c.spend) != null)
        ? (c.totalSpend ?? c.spend) / c.users
        : null,
    }));
  }

  if (rows.length === 0) {
    return <EmptyState message="No cohort data available." />;
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="min-w-full text-sm font-open-sauce">
        <thead className="bg-[#F2F9F1]">
          <tr>
            {['Cohort Week', 'Users', 'Total Bookings', 'Avg Bookings/User', 'Total Spend', 'Avg Spend/User'].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-[11px] font-open-sauce-semibold uppercase tracking-wider text-[#26472B] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF5EC]">
          {rows.map((row, i) => (
            <tr key={row.bucketDate ?? i} className="hover:bg-[#F7FBF6] transition-colors">
              <td className="px-5 py-3 font-open-sauce-semibold text-[#26472B] whitespace-nowrap">
                {row.bucketDate}
              </td>
              <td className="px-5 py-3 text-[#484848]">{(row.users ?? 0).toLocaleString('en-IN')}</td>
              <td className="px-5 py-3 text-[#484848]">{(row.totalBookings ?? 0).toLocaleString('en-IN')}</td>
              <td className="px-5 py-3 text-[#484848]">{row.avgBookings}</td>
              <td className="px-5 py-3 text-[#484848]">{fmtINR(row.totalSpend)}</td>
              <td className="px-5 py-3 text-[#484848]">{row.avgSpend != null ? fmtINR(row.avgSpend) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Retention Cards ──────────────────────────────────────────────────────────

function RetentionCard({ label, value, hint }) {
  const pct = value != null ? Math.min(100, Math.max(0, Number(value))) : null;
  const color = pct == null ? '#909090' : pct > 60 ? '#45A735' : pct > 30 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-white border border-[#E5F1E2] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#636363] font-open-sauce-semibold mb-1">
            {label}
          </p>
          <p className="text-4xl font-open-sauce-bold text-[#26472B] leading-tight">
            {pct != null ? `${pct.toFixed(1)}%` : '—'}
          </p>
          {hint && <p className="text-xs text-[#636363] font-open-sauce mt-1">{hint}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke={color}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-[#E5F1E2] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct ?? 0}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Section Skeleton ─────────────────────────────────────────────────────────

function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-[#E5F1E2]" style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('6m');

  const [revenue, setRevenue]     = useState({ data: null, loading: true,  error: null });
  const [funnel,  setFunnel]      = useState({ data: null, loading: true,  error: null });
  const [rfm,     setRfm]         = useState({ data: null, loading: true,  error: null });
  const [cohorts, setCohorts]     = useState({ data: null, loading: true,  error: null });
  const [retention, setRetention] = useState({ data: null, loading: true,  error: null });

  const fetchAll = useCallback((selectedPeriod) => {
    const cfg = PERIOD_TABS.find((p) => p.key === selectedPeriod) || PERIOD_TABS[3];

    setRevenue(  (s) => ({ ...s, loading: true, error: null }));
    setFunnel(   (s) => ({ ...s, loading: true, error: null }));
    setRfm(      (s) => ({ ...s, loading: true, error: null }));
    setCohorts(  (s) => ({ ...s, loading: true, error: null }));
    setRetention((s) => ({ ...s, loading: true, error: null }));

    Promise.allSettled([
      staffApi.get('/admin/dashboard/revenue'),
      staffApi.get('/analytics/funnel'),
      staffApi.get('/analytics/rfm'),
      staffApi.get('/analytics/cohorts', { params: { granularity: 'week', periods: cfg.weeks } }),
      staffApi.get('/analytics/retention'),
    ]).then(([revRes, funRes, rfmRes, cohRes, retRes]) => {
      // Revenue
      if (revRes.status === 'fulfilled') {
        const raw = revRes.value.data?.data ?? revRes.value.data;
        setRevenue({ data: Array.isArray(raw) ? raw : [], loading: false, error: null });
      } else {
        setRevenue({ data: null, loading: false, error: revRes.reason });
      }

      // Funnel
      if (funRes.status === 'fulfilled') {
        const raw = funRes.value.data?.data ?? funRes.value.data;
        setFunnel({ data: raw, loading: false, error: null });
      } else {
        setFunnel({ data: null, loading: false, error: null }); // non-fatal: shows skeleton
      }

      // RFM
      if (rfmRes.status === 'fulfilled') {
        const raw = rfmRes.value.data?.data ?? rfmRes.value.data;
        setRfm({ data: raw, loading: false, error: null });
      } else {
        setRfm({ data: null, loading: false, error: rfmRes.reason });
      }

      // Cohorts
      if (cohRes.status === 'fulfilled') {
        const raw = cohRes.value.data?.data ?? cohRes.value.data;
        const cohortData = raw?.cohorts ?? raw;
        setCohorts({ data: cohortData, loading: false, error: null });
      } else {
        setCohorts({ data: null, loading: false, error: cohRes.reason });
      }

      // Retention
      if (retRes.status === 'fulfilled') {
        const raw = retRes.value.data?.data ?? retRes.value.data;
        setRetention({ data: raw, loading: false, error: null });
      } else {
        setRetention({ data: null, loading: false, error: retRes.reason });
      }
    });
  }, []);

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const funnelStages = funnel.data?.stages ?? (Array.isArray(funnel.data) ? funnel.data : null);
  const retData = retention.data ?? {};

  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      <PageHeader
        title="Analytics"
        subtitle="Platform insights, cohorts, revenue trends, and user behaviour"
      />

      {/* Period selector */}
      <div className="px-4 sm:px-8 pt-4 pb-2 bg-white border-b border-[#E5F1E2]">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="p-4 sm:p-8 space-y-6">

        {/* ── SECTION 1: Revenue Overview ─────────────────────────────────── */}
        <SectionCard
          title="Revenue Overview"
          subtitle="Monthly revenue trend across selected period"
        >
          {revenue.loading ? (
            <SectionSkeleton rows={4} />
          ) : revenue.error ? (
            <ErrorBox error={revenue.error} />
          ) : (
            <RevenueBarChart data={revenue.data} />
          )}
        </SectionCard>

        {/* ── SECTION 2: Booking Funnel ────────────────────────────────────── */}
        <SectionCard
          title="Booking Funnel"
          subtitle="View → Checkout → Complete conversion"
        >
          {funnel.loading ? (
            <SectionSkeleton rows={5} />
          ) : (
            <FunnelChart stages={funnelStages} />
          )}
        </SectionCard>

        {/* ── SECTION 3: RFM Segments ──────────────────────────────────────── */}
        <SectionCard
          title="Customer Segments (RFM)"
          subtitle="Recency-Frequency-Monetary analysis"
        >
          {rfm.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-[#E5F1E2]" />
              ))}
            </div>
          ) : rfm.error ? (
            <ErrorBox error={rfm.error} />
          ) : rfm.data ? (
            <RfmGrid data={rfm.data} />
          ) : (
            <EmptyState message="RFM data unavailable." />
          )}
        </SectionCard>

        {/* ── SECTION 4: Cohort Table ──────────────────────────────────────── */}
        <SectionCard
          title="Acquisition Cohorts"
          subtitle="Weekly booking cohorts — users, bookings, and spend over time"
        >
          {cohorts.loading ? (
            <SectionSkeleton rows={6} />
          ) : cohorts.error ? (
            <ErrorBox error={cohorts.error} />
          ) : (
            <CohortTable cohorts={cohorts.data} />
          )}
        </SectionCard>

        {/* ── SECTION 5: Retention ────────────────────────────────────────── */}
        <SectionCard title="User Retention">
          {retention.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#E5F1E2]" />
              ))}
            </div>
          ) : retention.error ? (
            <ErrorBox error={retention.error} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RetentionCard
                label="D7 Retention"
                value={retData.D7 ?? retData.week1 ?? retData.d7 ?? null}
                hint="Users still active 7 days after first booking"
              />
              <RetentionCard
                label="D30 Retention"
                value={retData.D30 ?? retData.week4 ?? retData.d30 ?? null}
                hint="Users still active 30 days after first booking"
              />
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
