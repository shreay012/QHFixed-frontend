'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  StatCard,
  Spinner,
  ErrorBox,
  EmptyState,
  Button,
} from '@/components/staff/ui';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const errMsg = (e) =>
  e?.response?.data?.error?.message || e?.message || 'Something went wrong';

const EMPTY_FORM = { key: '', description: '', rolloutPercent: 100, enabled: true };

/* ── Toggle pill ─────────────────────────────────────────────────────────── */
function StatusPill({ enabled, onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={enabled ? 'Click to disable' : 'Click to enable'}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        enabled
          ? 'bg-[#F2F9F1] text-[#26472B] ring-[#D6EBCF] hover:bg-[#E5F1E2]'
          : 'bg-[#F5F5F5] text-[#909090] ring-[#E5E7EB] hover:bg-[#EBEBEB]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          enabled ? 'bg-[#45A735]' : 'bg-[#C0C0C0]'
        }`}
      />
      {enabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}

/* ── Rollout badge ───────────────────────────────────────────────────────── */
function RolloutBadge({ pct }) {
  const val = Number(pct ?? 100);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-open-sauce-semibold ring-1 ${
        val === 100
          ? 'bg-[#F2F9F1] text-[#26472B] ring-[#D6EBCF]'
          : val >= 50
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-red-50 text-red-700 ring-red-200'
      }`}
    >
      {val}%
    </span>
  );
}

/* ── Create / Edit Modal ─────────────────────────────────────────────────── */
function FlagModal({ mode, initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(
    mode === 'edit'
      ? {
          description: initial.description ?? '',
          rolloutPercent: initial.rolloutPercent ?? 100,
          enabled: initial.enabled ?? true,
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'create') {
      if (!String(form.key).trim()) errs.key = 'Key is required';
      else if (!/^[a-z][a-z0-9_]*$/.test(form.key.trim()))
        errs.key = 'Must be snake_case (lowercase letters, digits, underscores)';
    }
    const pct = Number(form.rolloutPercent);
    if (isNaN(pct) || pct < 0 || pct > 100)
      errs.rolloutPercent = 'Must be between 0 and 100';
    return errs;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload =
      mode === 'create'
        ? {
            key: form.key.trim(),
            description: form.description.trim(),
            rolloutPercent: Number(form.rolloutPercent),
            enabled: form.enabled,
          }
        : {
            description: form.description.trim(),
            rolloutPercent: Number(form.rolloutPercent),
            enabled: form.enabled,
          };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2]">
          <h2 className="text-base font-open-sauce-bold text-[#26472B]">
            {mode === 'create' ? 'New Feature Flag' : 'Edit Feature Flag'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#909090] hover:text-[#26472B] transition-colors p-1 rounded-lg hover:bg-[#F2F9F1]"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-5">
          {/* Key — only for create */}
          {mode === 'create' && (
            <div>
              <label className="block text-xs font-open-sauce-semibold text-[#636363] mb-1 uppercase tracking-wider">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.key}
                onChange={(e) => set('key', e.target.value)}
                placeholder="e.g. new_checkout_flow"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none font-open-sauce ${
                  errors.key ? 'border-red-400 bg-red-50' : 'border-[#E5F1E2]'
                }`}
              />
              {errors.key ? (
                <p className="mt-1 text-[11px] text-red-600">{errors.key}</p>
              ) : (
                <p className="mt-1 text-[11px] text-[#909090]">
                  snake_case only — cannot be changed after creation
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-open-sauce-semibold text-[#636363] mb-1 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What does this flag control?"
              rows={3}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none resize-none font-open-sauce"
            />
          </div>

          {/* Rollout % */}
          <div>
            <label className="block text-xs font-open-sauce-semibold text-[#636363] mb-1 uppercase tracking-wider">
              Rollout Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={Number(form.rolloutPercent)}
                onChange={(e) => set('rolloutPercent', e.target.value)}
                className="flex-1 accent-[#45A735] cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={form.rolloutPercent}
                onChange={(e) => set('rolloutPercent', e.target.value)}
                className={`w-16 border rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none font-open-sauce-semibold ${
                  errors.rolloutPercent ? 'border-red-400 bg-red-50' : 'border-[#E5F1E2]'
                }`}
              />
              <span className="text-sm text-[#636363] font-open-sauce">%</span>
            </div>
            {errors.rolloutPercent && (
              <p className="mt-1 text-[11px] text-red-600">{errors.rolloutPercent}</p>
            )}
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-open-sauce-semibold text-[#26472B]">Enabled</div>
              <div className="text-[11px] text-[#909090] font-open-sauce">
                Toggle whether this flag is active
              </div>
            </div>
            <button
              type="button"
              onClick={() => set('enabled', !form.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                form.enabled ? 'bg-[#45A735]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  form.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E5F1E2] bg-[#FAFDF9]">
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
              ? 'Create Flag'
              : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AdminFlagsPage() {
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);

  // modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // flag object | null

  // per-flag busy state (toggle, delete, edit)
  const [busy, setBusy] = useState({});

  // inline delete confirm: flagId | null
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // modal save spinner
  const [saving, setSaving] = useState(false);

  /* load */
  const load = useCallback(() => {
    setFlags(null);
    setError(null);
    staffApi
      .get('/flags/admin')
      .then((r) => {
        // API may wrap in { data: [...] } or { data: { items: [...] } } — always normalise to array
        const raw = r.data?.data;
        setFlags(Array.isArray(raw) ? raw : Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => setError(e));
  }, []);

  useEffect(() => { load(); }, [load]);

  /* derived stats — guard: flags is null (loading) or an array, never a plain object */
  const flagList = Array.isArray(flags) ? flags : [];
  const total        = flagList.length;
  const enabledCount = flagList.filter((f) => f.enabled).length;
  const fullRollout  = flagList.filter((f) => Number(f.rolloutPercent) === 100).length;

  /* toggle enabled — backend: PATCH /flags/admin/:key/toggle */
  const toggleEnabled = async (flag) => {
    const id = flag._id;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await staffApi.patch(`/flags/admin/${flag.key}/toggle`);
      showSuccess(`Flag "${flag.key}" ${!flag.enabled ? 'enabled' : 'disabled'}.`);
      load();
    } catch (e) {
      showError(errMsg(e));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* create */
  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await staffApi.post('/flags/admin', payload);
      showSuccess(`Flag "${payload.key}" created.`);
      setShowCreate(false);
      load();
    } catch (e) {
      showError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  /* edit save — backend: PUT /flags/admin/:key */
  const handleEdit = async (payload) => {
    if (!editTarget) return;
    const id = editTarget._id;
    setSaving(true);
    try {
      await staffApi.put(`/flags/admin/${editTarget.key}`, payload);
      showSuccess(`Flag "${editTarget.key}" updated.`);
      setEditTarget(null);
      load();
    } catch (e) {
      showError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  /* delete — backend: DELETE /flags/admin/:key */
  const handleDelete = async (id, key) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await staffApi.delete(`/flags/admin/${key}`);
      showSuccess(`Flag "${key}" deleted.`);
      setDeleteConfirm(null);
      load();
    } catch (e) {
      showError(errMsg(e));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  /* ── render ── */
  return (
    <div>
      <PageHeader
        title="Feature Flags"
        subtitle="Control feature rollout across the platform"
        action={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
            New Flag
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Stat cards */}
        {flags !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Flags" value={total} color="slate" />
            <StatCard
              label="Enabled"
              value={enabledCount}
              hint={`${total - enabledCount} disabled`}
              color="green"
            />
            <StatCard
              label="Full Rollout (100%)"
              value={fullRollout}
              hint={`${total - fullRollout} partial`}
              color="green"
            />
          </div>
        )}

        <ErrorBox error={error} />

        {/* Loading */}
        {flags === null && !error && <Spinner />}

        {/* Empty */}
        {flags !== null && flagList.length === 0 && (
          <EmptyState message="No feature flags yet. Click 'New Flag' to create one." />
        )}

        {/* Table */}
        {flags !== null && flagList.length > 0 && (
          <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
            <table className="min-w-full text-sm font-open-sauce">
              <thead className="bg-[#F2F9F1] text-[#26472B]">
                <tr>
                  {['Key', 'Status', 'Rollout', 'Description', 'Actions'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left font-open-sauce-semibold text-[12px] uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5EC]">
                {flagList.map((flag) => {
                  const id = flag._id;
                  const isBusy = !!busy[id];
                  const isDeletePending = deleteConfirm === id;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-[#F7FBF6] transition-colors"
                    >
                      {/* Key */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-open-sauce-semibold text-[#26472B] font-mono text-[13px] bg-[#F2F9F1] px-2 py-0.5 rounded">
                          {flag.key}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3.5 align-middle">
                        <StatusPill
                          enabled={flag.enabled}
                          busy={isBusy}
                          onClick={() => toggleEnabled(flag)}
                        />
                      </td>

                      {/* Rollout */}
                      <td className="px-4 py-3.5 align-middle">
                        <RolloutBadge pct={flag.rolloutPercent} />
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 align-middle text-[#636363] max-w-xs">
                        <span className="line-clamp-2">
                          {flag.description || (
                            <span className="text-[#C0C0C0] italic">No description</span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle">
                        {isDeletePending ? (
                          /* Inline delete confirmation */
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-red-600 font-open-sauce-semibold whitespace-nowrap">
                              Delete?
                            </span>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(id, flag.key)}
                              disabled={isBusy}
                            >
                              {isBusy ? 'Deleting…' : 'Confirm'}
                            </Button>
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => setDeleteConfirm(null)}
                              disabled={isBusy}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => setEditTarget(flag)}
                              disabled={isBusy}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(id)}
                              disabled={isBusy}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
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

      {/* Create modal */}
      {showCreate && (
        <FlagModal
          mode="create"
          initial={EMPTY_FORM}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          saving={saving}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <FlagModal
          mode="edit"
          initial={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
