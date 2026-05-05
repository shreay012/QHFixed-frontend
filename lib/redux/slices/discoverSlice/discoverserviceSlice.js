// lib/redux/slices/discoverSlice/discoverserviceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { discoverService } from '../../../services/discoverService';
import { normalizeService, normalizeServiceList } from '../../../i18n/normalizeI18n';

// Async Thunks
export const fetchAllServices = createAsyncThunk(
  'discover/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await discoverService.getAllServices();
      // Backend returns { success, data: [...] } — extract the array
      const list = Array.isArray(response.data) ? response.data
        : Array.isArray(response.data?.data) ? response.data.data
        : [];
      // Flatten any i18n-object fields (name/description) to the active
      // locale before they enter Redux. Otherwise raw renders like
      // <h3>{service.name}</h3> crash with "Objects are not valid as a
      // React child" when the backend returns the multi-country shape.
      return normalizeServiceList(list);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'discover/fetchById',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await discoverService.getServiceById(serviceId);
      const svc = response.data?.data || response.data;
      return normalizeService(svc);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch service');
    }
  }
);

// Slice
const discoverSlice = createSlice({
  name: 'discover',
  initialState: {
    // All services list for discovery
    allServices: [],
    
    // Selected service details
    selectedService: null,
    
    // Filter & search
    filteredServices: [],
    searchQuery: '',
    selectedCategory: 'all',
    
    // Loading states
    isLoading: false,
    isLoadingDetail: false,
    
    // Error handling
    error: null,
    
    // Categories for filtering
    categories: [
      'all',
      'ai-engineer',
      'developer',
      'quality-assurance',
      'designer',
      'security-engineer',
      'devops-engineer',
      'content-writer',
      'it-support-engineer',
      'crm-developer',
    ],
  },
  reducers: {
    // Set selected service
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    
    // Clear selected service
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      // Filter services based on search
      if (action.payload) {
        state.filteredServices = state.allServices.filter(service =>
          service.label?.toLowerCase().includes(action.payload.toLowerCase()) ||
          service.description?.toLowerCase().includes(action.payload.toLowerCase())
        );
      } else {
        state.filteredServices = state.allServices;
      }
    },
    
    // Set category filter
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      // Filter by category
      if (action.payload === 'all') {
        state.filteredServices = state.allServices;
      } else {
        state.filteredServices = state.allServices.filter(
          service => service.category === action.payload
        );
      }
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'all';
      state.filteredServices = state.allServices;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Services
      .addCase(fetchAllServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        const services = Array.isArray(action.payload) ? action.payload : [];
        state.allServices = services;
        state.filteredServices = services;
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Service By ID
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoadingDetail = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedService,
  clearSelectedService,
  setSearchQuery,
  setSelectedCategory,
  clearFilters,
  clearError,
} = discoverSlice.actions;

export default discoverSlice.reducer;