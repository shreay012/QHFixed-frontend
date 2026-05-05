import axios from "../axios/axiosInstance";
import { ENDPOINTS } from "../endpoints";

export const notificationsService = {
  getAllNotifications: async (page = 1, limit = 10) => {
    return await axios.get(ENDPOINTS.NOTIFICATIONS.GET_ALL(page, limit));
  },
  deleteNotification: async (id) => {
    // Backend has no DELETE endpoint; mark as read instead.
    return await axios.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },
  markAllRead: async () => {
    return await axios.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};
