/**
 * Suppress console.log/warn in production.
 * Errors are kept for monitoring.
 * Called once in root layout.
 */
export function suppressLogsInProduction() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  // Keep console.error for Sentry/monitoring
  const noop = () => {};
  window.console.log = noop;
  window.console.warn = noop;
  window.console.debug = noop;
  window.console.info = noop;
}
