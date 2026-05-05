import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ticketService } from '../../services/ticketApi';

// Async Thunks
export const fetchAllTickets = createAsyncThunk(
  'tickets/fetchAll',
  async ({ page = 1, limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await ticketService.getAllTickets({ page, limit });
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tickets');
    }
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearTickets: (state) => {
      state.tickets = [];
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets
      .addCase(fetchAllTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        const p = action.payload;
        // Handle both { data: { tickets: [] } } and flat array formats
        state.tickets = p?.data?.tickets || (Array.isArray(p?.data) ? p.data : []);
        state.pagination = p?.data?.pagination || p?.pagination || null;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTickets } = ticketSlice.actions;
export default ticketSlice.reducer;
