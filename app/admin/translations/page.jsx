'use client';

import { useState, useCallback, useRef } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { PageHeader, Spinner, ErrorBox, EmptyState, Button } from '@/components/staff/ui';
import { showSuccess, showError } from '@/lib/utils/toast';

/* ── Constants ─────────────────────────────────────────────────────────────── */

const LANGUAGES = [
  { code: 'en',    label: 'English' },
  { code: 'hi',    label: 'Hindi' },
  { code: 'de',    label: 'German' },
  { code: 'es',    label: 'Spanish' },
  { code: 'fr',    label: 'French' },
  { code: 'ar',    label: 'Arabic' },
  { code: 'ja',    label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
];

const PRESET_NAMESPACES = ['common', 'admin', 'booking', 'profile', 'services', 'resource'];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function errMsg(e) {
  return e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || 'Request failed';
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function CountBadge({ count, filtered }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F2F9F1] text-[#26472B] text-xs font-open-sauce-semibold ring-1 ring-[#D6EBCF]">
      {filtered < count ? (
        <>{filtered} <span className="font-normal text-[#636363]">/ {count} keys</span></>
      ) : (
        <>{count} keys</>
      )}
    </span>
  );
}

function InlineInput({ value, onChange, placeholder = '', className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#484848] focus:outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A735]/30 transition-colors ${className}`}
    />
  );
}

function AddKeyForm({ onSave, onCancel }) {
  const [newKey, setNewKey]     = useState('');
  const [newValue, setNewValue] = useState('');
  const [busy, setBusy]         = useState(false);

  const handleSave = async () => {
    if (!newKey.trim()) { showError('Key name is required.'); return; }
    setBusy(true);
    try {
      await onSave(newKey.trim(), newValue);
      setNewKey('');
      setNewValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="bg-[#FAFFF9] border-b border-[#E5F1E2]">
      <td className="px-4 py-3 align-top w-[38%]">
        <InlineInput
          value={newKey}
          onChange={setNewKey}
          placeholder="e.g. nav.home"
          className="font-mono text-[#26472B]"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <InlineInput
          value={newValue}
          onChange={setNewValue}
          placeholder="Translation value…"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={handleSave} disabled={busy || !newKey.trim()}>
            {busy ? 'Adding…' : 'Add'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TranslationRow({ translationKey, initialValue, onSave }) {
  const [value, setValue]   = useState(initialValue);
  const [busy, setBusy]     = useState(false);
  const isDirty             = value !== initialValue;
  const isEmpty             = !value.trim();

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSave(translationKey, value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className={`border-b border-[#EEF5EC] transition-colors hover:bg-[#F7FBF6] ${isEmpty ? 'bg-yellow-50' : ''}`}>
      <td className="px-4 py-3 align-middle w-[38%]">
        <span className="font-mono text-[12px] text-[#26472B] bg-[#F2F9F1] px-2 py-0.5 rounded select-all break-all">
          {translationKey}
        </span>
        {isEmpty && (
          <span className="ml-2 text-[10px] text-yellow-600 font-open-sauce-semibold uppercase tracking-wide">
            empty
          </span>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm font-open-sauce text-[#484848] focus:outline-none focus:ring-1 transition-colors ${
            isDirty
              ? 'border-[#45A735] ring-[#45A735]/30 bg-[#FAFFF9]'
              : isEmpty
              ? 'border-yellow-300 bg-yellow-50/60'
              : 'border-[#E5F1E2] bg-white'
          }`}
          placeholder="(empty)"
        />
      </td>
      <td className="px-4 py-3 align-middle">
        <Button
          size="sm"
          variant={isDirty ? 'primary' : 'subtle'}
          onClick={handleSave}
          disabled={busy || !isDirty}
          title={isDirty ? 'Save this key' : 'No changes'}
        >
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </td>
    </tr>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */

export default function AdminTranslationsPage() {
  // Controls
  const [lang, setLang]               = useState('en');
  const [nsPreset, setNsPreset]       = useState('common');
  const [nsCustom, setNsCustom]       = useState('');
  const [useCustomNs, setUseCustomNs] = useState(false);

  // Data
  const [translations, setTranslations] = useState(null); // null = not loaded yet
  const [loading, setLoading]           = useState(false);
  const [loadError, setLoadError]       = useState(null);

  // UI state
  const [search, setSearch]         = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Track current loaded params (so saves go to the right lang/ns)
  const loadedRef = useRef({ lang: 'en', ns: 'common' });

  const activeNs = useCustomNs ? nsCustom.trim() : nsPreset;

  /* Load translations from backend */
  const handleLoad = useCallback(async () => {
    const ns = useCustomNs ? nsCustom.trim() : nsPreset;
    if (!ns) { showError('Please enter a namespace.'); return; }
    setLoading(true);
    setLoadError(null);
    setTranslations(null);
    setSearch('');
    setShowAddForm(false);
    try {
      const res = await staffApi.get('/i18n/admin/translations', {
        params: { lang, namespace: ns },
      });
      // Response shape: { data: { [key]: string } }
      const raw = res.data?.data ?? res.data ?? {};
      setTranslations(raw);
      loadedRef.current = { lang, ns };
    } catch (e) {
      setLoadError(e);
    } finally {
      setLoading(false);
    }
  }, [lang, nsPreset, nsCustom, useCustomNs]);

  /* Save a single key */
  const handleSaveKey = useCallback(async (key, value) => {
    const { lang: l, ns } = loadedRef.current;
    try {
      await staffApi.post('/i18n/admin/translations', {
        lang: l,
        namespace: ns,
        key,
        value,
      });
      showSuccess('Key saved.');
      // Patch local state so the row's initialValue updates (prevents double-save confusion)
      setTranslations((prev) => prev ? { ...prev, [key]: value } : prev);
    } catch (e) {
      showError(errMsg(e));
      throw e; // re-throw so the row can reset busy state
    }
  }, []);

  /* Add new key */
  const handleAddKey = useCallback(async (key, value) => {
    const { lang: l, ns } = loadedRef.current;
    if (translations && Object.prototype.hasOwnProperty.call(translations, key)) {
      showError(`Key "${key}" already exists. Edit it in the table below.`);
      throw new Error('duplicate');
    }
    try {
      await staffApi.post('/i18n/admin/translations', {
        lang: l,
        namespace: ns,
        key,
        value,
      });
      showSuccess('Key added.');
      setTranslations((prev) => ({ ...prev, [key]: value }));
      setShowAddForm(false);
    } catch (e) {
      showError(errMsg(e));
      throw e;
    }
  }, [translations]);

  /* Derived filtered list */
  const allEntries = translations ? Object.entries(translations) : [];
  const filteredEntries = search.trim()
    ? allEntries.filter(([k, v]) =>
        k.toLowerCase().includes(search.toLowerCase()) ||
        v.toLowerCase().includes(search.toLowerCase())
      )
    : allEntries;

  const isLoaded = translations !== null;

  return (
    <div className="min-h-screen bg-[#F7FBF6]">
      <PageHeader
        title="Translations"
        subtitle="Manage i18n keys across languages and namespaces"
      />

      <div className="p-4 sm:p-8 space-y-6">

        {/* ── Controls card ─────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_4px_rgba(38,71,43,0.05)] p-5">
          <p className="text-xs font-open-sauce-semibold text-[#636363] uppercase tracking-wider mb-4">
            Select Language &amp; Namespace
          </p>
          <div className="flex flex-wrap gap-3 items-end">

            {/* Language selector */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[11px] font-open-sauce-semibold text-[#636363] uppercase tracking-wider">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#484848] bg-white focus:outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A735]/30 cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label} ({l.code})</option>
                ))}
              </select>
            </div>

            {/* Namespace selector */}
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-[11px] font-open-sauce-semibold text-[#636363] uppercase tracking-wider">
                Namespace
              </label>
              {!useCustomNs ? (
                <div className="flex gap-2 items-center">
                  <select
                    value={nsPreset}
                    onChange={(e) => setNsPreset(e.target.value)}
                    className="flex-1 border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#484848] bg-white focus:outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A735]/30 cursor-pointer"
                  >
                    {PRESET_NAMESPACES.map((ns) => (
                      <option key={ns} value={ns}>{ns}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setUseCustomNs(true)}
                    className="text-xs text-[#45A735] font-open-sauce-semibold hover:underline whitespace-nowrap"
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={nsCustom}
                    onChange={(e) => setNsCustom(e.target.value)}
                    placeholder="e.g. payments"
                    className="flex-1 border border-[#E5F1E2] rounded-lg px-3 py-2 text-sm font-open-sauce text-[#484848] focus:outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A735]/30"
                  />
                  <button
                    onClick={() => { setUseCustomNs(false); setNsCustom(''); }}
                    className="text-xs text-[#636363] font-open-sauce-semibold hover:underline whitespace-nowrap"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>

            {/* Load button */}
            <Button
              variant="primary"
              onClick={handleLoad}
              disabled={loading || (useCustomNs && !nsCustom.trim())}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Loading…
                </>
              ) : 'Load'}
            </Button>

          </div>
        </div>

        {/* ── Error state ──────────────────────────────────────────────── */}
        <ErrorBox error={loadError} />

        {/* ── Loading spinner ───────────────────────────────────────────── */}
        {loading && <Spinner />}

        {/* ── Loaded content ────────────────────────────────────────────── */}
        {isLoaded && !loading && (
          <div className="space-y-4">

            {/* Toolbar row: search + key count + add button */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0C9AB]"
                    width={15} height={15} viewBox="0 0 24 24" fill="none"
                  >
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={2} />
                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by key or value…"
                    className="w-full border border-[#E5F1E2] rounded-lg pl-9 pr-3 py-2 text-sm font-open-sauce text-[#484848] bg-white focus:outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A735]/30"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0C9AB] hover:text-[#636363] text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Count badge */}
                <CountBadge count={allEntries.length} filtered={filteredEntries.length} />

                {/* Loaded context label */}
                <span className="hidden sm:inline text-xs text-[#636363] font-open-sauce">
                  <span className="text-[#45A735] font-open-sauce-semibold">{loadedRef.current.lang}</span>
                  {' / '}
                  <span className="text-[#45A735] font-open-sauce-semibold">{loadedRef.current.ns}</span>
                </span>
              </div>

              {/* Add new key */}
              <Button
                variant={showAddForm ? 'subtle' : 'outline'}
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? 'Cancel' : '+ Add New Key'}
              </Button>
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm font-open-sauce">
                  <thead className="bg-[#F2F9F1] text-[#26472B]">
                    <tr>
                      <th className="text-left font-open-sauce-semibold text-[11px] uppercase tracking-wider px-4 py-3 w-[38%]">
                        Key
                      </th>
                      <th className="text-left font-open-sauce-semibold text-[11px] uppercase tracking-wider px-4 py-3">
                        Value
                      </th>
                      <th className="text-left font-open-sauce-semibold text-[11px] uppercase tracking-wider px-4 py-3 w-[110px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* Add new key row at the top */}
                    {showAddForm && (
                      <AddKeyForm
                        onSave={handleAddKey}
                        onCancel={() => setShowAddForm(false)}
                      />
                    )}

                    {/* Existing rows */}
                    {filteredEntries.length === 0 && !showAddForm && (
                      <tr>
                        <td colSpan={3} className="px-4 py-0">
                          <div className="py-8">
                            <EmptyState
                              message={
                                search.trim()
                                  ? `No keys match "${search}"`
                                  : 'No translation keys found for this language / namespace.'
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredEntries.map(([key, value]) => (
                      <TranslationRow
                        key={key}
                        translationKey={key}
                        initialValue={value ?? ''}
                        onSave={handleSaveKey}
                      />
                    ))}

                  </tbody>
                </table>
              </div>

              {/* Footer: empty-value legend */}
              {allEntries.some(([, v]) => !v?.trim()) && (
                <div className="border-t border-[#EEF5EC] px-4 py-2.5 flex items-center gap-2 bg-yellow-50/40">
                  <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 flex-shrink-0" />
                  <span className="text-[11px] text-yellow-700 font-open-sauce">
                    Highlighted rows have empty or missing translation values.
                  </span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Not yet loaded prompt ─────────────────────────────────── */}
        {!isLoaded && !loading && !loadError && (
          <div className="rounded-2xl border border-dashed border-[#D6EBCF] bg-white py-14 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F2F9F1] flex items-center justify-center">
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="#45A735" strokeWidth={1.5} />
                <path d="M8 9h4M8 12h8M8 15h5" stroke="#45A735" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-[#484848] font-open-sauce">
              Select a language and namespace, then click <strong className="font-open-sauce-semibold text-[#45A735]">Load</strong> to view and edit translation keys.
            </p>
            <p className="mt-1 text-xs text-[#636363] font-open-sauce">
              Changes are saved individually per key via inline Save buttons.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
