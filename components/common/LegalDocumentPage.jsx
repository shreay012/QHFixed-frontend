'use client';

/**
 * LegalDocumentPage — renders a legal document fetched from the backend.
 *
 * Per 11-legal-document-system.md: all legal content lives in the backend
 * legal_documents collection (CMS-managed) and is served via
 *   GET /legal/doc/:countryCode/:docType
 *
 * Usage:
 *   <LegalDocumentPage docType="terms-of-service" />
 *   <LegalDocumentPage docType="privacy-policy" />
 *   <LegalDocumentPage docType="refund-policy" />
 *
 * Country is auto-detected from the Redux region state (qh_country cookie → middleware).
 * Gracefully falls back to a "document not published" state rather than crashing.
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCountry } from '@/lib/redux/slices/regionSlice/regionSlice';
import { legalService } from '@/lib/services/legalApi';

const DOC_LABELS = {
  'terms-of-service': { title: 'Terms of Service', emoji: '📋' },
  'privacy-policy':   { title: 'Privacy Policy', emoji: '🔒' },
  'refund-policy':    { title: 'Cancellation & Refund Policy', emoji: '↩️' },
};

export default function LegalDocumentPage({ docType }) {
  const country = useSelector(selectCountry) || 'IN';
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meta = DOC_LABELS[docType] || { title: 'Legal Document', emoji: '📄' };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    legalService
      .getDocument(country, docType)
      .then((res) => {
        if (!cancelled) setDoc(res.data?.data || null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load document.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [country, docType]);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {meta.title}
          </h1>
          {doc && (
            <p className="text-sm text-gray-500">
              Version {doc.version} · Effective{' '}
              {new Date(doc.effectiveDate).toLocaleDateString()}
              {doc.fallback && (
                <span className="ml-2 text-amber-600">(Global version)</span>
              )}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-800 font-medium">
              This document is currently being updated. Please check back shortly.
            </p>
          </div>
        )}

        {/* No document published */}
        {!loading && !error && !doc && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg">
              This document has not yet been published for your region.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please contact support@quickhire.services for the current version.
            </p>
          </div>
        )}

        {/* Document content — styled without relying on @tailwindcss/typography */}
        {!loading && !error && doc && (
          <>
            <style dangerouslySetInnerHTML={{ __html: `
              .legal-page h1 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 1.5rem 0 0.5rem; }
              .legal-page h2 { font-size: 1.2rem; font-weight: 700; color: #111827; margin: 1.75rem 0 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.4rem; }
              .legal-page h3 { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.25rem 0 0.35rem; }
              .legal-page p  { margin: 0.65rem 0; line-height: 1.75; color: #374151; font-size: 0.9375rem; }
              .legal-page ul, .legal-page ol { padding-left: 1.5rem; margin: 0.65rem 0; }
              .legal-page li { margin: 0.3rem 0; line-height: 1.7; color: #374151; font-size: 0.9375rem; }
              .legal-page strong { font-weight: 600; color: #111827; }
              .legal-page a { color: #16a34a; text-decoration: underline; }
              .legal-page hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
            ` }} />
            <article
              className="legal-page"
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          </>
        )}

        {/* Footer */}
        {!loading && doc && (
          <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
            Document ID: {doc._id} · Country: {country} · Version: {doc.version}
          </div>
        )}
      </div>
    </div>
  );
}
