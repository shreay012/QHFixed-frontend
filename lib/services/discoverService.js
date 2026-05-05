// lib/services/discoverApi.js
import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const discoverService = {
  // Get all discover services/talents
  getAllServices: async () => {
    return await axios.get(ENDPOINTS.DISCOVER.GET_ALL);
  },

  // Get service by ID
  getServiceById: async (serviceId) => {
    return await axios.get(ENDPOINTS.DISCOVER.GET_BY_ID(serviceId));
  },
};