"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginForm = ({
  onSendOtp,
  onVerifyOtp,
  onLogin,
  onResendOtp,
  onMobileNumberChanged,
  isLoading = false,
  errorMessage,
  isOtpStep = false,
  isOtpVerified = false,
  mobileNumber: propMobileNumber,
  showResendTimer = false,
  resendSeconds = 120,
}) => {
  const [mobileNumber, setMobileNumber] = useState(propMobileNumber || "");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [isMobileFocused, setIsMobileFocused] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newScaleFactor = Math.min(Math.max(width / 1440, 0.7), 1.2);
      setScaleFactor(newScaleFactor);
      setIsMobile(width < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (propMobileNumber) {
      setMobileNumber(propMobileNumber);
    }
  }, [propMobileNumber]);

  const handleMobileChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(digitsOnly);

    if (onMobileNumberChanged && isOtpStep) {
      onMobileNumberChanged();
    }

    // Auto-send OTP when 10 digits are entered
    if (digitsOnly.length === 10 && !isLoading && !isOtpStep && onSendOtp) {
      onSendOtp(digitsOnly);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 1);
    if (!cleaned) {
      const updated = [...otpValues];
      updated[index] = "";
      setOtpValues(updated);
      return;
    }

    const dummyOtp = ["1", "2", "3", "4"];
    setOtpValues(dummyOtp);

    if (onVerifyOtp) {
      const fullOtp = dummyOtp.join("");
      onVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOtp = () => {
    if (mobileNumber.length === 10 && onSendOtp) {
      onSendOtp(mobileNumber);
    }
  };

  const formatResendTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const containerHeight = isMobile ? 48 : 45;
  const fontSize = 14;
  const spacingBetweenFields = isMobile ? 6 : 8;
  const otpFieldHeight = isMobile ? 48 : 45;

  return (
    <div className="w-full max-w-none">
      {/* Error Message */}
      {errorMessage && (
        <div
          className="w-full mb-4 flex items-center justify-center"
          style={{
            padding: "10px 16px",
            backgroundColor: "#DC3545",
            borderRadius: "40px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#FFFFFF",
              textAlign: "center",
              fontFamily: "OpenSauceOne, sans-serif",
            }}
          >
            {errorMessage}
          </span>
        </div>
      )}

      {/* Welcome Text */}
      <div className="text-left mb-4">
        <h2
          style={{
            fontSize: `${24 * scaleFactor}px`,
            fontWeight: 600,
            color: "#484848",
            fontFamily: "OpenSauceOne, sans-serif",
            marginBottom: "8px",
          }}
        >
          You're almost there!
        </h2>
        <p
          style={{
            fontSize: `${14 * scaleFactor}px`,
            fontWeight: 400,
            color: "#666666",
            fontFamily: "OpenSauceOne, sans-serif",
          }}
        >
          Just a quick step to unlock expert resources.
        </p>
        <div
          style={{
            height: "1px",
            backgroundColor: "#D9E5E3",
            margin: "10px 0",
          }}
        />
      </div>

      {/* Mobile Number Section */}
      <div className="mb-4">
        <div className="mb-2">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#484848",
              fontFamily: "OpenSauceOne, sans-serif",
            }}
          >
            Mobile Number <span style={{ color: "#DC3545" }}>*</span>
          </span>
        </div>

        <div
          className="flex"
          style={{
            height: `${containerHeight}px`,
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: `1px solid ${isMobileFocused ? "#45A735" : "#D9D9D9"}`,
          }}
        >
          {/* Mobile Number Input */}
          <div className="flex-1">
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => handleMobileChange(e.target.value)}
              onFocus={() => setIsMobileFocused(true)}
              onBlur={() => setIsMobileFocused(false)}
              placeholder="Enter Mobile Number"
              className="w-full h-full bg-transparent outline-none"
              style={{
                fontSize: `${fontSize}px`,
                color: "#484848",
                fontFamily: "OpenSauceOne, sans-serif",
                paddingLeft: isMobile ? "12px" : "16px",
                paddingRight: "12px",
              }}
              maxLength={10}
            />
          </div>

          {/* Send OTP Button */}
          <button
            onClick={handleSendOtp}
            disabled={isLoading || isOtpStep || mobileNumber.length !== 10}
            className="px-4 py-2 transition-colors"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 600,
              color: "#45A735",
              fontFamily: "OpenSauceOne, sans-serif",
              backgroundColor: "transparent",
              border: "none",
              cursor:
                isLoading || isOtpStep || mobileNumber.length !== 10
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isLoading || isOtpStep || mobileNumber.length !== 10 ? 0.6 : 1,
            }}
          >
            {isLoading
              ? "Verifying"
              : isOtpVerified
                ? "Verified"
                : isOtpStep
                  ? "OTP Sent"
                  : "Send OTP"}
          </button>
        </div>
      </div>

      {/* OTP Section */}
      <div className="mb-4">
        <div className="mb-2">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#484848",
              fontFamily: "OpenSauceOne, sans-serif",
            }}
          >
            OTP <span style={{ color: "#DC3545" }}>*</span>
          </span>
        </div>

        <div
          className="flex gap-2"
          style={{ gap: `${spacingBetweenFields}px` }}
        >
          {otpValues.map((value, index) => (
            <div
              key={index}
              className="flex-1"
              style={{
                height: `${otpFieldHeight}px`,
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: `1px solid ${
                  errorMessage && isOtpStep
                    ? "#DC3545"
                    : isOtpFocused[index]
                      ? "#45A735"
                      : "#D9D9D9"
                }`,
              }}
            >
              <input
                id={`otp-${index}`}
                type="text"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onFocus={() => {
                  const newFocused = [...isOtpFocused];
                  newFocused[index] = true;
                  setIsOtpFocused(newFocused);
                }}
                onBlur={() => {
                  const newFocused = [...isOtpFocused];
                  newFocused[index] = false;
                  setIsOtpFocused(newFocused);
                }}
                placeholder="-"
                className="w-full h-full bg-transparent outline-none text-center"
                style={{
                  fontSize: "14px",
                  color: "#484848",
                  fontFamily: "OpenSauceOne, sans-serif",
                }}
                maxLength={1}
                disabled={!isOtpStep}
              />
            </div>
          ))}
        </div>

        {/* Resend OTP Timer */}
        {isOtpStep && showResendTimer && (
          <div className="mt-3 text-center">
            <span
              style={{
                fontSize: "12px",
                color: "#666666",
                fontFamily: "OpenSauceOne, sans-serif",
              }}
            >
              Resend OTP in {formatResendTime(resendSeconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
