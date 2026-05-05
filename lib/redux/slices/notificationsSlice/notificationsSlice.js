import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsService } from "../../../services/notificationsApi";

// Async Thunk to fetch all notifications
export const fetchAllNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getAllNotifications(
        page,
        limit,
      );
      console.log("📬 Notifications API Response:", response.data);
      return { ...response.data, isLoadMore: page > 1 };
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch notifications",
      );
    }
  },
);

// Async Thunk to delete a notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.deleteNotification(id);
      console.log("🗑️ Notification deleted:", id);
      return id;
    } catch (error) {
      console.error("❌ Failed to delete notification:", error);
      return rejectWithValue(
        error.response?.data || "Failed to delete notification",
      );
    }
  },
);

// Slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      limit: 10,
      hasNextPage: false,
    },
    isLoading: false,
    isLoadingMore: false,
    error: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination.currentPage = 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => (n._id || n.id) === action.payload,
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => (n._id || n.id) !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchAllNotifications.pending, (state, action) => {
        const isLoadMore = action.meta.arg.page > 1;
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;

        const newNotifications = Array.isArray(action.payload?.data) ? action.payload.data : [];

        // If loading more (page > 1), append notifications, otherwise replace
        if (action.payload?.isLoadMore) {
          state.notifications = [...state.notifications, ...newNotifications];
        } else {
          state.notifications = newNotifications;
        }

        // Update pagination if available
        if (action.payload?.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.currentPage || 1,
            totalPages: action.payload.pagination.totalPages || 0,
            totalCount: action.payload.pagination.totalCount || 0,
            limit: action.payload.pagination.limit || 10,
            hasNextPage: action.payload.pagination.hasNextPage || false,
          };
        }
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload || "Failed to fetch notifications";
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => (n._id || n.id) !== action.payload,
        );
      });
  },
});

export const {
  setNotifications,
  clearNotifications,
  markAsRead,
  removeNotification,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
