'use client';

/**
 * Legal Acceptance Provider + Modal
 *
 * Checks on mount (after login) whether the authenticated user has accepted
 * all current legal documents for their country. If not, shows a non-dismissable
 * modal that the user must work through before using the platform.
 *
 * Usage:
 *   Wrap inside ClientProviders (already has auth context available).
 *   The modal auto-appears when a logged-in user has pending docs.
 *
 * API:
 *   useLegalAcceptance() — { allAccepted, pending, checkNow }
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { legalService } from '@/lib/services/legalApi';

const LegalContext = createContext({ allAccepted: true, pending: [], checkNow: () => {} });

export function useLegalAcceptance() {
  return useContext(LegalContext);
}

/* ─── CSS for HTML content rendered from the backend ───────────── */
const LEGAL_CONTENT_STYLES = `
  .legal-html h1 { font-size: 1.375rem; font-weight: 700; color: #111827; margin: 1.25rem 0 0.5rem; }
  .legal-html h2 { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 1.25rem 0 0.4rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.3rem; }
  .legal-html h3 { font-size: 0.9375rem; font-weight: 600; color: #374151; margin: 1rem 0 0.25rem; }
  .legal-html p  { margin: 0.5rem 0; line-height: 1.65; color: #374151; }
  .legal-html ul, .legal-html ol { padding-left: 1.4rem; margin: 0.5rem 0; }
  .legal-html li { margin: 0.25rem 0; line-height: 1.6; color: #374151; }
  .legal-html strong { font-weight: 600; color: #111827; }
  .legal-html a { color: #16a34a; text-decoration: underline; }
`;

/* ─── Modal ─────────────────────────────────────────────────── */

// LEGAL_DOC_TITLE_FIX_V1: backend can return `title` either as a flat string or
// a multi-locale object `{ en: "...", de: "..." }`. Rendering an object as a
// React child throws #31, so coerce here.
function pickDocText(value, preferred = 'en') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return (
      value[preferred] || value.en || value[Object.keys(value)[0]] || ''
    );
  }
  return String(value);
}

function DocModal({ doc, onAccept, isAccepting }) {
  const [scrolled, setScrolled] = useState(false);
  const contentRef = useRef(null);

  const DOC_LABELS = {
    'terms-of-service': 'Terms of Service',
    'privacy-policy': 'Privacy Policy',
    'refund-policy': 'Refund Policy',
  };

  const title = pickDocText(doc.title) || DOC_LABELS[doc.docType] || 'Legal Document';
  const content = pickDocText(doc.content) || '<p>Loading…</p>';
  const changeNotes = pickDocText(doc.changeNotes);

  // Auto-unlock if content is short enough that no scrolling is needed
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Give DOM time to paint the content, then measure
    const timer = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight + 10) {
        setScrolled(true); // no scroll needed — content fits
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [doc]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setScrolled(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Inject heading styles (no @tailwindcss/typography needed) */}
      <style dangerouslySetInnerHTML={{ __html: LEGAL_CONTENT_STYLES }} />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
           style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Version {doc.version} · Effective {new Date(doc.effectiveDate).toLocaleDateString()}
            </p>
          </div>
          <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-4">
            Action required
          </span>
        </div>

        {/* Content — scrollable area */}
        <div
          ref={contentRef}
          className="legal-html flex-1 overflow-y-auto px-6 py-5 text-sm"
          style={{ minHeight: 0 }}   /* needed for flex-1 + overflow-y-auto to work */
          onScroll={handleScroll}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-5 border-t border-gray-100 space-y-3 bg-white rounded-b-2xl">
          {!scrolled && (
            <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
              <span>↓</span>
              <span>Scroll to the bottom to accept</span>
            </p>
          )}
          {changeNotes && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              <strong>What changed:</strong> {changeNotes}
            </p>
          )}
          <button
            type="button"
            onClick={onAccept}
            disabled={!scrolled || isAccepting}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{
              background: scrolled ? '#45A735' : '#9ca3af',
              color: '#fff',
              cursor: scrolled && !isAccepting ? 'pointer' : 'not-allowed',
            }}
          >
            {isAccepting
              ? 'Recording acceptance…'
              : scrolled
                ? `I have read and accept the ${DOC_LABELS[doc.docType] || 'document'}`
                : `Read the full ${DOC_LABELS[doc.docType] || 'document'} to continue`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Provider ───────────────────────────────────────────────── */

export function LegalAcceptanceProvider({ children }) {
  const [pending, setPending] = useState([]);
  const [allAccepted, setAllAccepted] = useState(true);  // optimistic: assume true until checked
  const [checked, setChecked] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const isLoggedIn = () =>
    typeof window !== 'undefined' && !!window.localStorage.getItem('token');

  const checkStatus = useCallback(async () => {
    if (!isLoggedIn()) return; // guests don't need to accept
    try {
      const res = await legalService.getStatus();
      const data = res.data?.data || res.data;
      const pendingDocs = data?.pending || [];
      setPending(pendingDocs);
      setAllAccepted(pendingDocs.length === 0);
    } catch {
      // If the legal API is down, don't block the user — fail open
      setAllAccepted(true);
    } finally {
      setChecked(true);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Re-check when user logs in
  useEffect(() => {
    const onLogin = () => { setChecked(false); checkStatus(); };
    window.addEventListener('userLoggedIn', onLogin);
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') onLogin();
    });
    return () => {
      window.removeEventListener('userLoggedIn', onLogin);
    };
  }, [checkStatus]);

  const handleAccept = async (doc) => {
    setIsAccepting(true);
    try {
      await legalService.acceptDocument({
        docType: doc.docType,
        version: doc.version,
        countryCode: doc.countryCode,
      });
      // Remove accepted doc from pending list
      setPending((prev) => {
        const next = prev.filter(
          (d) => !(d.docType === doc.docType && d.version === doc.version)
        );
        if (next.length === 0) setAllAccepted(true);
        return next;
      });
    } catch {
      // Silently fail — user can try again or refresh
    } finally {
      setIsAccepting(false);
    }
  };

  // Current doc to show (first in queue)
  const currentDoc = checked && pending.length > 0 ? pending[0] : null;

  return (
    <LegalContext.Provider value={{ allAccepted, pending, checkNow: checkStatus }}>
      {children}
      {currentDoc && (
        <DocModal
          doc={currentDoc}
          onAccept={() => handleAccept(currentDoc)}
          isAccepting={isAccepting}
        />
      )}
    </LegalContext.Provider>
  );
}
