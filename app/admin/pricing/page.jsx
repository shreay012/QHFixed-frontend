'use client';

import React, { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  Spinner,
  ErrorBox,
  EmptyState,
  Button,
} from '@/components/staff/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = ['INR', 'USD', 'AED', 'EUR', 'GBP', 'AUD', 'SGD', 'CAD'];

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  AED: 'د.إ',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  SGD: 'S$',
  CAD: 'C$',
};

const EMPTY_FORM = {
  serviceId: '',
  serviceName: '',
  country: '',
  price: '',
  currency: 'USD',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency + ' ';
  const num = Number(price);
  if (isNaN(num)) return '—';
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function extractError(e) {
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || 'Request failed';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label className="block text-[11px] font-open-sauce-semibold text-[#636363] uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#26472B] placeholder-[#B0C9AA] focus:outline-none focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] transition-colors ${className}`}
    />
  );
}

function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#26472B] bg-white focus:outline-none focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

function StatusPill({ active }) {
  return active === false ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Inactive
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold bg-[#F2F9F1] text-[#26472B] ring-1 ring-[#45A735]/40">
      <span className="w-1.5 h-1.5 rounded-full bg-[#45A735]" />
      Active
    </span>
  );
}

function CountryHeaderRow({ country, count }) {
  return (
    <tr className="bg-[#F7FBF6]">
      <td colSpan={6} className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest font-open-sauce-semibold text-[#45A735]">
            {country}
          </span>
          <span className="text-[10px] font-open-sauce text-[#999] bg-[#E5F1E2] rounded-full px-2 py-0.5">
            {count} override{count !== 1 ? 's' : ''}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Create Override Modal ────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const valid =
    form.serviceId.trim() &&
    form.country.trim() &&
    form.price !== '' &&
    Number(form.price) > 0 &&
    form.currency;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await staffApi.post('/geo-pricing/admin', {
        serviceId: form.serviceId.trim(),
        serviceName: form.serviceName.trim() || undefined,
        country: form.country.trim().toUpperCase(),
        price: Number(form.price),
        currency: form.currency,
      });
      showSuccess('Price override created!');
      onCreated();
    } catch (err) {
      showError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5F1E2]">
          <h3 className="text-lg font-open-sauce-bold text-[#26472B]">Add Price Override</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F2F9F1] text-[#636363] hover:text-[#26472B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Service ID */}
          <div>
            <Label>Service ID *</Label>
            <Input
              value={form.serviceId}
              onChange={set('serviceId')}
              placeholder="e.g. 6642f0a3c1b2e4d8f0a1b2c3"
              required
            />
            <p className="mt-1 text-[11px] text-[#999] font-open-sauce">
              Find the service ID from the Services page.
            </p>
          </div>

          {/* Service Name (optional) */}
          <div>
            <Label>Display Name <span className="normal-case font-normal text-[#999]">(optional)</span></Label>
            <Input
              value={form.serviceName}
              onChange={set('serviceName')}
              placeholder="e.g. Web Development"
            />
          </div>

          {/* Country */}
          <div>
            <Label>Country Code *</Label>
            <Input
              value={form.country}
              onChange={set('country')}
              placeholder="e.g. AE, DE, US, IN"
              maxLength={4}
              required
            />
            <p className="mt-1 text-[11px] text-[#999] font-open-sauce">
              ISO 3166-1 alpha-2 country code (e.g. AE, IN, DE, AU, US).
            </p>
          </div>

          {/* Price + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Currency *</Label>
              <Select value={form.currency} onChange={set('currency')} required>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {CURRENCY_SYMBOLS[c]} {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={busy || !valid}>
              {busy ? 'Creating…' : 'Create Override'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGeoPricingPage() {
  const [overrides, setOverrides] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');

  // ── Data loading ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setOverrides(null);
    setError(null);
    try {
      const res = await staffApi.get('/geo-pricing/admin');
      setOverrides(res.data?.data || []);
    } catch (e) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await staffApi.delete(`/geo-pricing/admin/${id}`);
      showSuccess('Price override deleted.');
      setConfirmDeleteId(null);
      await load();
    } catch (e) {
      showError(extractError(e));
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtering + grouping ─────────────────────────────────────────────────

  const filtered = (overrides || []).filter((o) => {
    const matchCountry = filterCountry
      ? o.country?.toLowerCase().includes(filterCountry.toLowerCase())
      : true;
    const matchCurrency = filterCurrency ? o.currency === filterCurrency : true;
    return matchCountry && matchCurrency;
  });

  // Group by country, preserving alphabetical order
  const grouped = filtered.reduce((acc, o) => {
    const key = o.country || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});
  const sortedCountries = Object.keys(grouped).sort();

  // ── Render ────────────────────────────────────────────────────────────────

  const hasFilters = filterCountry || filterCurrency;
  const showEmpty = overrides !== null && filtered.length === 0;

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Geo Pricing"
        subtitle="Override service prices by country"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Override
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-5">
        {/* Error */}
        <ErrorBox error={error} />

        {/* Filter row */}
        {overrides !== null && !error && (
          <div className="bg-white border border-[#E5F1E2] rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-end shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
            <div className="flex-1 min-w-[160px]">
              <Label>Filter by Country</Label>
              <Input
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                placeholder="e.g. AE, IN…"
              />
            </div>
            <div className="w-44">
              <Label>Filter by Currency</Label>
              <Select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
              >
                <option value="">All currencies</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {CURRENCY_SYMBOLS[c]} {c}
                  </option>
                ))}
              </Select>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilterCountry(''); setFilterCurrency(''); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {overrides === null && !error && <Spinner />}

        {/* Empty state */}
        {showEmpty && (
          <EmptyState
            message={
              hasFilters
                ? 'No overrides match the current filters.'
                : 'No geo price overrides yet. Click "Add Override" to create one.'
            }
          />
        )}

        {/* Table */}
        {overrides !== null && !error && filtered.length > 0 && (
          <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
            <table className="min-w-full text-sm font-open-sauce">
              <thead className="bg-[#F2F9F1]">
                <tr>
                  {['Service Name', 'Country', 'Price', 'Currency', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] uppercase tracking-wider font-open-sauce-semibold text-[#26472B] px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5EC]">
                {sortedCountries.map((country) => (
                  <React.Fragment key={country}>
                    <CountryHeaderRow
                      country={country}
                      count={grouped[country].length}
                    />
                    {grouped[country].map((o) => (
                      <tr
                        key={o._id}
                        className="hover:bg-[#F7FBF6] transition-colors"
                      >
                        {/* Service Name */}
                        <td className="px-4 py-3.5 text-[#26472B] font-open-sauce-semibold align-middle">
                          {o.serviceName || (
                            <span className="text-[#999] font-normal italic">Unnamed</span>
                          )}
                          <div className="text-[10px] text-[#B0C9AA] font-open-sauce font-normal mt-0.5 truncate max-w-[200px]">
                            {o.serviceId}
                          </div>
                        </td>

                        {/* Country */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#E5F1E2] text-[#26472B] text-xs font-open-sauce-semibold tracking-wide">
                            {o.country}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 align-middle font-open-sauce-semibold text-[#26472B]">
                          {formatPrice(o.price, o.currency)}
                        </td>

                        {/* Currency */}
                        <td className="px-4 py-3.5 align-middle text-[#636363]">
                          {o.currency || '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 align-middle">
                          <StatusPill active={o.active} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 align-middle">
                          {confirmDeleteId === o._id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#636363] font-open-sauce">
                                Sure?
                              </span>
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={deleting}
                                onClick={() => handleDelete(o._id)}
                              >
                                {deleting ? '…' : 'Yes, delete'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={deleting}
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmDeleteId(o._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary bar */}
        {overrides !== null && overrides.length > 0 && (
          <div className="text-[11px] text-[#999] font-open-sauce text-right">
            Showing {filtered.length} of {overrides.length} override{overrides.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </div>
        )}
      </div>

      {/* Create Override Modal */}
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}
