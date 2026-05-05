import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "../../../services/dashboardApi";

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch dashboard stats",
      );
    }
  },
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      unreadNotificationsCount: 0,
      cartItemCount: 0,
      totalPendingJobs: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStats: (state) => {
      state.stats = {
        unreadNotificationsCount: 0,
        cartItemCount: 0,
        totalPendingJobs: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload || {
          unreadNotificationsCount: 0,
          cartItemCount: 0,
          totalPendingJobs: 0,
        };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
