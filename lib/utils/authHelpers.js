import chatSocketService from '@/lib/services/chatSocketService';

/**
 * Logout function that properly disconnects socket and clears storage
 */
export function logout() {
  console.log('🚪 Logging out...');
  
  // Step 1: Disconnect socket
  console.log('🔌 Disconnecting socket...');
  chatSocketService.disconnect();
  
  // Step 2: Clear localStorage
  console.log('🗑️ Clearing storage...');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('guestToken');
  }
  
  // Step 3: Redirect to login
  console.log('↪️ Redirecting to login...');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Check if user is currently logged in
 */
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  return !!(user && token);
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const userResponse = JSON.parse(userStr);
    return userResponse.data || userResponse;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('guestToken');
}
