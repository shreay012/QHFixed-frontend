// /Users/orange/Documents/QHAIMODE copy 2/frontend/app/admin/ops/audit/page.jsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import staffApi from '@/lib/axios/staffApi';
import { PageHeader, Spinner, ErrorBox, EmptyState, Button } from '@/components/staff/ui';

const ROLES = ['', 'admin', 'pm', 'resource', 'user', 'system'];

const ROLE_BADGE = {
  admin:    'bg-red-50 text-red-700 ring-red-200',
  pm:       'bg-blue-50 text-blue-700 ring-blue-200',
  resource: 'bg-orange-50 text-orange-700 ring-orange-200',
  user:     'bg-[#F2F9F1] text-[#26472B] ring-[#D6EBCF]',
  system:   'bg-[#F5F7F5] text-[#636363] ring-[#E5E7EB]',
};

function RoleBadge({ role }) {
  const cls = ROLE_BADGE[role] || 'bg-[#F5F7F5] text-[#484848] ring-[#E5E7EB]';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-open-sauce-semibold ring-1 ${cls}`}>
      {role || '—'}
    </span>
  );
}

function MetaModal({ meta, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E5F1E2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5F1E2]">
          <h3 className="text-base font-open-sauce-bold text-[#26472B]">Meta Details</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F9F1] text-[#636363] hover:text-[#26472B] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <pre className="text-xs font-mono text-[#242424] bg-[#F7FBF6] border border-[#E5F1E2] rounded-xl p-4 whitespace-pre-wrap break-all leading-relaxed">
            {JSON.stringify(meta, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [metaModal, setMetaModal] = useState(null);
  const debounceRef = useRef(null);

  const fetchLogs = useCallback(async (pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setError(null); }

    try {
      const params = { page: pageNum, limit: 50 };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const r = await staffApi.get('/admin-ops/audit-logs', { params });
      const d = r.data?.data || {};
      const incoming = Array.isArray(d.logs) ? d.logs : [];
      setTotal(d.total || 0);
      setLogs((prev) => (append ? [...prev, ...incoming] : incoming));
      setPage(pageNum);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roleFilter, search]);

  // Initial load + filter changes reset to page 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLogs(1, false), 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchLogs]);

  const loadMore = () => fetchLogs(page + 1, true);

  const hasMore = logs.length < total;

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Track all admin and system actions" />
      <div className="p-4 sm:p-8 space-y-5">
        <ErrorBox error={error} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action or entity…"
            className="flex-1 px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#242424] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735]"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-[#D6EBCF] bg-white rounded-lg text-sm font-open-sauce text-[#26472B] focus:outline-none focus:ring-2 focus:ring-[#45A735]/40 focus:border-[#45A735]"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r || 'All roles'}</option>
            ))}
          </select>
        </div>

        {/* Total count */}
        {!loading && (
          <p className="text-xs text-[#909090] font-open-sauce">
            Showing {logs.length} of {total} log entries
          </p>
        )}

        {loading && <Spinner />}

        {!loading && logs.length === 0 && !error && (
          <EmptyState message="No audit log entries found." />
        )}

        {!loading && logs.length > 0 && (
          <>
            <div className="overflow-x-auto bg-white border border-[#E5F1E2] rounded-2xl shadow-[0_1px_3px_rgba(38,71,43,0.04)]">
              <table className="min-w-full text-sm font-open-sauce">
                <thead className="bg-[#F2F9F1] text-[#26472B]">
                  <tr>
                    {['Timestamp', 'Action', 'Entity', 'Performed By', 'Role', 'Meta'].map((h) => (
                      <th key={h} className="text-left font-open-sauce-semibold text-[12px] uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF5EC]">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-[#F7FBF6] transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap text-[#636363] text-xs">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit',
                            })
                          : '—'}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 align-top">
                        <code className="text-xs font-mono bg-[#F2F9F1] text-[#26472B] px-2 py-0.5 rounded-md whitespace-nowrap">
                          {log.action || '—'}
                        </code>
                      </td>

                      {/* Entity + ID */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-open-sauce-semibold text-[#26472B] text-xs capitalize">
                          {log.entity || '—'}
                        </div>
                        {log.entityId && (
                          <code className="text-[11px] text-[#909090] font-mono mt-0.5 block">
                            {String(log.entityId).slice(-10)}
                          </code>
                        )}
                      </td>

                      {/* Performed By */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="text-[#484848] text-xs">
                          {log.performedBy?.name || log.performedBy || '—'}
                        </div>
                        {log.performedBy?._id && (
                          <code className="text-[11px] text-[#909090] font-mono mt-0.5 block">
                            {String(log.performedBy._id).slice(-8)}
                          </code>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <RoleBadge role={log.role} />
                      </td>

                      {/* Meta */}
                      <td className="px-4 py-3.5 align-top">
                        {log.meta && Object.keys(log.meta).length > 0 ? (
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => setMetaModal(log.meta)}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-[#B0B0B0] italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {metaModal !== null && (
        <MetaModal meta={metaModal} onClose={() => setMetaModal(null)} />
      )}
    </div>
  );
}
