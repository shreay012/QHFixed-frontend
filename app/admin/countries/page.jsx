'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  Spinner,
  ErrorBox,
  EmptyState,
  Button,
} from '@/components/staff/ui';

/* ─── helpers ─────────────────────────────────────────────── */

function toDisplayRate(rate) {
  // 0.18 → "18"
  if (rate === null || rate === undefined || rate === '') return '';
  return String(parseFloat((Number(rate) * 100).toPrecision(10)));
}

function fromDisplayRate(str) {
  // "18" → 0.18
  const n = parseFloat(str);
  if (isNaN(n)) return 0;
  return parseFloat((n / 100).toPrecision(10));
}

/* ─── StatusToggle ────────────────────────────────────────── */

function StatusToggle({ enabled, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      title={enabled ? 'Click to disable' : 'Click to enable'}
    >
      {/* pill track */}
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200
          ${enabled ? 'bg-[#45A735] border-[#45A735]' : 'bg-[#D1D5DB] border-[#D1D5DB]'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200
            ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </span>
      <span
        className={`text-[11px] font-open-sauce-semibold px-2 py-0.5 rounded-full
          ${enabled
            ? 'bg-[#F2F9F1] text-[#45A735] ring-1 ring-[#D6EBCF]'
            : 'bg-[#F5F7F5] text-[#9CA3AF] ring-1 ring-[#E5E7EB]'}`}
      >
        {loading ? '…' : enabled ? 'Active' : 'Disabled'}
      </span>
    </button>
  );
}

/* ─── EditModal ───────────────────────────────────────────── */

const FIELD_CLASS =
  'w-full px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#484848] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] focus:outline-none transition';

function EditModal({ country, onClose, onSaved }) {
  const [form, setForm] = useState({
    currency: country.currency || '',
    locale: country.locale || '',
    taxRateDisplay: toDisplayRate(country.taxRate),
    taxLabel: country.taxLabel || '',
    enabled: !!country.enabled,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        currency: form.currency.trim(),
        locale: form.locale.trim(),
        taxRate: fromDisplayRate(form.taxRateDisplay),
        taxLabel: form.taxLabel.trim(),
        enabled: form.enabled,
      };
      await staffApi.put(`/i18n/admin/countries/${country.code}`, payload);
      showSuccess(`${country.name} updated successfully.`);
      onSaved();
    } catch (err) {
      showError(
        err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to update country.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5F1E2] overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2] bg-[#F2F9F1]">
          <div>
            <h2 className="text-base font-open-sauce-bold text-[#26472B]">
              {country.flag && <span className="mr-2">{country.flag}</span>}
              Edit {country.name}
            </h2>
            <p className="text-xs text-[#636363] font-open-sauce mt-0.5">
              Country code: <span className="font-open-sauce-semibold text-[#45A735]">{country.code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E5F1E2] text-[#636363] hover:text-[#26472B] transition-colors cursor-pointer"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* currency */}
          <div>
            <label className="block text-xs font-open-sauce-semibold text-[#26472B] mb-1.5 uppercase tracking-wide">
              Currency
            </label>
            <input
              type="text"
              className={FIELD_CLASS}
              placeholder="e.g. INR"
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
              required
            />
          </div>

          {/* locale */}
          <div>
            <label className="block text-xs font-open-sauce-semibold text-[#26472B] mb-1.5 uppercase tracking-wide">
              Locale
            </label>
            <input
              type="text"
              className={FIELD_CLASS}
              placeholder="e.g. en-IN"
              value={form.locale}
              onChange={(e) => set('locale', e.target.value)}
              required
            />
          </div>

          {/* tax rate + label in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-open-sauce-semibold text-[#26472B] mb-1.5 uppercase tracking-wide">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className={`${FIELD_CLASS} pr-8`}
                  placeholder="e.g. 18"
                  value={form.taxRateDisplay}
                  onChange={(e) => set('taxRateDisplay', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] font-open-sauce pointer-events-none">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-open-sauce-semibold text-[#26472B] mb-1.5 uppercase tracking-wide">
                Tax Label
              </label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="e.g. GST"
                value={form.taxLabel}
                onChange={(e) => set('taxLabel', e.target.value)}
              />
            </div>
          </div>

          {/* enabled toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-[#F2F9F1] rounded-lg border border-[#E5F1E2]">
            <span className="text-sm font-open-sauce text-[#26472B]">Country enabled</span>
            <button
              type="button"
              onClick={() => set('enabled', !form.enabled)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200
                  ${form.enabled ? 'bg-[#45A735] border-[#45A735]' : 'bg-[#D1D5DB] border-[#D1D5DB]'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200
                    ${form.enabled ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </span>
              <span className={`text-xs font-open-sauce-semibold ${form.enabled ? 'text-[#45A735]' : 'text-[#9CA3AF]'}`}>
                {form.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState(null);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({});
  const [editing, setEditing] = useState(null); // country object | null

  const load = useCallback(() => {
    setCountries(null);
    setError(null);
    staffApi
      .get('/i18n/admin/countries')
      .then((r) => setCountries(r.data?.data || []))
      .catch((err) => setError(err));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (country) => {
    const code = country.code;
    setToggling((t) => ({ ...t, [code]: true }));
    try {
      await staffApi.put(`/i18n/admin/countries/${code}`, {
        enabled: !country.enabled,
      });
      showSuccess(
        `${country.name} ${!country.enabled ? 'enabled' : 'disabled'} successfully.`
      );
      load();
    } catch (err) {
      showError(
        err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to update status.'
      );
    } finally {
      setToggling((t) => ({ ...t, [code]: false }));
    }
  };

  return (
    <>
      <div>
        <PageHeader
          title="Country Configuration"
          subtitle="Manage supported countries, currencies, and tax settings"
        />

        <div className="p-4 sm:p-8 space-y-5">
          <ErrorBox error={error} />

          {countries === null && !error && <Spinner />}

          {countries !== null && countries.length === 0 && (
            <EmptyState message="No countries configured yet." />
          )}

          {countries !== null && countries.length > 0 && (
            <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
              <table className="min-w-full text-sm font-open-sauce">
                <thead className="bg-[#F2F9F1] text-[#26472B]">
                  <tr>
                    {[
                      'Country',
                      'Code',
                      'Currency',
                      'Tax Rate',
                      'Tax Label',
                      'Locale',
                      'Status',
                      'Actions',
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left font-open-sauce-semibold text-[12px] uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF5EC]">
                  {countries.map((c) => (
                    <tr
                      key={c.code}
                      className="hover:bg-[#F7FBF6] transition-colors"
                    >
                      {/* Flag + Country */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          {c.flag && (
                            <span className="text-xl leading-none" aria-hidden="true">
                              {c.flag}
                            </span>
                          )}
                          <span className="font-open-sauce-semibold text-[#26472B] whitespace-nowrap">
                            {c.name || c.code}
                          </span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="inline-block text-[11px] px-2 py-0.5 bg-[#F2F9F1] text-[#45A735] rounded font-open-sauce-semibold uppercase tracking-wider ring-1 ring-[#D6EBCF]">
                          {c.code}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="px-4 py-3.5 align-middle text-[#484848]">
                        {c.currency || '—'}
                      </td>

                      {/* Tax Rate */}
                      <td className="px-4 py-3.5 align-middle text-[#484848]">
                        {c.taxRate != null
                          ? `${parseFloat((c.taxRate * 100).toPrecision(10))}%`
                          : '—'}
                      </td>

                      {/* Tax Label */}
                      <td className="px-4 py-3.5 align-middle text-[#484848]">
                        {c.taxLabel || '—'}
                      </td>

                      {/* Locale */}
                      <td className="px-4 py-3.5 align-middle text-[#484848]">
                        {c.locale || '—'}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3.5 align-middle">
                        <StatusToggle
                          enabled={!!c.enabled}
                          loading={!!toggling[c.code]}
                          onClick={() => handleToggle(c)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(c)}
                        >
                          <svg
                            width={13}
                            height={13}
                            viewBox="0 0 24 24"
                            fill="none"
                            className="flex-shrink-0"
                          >
                            <path
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditModal
          country={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}
