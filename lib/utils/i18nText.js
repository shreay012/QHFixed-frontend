// Coerce a value that might be an i18n-keyed object (e.g. { en, hi, de })
// or a plain string into a renderable string. Prevents React error #31
// ("Objects are not valid as a React child") when the backend returns
// multi-locale fields like service.name = { en: "...", de: "..." }.
//
// Use this everywhere staff portals render service / category / booking
// fields that *might* be multilocale — admin doesn't need true localization,
// it just needs to never crash.
export function i18nText(value, preferredLocale = 'en') {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      value[preferredLocale] ||
      value.en ||
      value[Object.keys(value)[0]] ||
      ''
    );
  }
  return String(value);
}

// Shorthand alias for inline JSX use: {s(item.serviceName)}
export const s = i18nText;
