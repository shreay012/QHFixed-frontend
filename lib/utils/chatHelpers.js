export const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const formatDate = (date) => {
  const today = new Date();
  const messageDate = new Date(date);
  
  const isToday = 
    today.getDate() === messageDate.getDate() &&
    today.getMonth() === messageDate.getMonth() &&
    today.getFullYear() === messageDate.getFullYear();
  
  const isYesterday = 
    today.getDate() - 1 === messageDate.getDate() &&
    today.getMonth() === messageDate.getMonth() &&
    today.getFullYear() === messageDate.getFullYear();
  
  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    return parts[0][0].toUpperCase();
  }
  return 'U';
};

/**
 * Check if message is from current user
 * Handles both string and object ID comparisons
 */
export const isMessageFromCurrentUser = (senderId, currentUserId) => {
  if (!senderId || !currentUserId) return false;
  
  // Direct comparison
  if (senderId === currentUserId) return true;
  
  // String comparison (handles ObjectId vs string mismatch)
  if (senderId?.toString() === currentUserId?.toString()) return true;
  
  return false;
};

export const parseMessageData = (apiData) => {
  // Extract sender ID - check both _id and id formats
  const senderId = apiData.msg_from?._id || apiData.msg_from?.id || apiData.senderId;
  const recipientId = apiData.msg_to?._id || apiData.msg_to?.id || apiData.recipientId;
  
  return {
    id: apiData._id || apiData.id || Date.now().toString(),
    messageId: apiData._id || apiData.id,
    chatId: apiData.chatId,
    senderName: apiData.msg_from?.name || apiData.senderName || 'Unknown',
    senderInitials: getInitials(apiData.msg_from?.name || apiData.senderName),
    message: apiData.msg || apiData.message || '',
    timestamp: new Date(apiData.createdAt || Date.now()),
    isFromCurrentUser: false, // Will be determined by comparing sender ID
    msgType: apiData.msg_type || 0,
    attachment: apiData.attachment,
    isRead: apiData.is_read === 1,
    senderId: senderId,
    recipientId: recipientId,
    serviceId: apiData.serviceId,
  };
};
