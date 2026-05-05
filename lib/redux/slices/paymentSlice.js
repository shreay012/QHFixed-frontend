/**
 * Payment Redux Slice
 *
 * Handles multi-gateway payment state:
 *   - Payment history (paginated)
 *   - Active order state (gateway-agnostic)
 *   - Gateway detection helpers
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '@/lib/services/paymentApi';

/* ── Thunks ───────────────────────────────────────────────────── */

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentHistory({ page, limit });
      return response.data?.data !== undefined ? response.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  },
);

export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async ({ jobId, amount }, { rejectWithValue }) => {
    try {
      const response = await paymentService.createOrder(jobId, amount);
      const data = response.data?.data || response.data;
      return normalizeOrderResponse(data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  },
);

/* ── Normalizer — unifies gateway-specific fields ────────────── */

/**
 * Normalizes the backend /create-order response into a consistent shape
 * regardless of which gateway was used (razorpay, stripe, mock).
 *
 * @param {object} raw  Raw API response data
 * @returns {object}    Normalized order object
 */
export function normalizeOrderResponse(raw) {
  if (!raw) return null;

  const gateway = raw.gateway || (raw.razorpayOrderId ? 'razorpay' : raw.clientSecret ? 'stripe' : 'mock');

  return {
    // Common fields
    gateway,
    orderId:  raw.orderId || raw.razorpayOrderId || raw.paymentIntentId || null,
    amount:   raw.amount,
    currency: raw.currency || 'INR',
    mock:     raw.mock || false,
    invoice:  raw.invoice || null,

    // Razorpay-specific
    razorpayOrderId: raw.razorpayOrderId || (gateway === 'razorpay' ? raw.orderId : null),
    keyId:           raw.keyId || raw.key || null,

    // Stripe-specific
    clientSecret:          raw.clientSecret || null,
    stripePublishableKey:  raw.stripePublishableKey || null,
  };
}

/* ── Selectors ────────────────────────────────────────────────── */

export const selectPaymentHistory    = (s) => s.payment.history;
export const selectPaymentLoading    = (s) => s.payment.loading;
export const selectPaymentError      = (s) => s.payment.error;
export const selectPaymentTotalPages = (s) => s.payment.totalPages;
export const selectPaymentCurrentPage = (s) => s.payment.currentPage;
export const selectActiveOrder       = (s) => s.payment.activeOrder;

/* ── Slice ────────────────────────────────────────────────────── */

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    history: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    activeOrder: null,   // normalized order while payment is in flight
  },
  reducers: {
    clearActiveOrder(state) {
      state.activeOrder = null;
    },
    setActiveOrder(state, action) {
      state.activeOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Payment history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.history = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.data) ? payload.data : []);
        state.totalPages   = payload?.meta?.totalPages || payload?.totalPages || 1;
        state.currentPage  = payload?.meta?.page       || payload?.currentPage || 1;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create order
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activeOrder = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActiveOrder, setActiveOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
