// Helpers to normalize backend payloads that may contain i18n objects.
// Backend services have name/description as either:
//   - "AI Engineers"                                    (legacy string)
//   - { en: "AI Engineers", hi: "...", de: "...", ... } (multi-country)
//
// The Redux slices and React components were written for plain strings.
// To avoid "Objects are not valid as a React child" crashes, we walk
// known i18n-shaped fields and pick the active locale (or fall back to
// English / first available) before they enter Redux state.

const I18N_KEYS = ["en", "hi", "ar", "de", "es", "fr", "ja", "zh-CN"];

export function isI18nObject(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  for (const k of I18N_KEYS) if (k in v) return true;
  return false;
}

export function pickI18n(obj, locale = "en") {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || obj.en || obj[Object.keys(obj)[0]] || "";
}

// Read the active locale from the cookie (client-side only). On the server
// (during build/SSR) the cookie isn't accessible here so we default to "en".
function readLocaleFromCookie() {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)qh_locale=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "en";
}

const I18N_FIELDS = ["name", "description", "content", "title"];

/**
 * Returns a shallow clone of the service with i18n object fields flattened
 * to the active locale. Preserves the original object on the `*I18n` field
 * so tCms() can still translate later if needed.
 */
export function normalizeService(svc, locale) {
  if (!svc || typeof svc !== "object") return svc;
  const loc = locale || readLocaleFromCookie();
  const out = { ...svc };
  for (const f of I18N_FIELDS) {
    if (isI18nObject(out[f])) {
      out[`${f}I18n`] = out[f];
      out[f] = pickI18n(out[f], loc);
    }
  }
  // Nested technologies / steps may also have i18n names
  if (Array.isArray(out.technologies)) {
    out.technologies = out.technologies.map((t) =>
      typeof t === "string"
        ? t
        : isI18nObject(t?.name)
        ? { ...t, name: pickI18n(t.name, loc), nameI18n: t.name }
        : t,
    );
  }
  return out;
}

export function normalizeServiceList(arr, locale) {
  if (!Array.isArray(arr)) return [];
  return arr.map((s) => normalizeService(s, locale));
}
