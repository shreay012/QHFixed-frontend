import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../../services/bookingApi';

// Async Thunks
export const fetchPricing = createAsyncThunk(
  'pricing/fetchPricing',
  async (pricingPayload, { rejectWithValue }) => {
    try {
      const response = await bookingService.getPricing(pricingPayload);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch pricing'
      );
    }
  }
);

// Slice
const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    // Pricing data
    pricingData: null,
    
    // Pricing breakdown
    subtotal: null,
    taxes: null,
    discount: null,
    total: null,
    
    // Loading & Error states
    isLoading: false,
    error: null,
    
    // Success state
    isSuccess: false,
  },
  reducers: {
    // Clear pricing data
    clearPricing: (state) => {
      state.pricingData = null;
      state.subtotal = null;
      state.taxes = null;
      state.discount = null;
      state.total = null;
      state.error = null;
      state.isSuccess = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set pricing data manually (if needed)
    setPricingData: (state, action) => {
      state.pricingData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pricing
      .addCase(fetchPricing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(fetchPricing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pricingData = action.payload;
        
        // Extract pricing breakdown if available in response
        if (action.payload?.pricing) {
          state.subtotal = action.payload.pricing.subtotal;
          state.taxes = action.payload.pricing.taxes;
          state.discount = action.payload.pricing.discount;
          state.total = action.payload.pricing.total;
        }
        
        console.log("✅ Pricing Fetched Successfully:", action.payload);
      })
      .addCase(fetchPricing.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload;
        console.error("❌ Error fetching pricing:", action.payload);
      });
  },
});

export const {
  clearPricing,
  clearError,
  setPricingData,
} = pricingSlice.actions;

export default pricingSlice.reducer;
