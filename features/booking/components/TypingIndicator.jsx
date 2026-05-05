import React from 'react';

const TypingIndicator = ({ senderName, senderInitials }) => {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
        {senderInitials || 'PM'}
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col items-start">
        {senderName && <p className="text-xs text-gray-600 mb-1">{senderName}</p>}
        
        <div className="bg-gray-200 rounded-lg px-4 py-3 flex items-center gap-1">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
