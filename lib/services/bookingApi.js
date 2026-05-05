import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const bookingService = {
  // Get all services
  getServices: async () => {
    return await axios.get(ENDPOINTS.SERVICES.GET_ALL);
  },

  // Get service by ID
  getServiceById: async (serviceId) => {
    return await axios.get(ENDPOINTS.SERVICES.GET_BY_ID(serviceId));
  },

  // (category-based service listing removed)

  // Create new booking
  createBooking: async (bookingData) => {
    return await axios.post(ENDPOINTS.BOOKING.CREATE, bookingData);
  },

  // Get all user bookings
  getAllBookings: async () => {
    return await axios.get(ENDPOINTS.BOOKING.GET_ALL);
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    return await axios.get(ENDPOINTS.BOOKING.GET_BY_ID(bookingId));
  },

  // Get booking history
  getBookingHistory: async (userId) => {
    return await axios.get(ENDPOINTS.BOOKING.HISTORY, { 
      params: { userId } 
    });
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    return await axios.patch(ENDPOINTS.BOOKING.UPDATE(bookingId), updateData);
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    return await axios.post(ENDPOINTS.BOOKING.CANCEL(bookingId), { reason });
  },

  // Extend booking
  extendBooking: async (bookingId, extensionData) => {
    return await axios.post(ENDPOINTS.BOOKING.EXTEND(bookingId), extensionData);
  },

  // Get available time slots
  getAvailableSlots: async (serviceId, date) => {
    return await axios.get('/bookings/available-slots', {
      params: { serviceId, date }
    });
  },

  // Get hours availability — supports optional serviceId/date for the new /bookings/availability backend.
  getHoursAvailability: async (duration, opts = {}) => {
    return await axios.get(ENDPOINTS.SERVICES.GETHourseAvailability(duration, opts));
  },

  // Get pricing for booking
  getPricing: async (pricingData) => {
    return await axios.post(ENDPOINTS.JOBS.PRICING, pricingData);
  },

  // Get customer bookings by status
  getCustomerBookingsByStatus: async (status = 'pending') => {
    return await axios.get(ENDPOINTS.BOOKING.CUSTOMER_BOOKINGS, {
      params: { status }
    });
  },

  // Get job details by ID
  getJobById: async (jobId) => {
    return await axios.get(ENDPOINTS.BOOKING.JOB_BY_ID(jobId));
  },

  // Create new job
  createJob: async (jobData) => {
    return await axios.post(ENDPOINTS.BOOKING.CREATE_JOB, jobData);
  },

  // Update job by ID
  updateJob: async (jobId, jobData) => {
    return await axios.put(ENDPOINTS.BOOKING.UPDATE_JOB(jobId), jobData);
  },

  // Get ongoing bookings with status filter
  getOngoingBookings: async ({ page = 1, pageSize = 10, statuses = 'confirmed,in_progress,assigned_to_pm' }) => {
    return await axios.get(ENDPOINTS.BOOKING.ONGOING_BOOKINGS(page, pageSize, statuses));
  },

  // Get completed bookings
  getCompletedBookings: async ({ page = 1, pageSize = 10 }) => {
    return await axios.get(ENDPOINTS.BOOKING.COMPLETED_BOOKINGS(page, pageSize));
  },

  // Get booking timeline/history
  getBookingTimeline: async (bookingId, serviceId) => {
    return await axios.get(ENDPOINTS.BOOKING.GET_BOOKING_TIMELINE(bookingId, serviceId));
  },
 
};