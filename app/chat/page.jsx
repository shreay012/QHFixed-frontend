'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import ChatPanel from '@/features/booking/components/ChatPanel';

function ChatContent() {
  const searchParams = useSearchParams();

  // Get chat parameters from URL
  const bookingId = searchParams.get('bookingId') || '';
  const adminId = searchParams.get('adminId') || '';
  const serviceId = searchParams.get('serviceId') || '';
  const projectTitle = searchParams.get('projectTitle') || 'Development';
  const serviceInfo = searchParams.get('serviceInfo') || '';
  const hourlyRate = searchParams.get('hourlyRate') || '';

  // Live auth from redux
  const { user, token } = useSelector((state) => state.auth || {});
  const currentUserId = user?._id || user?.id || '';
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '');

  if (!currentUserId || !authToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign in required</h2>
          <p className="text-gray-600">Please log in to access chat.</p>
        </div>
      </div>
    );
  }

  if (!bookingId || !serviceId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Missing Information</h2>
          <p className="text-gray-600">Booking ID and Service ID are required to access chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto h-full">
        <ChatPanel
          projectTitle={projectTitle}
          serviceInfo={serviceInfo}
          bookingId={bookingId}
          adminId={adminId}
          serviceId={serviceId}
          hourlyRate={hourlyRate}
          currentUserId={currentUserId}
          authToken={authToken}
        />
      </div>
    </div>
  );
}

function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

export default ChatPage;
