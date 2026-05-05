import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../../services/bookingApi';

// Async Thunks
export const fetchHoursAvailability = createAsyncThunk(
  'availability/fetchHoursAvailability',
  async (duration, { rejectWithValue }) => {
    try {
      const response = await bookingService.getHoursAvailability(duration);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch hours availability');
    }
  }
);

// Slice
const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    // Availability data
    hoursAvailability: null,
    availableSlots: [],
    
    // Selected availability
    selectedDuration: null,
    
    // Loading & Error states
    isLoading: false,
    error: null,
  },
  reducers: {
    // Set selected duration
    setSelectedDuration: (state, action) => {
      state.selectedDuration = action.payload;
    },
    
    // Clear availability data
    clearAvailability: (state) => {
      state.hoursAvailability = null;
      state.availableSlots = [];
      state.selectedDuration = null;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hours Availability
      .addCase(fetchHoursAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHoursAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        // Payload is already the inner data from thunk extraction.
        // Keep `.data.availability` shape for components that read it that way.
        const payload = action.payload;
        state.availableSlots = Array.isArray(payload) ? payload : (payload?.slots || []);
        state.hoursAvailability = payload && typeof payload === 'object' && 'availability' in payload
          ? { data: payload }
          : payload;
        console.log("Hours Availability Fetched:", state.hoursAvailability);
      })
      .addCase(fetchHoursAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("Error fetching availability:", action.payload);
      });
  },
});

export const {
  setSelectedDuration,
  clearAvailability,
  clearError,
} = availabilitySlice.actions;

export default availabilitySlice.reducer;
