'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  Spinner,
  ErrorBox,
  EmptyState,
  Table,
  Button,
} from '@/components/staff/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------

function EditModal({ currency, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: currency.name || '',
    symbol: currency.symbol || '',
    rateToINR: currency.rateToINR ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFieldError(null);

    const rateVal = parseFloat(form.rateToINR);
    if (!form.name.trim()) return setFieldError('Name is required.');
    if (!form.symbol.trim()) return setFieldError('Symbol is required.');
    if (isNaN(rateVal) || rateVal <= 0) return setFieldError('Rate to INR must be a positive number.');

    setSaving(true);
    try {
      await staffApi.put(`/i18n/admin/currencies/${currency.code}`, {
        name: form.name.trim(),
        symbol: form.symbol.trim(),
        rateToINR: rateVal,
      });
      showSuccess(`${currency.code} updated successfully.`);
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to update currency.';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5F1E2] shadow-[0_16px_48px_rgba(38,71,43,0.15)] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2] bg-[#F2F9F1]">
          <div>
            <h2 className="text-base font-open-sauce-bold text-[#26472B]">
              Edit Currency
            </h2>
            <p className="text-xs font-open-sauce text-[#636363] mt-0.5">
              {currency.code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E5F1E2] transition-colors text-[#636363] hover:text-[#26472B]"
            aria-label="Close"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {fieldError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 font-open-sauce">
              {fieldError}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-open-sauce-semibold text-[#26472B] uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. US Dollar"
              className="w-full px-3 py-2 rounded-lg border border-[#D6EBCF] bg-white text-sm font-open-sauce text-[#484848] placeholder-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] transition"
            />
          </div>

          {/* Symbol */}
          <div className="space-y-1.5">
            <label className="block text-xs font-open-sauce-semibold text-[#26472B] uppercase tracking-wider">
              Symbol
            </label>
            <input
              type="text"
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              placeholder="e.g. $"
              maxLength={4}
              className="w-full px-3 py-2 rounded-lg border border-[#D6EBCF] bg-white text-sm font-open-sauce text-[#484848] placeholder-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] transition"
            />
          </div>

          {/* Rate to INR */}
          <div className="space-y-1.5">
            <label className="block text-xs font-open-sauce-semibold text-[#26472B] uppercase tracking-wider">
              Rate to INR
            </label>
            <input
              type="number"
              name="rateToINR"
              value={form.rateToINR}
              onChange={handleChange}
              placeholder="e.g. 83.5000"
              step="0.0001"
              min="0.0001"
              className="w-full px-3 py-2 rounded-lg border border-[#D6EBCF] bg-white text-sm font-open-sauce text-[#484848] placeholder-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] transition"
            />
            <p className="text-[11px] text-[#636363] font-open-sauce">
              1 {currency.code} = {form.rateToINR || '?'} INR
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(null); // currency object being edited

  const load = useCallback(() => {
    setCurrencies(null);
    setError(null);
    staffApi
      .get('/i18n/admin/currencies')
      .then((r) => setCurrencies(r.data?.data || []))
      .catch((err) => setError(err));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await staffApi.post('/i18n/admin/currencies/refresh');
      const updated = res.data?.data;
      const count =
        Array.isArray(updated)
          ? updated.length
          : (res.data?.updatedCount ?? res.data?.count ?? null);
      showSuccess(
        count != null
          ? `${count} currency rate${count !== 1 ? 's' : ''} refreshed.`
          : 'FX rates refreshed successfully.'
      );
      load();
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to refresh FX rates.';
      showError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2F9F1] text-[#26472B] text-[12px] font-open-sauce-bold uppercase tracking-widest border border-[#D6EBCF]">
          {r.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (r) => (
        <span className="font-open-sauce text-[#484848]">{r.name || '—'}</span>
      ),
    },
    {
      key: 'symbol',
      label: 'Symbol',
      render: (r) => (
        <span className="text-lg font-open-sauce-bold text-[#26472B]">
          {r.symbol || '—'}
        </span>
      ),
    },
    {
      key: 'rateToINR',
      label: 'Rate to INR',
      render: (r) => (
        <span className="font-open-sauce-semibold text-[#26472B] tabular-nums">
          {typeof r.rateToINR === 'number'
            ? r.rateToINR.toFixed(4)
            : '—'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (r) => (
        <span
          className="font-open-sauce text-[#636363] text-xs"
          title={r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''}
        >
          {formatRelativeTime(r.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditing(r)}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Currencies & FX Rates"
        subtitle="Manage exchange rates and currency symbols"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Refreshing…
              </>
            ) : (
              <>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Refresh Rates
              </>
            )}
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-4">
        <ErrorBox error={error} />

        {currencies === null && !error && <Spinner />}

        {currencies !== null && currencies.length === 0 && (
          <EmptyState message="No currencies configured yet." />
        )}

        {currencies !== null && currencies.length > 0 && (
          <Table
            columns={columns}
            rows={currencies}
            keyField="code"
            empty="No currencies found."
          />
        )}
      </div>

      {editing && (
        <EditModal
          currency={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
