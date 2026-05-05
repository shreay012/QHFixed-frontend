"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

const MessageInputBar = ({
  onSendMessage,
  onSendAttachment,
  onTypingChange,
  disabled,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Typing indicator logic
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingChange?.(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingChange?.(false);
    }, 3000);

    // Stop typing indicator if message is empty
    if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTypingChange?.(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return;

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTypingChange?.(false);
    }

    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white p-4" style={{ borderTop: "1px solid #D9E5E3" }}>
      <div className="flex items-end gap-2">
        {/* Message Input */}
        <textarea
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-[10px] sm:text-[11px] md:text-[12px] font-normal"
    
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          className="p-2 bg-[#45A735] text-white rounded-lg"
        >
          <Image
            src="/images/sendicon.svg"
            alt="Send"
            width={18}
            height={18}
          />
        </button>
      </div>
    </div>
  );
};

export default MessageInputBar;
