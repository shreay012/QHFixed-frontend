// /frontend/app/admin/cms/templates/page.jsx
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
// Constants
// ---------------------------------------------------------------------------

const CHANNELS = [
  { value: 'email',  label: 'Email'  },
  { value: 'sms',    label: 'SMS'    },
  { value: 'push',   label: 'Push'   },
  { value: 'in_app', label: 'In-App' },
];

const CHANNEL_BADGE = {
  email:  { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200'   },
  sms:    { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
  push:   { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
  in_app: { bg: 'bg-[#F2F9F1]', text: 'text-[#26472B]',  ring: 'ring-[#D6EBCF]'  },
};

const EMPTY_FORM = {
  key:       '',
  channel:   'email',
  subject:   '',
  body:      '',
  variables: '',
  active:    true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputCls(extra = '') {
  return `w-full px-3 py-2 rounded-lg border border-[#D6EBCF] bg-white text-sm font-open-sauce text-[#484848] placeholder-[#AEAEAE] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735] transition ${extra}`;
}

function labelCls() {
  return 'block text-xs font-open-sauce-semibold text-[#26472B] uppercase tracking-wider mb-1';
}

function varsToString(vars) {
  if (!vars || !Array.isArray(vars)) return '';
  return vars.join(', ');
}

function stringToVars(str) {
  if (!str || !str.trim()) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Channel Badge
// ---------------------------------------------------------------------------

function ChannelBadge({ channel }) {
  const style = CHANNEL_BADGE[channel] || CHANNEL_BADGE.in_app;
  const label = CHANNELS.find((c) => c.value === channel)?.label || channel;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 ${style.bg} ${style.text} ${style.ring}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-[#45A735]' : 'bg-[#D1D5DB]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </div>
      {label && <span className="text-sm font-open-sauce text-[#484848]">{label}</span>}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Template Modal (Create / Edit)
// ---------------------------------------------------------------------------

function TemplateModal({ template, onClose, onSaved }) {
  const isNew = !template?._id;
  const [form, setForm] = useState(() =>
    isNew
      ? { ...EMPTY_FORM }
      : {
          key:       template.key       || '',
          channel:   template.channel   || 'email',
          subject:   template.subject   || '',
          body:      template.body      || '',
          variables: varsToString(template.variables),
          active:    template.active ?? true,
        }
  );
  const [saving, setSaving]     = useState(false);
  const [fieldErr, setFieldErr] = useState(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const subjectRequired = form.channel === 'email';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErr(null);
    if (!form.key.trim())  return setFieldErr('Key is required.');
    if (!form.channel)     return setFieldErr('Channel is required.');
    if (!form.body.trim()) return setFieldErr('Body is required.');
    if (subjectRequired && !form.subject.trim()) return setFieldErr('Subject is required for email templates.');

    const body = {
      key:       form.key.trim(),
      channel:   form.channel,
      subject:   form.subject.trim() || undefined,
      body:      form.body.trim(),
      variables: stringToVars(form.variables),
      active:    form.active,
    };

    setSaving(true);
    try {
      if (isNew) {
        await staffApi.post('/cms-x/notification-templates', body);
        showSuccess('Template created successfully.');
      } else {
        await staffApi.put(`/cms-x/notification-templates/${template._id}`, body);
        showSuccess('Template updated successfully.');
      }
      onSaved();
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to save template.';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5F1E2] shadow-[0_16px_48px_rgba(38,71,43,0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5F1E2] bg-[#F2F9F1]">
          <div>
            <h2 className="text-base font-open-sauce-bold text-[#26472B]">
              {isNew ? 'New Template' : 'Edit Template'}
            </h2>
            <p className="text-xs font-open-sauce text-[#636363] mt-0.5">
              {isNew ? 'Create a notification template' : `Editing: ${template.key}`}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {fieldErr && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 font-open-sauce">
              {fieldErr}
            </div>
          )}

          {/* Key */}
          <div>
            <label className={labelCls()}>Key <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => set('key', e.target.value)}
              placeholder="e.g. booking_confirmed"
              className={inputCls('font-mono')}
              spellCheck={false}
            />
          </div>

          {/* Channel */}
          <div>
            <label className={labelCls()}>Channel <span className="text-red-500">*</span></label>
            <select
              value={form.channel}
              onChange={(e) => set('channel', e.target.value)}
              className={inputCls()}
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Subject (optional for SMS / push) */}
          <div>
            <label className={labelCls()}>
              Subject{subjectRequired ? <span className="text-red-500 ml-0.5">*</span> : <span className="text-[#AEAEAE] ml-1 normal-case">(optional for SMS / push)</span>}
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="e.g. Your booking is confirmed"
              className={inputCls()}
            />
          </div>

          {/* Body */}
          <div>
            <label className={labelCls()}>Body <span className="text-red-500">*</span></label>
            <textarea
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={6}
              placeholder="Hi {{userName}}, your booking {{bookingId}} is confirmed."
              className={inputCls('resize-y min-h-[120px]')}
            />
            <p className="text-[11px] text-[#909090] font-open-sauce mt-1">
              Use <code className="bg-[#F2F9F1] px-1 py-0.5 rounded text-[#26472B] font-mono">{'{{variableName}}'}</code> for dynamic values.
            </p>
          </div>

          {/* Variables */}
          <div>
            <label className={labelCls()}>Variables</label>
            <input
              type="text"
              value={form.variables}
              onChange={(e) => set('variables', e.target.value)}
              placeholder="userName, bookingId, amount"
              className={inputCls()}
            />
            <p className="text-[11px] text-[#909090] font-open-sauce mt-1">
              Comma-separated list of variable names used in the body.
            </p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 pt-1">
            <span className={labelCls() + ' mb-0'}>Active</span>
            <Toggle checked={form.active} onChange={(v) => set('active', v)} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
                isNew ? 'Create Template' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm modal
// ---------------------------------------------------------------------------

function DeleteConfirm({ template, onCancel, onConfirm, busy }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5F1E2] shadow-[0_16px_48px_rgba(38,71,43,0.15)] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-base font-open-sauce-bold text-[#26472B]">Delete Template?</h3>
        </div>
        <p className="text-sm text-[#636363] font-open-sauce mb-6">
          Are you sure you want to delete{' '}
          <strong className="text-[#26472B] font-mono">{template.key}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="subtle" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const ALL_FILTER = 'all';

export default function AdminNotificationTemplatesPage() {
  const [templates, setTemplates]       = useState(null);
  const [error, setError]               = useState(null);
  const [channelFilter, setChannelFilter] = useState(ALL_FILTER);
  const [modalTemplate, setModalTemplate] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteBusy, setDeleteBusy]       = useState(false);

  const load = useCallback(() => {
    setTemplates(null);
    setError(null);
    staffApi
      .get('/cms-x/notification-templates')
      .then((r) => setTemplates(r.data?.data || []))
      .catch((e) => setError(e));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await staffApi.delete(`/cms-x/notification-templates/${deleteTarget._id}`);
      showSuccess('Template deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to delete template.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered =
    templates === null
      ? null
      : channelFilter === ALL_FILTER
      ? templates
      : templates.filter((t) => t.channel === channelFilter);

  const counts = templates
    ? Object.fromEntries(CHANNELS.map((c) => [c.value, templates.filter((t) => t.channel === c.value).length]))
    : {};

  const columns = [
    {
      key: 'key',
      label: 'Key',
      render: (r) => (
        <code className="text-[12px] font-mono bg-[#F2F9F1] text-[#26472B] px-2 py-1 rounded-md border border-[#D6EBCF]">
          {r.key || '—'}
        </code>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (r) => <ChannelBadge channel={r.channel} />,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (r) => (
        <span className="text-sm font-open-sauce text-[#484848] max-w-[220px] truncate block">
          {r.subject || <span className="text-[#AEAEAE]">—</span>}
        </span>
      ),
    },
    {
      key: 'variables',
      label: 'Variables',
      render: (r) => {
        const vars = Array.isArray(r.variables) ? r.variables : [];
        if (vars.length === 0) return <span className="text-[#AEAEAE] text-xs font-open-sauce">None</span>;
        return (
          <span className="text-xs font-open-sauce text-[#636363]">
            {vars.join(', ')}
          </span>
        );
      },
    },
    {
      key: 'active',
      label: 'Status',
      render: (r) => (
        r.active ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 bg-[#F2F9F1] text-[#26472B] ring-[#45A735]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45A735]" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-open-sauce-semibold ring-1 bg-[#F5F7F5] text-[#909090] ring-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#909090]" />
            Inactive
          </span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setModalTemplate(r)}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
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
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(r)}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notification Templates"
        subtitle="Manage message templates for all notification channels"
        action={
          <Button variant="primary" size="md" onClick={() => setModalTemplate(null)}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
            New Template
          </Button>
        }
      />

      <div className="p-4 sm:p-8 space-y-4">
        <ErrorBox error={error} />

        {/* Channel filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All tab */}
          <button
            onClick={() => setChannelFilter(ALL_FILTER)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-open-sauce-semibold transition-all border ${
              channelFilter === ALL_FILTER
                ? 'bg-[#26472B] text-white border-[#26472B]'
                : 'bg-white text-[#636363] border-[#E5F1E2] hover:border-[#45A735] hover:text-[#26472B]'
            }`}
          >
            All
            {templates !== null && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-open-sauce-bold ${channelFilter === ALL_FILTER ? 'bg-white/20' : 'bg-[#F2F9F1] text-[#26472B]'}`}>
                {templates.length}
              </span>
            )}
          </button>

          {/* Per-channel tabs */}
          {CHANNELS.map((c) => {
            const style = CHANNEL_BADGE[c.value];
            const active = channelFilter === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setChannelFilter(c.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-open-sauce-semibold transition-all border ${
                  active
                    ? `${style.bg} ${style.text} border-current ring-1 ${style.ring}`
                    : 'bg-white text-[#636363] border-[#E5F1E2] hover:border-[#45A735] hover:text-[#26472B]'
                }`}
              >
                {c.label}
                {templates !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-open-sauce-bold ${active ? 'bg-current/10' : 'bg-[#F2F9F1] text-[#26472B]'}`}>
                    {counts[c.value] || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {filtered === null && !error && <Spinner />}

        {filtered !== null && filtered.length === 0 && (
          <EmptyState
            message={
              channelFilter === ALL_FILTER
                ? 'No templates yet. Create your first notification template.'
                : `No ${CHANNELS.find((c) => c.value === channelFilter)?.label || channelFilter} templates found.`
            }
          />
        )}

        {filtered !== null && filtered.length > 0 && (
          <Table
            columns={columns}
            rows={filtered}
            keyField="_id"
            empty="No templates found."
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalTemplate !== undefined && (
        <TemplateModal
          template={modalTemplate}
          onClose={() => setModalTemplate(undefined)}
          onSaved={() => {
            setModalTemplate(undefined);
            load();
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          template={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}
