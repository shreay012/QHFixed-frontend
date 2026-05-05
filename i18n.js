/**
 * next-intl request config
 *
 * Locale resolution order (per 09-geo-detection-routing.md):
 *   1. qh_locale cookie  — set by middleware.js geo detection
 *   2. DEFAULT_LOCALE    — 'en'
 *
 * Messages are loaded from ./messages/{locale}.json (static JSON bundles).
 * Dynamic per-namespace translations from the DB are available via
 * lib/services/i18nApi.getTranslations() for client-side use.
 */
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_CODES, DEFAULT_LOCALE } from "./lib/i18n/config";

export default getRequestConfig(async () => {
  let locale = DEFAULT_LOCALE;
  try {
    const c = await cookies();
    // Middleware sets qh_locale from Accept-Language / Cloudflare / cookie chain
    const v = c.get("qh_locale")?.value;
    if (v && LOCALE_CODES.includes(v)) locale = v;
  } catch {
    // SSR contexts without cookie access — fall through to default
  }

  let messages = {};
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Locale JSON missing — fall back to English
    try {
      messages = (await import(`./messages/${DEFAULT_LOCALE}.json`)).default;
    } catch {
      messages = {};
    }
  }

  return { locale, messages };
});
