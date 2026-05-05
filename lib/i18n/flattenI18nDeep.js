// Recursively walk a JSON payload and replace any i18n-shaped object
// ({ en, hi, ar, de, ... }) with the locale-picked string. Used by both
// axios instances (user + staff) so any backend endpoint returning the
// multi-country shape becomes safe to render in React.

const I18N_KEYS = ['en', 'hi', 'ar', 'de', 'es', 'fr', 'ja', 'zh-CN'];

export function readActiveLocale() {
  if (typeof document === 'undefined') return 'en';
  const m = document.cookie.match(/(?:^|;\s*)qh_locale=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : 'en';
}

export function isI18nObject(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  // Heuristic: at least one i18n key, AND every i18n-keyed value is a string.
  // Avoids false positives on records with an `en` field for unrelated reasons
  // (e.g. notification templates that have `lang: 'en'` siblings).
  let hasI18nKey = false;
  for (const k of Object.keys(v)) {
    if (I18N_KEYS.includes(k)) {
      hasI18nKey = true;
      if (v[k] != null && typeof v[k] !== 'string') return false;
    }
  }
  return hasI18nKey;
}

export function pickI18n(obj, locale) {
  return obj[locale] || obj.en || obj[Object.keys(obj)[0]] || '';
}

export function flattenI18nDeep(input, locale = readActiveLocale(), seen = new WeakSet()) {
  if (input == null) return input;
  if (typeof input !== 'object') return input;
  if (seen.has(input)) return input;
  seen.add(input);
  if (Array.isArray(input)) {
    return input.map((v) => flattenI18nDeep(v, locale, seen));
  }
  if (isI18nObject(input)) {
    return pickI18n(input, locale);
  }
  const out = {};
  for (const k of Object.keys(input)) {
    out[k] = flattenI18nDeep(input[k], locale, seen);
  }
  return out;
}
