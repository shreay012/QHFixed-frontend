'use client';

/**
 * Service detail page — read-only view of a single service.
 * Edit lives at /admin/services/[id]/edit (separate route).
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import staffApi from '@/lib/axios/staffApi';
import { showError, showSuccess } from '@/lib/utils/toast';
import { s } from '@/lib/utils/i18nText';
import { PageHeader, Spinner, ErrorBox, Button, StatusBadge } from '@/components/staff/ui';

function fmtINR(v) {
  if (v == null) return '—';
  return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}

function Card({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5F1E2] shadow-[0_1px_3px_rgba(38,71,43,0.04)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF5EC]">
        <h3 className="text-sm font-open-sauce-bold text-[#26472B]">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2 border-b border-[#F5F7F5] last:border-b-0">
      <span className="w-full sm:w-44 text-[11px] uppercase tracking-wider text-[#909090] font-open-sauce-semibold flex-shrink-0">{label}</span>
      <span className="flex-1 text-sm text-[#26472B] font-open-sauce break-words">{children}</span>
    </div>
  );
}

export default function AdminServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [svc, setSvc] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const r = await staffApi.get(`/admin/services/${id}`);
      setSvc(r.data?.data || null);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const toggleActive = async () => {
    if (!svc) return;
    setBusy('toggle');
    try {
      const next = !svc.active;
      await staffApi.put(`/admin/services/${id}`, { active: next });
      setSvc((p) => ({ ...p, active: next }));
      showSuccess(next ? 'Service activated' : 'Service deactivated');
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm('Soft-delete this service? Existing bookings keep their reference, but the service will be hidden from the public catalog.')) return;
    setBusy('delete');
    try {
      await staffApi.delete(`/admin/services/${id}`);
      showSuccess('Service archived');
      router.replace('/admin/services');
    } catch (e) {
      showError(e?.response?.data?.error?.message || 'Failed');
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Service" subtitle="Detail" action={
          <Button variant="subtle" onClick={() => router.push('/admin/services')}>← Back</Button>
        } />
        <div className="p-6"><ErrorBox error={error} /></div>
      </div>
    );
  }

  if (!svc) {
    return (
      <div>
        <PageHeader title="Service" subtitle="Loading…" action={
          <Button variant="subtle" onClick={() => router.push('/admin/services')}>← Back</Button>
        } />
        <div className="p-6"><Spinner /></div>
      </div>
    );
  }

  const name = s(svc.name) || svc.title || '—';
  const tagline = s(svc.tagline) || '';
  const description = s(svc.description) || '';
  const status = svc.deletedAt ? 'archived' : (svc.active ? 'active' : 'inactive');

  return (
    <div>
      <PageHeader
        title={name}
        subtitle={`Service · ${svc.category || 'Uncategorized'}`}
        action={
          <div className="flex gap-2">
            <Button variant="subtle" onClick={() => router.push('/admin/services')}>← Back</Button>
            <Button variant="subtle" onClick={() => router.push(`/admin/services/${id}/edit`)}>✎ Edit</Button>
          </div>
        }
      />

      <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — main details */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Overview" action={<StatusBadge status={status} />}>
            <Row label="Name">{name}</Row>
            {tagline && <Row label="Tagline">{tagline}</Row>}
            <Row label="Slug"><code className="text-xs text-[#636363]">{svc.slug || '—'}</code></Row>
            <Row label="Category">{svc.category || '—'}</Row>
            <Row label="Hourly rate">{fmtINR(svc.hourlyRate || svc.pricing?.hourly)}</Row>
            <Row label="Currency">{svc.pricing?.currency || 'INR'}</Row>
            <Row label="Created">{fmtDate(svc.createdAt)}</Row>
            <Row label="Updated">{fmtDate(svc.updatedAt)}</Row>
            {svc.deletedAt && <Row label="Deleted">{fmtDate(svc.deletedAt)}</Row>}
          </Card>

          {description && (
            <Card title="Description">
              <p className="text-sm text-[#484848] font-open-sauce whitespace-pre-wrap leading-relaxed">{description}</p>
            </Card>
          )}

          {Array.isArray(svc.technologies) && svc.technologies.length > 0 && (
            <Card title="Technologies">
              <div className="flex flex-wrap gap-2">
                {svc.technologies.map((t, i) => (
                  <span key={i} className="text-xs bg-[#F2F9F1] text-[#26472B] border border-[#E5F1E2] rounded-md px-2.5 py-1 font-open-sauce">
                    {s(t)}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {Array.isArray(svc.notIncluded) && svc.notIncluded.length > 0 && (
            <Card title="Not Included">
              <ul className="list-disc list-inside text-sm text-[#484848] font-open-sauce space-y-1">
                {svc.notIncluded.map((it, i) => (
                  <li key={i}>{s(it)}</li>
                ))}
              </ul>
            </Card>
          )}

          {Array.isArray(svc.faqs) && svc.faqs.length > 0 && (
            <Card title={`FAQs (${svc.faqs.length})`}>
              <div className="space-y-3">
                {svc.faqs.map((f, i) => (
                  <details key={i} className="bg-[#F7FBF6] border border-[#E5F1E2] rounded-lg p-3">
                    <summary className="text-sm font-open-sauce-semibold text-[#26472B] cursor-pointer">
                      {s(f.question) || `Question ${i + 1}`}
                    </summary>
                    <p className="text-sm text-[#484848] font-open-sauce mt-2 whitespace-pre-wrap">{s(f.answer)}</p>
                  </details>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — actions + media + availability */}
        <div className="space-y-4">
          {svc.imageUrl && (
            <Card title="Image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={svc.imageUrl} alt={name} className="w-full rounded-lg object-cover max-h-72" />
              <p className="mt-2 text-[11px] text-[#909090] font-mono break-all">{svc.imageUrl}</p>
            </Card>
          )}

          <Card title="Availability">
            {svc.availability && Object.keys(svc.availability).length > 0 ? (
              <pre className="text-xs text-[#636363] font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(svc.availability, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-[#909090] font-open-sauce italic">No availability rules configured.</p>
            )}
          </Card>

          <Card title="Actions">
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleActive}
                disabled={busy === 'toggle' || svc.deletedAt}
                className="w-full px-3 py-2 rounded-lg text-sm font-open-sauce-semibold border border-[#45A735] text-[#45A735] hover:bg-[#45A735] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                {busy === 'toggle' ? 'Updating…' : svc.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => router.push(`/admin/services/${id}/edit`)}
                className="w-full px-3 py-2 rounded-lg text-sm font-open-sauce-semibold bg-[#45A735] text-white hover:bg-[#26472B] transition-colors cursor-pointer"
              >
                Edit Service
              </button>
              <button
                onClick={remove}
                disabled={busy === 'delete' || svc.deletedAt}
                className="w-full px-3 py-2 rounded-lg text-sm font-open-sauce-semibold border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {busy === 'delete' ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
