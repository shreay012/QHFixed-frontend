'use client';

/**
 * Cancellation & Refund Policy page
 *
 * Per 06-cms-architecture.md: all legal content is CMS-managed and served
 * from the backend legal_documents collection.
 *
 * Delegates rendering to LegalDocumentPage which fetches from
 *   GET /legal/doc/{country}/refund-policy
 */

import LegalDocumentPage from '@/components/common/LegalDocumentPage';

export default function CancellationAndRefundPolicy() {
  return <LegalDocumentPage docType="refund-policy" />;
}
