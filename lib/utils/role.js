/**
 * Role helpers — single source of truth for "what is this user allowed to see".
 *
 * The Redux user object comes from the auth API and looks like:
 *   { _id, name, mobile, role, country, ... }
 *
 * For pages that aren't connected to Redux, fall back to localStorage which
 * mirrors the same shape under 'user' (set in authSlice fulfilled handler).
 */

const STAFF_ROLES = new Set([
  'super_admin',
  'country_admin',
  'admin',
  'ops',
  'finance',
  'support',
  'growth',
  'viewer',
]);

const FULL_ADMIN_ROLES = new Set(['super_admin', 'country_admin', 'admin']);

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRole(user = getUser()) {
  return user?.role || null;
}

export function getActiveCountry(user = getUser()) {
  return user?.country || null;
}

export function isStaff(user = getUser()) {
  return STAFF_ROLES.has(getRole(user));
}

export function isFullAdmin(user = getUser()) {
  return FULL_ADMIN_ROLES.has(getRole(user));
}

export function isSuperAdmin(user = getUser()) {
  return getRole(user) === 'super_admin';
}

export function isCountryAdmin(user = getUser()) {
  return getRole(user) === 'country_admin';
}

export function isPM(user = getUser()) {
  return getRole(user) === 'pm';
}

export function isResource(user = getUser()) {
  return getRole(user) === 'resource';
}

/**
 * Default landing path after login, by role. Mirror of the backend's
 * authorization model:
 *   super_admin    → /admin (sees all)
 *   country_admin  → /admin (sees only own country, scoped by middleware)
 *   admin/ops/etc  → /admin (legacy)
 *   pm             → /pm/bookings
 *   resource       → /resource/assignments
 *   user/customer  → /
 */
export function getLandingPathFor(user = getUser()) {
  const role = getRole(user);
  if (role === 'pm') return '/pm/bookings';
  if (role === 'resource') return '/resource/assignments';
  if (STAFF_ROLES.has(role)) return '/admin';
  return '/';
}
