import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../../services/authApi';

// Async Thunks
// Helper: extract a human-readable message from any backend error shape.
// Backend returns: { success: false, error: { code, message } }
function extractErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||   // ← backend's actual shape
    error.response?.data?.message ||
    (typeof error.response?.data === 'string' ? error.response.data : null) ||
    error.message ||
    fallback
  );
}

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (mobileNumber, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtp(mobileNumber);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to send OTP. Please check your connection and try again.')
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ mobileNumber, otp, fcmToken }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(mobileNumber, otp, fcmToken);
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, 'Login failed. Please try again.')
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  return null;
});

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      const { name, email, mobile, ongoingJobs, completedJobs } = response.data.data;
      
      // Split full name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        firstName,
        lastName,
        email,
        phone: mobile,
        ongoingJobs: ongoingJobs || 0,
        completedJobs: completedJobs || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

export const guestAccess = createAsyncThunk(
  'auth/guestAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.guestAccess();
      return response.data?.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get guest access');
    }
  }
);

// Initialize auth from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userType = localStorage.getItem('userType');
      const guestToken = localStorage.getItem('guestToken');
      
      if (token && user) {
        return {
          type: 'user',
          token,
          user: JSON.parse(user),
          userType: userType || 'user',
        };
      } else if (guestToken) {
        const guestData = localStorage.getItem('guestData');
        return {
          type: 'guest',
          guestToken,
          guestData: guestData ? JSON.parse(guestData) : null,
        };
      }
    }
    return null;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    guestToken: null,
    userType: null, // 'guest' or 'user'
    isAuthenticated: false,
    isNewUser: false,
    isLoading: false,
    error: null,
    otpSent: false,
    guestData: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.error = null;
    },
    setAuthFromStorage: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.userType = 'user';
    },
    setGuestFromStorage: (state, action) => {
      state.guestToken = action.payload.token;
      state.userType = 'guest';
      state.guestData = action.payload.guestData;
    },
    completeProfile: (state) => {
      // Mark profile as complete but keep isAuthenticated false
      // It will be set to true when user navigates away from Details step
      state.isNewUser = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('isNewUser', 'false');
        console.log('✅ Profile completed - marked as existing user');
      }
    },
    setAuthenticatedAfterDetails: (state) => {
      // Set authenticated to true after Details step is completed
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isNewUser');
        localStorage.removeItem('guestToken');
        localStorage.removeItem('guestData');
        console.log('✅ Authentication complete - user navigated past Details');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;

        // Extract nested data - API returns { data: { user, token, isNewUser } }
        const responseData = action.payload?.data || action.payload;
        const isNewUser = responseData?.isNewUser || false;
        
        state.user = responseData?.user;
        state.token = responseData?.token;
        state.userType = 'user';
        state.otpSent = false;
        state.isNewUser = isNewUser;

        // 🎯 ONLY set isAuthenticated to true if NOT a new user
        // New users stay on Details step until they complete their profile
        state.isAuthenticated = !isNewUser;

        // Store token and user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', responseData?.token || '');
          localStorage.setItem('user', JSON.stringify(responseData?.user || {}));
          localStorage.setItem('userType', responseData?.user?.role || 'user');
          localStorage.setItem('isNewUser', isNewUser.toString());
          
          // Clear guest data only for existing users
          if (!isNewUser) {
            localStorage.removeItem('guestToken');
            localStorage.removeItem('guestData');
          }
          
          console.log('🔐 Redux: Token saved to localStorage:', responseData.token);
          console.log('👤 Is New User:', isNewUser);
          console.log('🔓 Is Authenticated:', !isNewUser);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.userType = null;
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
        }
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          ...state.user,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          phone: action.payload.phone,
          ongoingJobs: action.payload.ongoingJobs,
          completedJobs: action.payload.completedJobs,
        };
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Guest Access
      .addCase(guestAccess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(guestAccess.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend returns { success, data: { token } } - thunk already extracts to data level
        state.guestToken = action.payload?.token || action.payload;
        state.userType = 'guest';
        state.guestData = action.payload;
      })
      .addCase(guestAccess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Initialize Auth from localStorage
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          if (action.payload.type === 'user') {
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.userType = 'user';
          } else if (action.payload.type === 'guest') {
            state.guestToken = action.payload.guestToken;
            state.userType = 'guest';
            state.guestData = action.payload.guestData;
          }
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, resetOtpState, setAuthFromStorage, setGuestFromStorage, completeProfile, setAuthenticatedAfterDetails } = authSlice.actions;
export default authSlice.reducer;