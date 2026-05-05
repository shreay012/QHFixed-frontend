'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { PageHeader, Spinner, ErrorBox, EmptyState } from '@/components/staff/ui';
import { showSuccess, showError } from '@/lib/utils/toast';

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */
const STATUS_OPTIONS = ['draft', 'published', 'archived'];
const BLOCK_TYPES = ['hero', 'text', 'image', 'cards', 'cta', 'faq', 'testimonials'];
const FILTER_TABS = ['all', 'published', 'draft', 'archived'];

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function newBlock() {
  return { type: 'text', content: '' };
}

function emptyForm() {
  return {
    title: '',
    slug: '',
    seoTitle: '',
    seoDesc: '',
    status: 'draft',
    blocks: [],
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────────── */

/** Green/yellow/grey status badge */
function StatusBadge({ status }) {
  const map = {
    published: 'bg-[#F2F9F1] text-[#26472B] ring-[#D6EBCF]',
    draft: 'bg-amber-50 text-amber-700 ring-amber-200',
    archived: 'bg-[#F5F7F5] text-[#636363] ring-[#E5E7EB]',
  };
  const dot = {
    published: 'bg-[#45A735]',
    draft: 'bg-amber-400',
    archived: 'bg-[#909090]',
  };
  const cls = map[status] || map.archived;
  const dotCls = dot[status] || dot.archived;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 capitalize ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
      {status}
    </span>
  );
}

/** Reusable inline button */
function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  const variants = {
    primary: 'bg-[#45A735] text-white hover:bg-[#26472B] shadow-[0_4px_14px_rgba(120,235,84,0.25)]',
    outline: 'border border-[#45A735] text-[#45A735] bg-transparent hover:bg-[#45A735] hover:text-white',
    subtle: 'bg-[#F2F9F1] text-[#26472B] hover:bg-[#E5F1E2]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-[#26472B] hover:bg-[#F2F9F1]',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-open-sauce-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Input field */
function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-xs font-open-sauce-semibold text-[#636363] uppercase tracking-wider mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[#909090] font-open-sauce">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#26472B] focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none';

/* ─────────────────────────────────────────────────────────────────────────────
   Blocks tab sub-component
───────────────────────────────────────────────────────────────────────────── */
function BlocksEditor({ blocks, onChange }) {
  const addBlock = () => onChange([...blocks, newBlock()]);

  const updateBlock = (idx, field, value) => {
    const next = blocks.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
    onChange(next);
  };

  const removeBlock = (idx) => onChange(blocks.filter((_, i) => i !== idx));

  const moveBlock = (idx, dir) => {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#D6EBCF] bg-[#FAFDF9] py-10 text-center text-sm text-[#909090] font-open-sauce">
          No blocks yet. Click "Add Block" to start building page content.
        </div>
      )}

      {blocks.map((block, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[#E5F1E2] bg-white overflow-hidden"
        >
          {/* Block header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#F2F9F1] border-b border-[#E5F1E2]">
            {/* Order controls */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveBlock(idx, -1)}
                disabled={idx === 0}
                title="Move up"
                className="w-6 h-6 flex items-center justify-center rounded text-[#636363] hover:text-[#26472B] disabled:opacity-30 hover:bg-[#E5F1E2] transition-colors"
              >
                <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                  <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveBlock(idx, 1)}
                disabled={idx === blocks.length - 1}
                title="Move down"
                className="w-6 h-6 flex items-center justify-center rounded text-[#636363] hover:text-[#26472B] disabled:opacity-30 hover:bg-[#E5F1E2] transition-colors"
              >
                <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <span className="w-5 h-5 rounded-full bg-[#D6EBCF] text-[#26472B] text-[10px] font-open-sauce-bold flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>

            {/* Type selector */}
            <select
              value={block.type}
              onChange={(e) => updateBlock(idx, 'type', e.target.value)}
              className="flex-1 border border-[#D6EBCF] rounded-lg px-2 py-1.5 text-xs font-open-sauce-semibold text-[#26472B] bg-white focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none capitalize"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeBlock(idx)}
              title="Remove block"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Content textarea */}
          <div className="p-4">
            <label className="block text-[10px] font-open-sauce-semibold text-[#909090] uppercase tracking-wider mb-1.5">
              Content — Enter JSON object
            </label>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(idx, 'content', e.target.value)}
              rows={5}
              placeholder={`{\n  "heading": "...",\n  "body": "..."\n}`}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-xs font-mono text-[#26472B] focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none resize-y bg-[#FAFDF9]"
            />
            <p className="mt-1 text-[10px] text-[#909090] font-open-sauce">
              Enter JSON content for this block. Invalid JSON will be stored as a string.
            </p>
          </div>
        </div>
      ))}

      <Btn type="button" variant="outline" onClick={addBlock}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
        Add Block
      </Btn>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page Create/Edit Modal
───────────────────────────────────────────────────────────────────────────── */
function PageModal({ page, onClose, onSaved }) {
  const isEdit = Boolean(page?._id);
  const [tab, setTab] = useState('details');
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          title: page.title || '',
          slug: page.slug || '',
          seoTitle: page.seoTitle || '',
          seoDesc: page.seoDesc || '',
          status: page.status || 'draft',
          blocks: Array.isArray(page.blocks) ? page.blocks : [],
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(isEdit);
  const backdropRef = useRef(null);

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (val) => {
    set('title', val);
    if (!slugManual) set('slug', slugify(val));
  };

  const handleSlugChange = (val) => {
    setSlugManual(true);
    set('slug', slugify(val));
  };

  const valid = form.title.trim() && form.slug.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      // Parse block content: attempt JSON parse, fall back to string
      const payload = {
        ...form,
        blocks: form.blocks.map((b) => {
          let parsed;
          try {
            parsed = JSON.parse(b.content);
          } catch {
            parsed = b.content;
          }
          return { type: b.type, content: parsed };
        }),
      };

      if (isEdit) {
        await staffApi.put(`/cms-x/pages/${page._id}`, payload);
        showSuccess('Page updated successfully.');
      } else {
        await staffApi.post('/cms-x/pages', payload);
        showSuccess('Page created successfully.');
      }
      onSaved();
      onClose();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5F1E2] flex-shrink-0">
          <div>
            <h2 className="text-lg font-open-sauce-bold text-[#26472B]">
              {isEdit ? 'Edit Page' : 'New Page'}
            </h2>
            <p className="text-xs text-[#909090] font-open-sauce mt-0.5">
              {isEdit ? `Editing: ${page.title}` : 'Create a new CMS page'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#636363] hover:text-[#26472B] hover:bg-[#F2F9F1] transition-colors"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5F1E2] px-6 flex-shrink-0">
          {['details', 'blocks'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-open-sauce-semibold border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-[#45A735] text-[#45A735]'
                  : 'border-transparent text-[#909090] hover:text-[#26472B]'
              }`}
            >
              {t === 'blocks' ? `Blocks (${form.blocks.length})` : 'Details'}
            </button>
          ))}
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'details' && (
            <div className="space-y-5">
              <Field label="Page Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Us"
                  className={inputCls}
                />
              </Field>

              <Field label="Slug" required hint="Auto-generated from title. Use lowercase letters, numbers, and hyphens only.">
                <div className="flex items-center gap-0">
                  <span className="px-3 py-2 bg-[#F2F9F1] border border-r-0 border-[#E5F1E2] rounded-l-lg text-xs text-[#636363] font-mono whitespace-nowrap">
                    /
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="about-us"
                    className={`${inputCls} rounded-l-none font-mono`}
                  />
                </div>
              </Field>

              <Field label="SEO Title" hint="Recommended: 50–60 characters">
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => set('seoTitle', e.target.value)}
                  placeholder="Search engine title"
                  className={inputCls}
                />
              </Field>

              <Field label="SEO Description" hint="Recommended: 140–160 characters">
                <textarea
                  value={form.seoDesc}
                  onChange={(e) => set('seoDesc', e.target.value)}
                  rows={3}
                  placeholder="Brief description for search engines..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {tab === 'blocks' && (
            <BlocksEditor
              blocks={form.blocks}
              onChange={(blocks) => set('blocks', blocks)}
            />
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5F1E2] flex-shrink-0 bg-[#FAFDF9]">
          <Btn variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={!valid || saving}>
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Page'
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────────────────────────────────────────── */
function DeleteModal({ page, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await staffApi.delete(`/cms-x/pages/${page._id}`);
      showSuccess('Page deleted.');
      onDeleted();
      onClose();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed to delete page.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#EF4444" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-base font-open-sauce-bold text-[#26472B] mb-1">Delete page?</h3>
        <p className="text-sm text-[#636363] font-open-sauce mb-1">
          Are you sure you want to delete{' '}
          <span className="font-open-sauce-semibold text-[#26472B]">{page.title}</span>?
        </p>
        <p className="text-xs text-[#909090] font-open-sauce mb-6">
          This action cannot be undone. The page and all its content blocks will be permanently removed.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="subtle" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={busy}>
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete Page'
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page Card
───────────────────────────────────────────────────────────────────────────── */
function PageCard({ page, onEdit, onTogglePublish, onDelete, busy }) {
  const isPublished = page.status === 'published';

  return (
    <div className="bg-white rounded-2xl border border-[#E5F1E2] p-5 flex flex-col gap-3 shadow-[0_1px_4px_rgba(38,71,43,0.04)] hover:shadow-[0_4px_16px_rgba(69,167,53,0.08)] transition-shadow duration-200">
      {/* Top row: title + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-open-sauce-bold text-[#26472B] truncate" title={page.title}>
            {page.title || 'Untitled'}
          </h3>
          <code className="mt-0.5 block text-[11px] text-[#636363] font-mono truncate">
            /{page.slug}
          </code>
        </div>
        <StatusBadge status={page.status} />
      </div>

      {/* SEO preview */}
      {(page.seoTitle || page.seoDesc) && (
        <div className="rounded-lg bg-[#F7FBF6] border border-[#E5F1E2] px-3 py-2">
          {page.seoTitle && (
            <p className="text-[11px] font-open-sauce-semibold text-[#26472B] truncate">{page.seoTitle}</p>
          )}
          {page.seoDesc && (
            <p className="text-[10px] text-[#636363] font-open-sauce line-clamp-2 mt-0.5">{page.seoDesc}</p>
          )}
        </div>
      )}

      {/* Blocks count + updated */}
      <div className="flex items-center justify-between text-[11px] text-[#909090] font-open-sauce">
        <span>
          {Array.isArray(page.blocks) ? page.blocks.length : 0} block
          {(Array.isArray(page.blocks) ? page.blocks.length : 0) !== 1 ? 's' : ''}
        </span>
        <span>Updated {fmtDate(page.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#F2F6F1]">
        <Btn size="sm" variant="subtle" onClick={() => onEdit(page)} disabled={busy[page._id]}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit
        </Btn>

        <Btn
          size="sm"
          variant={isPublished ? 'yellow' : 'outline'}
          onClick={() => onTogglePublish(page)}
          disabled={busy[page._id]}
          className="flex-1 justify-center"
        >
          {busy[page._id] ? (
            <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : isPublished ? (
            <>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path d="M10 9v6m4-6v6m5-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
              Unpublish
            </>
          ) : (
            <>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Publish
            </>
          )}
        </Btn>

        <button
          onClick={() => onDelete(page)}
          disabled={busy[page._id]}
          title="Delete page"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────────────── */
export default function AdminCmsPagesPage() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // null | { type: 'edit'|'create'|'delete', page? }
  const [busy, setBusy] = useState({}); // { [pageId]: boolean }

  const load = useCallback(() => {
    setPages(null);
    setError(null);
    staffApi
      .get('/cms-x/pages')
      .then((r) => setPages(r.data?.data || []))
      .catch((e) => {
        setError(e);
        setPages([]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setBusyFor = (id, val) =>
    setBusy((prev) => ({ ...prev, [id]: val }));

  const handleTogglePublish = async (page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    setBusyFor(page._id, true);
    try {
      await staffApi.put(`/cms-x/pages/${page._id}`, { status: newStatus });
      showSuccess(
        newStatus === 'published'
          ? `"${page.title}" is now published.`
          : `"${page.title}" moved to draft.`
      );
      load();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed to update status.');
    } finally {
      setBusyFor(page._id, false);
    }
  };

  // Filtered pages
  const displayed = Array.isArray(pages)
    ? filter === 'all'
      ? pages
      : pages.filter((p) => p.status === filter)
    : [];

  // Count per tab
  const counts = Array.isArray(pages)
    ? {
        all: pages.length,
        published: pages.filter((p) => p.status === 'published').length,
        draft: pages.filter((p) => p.status === 'draft').length,
        archived: pages.filter((p) => p.status === 'archived').length,
      }
    : { all: 0, published: 0, draft: 0, archived: 0 };

  return (
    <div>
      {/* ── Page header ── */}
      <PageHeader
        title="CMS Pages"
        subtitle="Manage website pages and their content blocks"
        action={
          <Btn variant="primary" onClick={() => setModal({ type: 'create' })}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
            New Page
          </Btn>
        }
      />

      <div className="p-4 sm:p-8 space-y-6">
        <ErrorBox error={error} />

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 bg-white border border-[#E5F1E2] rounded-xl p-1 w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-open-sauce-semibold transition-all duration-200 capitalize ${
                filter === tab
                  ? 'bg-[#45A735] text-white shadow-[0_2px_8px_rgba(69,167,53,0.30)]'
                  : 'text-[#636363] hover:text-[#26472B] hover:bg-[#F2F9F1]'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-open-sauce-bold ${
                  filter === tab ? 'bg-white/20 text-white' : 'bg-[#E5F1E2] text-[#636363]'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {pages === null && <Spinner />}

        {/* ── Empty state ── */}
        {pages !== null && displayed.length === 0 && !error && (
          <EmptyState
            message={
              filter === 'all'
                ? 'No pages yet. Click "New Page" to create your first page.'
                : `No ${filter} pages found.`
            }
          />
        )}

        {/* ── Page grid ── */}
        {pages !== null && displayed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((page) => (
              <PageCard
                key={page._id}
                page={page}
                busy={busy}
                onEdit={(p) => setModal({ type: 'edit', page: p })}
                onTogglePublish={handleTogglePublish}
                onDelete={(p) => setModal({ type: 'delete', page: p })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === 'create' && (
        <PageModal
          page={null}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {modal?.type === 'edit' && modal.page && (
        <PageModal
          page={modal.page}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {modal?.type === 'delete' && modal.page && (
        <DeleteModal
          page={modal.page}
          onClose={() => setModal(null)}
          onDeleted={load}
        />
      )}
    </div>
  );
}
