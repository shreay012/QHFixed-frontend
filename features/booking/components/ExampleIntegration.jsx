// Example: How to integrate ChatPanel into your existing booking page

import { ChatPanel } from '@/features/booking/components';
import { useState, useEffect } from 'react';

export default function ExampleBookingIntegration({ bookingId }) {
  const [bookingData, setBookingData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    // Get user info from localStorage or your auth context
    const userInfo = localStorage.getItem('userInfo');
    const token = localStorage.getItem('authToken');

    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setCurrentUserId(parsed.userId || parsed.id || '');
    }

    if (token) {
      setAuthToken(token);
    }

    // Fetch booking data from your API
    fetchBookingData();
  }, [bookingId]);

  const fetchBookingData = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      setBookingData(data);
    } catch (err) {
      console.error('Error fetching booking:', err);
    }
  };

  if (!bookingData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Your existing booking UI */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{bookingData.title}</h1>
        {/* Other booking details */}
      </div>

      {/* Tabs for Ongoing/History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left panel - Booking info */}
        <div className="lg:col-span-1">
          {/* Your booking details component */}
        </div>

        {/* Right panel - Chat */}
        <div className="lg:col-span-2">
          <div className="h-[600px]">
            <ChatPanel
              projectTitle={bookingData.title}
              serviceInfo={bookingData.serviceInfo}
              bookingId={bookingData.bookingId}
              adminId={bookingData.adminId} // PM/Admin assigned to this booking
              serviceId={bookingData.serviceId}
              hourlyRate={bookingData.hourlyRate}
              currentUserId={currentUserId}
              authToken={authToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
