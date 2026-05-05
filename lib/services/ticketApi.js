import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const ticketService = {
  // Get all user tickets with pagination
  getAllTickets: async ({ page = 1, limit = 100 } = {}) => {
    return await axios.get(ENDPOINTS.TICKETS.GET_ALL(page, limit));
  },

  // Get ticket message history
  getTicketMessages: async (ticketId) => {
    return await axios.get(ENDPOINTS.TICKETS.GET_MESSAGES(ticketId));
  },

  // Send a message on a ticket
  sendMessage: async (ticketId, msg) => {
    return await axios.post(ENDPOINTS.TICKETS.SEND_MESSAGE(ticketId), { msg });
  },

  // Create a new ticket
  createTicket: async (data) => {
    return await axios.post(ENDPOINTS.TICKETS.CREATE, data);
  },
};
