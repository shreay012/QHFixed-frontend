import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice/authSlice';
import bookingReducer from '../slices/bookingSlice/bookingSlice';
import userReducer from '../slices/userSlice/userSlice';
import servicesReducer from '../slices/discoverSlice/discoverserviceSlice';
import userProfileReducer from '../slices/userProfileSlice/userProfileSlice';
import availabilityReducer from '../slices/availabilitySlice/availabilitySlice';
import pricingReducer from '../slices/pricingSlice/pricingSlice';
import paymentReducer from '../slices/paymentSlice';
import ticketReducer from '../slices/ticketSlice';
import dashboardReducer from "../slices/dashboardSlice/dashboardSlice";
import notificationsReducer from '../slices/notificationsSlice/notificationsSlice';
import cartReducer from '../slices/cartSlice/cartSlice';
import regionReducer from '../slices/regionSlice/regionSlice';
import chatReducer from '../slices/chatSlice/chatSlice';
import { mockPreloadedState } from './mockPreloadedState';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    user: userReducer,
    services: servicesReducer,
    userProfile: userProfileReducer,
    availability: availabilityReducer,
    pricing: pricingReducer,
    payment: paymentReducer,
    tickets: ticketReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    cart: cartReducer,
    region: regionReducer,
    chat: chatReducer,
  },
  preloadedState: mockPreloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
