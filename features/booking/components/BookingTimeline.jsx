"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { bookingService } from "@/lib/services/bookingApi";

const BookingTimeline = ({ bookingId, serviceId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!bookingId || !serviceId) {
      setLoading(false);
      return;
    }

    // Prevent duplicate API calls
    if (hasFetched.current) {
      return;
    }

    const fetchHistory = async () => {
      try {
        hasFetched.current = true;
        setLoading(true);
        setError(null);

        const response = await bookingService.getBookingTimeline(
          bookingId,
          serviceId
        );

        if (response.data && response.data.history) {
          setHistory(response.data.history);
        } else {
          setHistory([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch booking history:", err);
        setError("Failed to load booking history");
        setLoading(false);
      }
    };

    fetchHistory();
  }, [bookingId, serviceId]);

  const formatDateTime = (dateString) => {
    // Parse the UTC time and keep it in UTC (don't convert to local timezone)
    const date = new Date(dateString);
    
    // Get UTC hours and minutes
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Format minutes with leading zero
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#45A735] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-gray-500">No history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Banner */}
      <div className="border-b border-gray-200 px-4 py-2">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/verifyIcon.svg"
                alt="Verified"
                width={20}
                height={20}
              />
            </div>
            <p className="text-sm text-gray-700">
              Your Booking Timeline
            </p>
          </div>
          <p
            className="text-[10px] sm:text-[11px] md:text-[12px] font-normal mt-0.5"
            style={{
              color: "#909090",
            }}
          >
            See all updates and actions related to your booking.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.map((item, index) => (
          <div key={item._id} className="relative pb-4 last:pb-0">
            {/* Vertical line - show for all except last item */}
            {index < history.length - 1 && (
              <div
                className="absolute right-4 top-8 bottom-0 w-[2px]"
                style={{
                  borderRight: "2px dashed #00BA00",
                }}
              />
            )}

            {/* Timeline item */}
            <div className="flex items-start gap-4 justify-end">
              {/* Content */}
              <div className="flex-1 text-right">
                <div
                  className="inline-block px-4 py-2 mb-2"
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: "16px",
                  }}
                >
                  <p
                    className="text-[10px] md:text-[11px] lg:text-[12px] font-normal"
                    style={{
                      color: "#4A5565",
                      fontWeight: "400",
                    }}
                  >
                    {item.status}
                  </p>
                </div>
                <p
                  className="text-[10px] md:text-[11px] lg:text-[12px] font-normal"
                  style={{
                    color: "#6A7282",
                    fontWeight: "400",
                  }}
                >
                  {formatDateTime(item.createdAt)}
                </p>
              </div>

              {/* Checkmark icon */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10" style={{backgroundColor: "#45A7351A"}}>
                <div className="w-5 h-5 bg-[#45A735] rounded-full flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTimeline;
