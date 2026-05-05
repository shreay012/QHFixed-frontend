/**
 * Centralized toast utility — replaces all browser alert() calls.
 * Uses react-hot-toast under the hood.
 */
import toast from 'react-hot-toast';

export const showError = (msg) =>
  toast.error(msg || 'Something went wrong. Please try again.', {
    duration: 4000,
    style: { borderRadius: '12px', fontFamily: 'inherit' },
  });

export const showSuccess = (msg) =>
  toast.success(msg || 'Done!', {
    duration: 3000,
    style: { borderRadius: '12px', fontFamily: 'inherit' },
  });

export const showInfo = (msg) =>
  toast(msg, {
    duration: 3000,
    icon: 'ℹ️',
    style: { borderRadius: '12px', fontFamily: 'inherit' },
  });

export const showWarning = (msg) =>
  toast(msg, {
    duration: 4000,
    icon: '⚠️',
    style: { borderRadius: '12px', background: '#fff7ed', color: '#c2410c', fontFamily: 'inherit' },
  });

export default { showError, showSuccess, showInfo, showWarning };
