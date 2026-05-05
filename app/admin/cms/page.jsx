'use client';

import { useEffect, useState, useCallback } from 'react';
import staffApi from '@/lib/axios/staffApi';
import {
  PageHeader,
  SectionCard,
  Spinner,
  ErrorBox,
  Button,
  EmptyState,
} from '@/components/staff/ui';
import { showError, showSuccess } from '@/lib/utils/toast';

/* ── Per-key field schemas ───────────────────────────────────────────────────── */
const SCHEMAS = {
  testimonials: [
    { key: 'name',    label: 'Name',          type: 'text',     required: true },
    { key: 'role',    label: 'Role / Title',  type: 'text',     required: true },
    { key: 'company', label: 'Company',        type: 'text' },
    { key: 'text',    label: 'Testimonial',    type: 'textarea', required: true },
    { key: 'rating',  label: 'Rating (1–5)',   type: 'number',   min: 1, max: 5 },
    { key: 'image',   label: 'Avatar URL',     type: 'text' },
  ],
  technologies: [
    { key: 'name',     label: 'Technology Name', type: 'text', required: true },
    { key: 'icon',     label: 'Icon URL',         type: 'text' },
    { key: 'category', label: 'Category',         type: 'text' },
  ],
  features: [
    { key: 'title',       label: 'Title',       type: 'text',     required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'icon',        label: 'Icon / Emoji', type: 'text' },
  ],
  faqs: [
    { key: 'question', label: 'Question', type: 'text',     required: true },
    { key: 'answer',   label: 'Answer',   type: 'textarea', required: true },
  ],
  segments: [
    { key: 'title',       label: 'Title',       type: 'text',     required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'icon',        label: 'Icon / Emoji', type: 'text' },
  ],
  process_steps: [
    { key: 'stepNumber',  label: 'Step #',      type: 'number',   required: true, min: 1 },
    { key: 'title',       label: 'Title',       type: 'text',     required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
  ],
};

function inferSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const sample = items[0];
  return Object.keys(sample).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    type: typeof sample[key] === 'number' ? 'number' : 'text',
  }));
}

function emptyItem(schema) {
  const obj = {};
  schema.forEach((f) => { obj[f.key] = ''; });
  return obj;
}

function itemLabel(item) {
  const candidates = ['name', 'title', 'question', 'stepNumber'];
  for (const c of candidates) {
    if (item[c]) return String(item[c]).slice(0, 60);
  }
  return JSON.stringify(item).slice(0, 50);
}

function fmtTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return null; }
}

/* ── Item Editor Modal ──────────────────────────────────────────────────────── */
function ItemEditor({ schema, item, onSave, onCancel }) {
  const [form, setForm] = useState({ ...item });
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const valid = schema.filter((f) => f.required).every((f) => String(form[f.key] ?? '').trim());

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E5F1E2]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-open-sauce-bold text-[#26472B] mb-5">
          {item._isNew ? 'Add Item' : 'Edit Item'}
        </h3>
        <div className="space-y-4">
          {schema.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-open-sauce-semibold text-[#636363] mb-1.5 uppercase tracking-wider">
                {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={4}
                  className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm font-open-sauce text-[#242424] bg-white focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none resize-none transition-colors"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  min={f.min}
                  max={f.max}
                  value={form[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm font-open-sauce text-[#242424] bg-white focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none transition-colors"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E5F1E2]">
          <Button variant="subtle" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)} disabled={!valid}>
            Save Item
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ───────────────────────────────────────────────────── */
function DeleteModal({ label, busy, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#E5F1E2]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-open-sauce-bold text-[#26472B] mb-2">Delete item?</h3>
        <p className="text-sm text-[#636363] font-open-sauce mb-6">
          This will remove{' '}
          <strong className="text-[#26472B]">"{label}"</strong> from the list. The change is published immediately.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="subtle" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={busy} disabled={busy}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── JSON Editor Panel ──────────────────────────────────────────────────────── */
function JsonEditorPanel({ cmsKey, initialItems, onSaved }) {
  const [editJson, setEditJson]   = useState(() => JSON.stringify(initialItems, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving]       = useState(false);

  // Re-sync when the key changes
  useEffect(() => {
    setEditJson(JSON.stringify(initialItems, null, 2));
    setJsonError('');
  }, [cmsKey, initialItems]);

  // Live validation
  useEffect(() => {
    if (!editJson.trim()) { setJsonError(''); return; }
    try {
      JSON.parse(editJson);
      setJsonError('');
    } catch (e) {
      setJsonError(`Invalid JSON: ${e.message}`);
    }
  }, [editJson]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(editJson);
      setEditJson(JSON.stringify(parsed, null, 2));
    } catch {
      // leave as-is; error shown by validation
    }
  };

  const resetJson = () => {
    setEditJson(JSON.stringify(initialItems, null, 2));
    setJsonError('');
  };

  const saveJson = async () => {
    try {
      const items = JSON.parse(editJson);
      if (!Array.isArray(items)) {
        setJsonError('Root value must be a JSON array.');
        return;
      }
      setSaving(true);
      await staffApi.put(`/admin/cms/${cmsKey}`, { items });
      showSuccess('CMS content saved!');
      if (onSaved) onSaved(items);
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to save';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#636363] font-open-sauce">
          Edit the JSON <code className="bg-[#F2F9F1] text-[#26472B] px-1.5 py-0.5 rounded text-xs font-mono">items</code>{' '}
          array for <strong className="text-[#26472B] font-open-sauce-semibold">{cmsKey}</strong>
        </p>
        <Button size="sm" variant="subtle" onClick={formatJson}>Format JSON</Button>
      </div>

      <textarea
        value={editJson}
        onChange={(e) => setEditJson(e.target.value)}
        rows={14}
        spellCheck={false}
        className="w-full border border-[#E5F1E2] rounded-xl px-4 py-3 text-sm font-mono text-[#242424] bg-[#FAFAFA] focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none resize-none transition-colors leading-relaxed"
        placeholder='[{"title": "...", "description": "..."}]'
      />

      {jsonError && (
        <p className="text-xs text-red-600 font-open-sauce flex items-start gap-1.5">
          <svg className="flex-shrink-0 mt-0.5" width={12} height={12} viewBox="0 0 24 24" fill="none">
            <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={2} />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
          {jsonError}
        </p>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="subtle" onClick={resetJson} disabled={saving}>Reset</Button>
        <Button
          variant="primary"
          onClick={saveJson}
          disabled={saving || !!jsonError}
          loading={saving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

/* ── Visual Item List Panel ─────────────────────────────────────────────────── */
function VisualEditorPanel({ cmsKey, items, schema, busy, onPublish, onEditItem, onDeleteItem, onMoveUp, onMoveDown, onAddItem }) {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#636363] font-open-sauce">
          {items.length} item{items.length !== 1 ? 's' : ''} · click Edit to modify any item
        </p>
        {schema && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddItem}
            disabled={busy}
          >
            + Add Item
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState message='No items yet. Click "+ Add Item" to create the first one.' />
      ) : (
        <ul className="divide-y divide-[#F2F6F1] -mx-5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAFDF9] transition-colors"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onMoveUp(idx)}
                  disabled={idx === 0 || busy}
                  className="text-[#C0D4BA] hover:text-[#26472B] disabled:opacity-30 leading-none p-0.5 transition-colors"
                  title="Move up"
                  aria-label="Move item up"
                >
                  ▲
                </button>
                <button
                  onClick={() => onMoveDown(idx)}
                  disabled={idx === items.length - 1 || busy}
                  className="text-[#C0D4BA] hover:text-[#26472B] disabled:opacity-30 leading-none p-0.5 transition-colors"
                  title="Move down"
                  aria-label="Move item down"
                >
                  ▼
                </button>
              </div>

              {/* Index badge */}
              <span className="w-6 h-6 rounded-full bg-[#E5F1E2] text-[#26472B] text-xs font-open-sauce-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-open-sauce-semibold text-[#26472B] truncate">
                  {itemLabel(item)}
                </div>
                {schema && schema[1] && item[schema[1].key] && (
                  <div className="text-[11px] text-[#909090] font-open-sauce truncate mt-0.5">
                    {String(item[schema[1].key]).slice(0, 80)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {schema && (
                  <Button size="sm" variant="subtle" onClick={() => onEditItem(item)}>
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeleteItem(idx)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Main CMS Page ──────────────────────────────────────────────────────────── */
export default function AdminCmsPage() {
  const [allKeys,  setAllKeys]  = useState(null);   // null=loading, []|[k,...]
  const [keyMeta,  setKeyMeta]  = useState({});      // { [key]: { updatedAt } }
  const [error,    setError]    = useState(null);

  // Selected key state
  const [selectedKey, setSelectedKey] = useState(null);
  const [items,       setItems]       = useState(null);
  const [schema,      setSchema]      = useState(null);
  const [keyLoading,  setKeyLoading]  = useState(false);
  const [keyError,    setKeyError]    = useState(null);

  // View mode toggle: 'visual' | 'json'
  const [viewMode, setViewMode] = useState('visual');

  // Visual editor state
  const [editingItem,    setEditingItem]    = useState(null);  // item | null
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);  // idx | null
  const [busy,           setBusy]           = useState(false);

  // Load key list on mount
  useEffect(() => {
    staffApi.get('/admin/cms')
      .then((r) => {
        const raw = r.data?.data ?? r.data;
        // Backend may return array of objects or array of key strings
        if (Array.isArray(raw)) {
          const meta = {};
          const keys = raw.map((item) => {
            if (typeof item === 'string') return item;
            if (item?.key) { meta[item.key] = item; return item.key; }
            return String(item);
          });
          setAllKeys(keys);
          setKeyMeta(meta);
        } else if (raw?.keys && Array.isArray(raw.keys)) {
          setAllKeys(raw.keys);
        } else {
          setAllKeys([]);
        }
      })
      .catch((e) => {
        setError(e);
        setAllKeys([]);
      });
  }, []);

  // Load selected key
  const openKey = useCallback(async (key) => {
    setSelectedKey(key);
    setItems(null);
    setSchema(null);
    setKeyError(null);
    setEditingItem(null);
    setDeleteConfirm(null);
    setKeyLoading(true);
    try {
      const r = await staffApi.get(`/admin/cms/${key}`);
      const raw = r.data?.data ?? r.data;
      const loaded = Array.isArray(raw?.items) ? raw.items
        : Array.isArray(raw) ? raw
        : [];
      setItems(loaded);
      setSchema(SCHEMAS[key] || inferSchema(loaded));
    } catch (e) {
      setKeyError(e);
      setItems([]);
    } finally {
      setKeyLoading(false);
    }
  }, []);

  // Publish helper (visual editor path)
  const publish = useCallback(async (newItems) => {
    setBusy(true);
    try {
      await staffApi.put(`/admin/cms/${selectedKey}`, { items: newItems });
      showSuccess('Content saved and published!');
      setItems(newItems);
      // Update last-saved meta
      setKeyMeta((prev) => ({
        ...prev,
        [selectedKey]: { ...prev[selectedKey], updatedAt: new Date().toISOString() },
      }));
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  }, [selectedKey]);

  // Visual editor handlers
  const handleSaveItem = (form) => {
    const coerced = { ...form };
    if (schema) {
      schema.forEach((f) => {
        if (f.type === 'number' && coerced[f.key] !== '') {
          coerced[f.key] = Number(coerced[f.key]);
        }
      });
    }
    delete coerced._isNew;
    let next;
    if (editingItem._isNew) {
      next = [...(items ?? []), coerced];
    } else {
      next = (items ?? []).map((it) => (it === editingItem ? coerced : it));
    }
    setEditingItem(null);
    publish(next);
  };

  const handleDelete = (idx) => {
    const next = (items ?? []).filter((_, i) => i !== idx);
    setDeleteConfirm(null);
    publish(next);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...(items ?? [])];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    publish(next);
  };

  const moveDown = (idx) => {
    if (idx === (items ?? []).length - 1) return;
    const next = [...(items ?? [])];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    publish(next);
  };

  // When JSON editor saves, sync items state
  const handleJsonSaved = (newItems) => {
    setItems(newItems);
    setSchema(SCHEMAS[selectedKey] || inferSchema(newItems));
    setKeyMeta((prev) => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], updatedAt: new Date().toISOString() },
    }));
  };

  // Last saved time for current key
  const lastSaved = selectedKey ? keyMeta[selectedKey]?.updatedAt : null;

  return (
    <div>
      <PageHeader
        title="CMS Content"
        subtitle="Manage homepage sections, hero text, and dynamic content blocks"
        action={
          lastSaved ? (
            <span className="text-xs text-[#909090] font-open-sauce">
              Last saved: {fmtTime(lastSaved)}
            </span>
          ) : null
        }
      />

      <div className="p-4 sm:p-8 space-y-4">

        {/* Global error */}
        <ErrorBox error={error} />

        {/* Key selector pills */}
        {allKeys === null ? (
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-[#E5F1E2] animate-pulse" />
            ))}
          </div>
        ) : allKeys.length === 0 ? (
          <EmptyState message="No CMS keys found. Check your backend configuration." />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allKeys.map((k) => (
              <button
                key={k}
                onClick={() => openKey(k)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-open-sauce-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedKey === k
                    ? 'bg-[#45A735] text-white shadow-[0_2px_8px_rgba(69,167,53,0.30)]'
                    : 'bg-white border border-[#E5F1E2] text-[#636363] hover:border-[#45A735] hover:text-[#26472B]'
                }`}
              >
                {k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        {!selectedKey && !error && allKeys?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E5F1E2] p-14 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F2F9F1] flex items-center justify-center">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#45A735" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="#45A735" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="#45A735" strokeWidth={1.6} strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="#45A735" strokeWidth={1.6} strokeLinecap="round" />
                <polyline points="10 9 9 9 8 9" stroke="#45A735" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-[#909090] font-open-sauce">
              Select a CMS key from the tabs above to start editing.
            </p>
          </div>
        )}

        {selectedKey && (
          <SectionCard
            title={selectedKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            subtitle={`Edit content items for the "${selectedKey}" section`}
            action={
              /* View mode toggle — only show when items are loaded */
              items !== null && !keyLoading ? (
                <div className="inline-flex rounded-lg border border-[#E5F1E2] overflow-hidden">
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 text-xs font-open-sauce-semibold transition-colors cursor-pointer ${
                      viewMode === 'visual'
                        ? 'bg-[#45A735] text-white'
                        : 'text-[#636363] hover:bg-[#F2F9F1]'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1.5 text-xs font-open-sauce-semibold transition-colors cursor-pointer ${
                      viewMode === 'json'
                        ? 'bg-[#45A735] text-white'
                        : 'text-[#636363] hover:bg-[#F2F9F1]'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              ) : null
            }
          >
            {keyLoading && <Spinner />}

            {!keyLoading && keyError && <ErrorBox error={keyError} />}

            {!keyLoading && !keyError && items !== null && (
              viewMode === 'json' ? (
                <JsonEditorPanel
                  cmsKey={selectedKey}
                  initialItems={items}
                  onSaved={handleJsonSaved}
                />
              ) : (
                <VisualEditorPanel
                  cmsKey={selectedKey}
                  items={items}
                  schema={schema}
                  busy={busy}
                  onAddItem={() => schema && setEditingItem({ ...emptyItem(schema), _isNew: true })}
                  onEditItem={(item) => setEditingItem(item)}
                  onDeleteItem={(idx) => setDeleteConfirm(idx)}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onPublish={publish}
                />
              )
            )}
          </SectionCard>
        )}
      </div>

      {/* Item editor modal */}
      {editingItem && schema && (
        <ItemEditor
          schema={schema}
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm !== null && items && (
        <DeleteModal
          label={itemLabel(items[deleteConfirm])}
          busy={busy}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
