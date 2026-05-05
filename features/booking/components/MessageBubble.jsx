import React from 'react';
import { formatTime } from '@/lib/utils/chatHelpers';

const MessageBubble = ({ message, isFromCurrentUser }) => {
  const { senderName, senderInitials, message: text, timestamp, attachment, msgType } = message;

  return (
    <div className={`flex gap-3 mb-4 ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
          isFromCurrentUser ? 'bg-[#45A7351A] text-[#45A735]' : 'bg-[#45A7351A] text-[#45A735]'
        }`}
      >
        {senderInitials}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (only for received messages) */}
        {!isFromCurrentUser && <p className="text-xs font-700 mb-1" style={{ color: '#000000' }}>{senderName}</p>}

        {/* Message Bubble */}
        <div
          className={`rounded-[12px] px-4 py-2 ${
            isFromCurrentUser ? 'bg-[#45A735] text-white' : 'bg-[#F3F4F6] text-gray-900'
          }`}
        >
          {/* Attachment */}
          {msgType === 1 && attachment && (
            <div className="mb-2">
              {attachment.mimetype?.startsWith('image/') ? (
                <img
                  src={attachment.url}
                  alt={attachment.originalName}
                  className="max-w-full rounded-lg mb-1"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 ${isFromCurrentUser ? 'text-white' : 'text-blue-600'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm underline">{attachment.originalName}</span>
                </a>
              )}
            </div>
          )}

          {/* Text Message */}
          {text && <p className="text-sm whitespace-pre-wrap break-words">{text}</p>}
        </div>

        {/* Timestamp */}
        <p className="text-[10px] sm:text-[11px] md:text-[10px] text-gray-500 mt-1">{formatTime(timestamp)}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
