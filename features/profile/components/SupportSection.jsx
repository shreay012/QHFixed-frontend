'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { fetchAllTickets } from '@/lib/redux/slices/ticketSlice';
import { fetchOngoingBookings } from '@/lib/redux/slices/bookingSlice/bookingSlice';
import { getServiceIcon } from '@/lib/utils/serviceIcon';
import axiosInstance from '@/lib/axios/axiosInstance';

const SupportSection = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations('supportSection');
  const { tickets, isLoading } = useSelector((state) => state.tickets);
  const { ongoingBookings: bookingsData } = useSelector((state) => state.booking);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch tickets on component mount
  useEffect(() => {
    dispatch(fetchAllTickets({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch ongoing bookings when modal opens
  useEffect(() => {
    if (isModalOpen) {
      dispatch(fetchOngoingBookings({ page: 1, pageSize: 100 }));
    }
  }, [isModalOpen, dispatch]);

  // Transform bookings data for modal
  const modalBookings = bookingsData.flatMap((booking) => {
    return booking.services?.map((service) => ({
      id: service._id,
      bookingId: service.bookingId,
      service: service.serviceId?.name || 'Service',
      icon: getServiceIcon(service.serviceId),
    })) || [];
  });

  // Fetch tickets on component mount
  useEffect(() => {
    dispatch(fetchAllTickets({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Filter tickets by status
  const ongoingTickets = tickets.filter((ticket) => ticket.status === 'Ongoing');
  const resolvedTickets = tickets.filter((ticket) => ticket.status === 'Resolved');

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Freeze background when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleSubmit = async () => {
    // Clear previous error
    setErrorMessage('');
    
    if (!selectedBooking || !noteText.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create ticket via API
      const response = await axiosInstance.post('/tickets/ticket', {
        serviceId: selectedBooking,
        comment: noteText,
      });

      // Show success modal
      setShowSuccess(true);
      
      // Refresh tickets list
      dispatch(fetchAllTickets({ page: 1, limit: 100 }));
    } catch (error) {
      // Extract error message from API response
      if (error.response?.status === 400 && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(t('errorCreate'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setNoteText('');
    setErrorMessage('');
    setShowSuccess(false);
  };

  const handleNoteChange = (e) => {
    setNoteText(e.target.value);
    // Clear error when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <div className="w-full lg:flex-1">
      {/* Header with Create Button */}
      <div className="mb-6 lg:mb-8 flex items-center justify-between">
        <h1 className="font-[700] text-[18px] sm:text-[20px] lg:text-[24px]" style={{ color: '#202224' }}>
          {t('title')}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-white text-sm lg:text-base font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: '#45A735' }}
        >
          {t('createNew')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 lg:gap-8 border-b border-gray-300 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`pb-2 sm:pb-3 font-semibold font-opensauce transition-colors text-xs sm:text-sm ${
            activeTab === 'ongoing'
              ? 'text-[#45A735] border-b-2 border-[#45A735]'
              : 'text-[#6A7282] hover:text-[#6A7282]'
          }`}
          style={{ fontWeight: 700 }}
        >
          {t('ongoingTab')}
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-2 sm:pb-3 font-semibold font-opensauce transition-colors text-xs sm:text-sm ${
            activeTab === 'resolved'
              ? 'text-[#45A735] border-b-2 border-[#45A735]'
              : 'text-[#6A7282] hover:text-[#6A7282]'
          }`}
          style={{ fontWeight: 700 }}
        >
          {t('resolvedTab')}
        </button>
      </div>

      {/* Tickets Grid */}
      {activeTab === 'ongoing' && (
        <div className="h-[400px] sm:h-[450px] lg:h-[480px] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 pr-2 sm:pr-3 lg:pr-4">
            {isLoading ? (
              <div className="col-span-1 lg:col-span-2 flex items-center justify-center py-20">
                <p className="text-gray-500 font-opensauce">{t('loading')}</p>
              </div>
            ) : ongoingTickets.length > 0 ? (
              ongoingTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Ticket Details Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('supportTicketId')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('bookingId')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.bookingDetails?.bookingId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('date')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('status')}
                      </p>
                      <span
                        className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold"
                        style={{ backgroundColor: '#0077CC1A', color: '#0077CC', borderRadius: '12px' }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Comment Section */}
                  {ticket.comment && (
                    <div className="mb-4 sm:mb-5 lg:mb-6">
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('comment')}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.comment}
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-4 sm:mb-5 lg:mb-6"></div>

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/support-chat/${ticket._id}`)}
                    className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg text-white text-xs sm:text-sm font-semibold transition-colors w-full sm:w-auto hover:opacity-90"
                    style={{ backgroundColor: '#45A735', fontWeight: 600 }}
                  >
                    {t('viewDetails')}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2" />
                    <path d="M3 9h18" stroke="#9CA3AF" strokeWidth="2" />
                    <path d="M9 14h6M9 19h6" stroke="#9CA3AF" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-gray-500 font-opensauce text-center">{t('noOngoing')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolved Tickets Tab */}
      {activeTab === 'resolved' && (
        <div className="h-[400px] sm:h-[450px] lg:h-[480px] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 pr-2 sm:pr-3 lg:pr-4">
            {isLoading ? (
              <div className="col-span-1 lg:col-span-2 flex items-center justify-center py-20">
                <p className="text-gray-500 font-opensauce">{t('loading')}</p>
              </div>
            ) : resolvedTickets.length > 0 ? (
              resolvedTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Ticket Details Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('supportTicketId')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('bookingId')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.bookingDetails?.bookingId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('date')}
                      </p>
                      <p className="break-words text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('status')}
                      </p>
                      <span
                        className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold"
                        style={{ backgroundColor: '#E8F7E8', color: '#45A735' }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Comment Section */}
                  {ticket.comment && (
                    <div className="mb-4 sm:mb-5 lg:mb-6">
                      <p className="text-[10px] sm:text-xs font-opensauce mb-1" style={{ color: '#909090', fontWeight: 500 }}>
                        {t('comment')}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: '#242424', fontWeight: 400 }}>
                        {ticket.comment}
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-4 sm:mb-5 lg:mb-6"></div>

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/support-chat/${ticket._id}`)}
                    className="py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg text-white text-xs sm:text-sm font-semibold transition-colors w-full sm:w-auto hover:opacity-90"
                    style={{ backgroundColor: '#45A735', fontWeight: 600 }}
                  >
                    {t('viewDetails')}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2" />
                    <path d="M3 9h18" stroke="#9CA3AF" strokeWidth="2" />
                    <path d="M9 14h6M9 19h6" stroke="#9CA3AF" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-gray-500 font-opensauce text-center">{t('noResolved')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <style jsx global>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            .hide-scrollbar {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
          `}</style>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[75vh] overflow-y-auto">
            {showSuccess ? (
              /* Success View */
              <>
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg width={20} height={20} className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/feedback.svg"
                      alt="Success"
                      width={96}
                      height={96}
                    />
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center px-4 pb-6">
                  <h2
                    className="text-[20px] md:text-[22px] lg:text-[24px] font-semibold mb-4"
                    style={{
                      color: "#242424",
                      fontWeight: "600",
                    }}
                  >
                    {t('thanksFeedback')}
                  </h2>
                  <p
                    className="text-[14px] md:text-[15px] lg:text-[16px]"
                    style={{
                      color: "#636363",
                      fontWeight: "400",
                    }}
                  >
                    {t('teamConnectSoon')}
                  </p>
                </div>
              </>
            ) : (
              /* Form View */
              <>
                {/* Header with Close Button */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="font-[700] text-base sm:text-lg lg:text-2xl" style={{ color: '#202224' }}>
                    {t('reportIssue')}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg width={20} height={20} className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Note Field */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">{t('noteLabel')}</label>
                  <textarea
                    value={noteText}
                    onChange={handleNoteChange}
                    placeholder={t('notePlaceholder')}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45A735] resize-none text-xs sm:text-sm"
                    rows={4}
                    style={{ color: '#242424' }}
                  />
                </div>

                {/* Ongoing Bookings Section */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="font-[600] text-sm sm:text-[16px] text-gray-900 mb-3 sm:mb-4">{t('ongoingBookings')}</h3>
                  <div className="max-h-[120px] sm:max-h-[130px] overflow-y-auto space-y-3 sm:space-y-4 hide-scrollbar">
                    {modalBookings.length > 0 ? (
                      modalBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center gap-2 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="booking"
                            value={booking.id}
                            checked={selectedBooking === booking.id}
                            onChange={(e) => setSelectedBooking(e.target.value)}
                            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                              <Image 
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${booking.icon}`}
                                alt={booking.service}
                                width={20}
                                height={20}
                                style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(465%) hue-rotate(70deg) brightness(94%) contrast(89%)' }}
                              />
                            </div>
                            <span className="font-[500] text-xs sm:text-sm text-gray-900 truncate">{booking.service}</span>
                          </div>
                          <span
                            className="text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                            style={{ backgroundColor: '#45A7351A', color: '#45A735' }}
                          >
                            {booking.bookingId}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-500 text-center py-4">{t('noOngoingAvailable')}</p>
                    )}
                  </div>
                </div>

                {/* Error Message and Submit Button Row */}
                <div className="flex items-center justify-between gap-4">
                  {/* Error Message */}
                  <div className="flex-1">
                    {errorMessage && (
                      <div 
                        className="flex items-start gap-2"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="8" stroke="#DC2626" strokeWidth="1.5"/>
                            <path d="M10 6V10" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="10" cy="13" r="0.5" fill="#DC2626"/>
                          </svg>
                        </div>
                        <p 
                          className="text-[11px] md:text-[12px] leading-relaxed"
                          style={{
                            color: "#DC2626",
                            fontWeight: "400",
                          }}
                        >
                          {errorMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedBooking || !noteText.trim() || isSubmitting}
                    className="py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg text-white text-sm sm:text-base font-semibold transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ backgroundColor: '#45A735' }}
                  >
                    {isSubmitting ? t('submitting') : t('submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportSection;
