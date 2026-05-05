'use client';

/**
 * Terms of Service page
 *
 * Per 06-cms-architecture.md: all legal content is CMS-managed and served
 * from the backend legal_documents collection.
 *
 * This page delegates rendering to LegalDocumentPage which:
 *   1. Fetches the active published version from GET /legal/doc/{country}/terms-of-service
 *   2. Renders the HTML content
 *   3. Falls back gracefully if no document has been published yet
 */

import LegalDocumentPage from '@/components/common/LegalDocumentPage';

export default function TermsAndConditions() {
  return <LegalDocumentPage docType="terms-of-service" />;
}
