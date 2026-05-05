"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllNotifications,
  clearNotifications,
  markAsRead,
  deleteNotification,
} from "@/lib/redux/slices/notificationsSlice/notificationsSlice";
import Image from "next/image";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fetchDashboardStats } from "@/lib/redux/slices/dashboardSlice";
import chatSocketService from "@/lib/services/chatSocketService";

const NotificationDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, isLoading, isLoadingMore, error, pagination } =
    useSelector((state) => state.notifications);
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (isOpen) {
      console.log("🔔 NotificationDrawer opened - Fetching notifications...");
      setCurrentPage(1);
      dispatch(fetchAllNotifications({ page: 1, limit: 10 }))
        .unwrap()
        .then((response) => {
          console.log("📬 Notification Drawer API Response:", response);
          console.log(
            "📋 Notifications Data:",
            response.data || response.notifications,
          );
        })
        .catch((error) => {
          console.error("❌ Failed to fetch notifications:", error);
        });
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch, isOpen]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when 80% scrolled
    if (scrollPercentage > 0.8) {
      const nextPage = currentPage + 1;
      console.log("📜 Loading more notifications... Page:", nextPage);
      setCurrentPage(nextPage);
      dispatch(fetchAllNotifications({ page: nextPage, limit: 10 }));
    }
  }, [dispatch, currentPage, isLoadingMore, pagination.hasNextPage]);

  // Real-time: fetch latest when new notification arrives via socket
  useEffect(() => {
    const onNew = () => {
      // Refresh first page to show new notification at top
      dispatch(fetchAllNotifications({ page: 1, limit: 10 }));
      dispatch(fetchDashboardStats());
    };
    const sock = chatSocketService.socket;
    if (sock) {
      sock.on('notification:new', onNew);
      sock.on('notification', onNew);
    }
    window.addEventListener('newNotification', onNew);
    return () => {
      if (sock) {
        sock.off('notification:new', onNew);
        sock.off('notification', onNew);
      }
      window.removeEventListener('newNotification', onNew);
    };
  }, [dispatch]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const handleOpenDeleteModal = (notification) => {
    setNotificationToDelete(notification);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setNotificationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      const id = notificationToDelete.id || notificationToDelete._id;
      await dispatch(deleteNotification(id));
      handleCloseDeleteModal();
    }
  };

  return (
    <>
      {/* Backdrop - Only render when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[550px] lg:w-[600px] bg-white z-[70]
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}
        `}
      >
        {/* Close Button - Positioned outside on left */}
        {isOpen && (
          <div className="absolute top-4 -left-14 z-10">
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: "white",
                color: "#000",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2
              style={{
                color: "#000000",
                fontWeight: "var(--font-weight-600)",
                fontSize: "var(--font-size-24)",
              }}
              className="sm:text-[20px] text-[18px]"
            >
              Notification
            </h2>
            {/* Close Button - Mobile Only */}
            <button
              onClick={onClose}
              className="sm:hidden p-2 hover:opacity-70 transition-opacity"
              aria-label="Close notifications"
            >
              <Image
                src="/closeicon.svg"
                alt="Close"
                width={24}
                height={24}
              />
            </button>
            {/* {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-[#45A735] hover:text-[#3d9230] font-medium"
              >
                Clear All
              </button>
            )} */}
          </div>
        </div>

        {/* Notification Items */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-gray-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#45A735]"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-red-500 mb-2">Failed to load notifications</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Image
                src="/images/notification/notificationpage.png"
                alt="No Notifications"
                width={102}
                height={103}
                className="mb-4"
              />
              <p
                style={{
                  color: "#242424",
                  fontWeight: "var(--font-weight-600)",
                  fontSize: "var(--font-size-16)",
                }}
                className="mb-2 sm:text-[14px] text-[13px]"
              >
                Nothing new here
              </p>
              <p
                style={{
                  color: "#484848",
                  fontWeight: "var(--font-weight-400)",
                  fontSize: "var(--font-size-14)",
                }}
                className="sm:text-[13px] text-[12px]"
              >
                You’ll see updates and alerts when they arrive.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === "payment" ? (
                        <div className="w-10 h-10 rounded-full border-1 border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path
                              fillRule="evenodd"
                              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : notification.type === "chat" ||
                        notification.type === "message" ? (
                        <div className="w-10 h-10 rounded-full border-1 border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      ) : notification.type === "timer" ||
                        notification.type === "schedule" ? (
                        <div className="w-10 h-10 rounded-full border-1 border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : notification.type === "assignment" ||
                        notification.type === "resource" ? (
                        <div className="w-10 h-10 rounded-full border-1 border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-1 border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-[15px]">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(
                              notification.createdAt || notification.timestamp,
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(notification);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p
                          style={{
                            color: "#636363",
                            fontWeight: "400",
                            fontSize: "12px",
                            opacity: "0.8",
                          }}
                          className="leading-relaxed sm:text-[12px] text-[11px] flex-1"
                        >
                          {notification.message || notification.description}
                        </p>
                        {(notification.data?.displayBookingId ||
                          notification.displayBookingId) && (
                          <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                            {notification.data?.displayBookingId ||
                              notification.displayBookingId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#45A735]"></div>
                </div>
              )}

              {/* End of List Indicator */}
              {!pagination.hasNextPage && notifications.length > 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No more notifications
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-[20px]">
          <div
            className="rounded-2xl p-[22px] pt-[55px] max-w-lg w-full shadow-2xl relative"
            style={{
              background:
                "linear-gradient(0.01deg, #FFFFFF 0.01%, #DDEFDA 99.99%)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseDeleteModal}
              className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Trash Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-center text-gray-900 mb-1"
              style={{
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "150%",
              }}
            >
              Delete Notification
            </h3>

            {/* Message */}
            <p
              className="text-center text-gray-500 mb-6"
              style={{
                fontSize: "14px",
                lineHeight: "150%",
              }}
            >
              Are you sure you want to delete this notification?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-[#45A735] text-white py-2 px-3 rounded-lg font-semibold transition-colors relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-[#26472B] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                <span className="relative z-10">Delete</span>
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 border-1 border-[#45A735] text-gray-400 py-2 px-3 rounded-lg font-semibold hover:bg-[#26472B] hover:text-white hover:border-[#26472B] transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDrawer;
