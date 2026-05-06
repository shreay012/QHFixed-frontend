'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import staffApi from '@/lib/axios/staffApi';
import { isSuperAdmin } from '@/lib/utils/role';
import {
  PageHeader,
  SectionCard,
  Spinner,
  ErrorBox,
  Button,
  EmptyState,
} from '@/components/staff/ui';
import { showError, showSuccess } from '@/lib/utils/toast';

/**
 * Super-admin-only page for managing other super admins. Lists existing
 * super admins, lets the current super admin promote any user to super_admin
 * (by mobile lookup) or create a brand new super_admin user. Toggling
 * active/inactive uses the existing /admin/users/:id/status endpoint.
 *
 * RBAC:
 *   - Page itself gated client-side via isSuperAdmin().
 *   - Backend POST /admin/super-admins gated by PERMS.RBAC_WRITE
 *     (super_admin only).
 */
export default function SuperAdminsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);

  // Gate
  useEffect(() => {
    if (typeof window !== 'undefined' && !isSuperAdmin()) {
      router.replace('/admin');
    }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffApi.get('/admin/users?role=super_admin');
      const data = res.data?.data || res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load super admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (form) => {
    setBusy(true);
    try {
      const res = await staffApi.post('/admin/super-admins', form);
      const action = res.data?.action || 'created';
      showSuccess(action === 'promoted' ? 'User promoted to super admin.' : 'Super admin created.');
      setShowAdd(false);
      await load();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (item) => {
    if (items.length <= 1 && item?.meta?.status !== 'inactive') {
      showError('Cannot deactivate the only super admin. Promote another first.');
      return;
    }
    const next = item?.meta?.status === 'inactive' ? 'active' : 'inactive';
    setBusy(true);
    try {
      await staffApi.patch(`/admin/users/${item._id}/status`, { status: next });
      showSuccess(`Marked ${next}`);
      await load();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      <PageHeader
        title="Super Admins"
        subtitle="Global administrators with cross-country access. Promote existing users or onboard new ones."
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            + Add Super Admin
          </Button>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="No super admins yet"
          message="Create or promote at least one to manage the platform."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <SectionCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-[#909090] border-b border-[#E5F1E2]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F1E2]">
                {items.map((u) => {
                  const status = u?.meta?.status || 'active';
                  const created = u?.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  return (
                    <tr key={u._id} className="hover:bg-[#F7FBF6]">
                      <td className="px-4 py-3 font-open-sauce-semibold text-[#26472B]">
                        {u.name || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{u.mobile || '—'}</td>
                      <td className="px-4 py-3 text-[#636363]">{u.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === 'active'
                              ? 'bg-[#F2F9F1] text-[#26472B]'
                              : 'bg-[#FEE2E2] text-[#991B1B]'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#636363] text-xs">{created}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="subtle" disabled={busy} onClick={() => onToggle(u)}>
                          {status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {showAdd && (
        <CreateModal
          onClose={() => setShowAdd(false)}
          onSubmit={onSubmit}
          busy={busy}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onSubmit, busy }) {
  // Two modes: create-new (default) | promote-existing (search by mobile)
  const [mode, setMode] = useState('create');
  const [searchMobile, setSearchMobile] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '' });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const findUser = async () => {
    if (!/^\d{10,15}$/.test(searchMobile.replace(/\D/g, ''))) return;
    setSearching(true);
    setFoundUser(null);
    try {
      const r = await staffApi.get(`/admin/users?role=&q=${encodeURIComponent(searchMobile)}`);
      const list = r.data?.data || [];
      const match = list.find((u) => u.mobile === searchMobile) || list[0];
      setFoundUser(match || { __notFound: true });
    } catch {
      setFoundUser({ __notFound: true });
    } finally {
      setSearching(false);
    }
  };

  const submit = () => {
    if (mode === 'promote') {
      if (!foundUser?._id) return;
      onSubmit({ userId: foundUser._id });
    } else {
      onSubmit({ name: form.name, mobile: form.mobile, email: form.email });
    }
  };

  const validCreate = form.name.trim() && /^\d{10,15}$/.test(form.mobile.replace(/\D/g, ''));
  const validPromote = foundUser?._id && !foundUser?.__notFound;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#E5F1E2]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-open-sauce-bold text-[#26472B] mb-4">
          Add Super Admin
        </h3>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-[#F7FBF6] rounded-lg mb-5 border border-[#E5F1E2]">
          {[
            { id: 'create',  label: 'Create New' },
            { id: 'promote', label: 'Promote Existing' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-open-sauce-semibold transition-colors ${
                mode === t.id
                  ? 'bg-white text-[#26472B] shadow-sm'
                  : 'text-[#636363] hover:text-[#26472B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === 'create' ? (
          <div className="space-y-4">
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Operations Director"
                className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
              />
            </Field>
            <Field label="Mobile" required>
              <input
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="e.g. 9000000099"
                className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="optional"
                className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Mobile of existing user" required>
              <div className="flex gap-2">
                <input
                  value={searchMobile}
                  onChange={(e) => { setSearchMobile(e.target.value); setFoundUser(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') findUser(); }}
                  placeholder="9000000010"
                  className="flex-1 border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
                />
                <Button variant="subtle" onClick={findUser} disabled={searching || !searchMobile.trim()}>
                  {searching ? 'Searching…' : 'Find'}
                </Button>
              </div>
            </Field>
            {foundUser?.__notFound && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                No user with that mobile. Switch to "Create New" instead.
              </div>
            )}
            {foundUser?._id && (
              <div className="bg-[#F2F9F1] border border-[#45A735]/20 rounded-lg p-3 text-sm">
                <div className="font-open-sauce-semibold text-[#26472B]">{foundUser.name || 'Unnamed'}</div>
                <div className="text-[#636363] text-xs mt-0.5">
                  Current role: <span className="font-medium">{foundUser.role}</span>
                  {foundUser.country ? ` · country: ${foundUser.country}` : ''}
                </div>
                <div className="text-[#909090] text-xs mt-2">
                  This user will become a super admin. Their country (if any) will be cleared.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E5F1E2]">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={busy || (mode === 'create' ? !validCreate : !validPromote)}
            onClick={submit}
          >
            {busy ? 'Saving…' : mode === 'promote' ? 'Promote' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-open-sauce-semibold text-[#636363] mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
