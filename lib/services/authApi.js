import axios from '../axios/axiosInstance';
import { ENDPOINTS } from '../endpoints';

export const authService = {
  sendOtp: async (mobileNumber) => {
    return await axios.post(ENDPOINTS.AUTH.SEND_OTP, { 
      mobile: mobileNumber,
      role: "user"
    });
  },

  verifyOtp: async (mobileNumber, otp, fcmToken = "") => {
    return await axios.post(ENDPOINTS.AUTH.VERIFY_OTP, { 
      mobile: mobileNumber,
      otp,
      fcmToken
    });
  },

  logout: async () => {
    return await axios.post(ENDPOINTS.AUTH.LOGOUT);
  },

  updateProfile: async (profileData) => {
    const config = {};
    
    // If it's FormData, remove Content-Type to let axios/browser handle it
    if (profileData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined,
      };
    }
    
    return await axios.put(ENDPOINTS.USER.UPDATE_PROFILE, profileData, config);
  },

  getProfile: async () => {
    return await axios.get(ENDPOINTS.USER.GET_PROFILE);
  },

  guestAccess: async () => {
    return await axios.post(ENDPOINTS.AUTH.GUEST_ACCESS);
  },
};