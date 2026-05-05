"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ReportIssueModal = ({ isOpen, onClose, onSubmit, errorMessage = "" }) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Freeze background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!note.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(note);
      setNote("");
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNote("");
    setShowSuccess(false);
    onClose();
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    // Clear error when user starts typing
    if (errorMessage && onClose) {
      // Trigger parent to clear error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-4 md:p-5"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {showSuccess ? (
          /* Success View */
          <>
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center"
                aria-label="Close"
              >
                <Image
                  src="/images/crossicon.svg"
                  alt="Close"
                  width={24}
                  height={24}
                />
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
                Thanks For sharing Your Feedback
              </h2>
              <p 
                className="text-[14px] md:text-[15px] lg:text-[16px]"
                style={{
                  color: "#636363",
                  fontWeight: "400",
                }}
              >
                Our teammate will connect with you within 10 minutes.
              </p>
            </div>
          </>
        ) : (
          /* Form View */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-[16px] md:text-[17px] lg:text-[18px] font-semibold"
                style={{
                  color: "#242424",
                  fontWeight: "600",
                }}
              >
                Report Issue
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center "
                aria-label="Close"
              >
                <Image
                  src="/images/crossicon.svg"
                  alt="Close"
                  width={24}
                  height={24}
                />
              </button>
            </div>

            {/* Note Label */}
            <div className="mb-2">
              <label
                htmlFor="report-note"
                className="block text-[14px] md:text-[15px] lg:text-[16px]"
                style={{
                  color: "#484848",
                  fontWeight: "600",
                }}
              >
                Note<span className="text-red-500">*</span>
              </label>
            </div>

            {/* Textarea */}
            <textarea
              id="report-note"
              value={note}
              onChange={handleNoteChange}
              placeholder="Please write your note...."
              className="w-full min-h-[100px] p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#45A735] focus:border-transparent text-sm text-gray-700 placeholder-gray-400"
              style={{
                fontFamily: "inherit",
              }}
            />

            {/* Error Message */}
            {errorMessage && (
              <div 
                className="mt-3 p-3 rounded-lg flex items-start gap-3"
                style={{
                  backgroundColor: "#FEE2E2",
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="#DC2626" strokeWidth="1.5"/>
                    <path d="M10 6V10" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="13" r="0.5" fill="#DC2626"/>
                  </svg>
                </div>
                <p 
                  className="text-[13px] md:text-[14px] leading-relaxed"
                  style={{
                    color: "#DC2626",
                    fontWeight: "400",
                  }}
                >
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={!note.trim() || isSubmitting}
                className="px-8 py-2.5 bg-[#45A735] text-white rounded-lg font-medium hover:bg-[#3d9430] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;
