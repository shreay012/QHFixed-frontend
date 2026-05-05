'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  Spinner,
  ErrorBox,
  EmptyState,
  StatCard,
  Button,
} from '@/components/staff/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FILTER_TABS = ['All', 'Active', 'Expiring Soon', 'Expired', 'Disabled'];

function getPromoStatus(promo) {
  if (!promo.active) return 'Disabled';
  const now = Date.now();
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < now) return 'Expired';
  if (promo.expiresAt) {
    const diffMs = new Date(promo.expiresAt).getTime() - now;
    if (diffMs < 7 * 24 * 60 * 60 * 1000) return 'Expiring Soon';
  }
  return 'Active';
}

function PromoBadge({ promo }) {
  const status = getPromoStatus(promo);
  const map = {
    Active: 'bg-[#F2F9F1] text-[#26472B] ring-[#D6EBCF]',
    'Expiring Soon': 'bg-orange-50 text-orange-700 ring-orange-200',
    Expired: 'bg-red-50 text-red-700 ring-red-200',
    Disabled: 'bg-[#F5F7F5] text-[#636363] ring-[#E5E7EB]',
  };
  const dotMap = {
    Active: 'bg-[#45A735]',
    'Expiring Soon': 'bg-orange-500',
    Expired: 'bg-red-500',
    Disabled: 'bg-[#909090]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 ${map[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status]}`} />
      {status}
    </span>
  );
}

function UsageBar({ usedCount, maxUses }) {
  if (!maxUses || maxUses === 0) {
    return (
      <span className="text-[#636363] text-xs font-open-sauce">
        {usedCount} / ∞
      </span>
    );
  }
  const pct = Math.min(100, Math.round((usedCount / maxUses) * 100));
  const barColor =
    pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-orange-400' : 'bg-[#45A735]';
  return (
    <div className="min-w-[80px]">
      <div className="flex justify-between text-[11px] text-[#636363] font-open-sauce mb-1">
        <span>{usedCount}</span>
        <span>{maxUses}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#E5F1E2] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function toLocalDatetimeValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  // format: YYYY-MM-DDTHH:MM
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_FORM = {
  code: '',
  type: 'percent',
  value: '',
  maxUses: '',
  minOrderValue: '',
  expiresAt: '',
  applicableServices: '',
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function PromoModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    mode === 'edit' && initial
      ? {
          code: initial.code || '',
          type: initial.type || 'percent',
          value: initial.value ?? '',
          maxUses: initial.maxUses ?? '',
          minOrderValue: initial.minOrderValue ?? '',
          expiresAt: toLocalDatetimeValue(initial.expiresAt),
          applicableServices: Array.isArray(initial.applicableServices)
            ? initial.applicableServices.join(', ')
            : initial.applicableServices || '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        maxUses: form.maxUses === '' ? 0 : Number(form.maxUses),
        ...(form.minOrderValue !== '' && { minOrderValue: Number(form.minOrderValue) }),
        ...(form.expiresAt && { expiresAt: new Date(form.expiresAt).toISOString() }),
        ...(form.applicableServices.trim() && {
          applicableServices: form.applicableServices
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      };

      if (mode === 'edit' && initial?._id) {
        await staffApi.put(`/promo/admin/${initial._id}`, payload);
        showSuccess('Promo updated!');
      } else {
        await staffApi.post('/promo/admin', payload);
        showSuccess('Promo created!');
      }
      onSaved();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to save promo');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 border border-[#D6EBCF] rounded-lg text-sm font-open-sauce text-[#242424] bg-white focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] focus:outline-none transition-all placeholder:text-[#B0BDB0]';
  const labelCls = 'block text-xs font-open-sauce-semibold text-[#26472B] mb-1 uppercase tracking-wide';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E5F1E2] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E5F1E2] flex-shrink-0">
          <h3 className="text-lg font-open-sauce-bold text-[#26472B]">
            {mode === 'edit' ? 'Edit Promo Code' : 'New Promo Code'}
          </h3>
          <p className="text-xs text-[#636363] mt-0.5 font-open-sauce">
            {mode === 'edit'
              ? 'Update the promo details below.'
              : 'Fill in the details to create a new discount code.'}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Code */}
          <div>
            <label className={labelCls}>Code</label>
            <div className="flex gap-2">
              <input
                required
                className={inputCls}
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
              />
              <button
                type="button"
                onClick={() => set('code', generateCode())}
                className="shrink-0 px-3 py-2.5 rounded-lg border border-[#D6EBCF] text-xs font-open-sauce-semibold text-[#45A735] bg-[#F2F9F1] hover:bg-[#E5F1E2] transition-colors whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select
                required
                className={inputCls}
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (amount)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Value {form.type === 'percent' ? '(0 – 100%)' : '(amount)'}
              </label>
              <input
                required
                type="number"
                min={0}
                max={form.type === 'percent' ? 100 : undefined}
                step="0.01"
                className={inputCls}
                placeholder={form.type === 'percent' ? '20' : '500'}
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
              />
            </div>
          </div>

          {/* maxUses + minOrderValue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Max Uses (0 = unlimited)</label>
              <input
                type="number"
                min={0}
                step={1}
                className={inputCls}
                placeholder="0"
                value={form.maxUses}
                onChange={(e) => set('maxUses', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Min Order Value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                placeholder="Optional"
                value={form.minOrderValue}
                onChange={(e) => set('minOrderValue', e.target.value)}
              />
            </div>
          </div>

          {/* Expires At */}
          <div>
            <label className={labelCls}>Expires At</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.expiresAt}
              onChange={(e) => set('expiresAt', e.target.value)}
            />
          </div>

          {/* Applicable Services */}
          <div>
            <label className={labelCls}>Applicable Service IDs (comma-separated, optional)</label>
            <input
              type="text"
              className={inputCls}
              placeholder="svc_abc123, svc_def456"
              value={form.applicableServices}
              onChange={(e) => set('applicableServices', e.target.value)}
            />
            <p className="text-[10px] text-[#909090] mt-1 font-open-sauce">
              Leave blank to apply to all services.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5F1E2] flex justify-end gap-2 flex-shrink-0">
          <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Promo'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminPromosPage() {
  const [promos, setPromos] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', promo }
  const [busy, setBusy] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null); // promo _id

  // Load list
  const load = useCallback(() => {
    setError(null);
    setPromos(null);
    staffApi
      .get('/promo/admin')
      .then((r) => {
        const d = r.data?.data;
        setPromos(Array.isArray(d) ? d : []);
      })
      .catch((err) => setError(err));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived stats
  const stats = promos
    ? promos.reduce(
        (acc, p) => {
          const s = getPromoStatus(p);
          acc.total += 1;
          acc.totalUses += p.usedCount || 0;
          if (s === 'Active' || s === 'Expiring Soon') acc.active += 1;
          if (s === 'Expired') acc.expired += 1;
          return acc;
        },
        { total: 0, active: 0, expired: 0, totalUses: 0 }
      )
    : null;

  // Filtered rows
  const filtered = promos
    ? promos.filter((p) => {
        if (filter === 'All') return true;
        const s = getPromoStatus(p);
        if (filter === 'Active') return s === 'Active' || s === 'Expiring Soon';
        if (filter === 'Expiring Soon') return s === 'Expiring Soon';
        if (filter === 'Expired') return s === 'Expired';
        if (filter === 'Disabled') return s === 'Disabled';
        return true;
      })
    : [];

  // Clone
  const handleClone = async (promo) => {
    setBusy((b) => ({ ...b, [promo._id + '_clone']: true }));
    try {
      const newCode = `${promo.code}_COPY_${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      await staffApi.post(`/promo/admin/${promo._id}/clone`, { code: newCode });
      showSuccess(`Promo cloned as ${newCode}!`);
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Clone failed');
    } finally {
      setBusy((b) => ({ ...b, [promo._id + '_clone']: false }));
    }
  };

  // Delete
  const handleDelete = async (id) => {
    setBusy((b) => ({ ...b, [id + '_delete']: true }));
    try {
      await staffApi.delete(`/promo/admin/${id}`);
      showSuccess('Promo deleted.');
      setConfirmDelete(null);
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Delete failed');
    } finally {
      setBusy((b) => ({ ...b, [id + '_delete']: false }));
    }
  };

  // Toggle active via PATCH
  const handleToggleActive = async (promo) => {
    const key = promo._id + '_toggle';
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      await staffApi.patch(`/promo/admin/${promo._id}/toggle`);
      showSuccess(promo.active ? 'Promo disabled.' : 'Promo enabled.');
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Update failed');
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBF6]">
      {/* Page Header */}
      <PageHeader
        title="Promo Codes"
        subtitle="Create and manage discount codes"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setModal({ mode: 'create' })}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Promo
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Error */}
        <ErrorBox error={error} />

        {/* Stats Row */}
        {promos === null && !error && <Spinner />}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Promos" value={stats.total} color="green" />
            <StatCard label="Active" value={stats.active} color="emerald" hint="incl. expiring soon" />
            <StatCard label="Expired" value={stats.expired} color="red" />
            <StatCard label="Total Uses" value={stats.totalUses} color="slate" hint="across all promos" />
          </div>
        )}

        {/* Filter Tabs */}
        {promos !== null && (
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-open-sauce-semibold transition-all border ${
                  filter === tab
                    ? 'bg-[#45A735] text-white border-[#45A735] shadow-[0_2px_8px_rgba(69,167,53,0.30)]'
                    : 'bg-white text-[#636363] border-[#E5F1E2] hover:border-[#45A735] hover:text-[#45A735]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {promos !== null && filtered.length === 0 && (
          <EmptyState message={filter === 'All' ? 'No promo codes yet. Create one!' : `No promos match "${filter}".`} />
        )}

        {promos !== null && filtered.length > 0 && (
          <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
            <table className="min-w-full text-sm font-open-sauce">
              <thead className="bg-[#F2F9F1] text-[#26472B]">
                <tr>
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left font-open-sauce-semibold text-[12px] uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5EC]">
                {filtered.map((promo) => {
                  const isDeleting = busy[promo._id + '_delete'];
                  const isCloning = busy[promo._id + '_clone'];
                  const isToggling = busy[promo._id + '_toggle'];
                  const deleteConfirming = confirmDelete === promo._id;

                  return (
                    <tr key={promo._id} className="hover:bg-[#F7FBF6] transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3.5 align-middle">
                        <code className="font-mono font-semibold text-[#26472B] bg-[#F2F9F1] px-2 py-0.5 rounded text-[13px] tracking-wide">
                          {promo.code}
                        </code>
                      </td>

                      {/* Type + Value */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-open-sauce-semibold uppercase tracking-wide ${
                              promo.type === 'percent'
                                ? 'bg-[#F2F9F1] text-[#26472B]'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {promo.type}
                          </span>
                          <span className="font-open-sauce-semibold text-[#26472B]">
                            {promo.type === 'percent'
                              ? `${promo.value}%`
                              : `${promo.value} off`}
                          </span>
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3.5 align-middle text-[#484848]">
                        {promo.minOrderValue ? `${promo.minOrderValue}` : <span className="text-[#B0BDB0]">—</span>}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3.5 align-middle">
                        <UsageBar
                          usedCount={promo.usedCount || 0}
                          maxUses={promo.maxUses || 0}
                        />
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5 align-middle text-[#636363] text-xs whitespace-nowrap">
                        {promo.expiresAt
                          ? new Date(promo.expiresAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : <span className="text-[#B0BDB0]">Never</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <PromoBadge promo={promo} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle">
                        {deleteConfirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600 font-open-sauce-semibold">Delete?</span>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(promo._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? '…' : 'Yes'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmDelete(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {/* Edit */}
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => setModal({ mode: 'edit', promo })}
                              title="Edit"
                            >
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </Button>

                            {/* Toggle active */}
                            <Button
                              size="sm"
                              variant={promo.active ? 'ghost' : 'outline'}
                              onClick={() => handleToggleActive(promo)}
                              disabled={isToggling}
                              title={promo.active ? 'Disable' : 'Enable'}
                            >
                              {isToggling ? '…' : promo.active ? 'Disable' : 'Enable'}
                            </Button>

                            {/* Clone */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClone(promo)}
                              disabled={isCloning}
                              title="Clone"
                            >
                              {isCloning ? '…' : (
                                <>
                                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                  </svg>
                                  Clone
                                </>
                              )}
                            </Button>

                            {/* Delete */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setConfirmDelete(promo._id)}
                              title="Delete"
                            >
                              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <PromoModal
          mode={modal.mode}
          initial={modal.promo}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
