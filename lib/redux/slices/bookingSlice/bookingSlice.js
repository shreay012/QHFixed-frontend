import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "../../../services/bookingApi";

const getErrorPayload = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  if (responseData) {
    return responseData.message || responseData.error || responseData || fallbackMessage;
  }
  return error?.message || fallbackMessage;
};

// Async Thunks
export const fetchServiceById = createAsyncThunk(
  "booking/fetchServiceById",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getServiceById(serviceId);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch service");
    }
  },
);

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create booking",
      );
    }
  },
);

export const fetchBookingHistory = createAsyncThunk(
  "booking/fetchHistory",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingHistory(userId);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch history");
    }
  },
);

export const fetchCustomerBookings = createAsyncThunk(
  "booking/fetchCustomerBookings",
  async (status = "pending", { rejectWithValue }) => {
    try {
      const response = await bookingService.getCustomerBookingsByStatus(status);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch customer bookings",
      );
    }
  },
);

export const fetchJobById = createAsyncThunk(
  "booking/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getJobById(jobId);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Failed to fetch job details"),
      );
    }
  },
);

export const createJob = createAsyncThunk(
  "booking/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createJob(jobData);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create job");
    }
  },
);

export const updateJob = createAsyncThunk(
  "booking/updateJob",
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const response = await bookingService.updateJob(jobId, jobData);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update job");
    }
  },
);

export const fetchOngoingBookings = createAsyncThunk(
  "booking/fetchOngoingBookings",
  async ({ page = 1, pageSize = 10, statuses = 'confirmed,in_progress,assigned_to_pm' }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getOngoingBookings({ page, pageSize, statuses });
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch ongoing bookings");
    }
  },
);

export const fetchCompletedBookings = createAsyncThunk(
  "booking/fetchCompletedBookings",
  async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getCompletedBookings({ page, pageSize });
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch completed bookings");
    }
  },
);

// Slice
const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    // Service data
    selectedService: null,
    serviceDetails: null, // Full service with technologies

    // Booking selections
    selectedTechnologies: [], // Array of selected technology objects
    selectedDuration: null,
    selectedDate: null,
    selectedTime: null,

    // Booking flow
    currentStep: 1, // 1: Service, 2: Technologies, 3: Date/Time, 4: Confirmation
    totalSteps: 4,

    // Booking data
    currentBooking: null,
    bookingHistory: [],
    customerBookings: [], // Store customer bookings by status
    ongoingBookings: [], // Store ongoing bookings
    ongoingBookingsPagination: null, // Store pagination info
    completedBookings: [], // Store completed bookings
    completedBookingsPagination: null, // Store completed bookings pagination
    selectedJobId: null, // Store selected job ID for review
    jobDetails: null, // Store job details when fetched
    createdJob: null, // Store created job response
    updatedJob: null, // Store updated job response
    createdJobId: null,

    // Calculations
    totalPrice: 0,

    // Loading & Error states
    isLoading: false,
    isCreatingBooking: false,
    isFetchingCustomerBookings: false,
    isFetchingOngoingBookings: false,
    isFetchingCompletedBookings: false,
    isFetchingJobDetails: false,
    isCreatingJob: false,
    isUpdatingJob: false,
    error: null,
  },
  reducers: {
    // Service selection
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
      state.serviceDetails = action.payload;
    },

    // Technology selection
    toggleTechnology: (state, action) => {
      const technology = action.payload;
      const existingIndex = state.selectedTechnologies.findIndex(
        (t) => t._id === technology._id,
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        state.selectedTechnologies.splice(existingIndex, 1);
      } else {
        // Add if not selected
        state.selectedTechnologies.push(technology);
      }

      // Recalculate total price
      state.totalPrice = state.selectedTechnologies.reduce(
        (sum, tech) => sum + (tech.TechnologyPrice || 0),
        0,
      );
    },

    setSelectedTechnologies: (state, action) => {
      state.selectedTechnologies = action.payload;
      // Recalculate total price
      state.totalPrice = state.selectedTechnologies.reduce(
        (sum, tech) => sum + (tech.TechnologyPrice || 0),
        0,
      );
    },

    // Duration selection
    setSelectedDuration: (state, action) => {
      state.selectedDuration = action.payload;
      // Recalculate if needed (duration * hourly rate)
    },

    // Date/Time selection
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },

    // Booking flow navigation
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },

    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },

    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    // Clear selections
    clearBookingSelection: (state) => {
      state.selectedService = null;
      state.serviceDetails = null;
      state.selectedTechnologies = [];
      state.selectedDuration = null;
      state.selectedDate = null;
      state.selectedTime = null;
      state.currentStep = 1;
      state.totalPrice = 0;
    },

    clearError: (state) => {
      state.error = null;
    },

    setSelectedJobId: (state, action) => {
      state.selectedJobId = action.payload;
    },

    clearJobDetails: (state) => {
      state.jobDetails = null;
      state.selectedJobId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Service By ID
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend returns service object directly (not nested under .service)
        const service = action.payload?.data?.service || action.payload?.data || action.payload;
        state.serviceDetails = service;
        state.selectedService = service;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isCreatingBooking = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreatingBooking = false;
        state.currentBooking = action.payload;
        // Clear selections after successful booking
        state.selectedTechnologies = [];
        state.selectedDuration = null;
        state.selectedDate = null;
        state.selectedTime = null;
        state.currentStep = 1;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreatingBooking = false;
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchBookingHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookingHistory = action.payload;
      })
      .addCase(fetchBookingHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Customer Bookings
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.isFetchingCustomerBookings = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.isFetchingCustomerBookings = false;
        state.customerBookings = action.payload || [];
        console.log(
          "✅ Customer bookings fetched successfully:",
          action.payload,
        );
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.isFetchingCustomerBookings = false;
        state.error = action.payload;
        console.error("❌ Failed to fetch customer bookings:", action.payload);
      })

      // Fetch Job By ID
      .addCase(fetchJobById.pending, (state) => {
        state.isFetchingJobDetails = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isFetchingJobDetails = false;
        state.jobDetails = action.payload?.job || action.payload;
        console.log("✅ Job details fetched successfully:", action.payload);
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isFetchingJobDetails = false;
        state.error = action.payload;
        console.error("❌ Failed to fetch job details:", action.payload);
      })

      // Create Job
      .addCase(createJob.pending, (state) => {
        state.isCreatingJob = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isCreatingJob = false;
        state.createdJob = action.payload?.job || action.payload;
        state.createdJobId = action.payload?.job?._id || action.payload?._id;
        console.log("✅ Job created successfully:", action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isCreatingJob = false;
        state.error = action.payload;
        console.error("❌ Failed to create job:", action.payload);
      })

      // Update Job
      .addCase(updateJob.pending, (state) => {
        state.isUpdatingJob = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isUpdatingJob = false;
        state.updatedJob = action.payload?.job || action.payload;
        console.log("✅ Job updated successfully:", action.payload);
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.isUpdatingJob = false;
        state.error = action.payload;
        console.error("❌ Failed to update job:", action.payload);
      })

      // Fetch Ongoing Bookings
      .addCase(fetchOngoingBookings.pending, (state) => {
        state.isFetchingOngoingBookings = true;
        state.error = null;
      })
      .addCase(fetchOngoingBookings.fulfilled, (state, action) => {
        state.isFetchingOngoingBookings = false;
        state.ongoingBookings = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
        state.ongoingBookingsPagination = action.payload?.pagination || null;
        console.log("✅ Ongoing bookings fetched successfully:", action.payload);
      })
      .addCase(fetchOngoingBookings.rejected, (state, action) => {
        state.isFetchingOngoingBookings = false;
        state.error = action.payload;
        console.error("❌ Failed to fetch ongoing bookings:", action.payload);
      })

      // Fetch Completed Bookings
      .addCase(fetchCompletedBookings.pending, (state) => {
        state.isFetchingCompletedBookings = true;
        state.error = null;
      })
      .addCase(fetchCompletedBookings.fulfilled, (state, action) => {
        state.isFetchingCompletedBookings = false;
        state.completedBookings = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
        state.completedBookingsPagination = action.payload?.pagination || null;
        console.log("✅ Completed bookings fetched successfully:", action.payload);
      })
      .addCase(fetchCompletedBookings.rejected, (state, action) => {
        state.isFetchingCompletedBookings = false;
        state.error = action.payload;
        console.error("❌ Failed to fetch completed bookings:", action.payload);
      });
  },
});

export const {
  setSelectedService,
  toggleTechnology,
  setSelectedTechnologies,
  setSelectedDuration,
  setSelectedDate,
  setSelectedTime,
  nextStep,
  prevStep,
  setCurrentStep,
  clearBookingSelection,
  clearError,
  setSelectedJobId,
  clearJobDetails,
} = bookingSlice.actions;

export default bookingSlice.reducer;
