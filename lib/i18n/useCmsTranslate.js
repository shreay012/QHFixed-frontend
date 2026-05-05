"use client";

import { useLocale } from "next-intl";
import { useEffect, useState, useMemo } from "react";

// Cache loaded CMS maps per locale to avoid re-fetching across components.
const CMS_CACHE = {};

// Recognized i18n shape from the backend (e.g. service.name = { en, hi, ar, de }).
// We treat any plain object that has at least one of these keys as an i18n object.
const I18N_KEYS = ["en", "hi", "ar", "de", "es", "fr", "ja", "zh-CN"];

function isI18nObject(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  for (const k of I18N_KEYS) if (k in v) return true;
  return false;
}

function pickI18n(obj, locale) {
  if (!obj) return "";
  return obj[locale] || obj.en || obj[Object.keys(obj)[0]] || "";
}

async function loadCmsMap(locale) {
  if (CMS_CACHE[locale]) return CMS_CACHE[locale];
  try {
    const mod = await import(`@/messages/cms/${locale}.json`);
    CMS_CACHE[locale] = mod.default || mod;
  } catch {
    try {
      const mod = await import(`@/messages/cms/en.json`);
      CMS_CACHE[locale] = mod.default || mod;
    } catch {
      CMS_CACHE[locale] = {};
    }
  }
  return CMS_CACHE[locale];
}

/**
 * Translates a CMS value to the active locale.
 *
 * Accepts either:
 *   - a plain English string (e.g. "AI Engineers") — looked up in the CMS map
 *   - an i18n object (e.g. { en: "...", hi: "...", de: "..." }) — picks the
 *     active locale, falls back to en, then to first available
 *
 * Returning a non-string here would crash React with "Objects are not valid
 * as a React child", so we always coerce to string.
 */
export function useCmsTranslate() {
  const locale = useLocale();
  const [map, setMap] = useState(CMS_CACHE[locale] || {});

  useEffect(() => {
    let alive = true;
    loadCmsMap(locale).then((m) => {
      if (alive) setMap(m);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  return useMemo(() => {
    return (value) => {
      if (value == null || value === "") return value;

      // Backend i18n object — pick locale and skip the lookup map
      if (isI18nObject(value)) return pickI18n(value, locale);

      if (typeof value !== "string") return String(value);

      const v = map?.[value];
      return typeof v === "string" && v.length > 0 ? v : value;
    };
  }, [map, locale]);
}
