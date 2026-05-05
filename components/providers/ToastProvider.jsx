"use client";

import { createContext, useContext, useState, useCallback } from "react";
import Image from "next/image";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    console.log("🎯 showToast called with:", toast);
    const id = Date.now();
    const newToast = { ...toast, id };

    console.log("📝 Adding toast to state:", newToast);
    setToasts((prev) => {
      const updated = [...prev, newToast];
      console.log("📊 Updated toasts array:", updated);
      return updated;
    });

    // Auto-remove after duration
    setTimeout(() => {
      console.log("⏰ Auto-removing toast:", id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Debug: Log whenever toasts change
  console.log(
    "🍞 ToastProvider render - Current toasts:",
    toasts.length,
    toasts,
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast Container - Top Right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 animate-slide-in"
            style={{
              animation: "slideIn 0.3s ease-out",
            }}
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                toast.type === "chat"
                  ? "bg-[#fff]"
                  : toast.type === "booking"
                    ? "bg-[#fff]"
                    : "bg-[#fff]"
              }`}
            >
              <span className="text-lg">
                {toast.type === "success" ? (
                  // Check icon for success
                  <Image
                    src="/checkicon.svg"
                    alt="Success"
                    width={20}
                    height={20}
                  />
                ) : (
                  // Bell icon for other types
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                {toast.title || "Notification"}
              </p>
              <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
              {/* {toast.subtitle && (
                <p className="text-xs text-gray-500 mt-1">
                  {toast.subtitle}
                </p>
              )} */}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
