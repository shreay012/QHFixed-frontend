/**
 * Parse user data from localStorage
 * Handles both nested structure {"success": true, "data": {...}} and direct structure {...}
 * @param {string} userStr - JSON string from localStorage.getItem('user')
 * @returns {Object|null} - Parsed user object or null
 */
export const parseUserFromStorage = (userStr) => {
  if (!userStr) return null;
  
  try {
    const userResponse = JSON.parse(userStr);
    // Handle nested structure: {"success": true, "data": {...}}
    const userData = userResponse.data || userResponse;
    return userData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get current user from localStorage
 * @returns {Object|null} - User object or null
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  return parseUserFromStorage(userStr);
};

/**
 * Get current user ID from localStorage
 * @returns {string} - User ID or empty string
 */
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?._id || user?.id || user?.userId || '';
};

/**
 * Get auth token from localStorage
 * @param {boolean} includeBearer - Whether to include "Bearer " prefix
 * @returns {string} - Auth token or empty string
 */
export const getAuthToken = (includeBearer = true) => {
  if (typeof window === 'undefined') return '';
  
  const token = localStorage.getItem('token') || localStorage.getItem('guestToken');
  if (!token) return '';
  
  if (includeBearer && !token.startsWith('Bearer ')) {
    return `Bearer ${token}`;
  }
  
  return token;
};
