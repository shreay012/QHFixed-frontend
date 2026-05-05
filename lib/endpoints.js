// lib/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    GUEST_ACCESS: "/auth/guest-access",
  },
  BOOKING: {
    CREATE: "/bookings",
    GET_ALL: "/bookings",
    GET_BY_ID: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    EXTEND: (id) => `/bookings/${id}/extend`,
    HISTORY: "/bookings/history",
    CUSTOMER_BOOKINGS: "/customer/bookings", // New endpoint for customer bookings
    ONGOING_BOOKINGS: (page, pageSize, statuses) =>
      `/customer/bookings?servicesStatus=${statuses}&page=${page}&pageSize=${pageSize}`, // Ongoing bookings with status filter
    COMPLETED_BOOKINGS: (page, pageSize) =>
      `/customer/bookings?servicesStatus=completed&page=${page}&pageSize=${pageSize}`, // Completed bookings
    JOB_BY_ID: (id) => `/jobs/${id}`, // Get job details by ID (GET /api/jobs/:id)
    CREATE_JOB: "/jobs", // Create new job
    UPDATE_JOB: (id) => `/jobs/${id}?service=create`, // Update job by ID
    GET_BOOKING_TIMELINE: (bookingId, serviceId) =>
      `/bookingHistories/getBookingHistory?bookingId=${bookingId}&serviceId=${serviceId}`, // Get booking timeline/history
  },
  JOBS: {
    PRICING: "/jobs/pricing",
  },
  SERVICES: {
    GET_ALL: "/services",
    GET_BY_ID: (id) => `/services/${id}`,

    GETHourseAvailability: (duration, opts = {}) => {
      const params = new URLSearchParams({ duration: String(duration) });
      if (opts.serviceId) params.set('serviceId', opts.serviceId);
      if (opts.date) params.set('date', opts.date);
      return `/bookings/availability?${params.toString()}`;
    },
  },
  // heck
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    GET_PROFILE: "/user/profile",
  },
  PAYMENT: {
    CREATE_ORDER: "/payments/create-order",
    VERIFY: "/payments/verify",                           // Razorpay signature verify
    STRIPE_CONFIRM: "/payments/stripe/confirm",           // Stripe PaymentIntent confirm
    STATUS: (paymentId) => `/payments/status/${paymentId}`,
    HISTORY: "/payments/history",
    DOWNLOAD_INVOICE: (jobId) => `/payments/invoice/download/${jobId}`,
  },
  CHAT: {
    GET_MESSAGES: (customerId) => `/chat/messages/${customerId}`,
    SEND_MESSAGE: (customerId) => `/chat/send/${customerId}`,
    SEND_TYPING: (customerId) => `/chat/typing/${customerId}`,
    MARK_AS_SEEN: (messageId) => `/chat/seen/${messageId}`,
  },
  DISCOVER: {
    GET_ALL: "/services",
    GET_BY_ID: (id) => `/services/${id}`,
  },
  TICKETS: {
    GET_ALL: (page, limit) =>
      `/tickets/user/all-tickets?page=${page}&limit=${limit}`,
    GET_MESSAGES: (ticketId) => `/ticket-messages/${ticketId}`,
    SEND_MESSAGE: (ticketId) => `/tickets/${ticketId}/message`,
    CREATE: "/tickets/ticket",
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
  NOTIFICATIONS: {
    GET_ALL: (page, limit) =>
      `/notifications?page=${page}&pageSize=${limit}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
  },
  MISCELLANEOUS: {
    CONTACT_US: "/miscellaneous/contact-us",
  },
  CMS: {
    GET: (key) => `/cms/${key}`,
  },
};
