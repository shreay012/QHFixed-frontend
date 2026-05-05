/**
 * Currency formatting utilities — multi-currency, multi-locale, RTL-aware.
 *
 * Architecture:
 *  - Backend stores amounts in the booking's native currency (e.g. INR, AED, EUR).
 *  - Display conversion to the user's selected currency uses static FX rates (display only).
 *  - Payment amounts are always in the native currency; FX conversion is for UI only.
 *  - RTL currencies (AED, SAR) are handled by the Intl.NumberFormat locale.
 *
 * Public API:
 *   formatAmount(amount, currency)          — format amount already in target currency
 *   formatPrice(amountInr, currency, opts) — convert from INR then format (legacy)
 *   convertFromINR(amountInr, targetCurrency)
 *   formatINR(amountInr)                   — shorthand for INR formatting
 *   isRtlCurrency(currency)                — true for AED, SAR, etc.
 *   getCurrencyLocale(currency)            — BCP 47 locale for the currency
 */
import { CURRENCIES, DEFAULT_CURRENCY } from "./config";

/* ──────────────────────────────────────────────────────────────────
   Internal helpers
────────────────────────────────────────────────────────────────── */

const RTL_CURRENCIES = new Set(["AED", "SAR", "KWD", "BHD", "QAR", "OMR", "YER", "DZD", "MAD"]);

/**
 * Get the best BCP 47 locale for a currency code.
 * Uses the CURRENCIES map first, then falls back to sensible defaults.
 */
export function getCurrencyLocale(currency = DEFAULT_CURRENCY) {
  const cur = CURRENCIES[currency];
  if (cur?.locale) return cur.locale;

  // Fallbacks for currencies not in the map
  const LOCALE_MAP = {
    SAR: "ar-SA", KWD: "ar-KW", BHD: "ar-BH", QAR: "ar-QA",
    OMR: "ar-OM", YER: "ar-YE", DZD: "ar-DZ", MAD: "ar-MA",
    JPY: "ja-JP", CNY: "zh-CN", KRW: "ko-KR", THB: "th-TH",
    MYR: "ms-MY", IDR: "id-ID", PHP: "en-PH", VND: "vi-VN",
    NGN: "en-NG", ZAR: "en-ZA", BRL: "pt-BR", MXN: "es-MX",
    PLN: "pl-PL", CZK: "cs-CZ", HUF: "hu-HU", RON: "ro-RO",
    TRY: "tr-TR", CHF: "de-CH", DKK: "da-DK", SEK: "sv-SE", NOK: "nb-NO",
  };
  return LOCALE_MAP[currency] || "en-US";
}

/**
 * Returns true if the currency is typically displayed in an RTL context.
 * The Intl API handles number placement automatically when the locale is set correctly.
 *
 * @param {string} currency  ISO 4217 code
 * @returns {boolean}
 */
export function isRtlCurrency(currency = "") {
  return RTL_CURRENCIES.has(currency.toUpperCase());
}

/* ──────────────────────────────────────────────────────────────────
   Core formatting
────────────────────────────────────────────────────────────────── */

/**
 * Format an amount already expressed in the target currency.
 * Use this when the backend returns amounts in native currency (multi-currency flow).
 *
 * @param {number}  amount       Amount in the target currency
 * @param {string}  currency     ISO 4217 code (e.g. 'AED', 'EUR', 'INR')
 * @param {object}  [opts]
 * @param {number}  [opts.maxDigits]  Max fraction digits (defaults: 0 for INR, 2 for others)
 * @param {boolean} [opts.compact]    Use compact notation (e.g. 1.2K) for large amounts
 * @returns {string}
 */
export function formatAmount(amount, currency = DEFAULT_CURRENCY, opts = {}) {
  const code = currency.toUpperCase();
  const locale = getCurrencyLocale(code);
  const value = Number(amount || 0);

  // Default fraction digits: 0 for INR, 2 for everything else
  const maxDigits = typeof opts.maxDigits === "number"
    ? opts.maxDigits
    : code === "INR" ? 0 : 2;

  const notation = opts.compact ? "compact" : "standard";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: 0,
      notation,
    }).format(value);
  } catch {
    // Fallback for unrecognized currencies or old runtimes
    const cur = CURRENCIES[code];
    const symbol = cur?.symbol || code;
    const rounded = Number(value.toFixed(maxDigits)).toLocaleString(locale || "en");
    return `${symbol}${rounded}`;
  }
}

/**
 * Convert an INR amount to the target currency using static FX rates.
 * NOTE: For display only — never use this for payment amounts.
 *
 * @param {number}  amountInr     Amount in Indian Rupee
 * @param {string}  targetCurrency  ISO 4217 code
 * @returns {number}
 */
export function convertFromINR(amountInr, targetCurrency = DEFAULT_CURRENCY) {
  const cur = CURRENCIES[targetCurrency] || CURRENCIES[DEFAULT_CURRENCY];
  return Number(amountInr || 0) * (cur.fxFromINR ?? 1);
}

/**
 * Convert from INR and format in the target currency.
 * Legacy function — prefer formatAmount() for new multi-currency code.
 *
 * @param {number}  amountInr       Amount in INR (canonical)
 * @param {string}  currencyCode    Target display currency
 * @param {object}  [opts]
 * @param {boolean} [opts.alreadyConverted]  Skip FX conversion
 * @param {number}  [opts.maxDigits]
 * @returns {string}
 */
export function formatPrice(amountInr, currencyCode = DEFAULT_CURRENCY, opts = {}) {
  const value = opts.alreadyConverted
    ? Number(amountInr || 0)
    : convertFromINR(amountInr, currencyCode);
  return formatAmount(value, currencyCode, { maxDigits: opts.maxDigits });
}

/**
 * Format an amount in INR (convenience shorthand).
 *
 * @param {number} amountInr
 * @returns {string}
 */
export function formatINR(amountInr) {
  return formatAmount(amountInr, "INR");
}

/**
 * Format a tax amount with label for invoice display.
 * Handles inclusive (price already includes tax) and exclusive (tax added on top).
 *
 * @param {{ taxAmount: number, taxName: string, taxRate: number, inclusive: boolean }}
 * @param {string} currency
 * @returns {{ label: string, amount: string, note: string }}
 */
export function formatTaxLine({ taxAmount, taxName, taxRate, inclusive }, currency = "INR") {
  if (!taxAmount || !taxName) return null;
  const pct = `${(taxRate * 100).toFixed(0)}%`;
  return {
    label: `${taxName} (${pct})`,
    amount: formatAmount(taxAmount, currency),
    note: inclusive ? "included in price" : "added to total",
  };
}
