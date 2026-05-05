'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { showSuccess, showError } from '@/lib/utils/toast';
import {
  PageHeader,
  Spinner,
  ErrorBox,
  EmptyState,
  Button,
} from '@/components/staff/ui';

/* ─── constants ──────────────────────────────────────────────── */

const DOC_TYPES = ['terms', 'privacy', 'refund', 'nda', 'sla'];

const DOC_TYPE_LABELS = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
  nda: 'NDA',
  sla: 'SLA',
};

/* ─── shared styles ──────────────────────────────────────────── */

const FIELD_CLASS =
  'w-full px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#484848] placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] focus:outline-none transition';

const LABEL_CLASS =
  'block text-xs font-open-sauce-semibold text-[#26472B] mb-1.5 uppercase tracking-wide';

/* ─── small helpers ──────────────────────────────────────────── */

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function extractErr(err, fallback = 'Something went wrong.') {
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

/* ─── badges ─────────────────────────────────────────────────── */

function ActiveBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold bg-[#F2F9F1] text-[#26472B] ring-1 ring-[#D6EBCF]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#45A735]" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold bg-[#F5F7F5] text-[#9CA3AF] ring-1 ring-[#E5E7EB]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
      Retired
    </span>
  );
}

function MaterialBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold bg-orange-50 text-orange-700 ring-1 ring-orange-200">
      &#9888; Material
    </span>
  );
}

function DocTypePill({ type }) {
  return (
    <span className="inline-block text-[11px] px-2 py-0.5 bg-[#F2F9F1] text-[#45A735] rounded font-open-sauce-semibold uppercase tracking-wider ring-1 ring-[#D6EBCF]">
      {DOC_TYPE_LABELS[type] || type}
    </span>
  );
}

/* ─── CreateModal ────────────────────────────────────────────── */

const EMPTY_FORM = {
  docType: 'terms',
  country: 'GLOBAL',
  effectiveDate: '',
  materialChange: false,
  content: '',
};

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      showError('Document content is required.');
      return;
    }
    if (!form.effectiveDate) {
      showError('Effective date is required.');
      return;
    }
    setSaving(true);
    try {
      await staffApi.post('/legal/admin/doc', {
        docType: form.docType,
        country: form.country.trim().toUpperCase() || 'GLOBAL',
        effectiveDate: form.effectiveDate,
        materialChange: form.materialChange,
        content: form.content.trim(),
      });
      showSuccess('Legal document created successfully.');
      onCreated();
    } catch (err) {
      showError(extractErr(err, 'Failed to create document.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5F1E2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2] bg-[#F2F9F1] flex-shrink-0">
          <div>
            <h2 className="text-base font-open-sauce-bold text-[#26472B]">New Legal Document</h2>
            <p className="text-xs text-[#636363] font-open-sauce mt-0.5">
              A new versioned document will be created for the selected type and country.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E5F1E2] text-[#636363] hover:text-[#26472B] transition-colors cursor-pointer flex-shrink-0"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* doc type + country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Document Type</label>
              <select
                className={FIELD_CLASS}
                value={form.docType}
                onChange={(e) => set('docType', e.target.value)}
                required
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Country</label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="e.g. GLOBAL, IN, AE, US"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                required
              />
              <p className="mt-1 text-[11px] text-[#9CA3AF] font-open-sauce">
                Use GLOBAL for universal documents.
              </p>
            </div>
          </div>

          {/* effective date + material change */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={LABEL_CLASS}>Effective Date</label>
              <input
                type="date"
                className={FIELD_CLASS}
                value={form.effectiveDate}
                onChange={(e) => set('effectiveDate', e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FFF6EC] rounded-lg border border-orange-200 cursor-pointer"
              onClick={() => set('materialChange', !form.materialChange)}
            >
              <input
                id="materialChange"
                type="checkbox"
                className="w-4 h-4 rounded border-orange-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                checked={form.materialChange}
                onChange={(e) => set('materialChange', e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <label htmlFor="materialChange" className="text-sm font-open-sauce-semibold text-orange-700 cursor-pointer select-none">
                  Material Change
                </label>
                <p className="text-[11px] text-orange-600 font-open-sauce leading-tight">
                  Requires all active users to re-accept
                </p>
              </div>
            </div>
          </div>

          {/* content */}
          <div>
            <label className={LABEL_CLASS}>Document Content</label>
            <textarea
              className={`${FIELD_CLASS} min-h-[220px] resize-y leading-relaxed`}
              placeholder="Paste or type the full document content here (Markdown or plain text)…"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              required
            />
          </div>

          {/* actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── ViewModal ──────────────────────────────────────────────── */

function ViewModal({ doc, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5F1E2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2] bg-[#F2F9F1] flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <DocTypePill type={doc.docType} />
            <span className="text-[11px] px-2 py-0.5 rounded font-open-sauce-semibold bg-white ring-1 ring-[#E5E7EB] text-[#484848]">
              {doc.country || 'GLOBAL'}
            </span>
            <span className="text-[11px] text-[#636363] font-open-sauce">
              v{doc.version} &middot; Effective {fmtDate(doc.effectiveDate)}
            </span>
            {doc.materialChange && <MaterialBadge />}
            <ActiveBadge active={doc.active} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E5F1E2] text-[#636363] hover:text-[#26472B] transition-colors cursor-pointer flex-shrink-0 ml-3"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap text-sm font-open-sauce text-[#484848] leading-relaxed bg-[#F7FBF6] border border-[#E5F1E2] rounded-xl p-4 min-h-[200px]">
            {doc.content || '(No content)'}
          </pre>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-[#E5F1E2] flex justify-end flex-shrink-0">
          <Button variant="subtle" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function AdminLegalPage() {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [retiring, setRetiring] = useState({}); // id → 'confirm' | 'loading'

  const load = useCallback(() => {
    setDocs(null);
    setError(null);
    staffApi
      .get('/legal/admin/docs')
      .then((r) => setDocs(r.data?.data || []))
      .catch((err) => setError(err));
  }, []);

  useEffect(() => { load(); }, [load]);

  /* derived country list for filter dropdown */
  const countryOptions = useMemo(() => {
    if (!docs) return [];
    return [...new Set(docs.map((d) => d.country).filter(Boolean))].sort();
  }, [docs]);

  /* filtered rows */
  const filtered = useMemo(() => {
    if (!docs) return [];
    return docs.filter((d) => {
      if (filterType && d.docType !== filterType) return false;
      if (filterCountry && d.country !== filterCountry) return false;
      return true;
    });
  }, [docs, filterType, filterCountry]);

  /* retire handlers */
  const handleRetireClick = (id) => {
    setRetiring((r) => ({ ...r, [id]: 'confirm' }));
  };

  const handleRetireCancel = (id) => {
    setRetiring((r) => {
      const next = { ...r };
      delete next[id];
      return next;
    });
  };

  const handleRetireConfirm = async (id) => {
    setRetiring((r) => ({ ...r, [id]: 'loading' }));
    try {
      await staffApi.patch(`/legal/admin/doc/${id}/retire`);
      showSuccess('Document retired successfully.');
      setRetiring((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
      load();
    } catch (err) {
      showError(extractErr(err, 'Failed to retire document.'));
      setRetiring((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <>
      <div>
        <PageHeader
          title="Legal Documents"
          subtitle="Manage versioned legal documents by country"
          action={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
              </svg>
              New Document
            </Button>
          }
        />

        <div className="p-4 sm:p-8 space-y-5">
          <ErrorBox error={error} />

          {/* filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#484848] focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] focus:outline-none transition cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All doc types</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#484848] focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] focus:outline-none transition cursor-pointer"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option value="">All countries</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(filterType || filterCountry) && (
              <button
                onClick={() => { setFilterType(''); setFilterCountry(''); }}
                className="text-xs text-[#636363] hover:text-[#26472B] font-open-sauce underline underline-offset-2 cursor-pointer transition-colors"
              >
                Clear filters
              </button>
            )}

            {docs !== null && (
              <span className="ml-auto text-xs text-[#9CA3AF] font-open-sauce">
                {filtered.length} {filtered.length === 1 ? 'document' : 'documents'}
              </span>
            )}
          </div>

          {/* loading */}
          {docs === null && !error && <Spinner />}

          {/* empty */}
          {docs !== null && filtered.length === 0 && (
            <EmptyState message={
              filterType || filterCountry
                ? 'No documents match the current filters.'
                : 'No legal documents yet. Create the first one.'
            } />
          )}

          {/* table */}
          {docs !== null && filtered.length > 0 && (
            <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
              <table className="min-w-full text-sm font-open-sauce">
                <thead className="bg-[#F2F9F1] text-[#26472B]">
                  <tr>
                    {[
                      'Doc Type',
                      'Country',
                      'Version',
                      'Effective Date',
                      'Material Change',
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
                  {filtered.map((doc) => {
                    const retireState = retiring[doc._id];
                    return (
                      <tr key={doc._id} className="hover:bg-[#F7FBF6] transition-colors">

                        {/* doc type */}
                        <td className="px-4 py-3.5 align-middle">
                          <DocTypePill type={doc.docType} />
                        </td>

                        {/* country */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="text-[#484848] font-open-sauce-semibold">
                            {doc.country || 'GLOBAL'}
                          </span>
                        </td>

                        {/* version */}
                        <td className="px-4 py-3.5 align-middle">
                          <code className="text-xs font-mono bg-[#F5F7F5] text-[#636363] px-2 py-0.5 rounded ring-1 ring-[#E5E7EB]">
                            v{doc.version ?? '—'}
                          </code>
                        </td>

                        {/* effective date */}
                        <td className="px-4 py-3.5 align-middle text-[#484848] whitespace-nowrap">
                          {fmtDate(doc.effectiveDate)}
                        </td>

                        {/* material change */}
                        <td className="px-4 py-3.5 align-middle">
                          {doc.materialChange ? (
                            <MaterialBadge />
                          ) : (
                            <span className="text-[11px] text-[#9CA3AF] font-open-sauce">No</span>
                          )}
                        </td>

                        {/* status */}
                        <td className="px-4 py-3.5 align-middle">
                          <ActiveBadge active={doc.active} />
                        </td>

                        {/* actions */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* view */}
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={() => setViewing(doc)}
                            >
                              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
                              </svg>
                              View
                            </Button>

                            {/* retire — only for active docs */}
                            {doc.active && (
                              <>
                                {!retireState && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="!border-red-300 !text-red-600 hover:!bg-red-600 hover:!text-white"
                                    onClick={() => handleRetireClick(doc._id)}
                                  >
                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                      <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
                                    </svg>
                                    Retire
                                  </Button>
                                )}
                                {retireState === 'confirm' && (
                                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1">
                                    <span className="text-[11px] text-red-700 font-open-sauce-semibold whitespace-nowrap">
                                      Retire this version?
                                    </span>
                                    <button
                                      onClick={() => handleRetireConfirm(doc._id)}
                                      className="text-[11px] font-open-sauce-semibold text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                    >
                                      Yes, Retire
                                    </button>
                                    <button
                                      onClick={() => handleRetireCancel(doc._id)}
                                      className="text-[11px] font-open-sauce-semibold text-[#636363] hover:text-[#26472B] px-1.5 py-0.5 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                                {retireState === 'loading' && (
                                  <span className="text-[11px] text-[#9CA3AF] font-open-sauce italic">
                                    Retiring…
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* create modal */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {/* view modal */}
      {viewing && (
        <ViewModal
          doc={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
