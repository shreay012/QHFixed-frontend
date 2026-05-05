'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/redux/store/hooks';
import { guestAccess, setGuestFromStorage, setAuthFromStorage } from '@/lib/redux/slices/authSlice/authSlice';

const GuestAccessProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return; // Prevent multiple calls
      
      console.log('🔄 Initializing authentication...');

      // Check if user is already authenticated
      const storedUserToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUser = localStorage.getItem('user');

      // If user is logged in, restore their session
      if (storedUserToken && storedUserType === 'user' && storedUser) {
        try {
          console.log('✅ Restoring user session');
          const userResponse = JSON.parse(storedUser);
          // Handle nested structure: {"success": true, "data": {...}}
          const userData = userResponse.data || userResponse;
          console.log('👤 User data:', { id: userData._id, name: userData.name });
          dispatch(setAuthFromStorage({
            token: storedUserToken,
            user: userData
          }));
          setIsInitialized(true);
          return; // Exit early if user is authenticated
        } catch (error) {
          console.error('❌ Error restoring user session:', error);
        }
      }

      // Check if guest token already exists
      const storedGuestToken = localStorage.getItem('guestToken');
      const storedGuestData = localStorage.getItem('guestData');

      if (storedGuestToken && storedUserType === 'guest' && storedGuestData) {
        try {
          console.log(' Restoring guest session');
          dispatch(setGuestFromStorage({
            token: storedGuestToken,
            guestData: JSON.parse(storedGuestData)
          }));
          setIsInitialized(true);
          return; // Exit early if guest token is valid
        } catch (error) {
          console.error('❌ Error restoring guest session:', error);
        }
      }

      // If no valid session exists, create guest access
      console.log('🔑 No existing session found, calling guest access API...');
      try {
        const result = await dispatch(guestAccess()).unwrap();

        console.log('✅ Guest access API response:', result);

        // Thunk extracts data to root level: result = { token, ... }
        const guestToken = result?.token || result?.data?.token;
        localStorage.setItem('guestToken', guestToken);
        localStorage.setItem('userType', 'guest');
        localStorage.setItem('guestData', JSON.stringify(result || {}));

        console.log('💾 Guest data stored in localStorage');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Failed to initialize guest access:', error);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch, isInitialized]);

  return <>{children}</>;
};

export default GuestAccessProvider;
