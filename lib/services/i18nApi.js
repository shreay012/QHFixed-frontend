/**
 * i18n / Geo API service
 *
 * Connects to the /i18n/* endpoints on the backend:
 *   GET /i18n/geo               — server-side country/currency/lang detection
 *   GET /i18n/countries         — list active countries
 *   GET /i18n/currencies        — currencies with FX rates
 *   GET /i18n/translations      — dynamic translation keys from DB
 *
 * Per 06-cms-architecture.md and 09-geo-detection-routing.md:
 *   - Country detection is handled by the geo middleware on every request.
 *   - This service gives the frontend a way to sync its Redux region state
 *     with the server-resolved geo context on first load.
 *   - Translations are loaded from DB (with Redis cache); JSON files are fallback.
 */
import axios from '../axios/axiosInstance';

export const i18nApi = {
  /**
   * Get the server-resolved geo context for the current request.
   * Returns { country, currency, lang } based on IP / headers.
   */
  getGeo: async () => {
    const res = await axios.get('/i18n/geo');
    return res.data?.data || { country: 'IN', currency: 'INR', lang: 'en' };
  },

  /**
   * Fetch all active countries (cached 1h by backend Redis).
   * Used by CountrySwitcher and checkout country pickers.
   */
  getCountries: async () => {
    const res = await axios.get('/i18n/countries');
    return res.data?.data || [];
  },

  /**
   * Fetch currencies with live FX rates (cached 1h by backend).
   * Used for currency conversion display.
   */
  getCurrencies: async () => {
    const res = await axios.get('/i18n/currencies');
    return res.data?.data || {};
  },

  /**
   * Fetch translation keys from the database for a given language + namespace.
   * The backend serves these with Redis caching (10 min TTL).
   *
   * @param {string} lang       BCP 47 language code, e.g. 'en', 'hi', 'ar', 'de'
   * @param {string} namespace  Translation namespace, e.g. 'common', 'services', 'checkout'
   * @param {string} [country]  Optional: country-specific overrides
   * @returns {Promise<Record<string, string>>}  { key: "value", ... }
   */
  getTranslations: async (lang = 'en', namespace = 'common', country) => {
    const params = { lang, namespace };
    if (country) params.country = country;
    const res = await axios.get('/i18n/translations', { params });
    return res.data?.data || {};
  },
};
