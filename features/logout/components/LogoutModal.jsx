"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { logout, guestAccess } from "@/lib/redux/slices/authSlice/authSlice";
import chatSocketService from "@/lib/services/chatSocketService";
import { useToast } from "@/components/providers/ToastProvider";

const LogoutModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast(); // Add this line

  const handleLogout = async () => {
    try {
      // Disconnect socket before logout
      console.log("🔌 Disconnecting socket on logout...");
      chatSocketService.disconnect();

      // Logout user
      await dispatch(logout()).unwrap();

      // Clear all user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");

      // Reinitialize guest access
      const guestResult = await dispatch(guestAccess()).unwrap();
      localStorage.setItem("guestToken", guestResult.data.token);
      localStorage.setItem("userType", "guest");
      localStorage.setItem("guestData", JSON.stringify(guestResult.data));
      // showToast("Logout successfully", "success");
      showToast({
        title: " ",
        message: "Logged out successfully",
        type: "success",
      });

      onClose();
      router.push("/");
    } catch (error) { 1
      console.error("Logout failed:", error);
      // Still disconnect socket and redirect even if guest access fails
      chatSocketService.disconnect();
      onClose();
      router.push("/");
    }
  };

  // Prevent body scroll when modal is open
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

  return (
    <>
      {/* Backdrop - Only render when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Modal Card - Only render when open */}
      {isOpen && (
        <div
          className="
            fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-[85%] sm:w-full max-w-[360px] rounded-2xl sm:rounded-3xl shadow-2xl z-[110]
            p-6 sm:p-8 transition-opacity duration-300
          "
          style={{
            background:
              "linear-gradient(0.01deg, #FFFFFF 0.01%, #DDEFDA 99.99%)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logouticon.svg"
                alt="Logout"
                width={48}
                height={48}
              />
            </div>
          </div>

          {/* Heading */}
          <h2
            className="text-center text-sm sm:text-base font-bold mb-3"
            style={{ color: "#484848" }}
          >
            Do you want to log out?
          </h2>

          {/* Description */}
          <p
            className="text-center text-xs mb-8 font-normal"
            style={{ color: "#636363" }}
          >
            Are you sure you want to log out? You can sign back in anytime.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="
    flex-[2] text-white font-semibold py-3 rounded-lg
    font-opensauce text-sm sm:text-base
  "
              style={{
                background:
                  "linear-gradient(to right, #26472B 50%, #45A735 50%)",
                backgroundSize: "200% 100%",
                backgroundPosition: "right bottom",
                transition: "all 0.4s ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundPosition = "left bottom";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundPosition = "right bottom";
              }}
            >
              Yes, Logout
            </button>
            <button
              onClick={onClose}
              className="
                flex-1 border-2 border-[#45A735] text-[#45A735] font-semibold py-2 rounded-lg
                hover:bg-gray-50 transition-colors duration-200
                font-opensauce text-xs sm:text-sm
              "
            >
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutModal;
