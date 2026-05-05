import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const paymentService = {
  /**
   * Create a payment order — geo-aware, returns gateway-specific data.
   * Response shape varies by gateway:
   *   Razorpay: { gateway:'razorpay', orderId, razorpayOrderId, keyId, amount, currency }
   *   Stripe:   { gateway:'stripe', orderId, clientSecret, stripePublishableKey, amount, currency }
   *   Mock:     { gateway:'mock', orderId, amount, currency, mock:true }
   */
  createOrder: async (jobId, amount) => {
    return await axios.post(ENDPOINTS.PAYMENT.CREATE_ORDER, { jobId, amount });
  },

  /**
   * Verify Razorpay signature after client-side payment completes.
   * @param {{ razorpay_payment_id, razorpay_order_id, razorpay_signature }}
   */
  verifyPayment: async (paymentData) => {
    return await axios.post(ENDPOINTS.PAYMENT.VERIFY, paymentData);
  },

  /**
   * Confirm a Stripe PaymentIntent after stripe.confirmPayment() resolves.
   * @param {string} paymentIntentId  The pi_... ID returned in orderId
   */
  confirmStripePayment: async (paymentIntentId) => {
    return await axios.post(ENDPOINTS.PAYMENT.STRIPE_CONFIRM, { paymentIntentId });
  },

  /** Get payment record by paymentId */
  getPaymentStatus: async (paymentId) => {
    return await axios.get(ENDPOINTS.PAYMENT.STATUS(paymentId));
  },

  /** Paginated payment history for the current user */
  getPaymentHistory: async ({ page = 1, limit = 10 } = {}) => {
    return await axios.get(`${ENDPOINTS.PAYMENT.HISTORY}?page=${page}&limit=${limit}`);
  },

  /** Download invoice PDF blob or get S3 redirect URL */
  downloadInvoice: async (jobId) => {
    return await axios.post(ENDPOINTS.PAYMENT.DOWNLOAD_INVOICE(jobId), {}, { responseType: 'blob' });
  },
};
