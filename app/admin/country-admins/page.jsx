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

const SUPPORTED_COUNTRIES = [
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'US', flag: '🇺🇸', name: 'United States' },
];

/**
 * Super-admin-only page for managing country admins. Lists existing
 * country_admin users (one per market), lets super_admin create new ones
 * for additional countries, and toggle active/inactive status.
 *
 * Reuses the existing /api/admin/users endpoint (?role=country_admin).
 */
export default function CountryAdminsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);

  // Gate: only super_admin sees this page.
  useEffect(() => {
    if (typeof window !== 'undefined' && !isSuperAdmin()) {
      router.replace('/admin');
    }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffApi.get('/admin/users?role=country_admin');
      const data = res.data?.data || res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load country admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCreate = async (form) => {
    setBusy(true);
    try {
      // Reuse the staff-create endpoint pattern. Backend stores role
      // canonically; we send country in the body so the new admin lands
      // scoped correctly.
      await staffApi.post('/admin/country-admins', form);
      showSuccess(`Country admin for ${form.country} created.`);
      setShowAdd(false);
      await load();
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (item) => {
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
        title="Country Admins"
        subtitle="Manage country-scoped admin users. Each country admin sees only their country's data."
        action={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            + Add Country Admin
          </Button>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="No country admins yet"
          message="Create one per market. Existing data from that country will be scoped to them automatically."
          action={
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              Create First Country Admin
            </Button>
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <SectionCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-[#909090] border-b border-[#E5F1E2]">
                <tr>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5F1E2]">
                {items.map((u) => {
                  const country = u.country || '–';
                  const c = SUPPORTED_COUNTRIES.find((x) => x.code === country);
                  const status = u?.meta?.status || 'active';
                  return (
                    <tr key={u._id} className="hover:bg-[#F7FBF6]">
                      <td className="px-4 py-3 font-open-sauce-semibold text-[#26472B]">
                        <span className="mr-1">{c?.flag || '🌍'}</span>
                        {c?.name || country}
                      </td>
                      <td className="px-4 py-3">{u.name || '—'}</td>
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
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="subtle"
                          disabled={busy}
                          onClick={() => onToggle(u)}
                        >
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
          onSubmit={onCreate}
          busy={busy}
          existingCountries={items.map((i) => i.country).filter(Boolean)}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onSubmit, busy, existingCountries }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    country: '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const valid =
    form.name.trim() &&
    /^\d{10,15}$/.test(form.mobile.replace(/\D/g, '')) &&
    SUPPORTED_COUNTRIES.some((c) => c.code === form.country);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[#E5F1E2]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-open-sauce-bold text-[#26472B] mb-5">
          Add Country Admin
        </h3>
        <div className="space-y-4">
          <Field label="Country" required>
            <select
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
            >
              <option value="">Select country…</option>
              {SUPPORTED_COUNTRIES.map((c) => (
                <option
                  key={c.code}
                  value={c.code}
                  disabled={existingCountries.includes(c.code)}
                >
                  {c.flag} {c.name} {existingCountries.includes(c.code) ? '(already exists)' : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
              placeholder="e.g. Priya Sharma"
            />
          </Field>
          <Field label="Mobile" required>
            <input
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value)}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none font-mono"
              placeholder="e.g. 9000000060"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full border border-[#E5F1E2] rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#45A735]/30 focus:border-[#45A735] focus:outline-none"
              placeholder="optional"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E5F1E2]">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!valid || busy}
            onClick={() => onSubmit(form)}
          >
            {busy ? 'Creating…' : 'Create'}
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
