'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { showError, showSuccess } from '@/lib/utils/toast';
import ChatPanel from '@/features/booking/components/ChatPanel';
import BookingTimeline from '@/features/booking/components/BookingTimeline';
import { bookingService, paymentService } from '@/lib/services/bookingApi';
import chatSocketService from '@/lib/services/chatSocketService';
import { getCurrentUser } from '@/lib/utils/userHelpers';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  assigned_to_pm: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-200 text-gray-800',
  cancelled: 'bg-red-100 text-red-700',
};

function formatStatus(s) {
  return s ? s.replace(/_/g, ' ') : '—';
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Countdown Timer ────────────────────────────────────────────────────────
function useCountdown(endTime) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const ms = new Date(endTime).getTime() - Date.now();
      setRemaining(ms);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

function CountdownDisplay({ endTime, onThirtyMinWarning }) {
  const ms = useCountdown(endTime);
  const warned = useRef(false);

  useEffect(() => {
    if (ms === null) return;
    // Fire 30-min warning once
    if (!warned.current && ms > 0 && ms <= 30 * 60 * 1000) {
      warned.current = true;
      onThirtyMinWarning?.();
    }
  }, [ms, onThirtyMinWarning]);

  if (ms === null) return null;
  if (ms <= 0) return <span className="text-red-600 font-bold text-sm">⏱ Time Ended</span>;

  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const isWarning = ms <= 30 * 60 * 1000;
  const isUrgent = ms <= 10 * 60 * 1000;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
      isUrgent ? 'bg-red-100 text-red-700 animate-pulse' :
      isWarning ? 'bg-orange-100 text-orange-700' : 'bg-green-50 text-green-700'}`}>
      <span>⏱</span>
      <span>Time Remaining: {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
      {isWarning && <span className="text-xs font-normal">(30 min warning!)</span>}
    </div>
  );
}

// ─── Extend Booking Modal ───────────────────────────────────────────────────
const PLANS = [
  { id: 'plan-4', label: '4 Hours', hours: 4 },
  { id: 'plan-8', label: '8 Hours', hours: 8 },
  { id: 'plan-custom', label: 'Custom', hours: null },
];

function ExtendModal({ booking, onClose, onSuccess }) {
  const [step, setStep] = useState('hours'); // hours | summary | payment
  const [selectedPlan, setSelectedPlan] = useState('plan-4');
  const [customHours, setCustomHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hourlyRate = booking?.pricing?.hourlyRate || booking?.pricing?.hourly || 1200;
  const hours = selectedPlan === 'plan-custom' ? customHours : PLANS.find(p => p.id === selectedPlan)?.hours || 4;
  const subtotal = hourlyRate * hours;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handlePayAndExtend = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate new end time
      const currentEnd = booking.endTime ? new Date(booking.endTime) : new Date();
      const newEndTime = new Date(currentEnd.getTime() + hours * 3600_000).toISOString();

      // Step 1: Extend booking (updates DB, returns mock payment or order)
      const orderRes = await bookingService.extendBooking(booking._id || booking.id, {
        additionalHours: hours,
        newEndTime,
        hourlyRate,
        subtotal,
        gst,
        total,
      });

      const orderData = orderRes?.data?.data || orderRes?.data;

      // Step 2: If mock payment (dev), skip Razorpay
      if (orderData?.mock || !orderData?.razorpayOrderId) {
        onSuccess(orderData);
        return;
      }

      // Step 3: Open Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: total * 100,
          currency: 'INR',
          name: 'QuickHire',
          description: `Extend booking by ${hours} hours`,
          order_id: orderData.razorpayOrderId,
          prefill: { name: orderData.userDetails?.name || '', email: orderData.userDetails?.email || '' },
          handler: async (response) => {
            onSuccess({ ...orderData, paymentResponse: response });
          },
          modal: { ondismiss: () => setLoading(false) },
        });
        rzp.open();
      };
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.message || 'Extension failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Extend Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Step: Hours */}
        {step === 'hours' && (
          <div className="p-6">
            <p className="text-gray-600 mb-4 text-sm">Select additional hours to add to your current booking.</p>
            <div className="space-y-3 mb-6">
              {PLANS.map(plan => (
                <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-[#45A735] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)} className="accent-[#45A735]" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{plan.label}</p>
                    <p className="text-xs text-gray-500">₹{plan.hours ? (hourlyRate * plan.hours).toLocaleString() : '—'} + 18% GST</p>
                  </div>
                </label>
              ))}
              {selectedPlan === 'plan-custom' && (
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-sm text-gray-600 w-28">Hours:</label>
                  <input type="number" min={1} max={40} value={customHours}
                    onChange={e => setCustomHours(Math.max(1, Number(e.target.value)))}
                    className="border rounded-lg px-3 py-2 w-24 text-center font-semibold focus:outline-none focus:border-[#45A735]" />
                </div>
              )}
            </div>
            <button onClick={() => setStep('summary')}
              className="w-full bg-[#45A735] text-white font-bold py-3 rounded-xl hover:bg-[#3d942d] transition-colors">
              Review Summary →
            </button>
          </div>
        )}

        {/* Step: Summary */}
        {step === 'summary' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Additional Hours</span>
                <span className="font-semibold">{hours} hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rate</span>
                <span className="font-semibold">₹{hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-semibold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#45A735]">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              New end time: {new Date(new Date(booking.endTime).getTime() + hours * 3600_000).toLocaleString('en-IN')}
            </p>
            {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep('hours')}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={handlePayAndExtend} disabled={loading}
                className="flex-1 bg-[#45A735] text-white font-bold py-3 rounded-xl hover:bg-[#3d942d] disabled:opacity-60 transition-colors">
                {loading ? 'Processing…' : `Pay ₹${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const BookingOngoingPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = params?.id || searchParams.get('bookingId');
  const queryServiceId = searchParams.get('serviceId');

  const [activeTab, setActiveTab] = useState('ongoing');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionBusy, setActionBusy] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendWarningShown, setExtendWarningShown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showExtendWarningBanner, setShowExtendWarningBanner] = useState(false);

  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || null;
  const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getBookingById(bookingId);
      const data = res?.data?.data || res?.data || null;
      setBookingData(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  // Real-time booking status via socket
  useEffect(() => {
    const sock = chatSocketService.socket;
    if (!sock || !bookingId) return;
    const onStatus = (payload) => {
      if (String(payload?.bookingId) !== String(bookingId)) return;
      setBookingData(prev => prev ? { ...prev, status: payload.status } : prev);
      loadBooking();
    };
    sock.on('booking:status', onStatus);
    return () => sock.off('booking:status', onStatus);
  }, [bookingId, loadBooking]);

  // 30-min warning handler — show in-page banner instead of browser confirm
  const handle30MinWarning = useCallback(() => {
    if (extendWarningShown) return;
    setExtendWarningShown(true);
    setShowExtendWarningBanner(true);
  }, [extendWarningShown]);

  const handleCancel = async () => {
    if (!bookingId || !cancelReason.trim()) return;
    try {
      setActionBusy('cancel');
      setShowCancelModal(false);
      await bookingService.cancelBooking(bookingId, cancelReason.trim());
      setCancelReason('');
      showSuccess('Booking cancelled successfully.');
      await loadBooking();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionBusy(null);
    }
  };

  const handleExtendSuccess = async (data) => {
    setShowExtendModal(false);
    setExtendWarningShown(false); // allow another warning after extension
    await loadBooking();
    showSuccess('✅ Booking extended successfully!');
  };

  if (!bookingId) return <div className="p-6 text-gray-600">Missing booking id.</div>;
  if (loading && !bookingData) return <div className="p-6 text-gray-600">Loading booking…</div>;
  if (error && !bookingData) return <div className="p-6 text-red-600">{error}</div>;

  const status = bookingData?.status || 'pending';
  const projectTitle = bookingData?.projectTitle || bookingData?.requirements || 'Your Booking';
  const duration = bookingData?.duration ? `${bookingData.duration} Hours` : '';
  const serviceInfo = duration || 'Service';
  const isCancellable = ['pending', 'confirmed', 'assigned_to_pm'].includes(status);
  const isExtendable = ['confirmed', 'assigned_to_pm', 'in_progress'].includes(status);
  const isActive = ['in_progress', 'confirmed', 'assigned_to_pm'].includes(status);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{projectTitle}</h1>
              <p className="text-gray-500 text-sm mb-3">{serviceInfo}</p>
              <div className="flex gap-3 flex-wrap items-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {bookingId}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-700'}`}>
                  {formatStatus(status)}
                </span>
                {/* ⏱ Live Countdown Timer */}
                {isActive && bookingData?.endTime && (
                  <CountdownDisplay
                    endTime={bookingData.endTime}
                    onThirtyMinWarning={isExtendable ? handle30MinWarning : undefined}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isExtendable && (
                <button
                  onClick={() => setShowExtendModal(true)}
                  disabled={actionBusy === 'extend'}
                  className="px-4 py-2 rounded-xl bg-[#45A735] text-white text-sm font-semibold hover:bg-[#3d942d] disabled:opacity-50 transition-colors"
                >
                  🔄 Extend Booking
                </button>
              )}
              {isCancellable && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionBusy === 'cancel'}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {actionBusy === 'cancel' ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-2xl shadow-md mb-4">
          <div className="flex border-b">
            {['ongoing', 'history'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors text-sm ${activeTab === tab ? 'border-b-2 border-[#45A735] text-[#45A735]' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'ongoing' ? '💬 Chat' : '📋 History'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Booking Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">📌 Booking Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Service', value: serviceInfo },
                  { label: 'Status', value: formatStatus(status) },
                  { label: 'Start', value: fmtDate(bookingData?.startTime) },
                  { label: 'End', value: fmtDate(bookingData?.endTime) },
                  bookingData?.pricing?.total != null && { label: 'Total', value: `₹${Number(bookingData.pricing.total).toLocaleString()}` },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-min warning banner */}
            {isActive && bookingData?.endTime && (() => {
              const ms = new Date(bookingData.endTime).getTime() - Date.now();
              return ms > 0 && ms <= 30 * 60 * 1000 ? (
                <div className="bg-orange-50 border border-orange-300 rounded-2xl p-4 text-sm">
                  <p className="font-bold text-orange-700 mb-1">⚠️ Booking ends soon!</p>
                  <p className="text-orange-600 mb-3">Less than 30 minutes remaining.</p>
                  <button onClick={() => setShowExtendModal(true)}
                    className="w-full bg-[#45A735] text-white font-bold py-2 rounded-xl hover:bg-[#3d942d] text-sm">
                    Extend Now
                  </button>
                </div>
              ) : null;
            })()}
          </div>

          {/* Right: Chat / History */}
          <div className="lg:col-span-2 h-[600px]">
            {activeTab === 'ongoing' ? (
              <ChatPanel
                projectTitle={projectTitle}
                serviceInfo={serviceInfo}
                bookingId={bookingId}
                adminId={bookingData?.pmId || ''}
                serviceId={bookingData?.serviceId || queryServiceId || ''}
                hourlyRate={bookingData?.pricing?.hourlyRate || ''}
                currentUserId={currentUserId}
                authToken={authToken}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 h-full overflow-auto">
                {bookingData?.serviceId ? (
                  <BookingTimeline bookingId={bookingId} serviceId={String(bookingData.serviceId)} />
                ) : (
                  <div className="text-center text-gray-400 mt-16">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-medium">No history yet</p>
                    <p className="text-sm mt-1">Events will appear as your project progresses.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 30-min Warning Banner */}
      {showExtendWarningBanner && (
        <div className="fixed bottom-6 right-6 z-40 bg-orange-50 border border-orange-300 rounded-2xl p-5 shadow-2xl max-w-sm">
          <button onClick={() => setShowExtendWarningBanner(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          <p className="font-bold text-orange-700 mb-1">⏱ Booking ends in 30 minutes!</p>
          <p className="text-orange-600 text-sm mb-4">Add more hours to keep your session going.</p>
          <div className="flex gap-2">
            <button onClick={() => { setShowExtendWarningBanner(false); setShowExtendModal(true); }}
              className="flex-1 bg-[#45A735] text-white font-bold py-2 rounded-xl text-sm hover:bg-[#3d942d]">
              Extend Now
            </button>
            <button onClick={() => setShowExtendWarningBanner(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Cancel Booking</h2>
            <p className="text-gray-500 text-sm mb-4">Please provide a reason for cancellation.</p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Project requirements changed..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Keep Booking
              </button>
              <button onClick={handleCancel} disabled={!cancelReason.trim() || actionBusy === 'cancel'}
                className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 disabled:opacity-50">
                {actionBusy === 'cancel' ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {showExtendModal && bookingData && (
        <ExtendModal
          booking={bookingData}
          onClose={() => setShowExtendModal(false)}
          onSuccess={handleExtendSuccess}
        />
      )}
    </div>
  );
};

export default BookingOngoingPage;
