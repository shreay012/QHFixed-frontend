"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ticketService } from "@/lib/services/ticketApi";

function normalizeMessage(m, currentUserId) {
  const senderId = String(m.senderId || m.sender || "");
  const isUser = senderId === String(currentUserId);
  return {
    id: m._id || m.id,
    text: m.msg ?? m.text ?? "",
    sender: isUser ? "user" : (m.senderRole === "admin" ? "admin" : (m.senderRole || "admin")),
    senderName: isUser ? "You" : (m.senderName || (m.senderRole === "admin" ? "Support Team" : "Support")),
    senderRole: m.senderRole || (isUser ? "user" : "admin"),
    timestamp: m.createdAt || m.timestamp || new Date().toISOString(),
    isRead: m.isRead ?? true,
  };
}

export default function SupportChatPage() {
  const params = useParams();
  const ticketId = params.id;

  const { user } = useSelector((s) => s.auth || {});
  const currentUserId = user?._id || user?.id;

  const [ticketData, setTicketData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketConnected = true;

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let cancelled = false;
    if (!ticketId) return;
    setIsLoading(true);
    ticketService
      .getTicketMessages(ticketId)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data?.data || res?.data || {};
        const t = payload.ticket || null;
        const msgs = Array.isArray(payload) ? payload : (payload.messages || []);
        if (t) {
          const created = t.createdAt ? new Date(t.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "";
          setTicketData({
            ticketId: String(t._id || t.id || ticketId).slice(-6).toUpperCase(),
            bookingId: t.bookingId ? String(t.bookingId).slice(-6).toUpperCase() : "-",
            status: t.status || "open",
            createdAt: created,
            comment: t.description || t.subject || "",
            resource: t.resource || "-",
            startDate: t.startDate ? new Date(t.startDate).toLocaleDateString() : "-",
            endDate: t.endDate ? new Date(t.endDate).toLocaleDateString() : "-",
            duration: t.duration || "-",
          });
        }
        setMessages(msgs.map((m) => normalizeMessage(m, currentUserId)));
      })
      .catch(() => { if (!cancelled) { setMessages([]); } })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [ticketId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text || sending) return;
    setNewMessage("");
    const optimistic = {
      id: `temp_${Date.now()}`,
      text,
      sender: "user",
      senderName: "You",
      senderRole: "user",
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      setSending(true);
      const res = await ticketService.sendMessage(ticketId, text);
      const saved = res?.data?.data;
      if (saved) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? normalizeMessage(saved, currentUserId) : m)));
      }
    } catch (e) {
      // revert on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5FAF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#45A735] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .chat-messages-area::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
      <div
        className=" bg-[#F5FAF5] pt-2  px-4 pb-6 md:px-6 md:pb-2 lg:px-8 lg:pb-2"
        style={{
          height: "88vh",
          maxHeight: "88vh",
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <h1
            className="text-[18px] md:text-[20px] lg:text-[24px]"
            style={{
              color: "#484848",
              fontWeight: "600",
            }}
          >
            Ticket Details
          </h1>
          <div
            className="flex items-center gap-2 text-[10px] md:text-[11px] lg:text-[12px] mt-0.5"
            style={{
              color: "#636363",
              fontWeight: "500",
            }}
          >
            <a href="/">Home</a>
            <span>/</span>
            <a href="/profile">My Bookings</a>
            <span>/</span>
            <span className="text-[#45A735]">Tickets</span>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ maxHeight: "calc(88vh - 80px)", overflow: "hidden" }}
        >
          {/* Left Side - Ticket Details */}
          <div className="lg:col-span-1 overflow-y-auto">
            {/* Ticket Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <h2
                className="text-[14px] md:text-[16px] lg:text-[18px] mb-4"
                style={{
                  color: "#000000",
                  fontWeight: "600",
                }}
              >
                Ticket Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Support Ticket ID
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.ticketId}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Status
                  </p>
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold rounded-xl"
                    style={{ backgroundColor: "#0077CC1A", color: "#0077CC" }}
                  >
                    {ticketData?.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Created
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.createdAt}
                  </p>
                </div>

                <div className="flex items-start justify-between">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Comment
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px] text-right max-w-[60%]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.comment}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h2
                className="text-[14px] md:text-[16px] lg:text-[18px] mb-4"
                style={{
                  color: "#000000",
                  fontWeight: "600",
                }}
              >
                Booking Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Booking ID
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.bookingId}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Start Date
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.startDate}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Resource
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.resource}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    End Date
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.endDate}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p
                    className="text-[10px] md:text-[12px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "400" }}
                  >
                    Duration
                  </p>
                  <p
                    className="text-[12px] md:text-[13px] lg:text-[14px]"
                    style={{ color: "#484848", fontWeight: "500" }}
                  >
                    {ticketData?.duration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl border border-gray-200 flex flex-col"
              style={{ height: "calc(88vh - 80px)" }}
            >
              {/* Socket Status Indicator */}
              <div className="border-b border-gray-200 px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-gray-400"}`}
                  ></div>
                  <p className="text-xs text-gray-600">
                    {socketConnected ? "Connected" : "Connecting..."}
                  </p>
                </div>
              </div>

              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto p-6 chat-messages-area"
                style={{
                  minHeight: 0,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex flex-col">
                          {message.sender !== "user" && (
                            <p className="text-xs text-gray-500 mb-1 ml-2">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-[#45A735] text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          {message.timestamp && (
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === "user"
                                  ? "text-gray-500 text-right mr-2"
                                  : "text-gray-500 ml-2"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 px-6 py-4">
                {ticketData?.status?.toLowerCase() === "resolved" ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      This ticket is resolved. You cannot send messages.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45A735] focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2.5 bg-[#45A735] text-white rounded-lg font-medium hover:bg-[#3d9430] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
