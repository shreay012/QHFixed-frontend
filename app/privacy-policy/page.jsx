'use client';

/**
 * Privacy Policy page
 *
 * Per 11-legal-document-system.md: all legal content is CMS-managed and served
 * from the backend legal_documents collection.
 *
 * Delegates rendering to LegalDocumentPage which fetches from
 *   GET /legal/doc/{country}/privacy-policy
 */

import LegalDocumentPage from '@/components/common/LegalDocumentPage';

export default function PrivacyPolicy() {
  return <LegalDocumentPage docType="privacy-policy" />;
}
