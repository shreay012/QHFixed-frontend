import axios from "../axios/axiosInstance";
import { ENDPOINTS } from "../endpoints";

export const dashboardService = {
  getStats: async () => {
    return await axios.get(ENDPOINTS.DASHBOARD.STATS);
  },
};
