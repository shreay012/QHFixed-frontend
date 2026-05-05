/**
 * Legal Document API service
 *
 * Talks to the /legal endpoints on the backend.
 */
import axios from '../axios/axiosInstance';

export const legalService = {
  /**
   * Fetch the current published version of a legal document for a country.
   * Public — no auth required.
   *
   * @param {string} countryCode  ISO alpha-2 (e.g. 'IN', 'AE')
   * @param {string} docType      'terms-of-service' | 'privacy-policy' | 'refund-policy'
   */
  getDocument: async (countryCode, docType) => {
    return axios.get(`/legal/doc/${countryCode}/${docType}`);
  },

  /**
   * Check which legal docs the authenticated user still needs to accept.
   * Returns { allAccepted, pending[], accepted[] }
   */
  getStatus: async () => {
    return axios.get('/legal/status');
  },

  /**
   * Record user's acceptance of a specific doc version.
   * Idempotent — safe to call multiple times.
   *
   * @param {{ docType, version, countryCode }}
   */
  acceptDocument: async ({ docType, version, countryCode }) => {
    return axios.post('/legal/accept', { docType, version, countryCode });
  },
};
