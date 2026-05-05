/**
 * Redux preloaded state.
 *
 * Provides explicit initial shapes for each slice so the store
 * hydrates cleanly on first render before any API calls complete.
 * All real data is loaded asynchronously via thunks after mount.
 *
 * NOTE: auth starts unauthenticated — real auth state is read from
 * localStorage by the authSlice initialiser.
 */
export const mockPreloadedState = {
  auth: {
    user: null,
    token: null,
    guestToken: null,
    userType: null,
    isAuthenticated: false,
    isNewUser: false,
    isLoading: false,
    error: null,
    otpSent: false,
    guestData: null,
  },
  booking: {
    selectedService: null,
    serviceDetails: null,
    selectedTechnologies: [],
    selectedDuration: null,
    selectedDate: null,
    selectedTime: null,
    currentStep: 1,
    totalSteps: 4,
    currentBooking: null,
    bookingHistory: [],
    customerBookings: [],
    ongoingBookings: [],
    ongoingBookingsPagination: null,
    completedBookings: [],
    completedBookingsPagination: null,
    selectedJobId: null,
    jobDetails: null,
    createdJob: null,
    updatedJob: null,
    createdJobId: null,
    totalPrice: 0,
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
  user: {
    user: null,
    isLoading: false,
    error: null,
  },
  services: {
    allServices: [],
    selectedService: null,
    filteredServices: [],
    searchQuery: '',
    selectedCategory: 'all',
    isLoading: false,
    isLoadingDetail: false,
    error: null,
    categories: ['all', 'frontend', 'backend', 'design', 'qa', 'devops', 'mobile'],
  },
  userProfile: {
    profile: null,
    isLoading: false,
    error: null,
  },
  availability: {
    hoursAvailability: null,
    availableSlots: [],
    selectedDuration: null,
    isLoading: false,
    error: null,
  },
  pricing: {
    pricing: null,
    isLoading: false,
    error: null,
  },
  payment: {
    history: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
  },
  tickets: {
    tickets: [],
    pagination: { currentPage: 1, totalPages: 0, totalCount: 0 },
    isLoading: false,
    error: null,
  },
  dashboard: {
    stats: {
      unreadNotificationsCount: 0,
      cartItemCount: 0,
      totalPendingJobs: 0,
    },
    isLoading: false,
    error: null,
  },
  notifications: {
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
};
