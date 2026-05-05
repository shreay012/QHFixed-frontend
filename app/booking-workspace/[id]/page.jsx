"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ChatPanel,
  ReportIssueModal,
  BookingTimeline,
} from "@/features/booking/components";
import { bookingService } from "@/lib/services/bookingApi";
import { ticketService } from "@/lib/services/ticketApi";
import chatSocketService from "@/lib/services/chatSocketService";
import axios from "@/lib/axios/axiosInstance";
import { getCurrentUser } from "@/lib/utils/userHelpers";
import { showSuccess } from "@/lib/utils/toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function fmtCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const BookingWorkspacePage = () => {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id ? decodeURIComponent(params.id) : null;
  const t = useTranslations("booking");

  const [activeTab, setActiveTab] = useState("chat");
  const [booking, setBooking] = useState(null);
  const [resource, setResource] = useState(null);
  const [pm, setPm] = useState(null);
  const [otherBookings, setOtherBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportErrorMessage, setReportErrorMessage] = useState("");
  const [now, setNow] = useState(Date.now());

  const currentUser =
    typeof window !== "undefined" ? getCurrentUser() : null;
  const currentUserId = currentUser?._id || null;
  const authToken =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const loadAll = useCallback(async () => {
    if (!rawId) return;
    try {
      setLoading(true);
      setLoadError(null);

      const res = await bookingService.getBookingById(rawId);
      const b = res?.data?.data || res?.data || null;
      setBooking(b);

      // Resource profile
      if (b?.resourceId) {
        try {
          const rp = await axios.get(`/resource/${b.resourceId}/profile`);
          setResource(rp?.data?.data || rp?.data || null);
        } catch (e) {
          console.warn("resource profile fetch failed", e);
        }
      } else {
        setResource(null);
      }

      // PM profile (uses same endpoint — any user record)
      if (b?.pmId) {
        try {
          const pp = await axios.get(`/resource/${b.pmId}/profile`);
          setPm(pp?.data?.data || pp?.data || null);
        } catch (e) {
          console.warn("pm profile fetch failed", e);
        }
      } else {
        setPm(null);
      }

      // Other ongoing bookings for the sidebar
      try {
        const ongoing = await bookingService.getOngoingBookings({
          page: 1,
          pageSize: 8,
        });
        const items = ongoing?.data?.data || ongoing?.data || [];
        setOtherBookings(
          items.filter((x) => String(x._id || x.id) !== String(rawId)),
        );
      } catch (e) {
        console.warn("other bookings fetch failed", e);
      }
    } catch (e) {
      console.error("failed to load booking workspace", e);
      setLoadError(
        e?.response?.data?.message || e.message || "Failed to load booking",
      );
    } finally {
      setLoading(false);
    }
  }, [rawId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Live updates: booking status, new time logs.
  useEffect(() => {
    const sock = chatSocketService.socket;
    if (!sock || !rawId) return undefined;
    const onStatus = (payload) => {
      if (!payload || String(payload.bookingId) !== String(rawId)) return;
      setBooking((prev) => (prev ? { ...prev, status: payload.status } : prev));
      loadAll();
    };
    const onTimeLog = (payload) => {
      if (!payload || String(payload.bookingId) !== String(rawId)) return;
      // Refresh booking data in case totals changed.
      loadAll();
    };
    sock.on("booking:status", onStatus);
    sock.on("time-log:new", onTimeLog);
    return () => {
      sock.off("booking:status", onStatus);
      sock.off("time-log:new", onTimeLog);
    };
  }, [rawId, loadAll]);

  // Tick the countdown clock once per second.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleReportIssue = async (note) => {
    setReportErrorMessage("");
    try {
      await ticketService.createTicket({
        subject: `Issue on booking ${rawId}`,
        description: note,
        bookingId: rawId,
      });
      setIsReportModalOpen(false);
      showSuccess("Issue reported successfully! Our team will review it shortly.");
    } catch (e) {
      setReportErrorMessage(
        e?.response?.data?.message || "Failed to report issue. Please try again.",
      );
    }
  };

  if (!rawId) {
    return <div className="p-6 text-gray-600">Missing booking id.</div>;
  }
  if (loading && !booking) {
    return <div className="p-6 text-gray-600">Loading workspace…</div>;
  }
  if (loadError && !booking) {
    return <div className="p-6 text-red-600">{loadError}</div>;
  }

  // Map API booking to the shape the existing JSX expects.
  const status = booking?.status || "pending";
  // Resolve service info (job-shape: services[0].serviceId is populated; legacy: booking.serviceId)
  const firstSvc = Array.isArray(booking?.services) && booking.services.length
    ? booking.services[0]
    : null;
  const svcDoc =
    (firstSvc && typeof firstSvc.serviceId === "object" ? firstSvc.serviceId : null) ||
    (booking && typeof booking.serviceId === "object" ? booking.serviceId : null);
  const serviceName = svcDoc?.name || booking?.title || "Service";
  const techList =
    (Array.isArray(firstSvc?.technologyIds)
      ? firstSvc.technologyIds.map((t) => t?.name || t).filter(Boolean)
      : null) ||
    (Array.isArray(svcDoc?.technologies) ? svcDoc.technologies : null) ||
    (Array.isArray(booking?.technologies) ? booking.technologies : []);
  const startTimeRaw =
    firstSvc?.preferredStartDate || booking?.startTime || booking?.preferredStartDate;
  const endTimeRaw =
    firstSvc?.preferredEndDate || booking?.endTime || booking?.preferredEndDate;
  const durationHours = firstSvc?.durationTime || booking?.duration || booking?.durationTime || 0;
  const duration = durationHours ? `${durationHours} Hours` : "";

  // Timer logic:
  //  - in_progress + startedAt: countdown from (startedAt + durationMs) — actual work deadline
  //  - paused: show remaining = durationMs - workedMs
  //  - any other status (paid/scheduled/assigned/etc.): NOT started yet —
  //    only the PM can start the booking, so show the booked duration as a
  //    static value. We no longer fabricate a countdown to the scheduled
  //    start time, since that misled users into thinking work had begun.
  const durationMs = durationHours * 60 * 60 * 1000;
  let timeRemaining;
  let timerLabel = t("timeRemaining");
  let isAwaitingPm = false;
  if (status === "in_progress" && booking?.startedAt) {
    const workDeadline = new Date(booking.startedAt).getTime() + durationMs;
    timeRemaining = fmtCountdown(workDeadline - now);
  } else if (status === "paused" && durationMs > 0) {
    const workedMs = booking?.workedMs || 0;
    timeRemaining = fmtCountdown(durationMs - workedMs);
  } else if (durationHours > 0) {
    // Work not started — only PM can start. Show booked duration, not a countdown.
    const hh = String(durationHours).padStart(2, "0");
    timeRemaining = `${hh}:00:00`;
    timerLabel = t("awaitingPmStart");
    isAwaitingPm = true;
  } else {
    timeRemaining = "—";
    timerLabel = t("awaitingPmStart");
    isAwaitingPm = true;
  }
  const bookingData = {
    id: String(booking?._id || rawId),
    bookingId: String(booking?._id || rawId),
    resource: serviceName,
    parentBookingId: String(booking?._id || rawId),
    serviceBookingId: svcDoc?._id ? String(svcDoc._id) : "",
    serviceId: svcDoc?._id ? String(svcDoc._id) : "",
    projectManagerId: booking?.pmId ? String(booking.pmId) : null,
    assignedResourceId: booking?.resourceId ? String(booking.resourceId) : null,
    statusType: status,
    startDate: fmtDate(startTimeRaw),
    endDate: fmtDate(endTimeRaw),
    duration,
    resourceAssigned: resource
      ? { name: resource.name || "Resource", avatar: resource.avatarUrl || "/avtar.png" }
      : null,
    projectManager: pm
      ? {
          id: String(pm._id || booking?.pmId || ""),
          name: pm.name || "Project Manager",
          avatar: pm.avatarUrl || "/avtar.png",
          responseTime: pm.responseTime || "10 min.",
          rating: pm.rating || 4.5,
          reviews: pm.reviews || 0,
        }
      : null,
    technicalSkills: techList,
    otherBookings: otherBookings.map((o) => {
      const oFirst = Array.isArray(o.services) && o.services.length ? o.services[0] : null;
      const oSvc =
        (oFirst && typeof oFirst.serviceId === "object" ? oFirst.serviceId : null) ||
        (o && typeof o.serviceId === "object" ? o.serviceId : null);
      return {
        id: String(o._id || o.id),
        resource: oSvc?.name || o.title || "Booking",
        icon: "/AI.svg",
        hasUnread: false,
      };
    }),
    timeRemaining,
    timerLabel,
    isAwaitingPm,
  };
  return (
    <div className="min-h-screen bg-[#F5FAF5] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-[18px] md:text-[20px] lg:text-[24px] mb-4"
          style={{
            color: "#484848",
            fontWeight: "var(--font-weight-600)",
            fontSize: "var(--font-size-24)",
          }}
        >
          Live Booking Workspace
        </h1>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            Home
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => router.push("/profile?section=bookings")}
            className="text-gray-600 hover:text-gray-900"
          >
            My Bookings
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-[#45A735] font-semibold">
            {bookingData.bookingId}
          </span>
        </div>

        {/* Info Bar and Button Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Info Bar */}
          <div
            className="flex-1 bg-white p-4"
            style={{
              border: "1px solid #D9E5E3",
              borderRadius: "16px",
            }}
          >
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] md:text-[13px] lg:text-[14px]"
                  style={{
                    color: "#636363",
                    fontWeight: "var(--font-weight-400)",
                    fontSize: "var(--font-size-14)",
                  }}
                >
                  Service
                </span>
                <span className="text-sm font-semibold text-[#45A735]">
                  {bookingData.resource}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] md:text-[13px] lg:text-[14px]"
                  style={{
                    color: "#636363",
                    fontWeight: "var(--font-weight-400)",
                    fontSize: "var(--font-size-14)",
                  }}
                >
                  Booking ID
                </span>
                <span className="text-sm font-semibold text-[#45A735]">
                  {bookingData.bookingId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] md:text-[13px] lg:text-[14px]"
                  style={{
                    color: "#636363",
                    fontWeight: "var(--font-weight-400)",
                    fontSize: "var(--font-size-14)",
                  }}
                >
                  Start Date
                </span>
                <span className="text-sm font-semibold text-[#45A735]">
                  {bookingData.startDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] md:text-[13px] lg:text-[14px]"
                  style={{
                    color: "#636363",
                    fontWeight: "var(--font-weight-400)",
                    fontSize: "var(--font-size-14)",
                  }}
                >
                  Duration
                </span>
                <span className="text-sm font-semibold text-[#45A735]">
                  {bookingData.duration}
                </span>
              </div>
            </div>
          </div>

          {/* All Bookings Button */}
          <button
            onClick={() => router.push("/profile?section=bookings")}
            className="px-6 self-stretch bg-[#45A735] text-white rounded-lg hover:bg-[#3d9430] transition-colors flex-shrink-0 text-[14px] md:text-[15px] lg:text-[16px]"
            style={{
              fontWeight: "var(--font-weight-700)",
              fontSize: "var(--font-size-16)",
            }}
          >
            All Bookings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Resource Info */}
        <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
          {/* Your Dedicated Resource Card */}
          <div>
            <h3
              className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-gray-900 mb-4"
              style={{
                fontSize: "var(--font-size-16)",
              }}
            >
              Your Dedicated Resource
            </h3>
            <div
              className="bg-white shadow-sm overflow-hidden"
              style={{
                border: "1px solid #D9E5E3",
                borderRadius: "16px",
              }}
            >
              {/* Split background container */}
              <div className="relative h-48">
                {/* Top half - green gradient */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-green-400 to-green-600">
                  <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                </div>
                {/* Bottom half - white */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>

                {/* Centered rounded pill - overlapping both halves */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)]">
                  <div
                    className="flex items-center gap-3 bg-white px-4 py-3"
                    style={{
                      border: "1.22px solid var(--Grey-Shade-Grey-5, #D9D9D9)",
                      borderRadius: "86px",
                    }}
                  >
                    {bookingData.resourceAssigned ? (
                      <>
                        <div className="w-10 h-10 bg-[#45A735] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {bookingData.resourceAssigned.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {bookingData.resourceAssigned.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Developer Assigned
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Image
                          src="/images/notassigned.svg"
                          alt="Not assigned"
                          width={30}
                          height={30}
                          className="flex-shrink-0"
                        />
                        <p
                          className="text-[14px] md:text-[16px] lg:text-[18px]"
                          style={{
                            color: "#636363",
                            fontWeight: "var(--font-weight-700)",
                            fontSize: "var(--font-size-14)",
                          }}
                        >
                          Resource Not assigned yet
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills Card */}
          <div
            className="bg-white p-4 md:p-6 shadow-sm"
            style={{
              border: "1px solid  #D9E5E3",
              borderRadius: "16px",
            }}
          >
            <h3
              className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-gray-900 mb-4"
              style={{
                fontSize: "var(--font-size-16)",
              }}
            >
              Technical Skills
            </h3>
            <div
              className="max-h-[80px] overflow-y-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex flex-wrap gap-2">
                {bookingData.technicalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#E8F7E8] text-[#45A735] rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Your Technical Project Manager Card */}
          <div>
            <h3
              className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-gray-900 mb-4"
              style={{
                fontSize: "var(--font-size-16)",
                textAlign: "left",
              }}
            >
              Your Technical Project Manager
            </h3>
            <div
              className="bg-white p-4 md:p-6 shadow-sm"
              style={{
                border: "1px solid #D9E5E3",
                borderRadius: "16px",
              }}
            >
              {bookingData.projectManager ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#45A7351A] rounded-full flex items-center justify-center text-[#45A735] font-bold text-sm flex-shrink-0">
                    {bookingData.projectManager.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {bookingData.projectManager.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Usually replies in{" "}
                      {bookingData.projectManager.responseTime}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div
                    className="flex items-center gap-3 bg-white px-6 py-3"
                    style={{
                      border: "1.22px solid var(--Grey-Shade-Grey-5, #D9D9D9)",
                      borderRadius: "86px",
                    }}
                  >
                    <Image
                      src="/images/notassigned.svg"
                      alt="TPM Not assigned"
                      width={30}
                      height={30}
                      className="flex-shrink-0"
                    />
                    <p
                      className="text-[14px] md:text-[16px] lg:text-[18px]"
                      style={{
                        color: "#636363",
                        fontWeight: "var(--font-weight-700)",
                        fontSize: "var(--font-size-14)",
                      }}
                    >
                      TPM Not assigned yet
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Issue Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full py-3 bg-white hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            style={{
              border: "1px solid #FF4848",
              borderRadius: "16px",
            }}
          >
            <Image
              src="/images/Info.svg"
              alt="Report"
              width={30}
              height={30}
              className="flex-shrink-0"
            />
            <span
              className="text-[14px] md:text-[15px] lg:text-[16px]"
              style={{
                color: "#FF4848",
                fontWeight: "var(--font-weight-600)",
                fontSize: "var(--font-size-16)",
              }}
            >
              Report issue
            </span>
          </button>
        </div>

        {/* Center - Chat Area */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div
            className="bg-white rounded-[16px] shadow-sm overflow-hidden h-[600px] flex flex-col"
            style={{ border: "1px solid #D9E5E3" }}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-semibold transition-colors ${
                  activeTab === "chat"
                    ? "text-[#45A735] border-b-2 border-[#45A735]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-4 md:px-6 py-3 md:py-4 text-sm font-semibold transition-colors ${
                  activeTab === "history"
                    ? "text-[#45A735] border-b-2 border-[#45A735]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                History
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-hidden px-3 md:px-4">
                    <ErrorBoundary>
                      <ChatPanel
                        projectTitle={bookingData.resource}
                        serviceInfo={`${bookingData.bookingId} | ${bookingData.duration}`}
                        bookingId={bookingData.bookingId}
                        adminId={bookingData.projectManagerId || ""}
                        serviceId={bookingData.serviceId}
                        hourlyRate={booking?.pricing?.hourlyRate || ""}
                        currentUserId={currentUserId}
                        authToken={authToken}
                        baseUrl={process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              ) : (
                <BookingTimeline
                  bookingId={bookingData.parentBookingId}
                  serviceId={bookingData.serviceBookingId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Timer & Other Bookings */}
        <div className="lg:col-span-3 order-3 space-y-6">
          {/* Timer Card */}
          <div
            className="bg-white p-4 md:p-6 shadow-sm text-center"
            style={{
              border: "1px solid var(--Ui-Color-Secondary-Light, #D9E5E3)",
              borderRadius: "16px",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {bookingData.timerLabel || t("timeRemaining")}
            </h3>
            <div
              className={`text-3xl md:text-4xl font-bold mb-2 ${
                bookingData.isAwaitingPm
                  ? "text-gray-400"
                  : "text-[#45A735]"
              }`}
              style={{ fontFamily: "monospace" }}
            >
              {bookingData.timeRemaining}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {bookingData.isAwaitingPm ? t("timerStartsHint") : ""}
            </p>
          </div>

          {/* Other Ongoing Bookings */}
          <div
            className="bg-white p-4 md:p-6 shadow-sm"
            style={{
              border: "1px solid #D9E5E3",
              borderRadius: "16px",
            }}
          >
            <h3
              className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-gray-900 mb-4"
              style={{
                fontSize: "var(--font-size-16)",
              }}
            >
              Other Ongoing Services ({bookingData.otherBookings.length})
            </h3>
            <div
              className="space-y-3 max-h-[220px] overflow-y-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {bookingData.otherBookings.length > 0 ? (
                bookingData.otherBookings.map((booking, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-[#F9F9F9] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{
                      border: "1px solid #E5E5E5",
                      borderRadius: "12px",
                    }}
                    onClick={() => {
                      router.push(
                        `/booking-workspace/${encodeURIComponent(booking.id)}`,
                      );
                    }}
                  >
                    <div className="w-10 h-10 bg-[#45A7351A] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={booking.icon || "/AI.svg"}
                        alt={booking.resource}
                        width={24}
                        height={24}
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(465%) hue-rotate(70deg) brightness(94%) contrast(89%)",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {booking.resource}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Booking Id</p>
                      <p className="text-xs text-gray-900 font-medium">
                        {booking.id}
                      </p>
                    </div>
                    {booking.hasUnread && (
                      <div className="flex-shrink-0">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                            stroke="#45A735"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No other ongoing bookings
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportErrorMessage("");
        }}
        onSubmit={handleReportIssue}
        errorMessage={reportErrorMessage}
      />
    </div>
  );
};

export default BookingWorkspacePage;
