import axiosInstance from '../axios/axiosInstance';

/**
 * Chat API Service
 * Handles all chat-related API calls
 */

/**
 * Get chat messages for a customer
 * @param {string} customerId - Project Manager ID (if assigned) or Service ID (if not assigned)
 * @param {string} serviceId - Service ID
 * @returns {Promise} - Chat messages response
 */
// BOOKING_ID_PARAM_FIX_V1: accept bookingId so client reads from booking_<id> room.
export const getChatMessages = async (customerId, serviceId, bookingId) => {
  try {
    console.log('📡 API: GET /chat/messages/' + customerId);
    console.log('   └─ Customer ID (PM or Service):', customerId);
    console.log('   └─ Service ID:', serviceId);
    const response = await axiosInstance.get(`/chat/messages/${customerId}`, {
      params: { serviceId, ...(bookingId ? { bookingId } : {}) },
    });
    console.log('✅ API: Chat messages response:', response.data);
    // Return the full envelope { success, data, meta } so callers can rely on shape
    return response.data;
  } catch (error) {
    console.error('❌ API: Error fetching chat messages:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });
    
    // Return empty response instead of throwing
    // This lets the chat UI still load even if backend isn't ready
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.warn('⚠️ Backend endpoint not ready, returning empty messages');
      return {
        success: true,
        count: 0,
        total: 0,
        page: 1,
        totalPages: 0,
        data: [],
        message: 'Chat endpoint not available yet',
      };
    }
    
    throw error;
  }
};

/**
 * Send a text message
 * @param {string} customerId - Project Manager ID (if assigned) or Service ID (if not assigned)
 * @param {string} message - Message text
 * @param {string} serviceId - Service ID
 * @param {number} firstMsg - Optional: 1 if first message without PM assigned
 * @returns {Promise} - Send message response
 */
export const sendTextMessage = async (customerId, message, serviceId, firstMsg = null, bookingId = null) => {
  try {
    const body = {
      msg: message,
      msg_type: 0, // 0 = text message
      serviceId,
    };

    if (bookingId) {
      body.bookingId = bookingId;
    }

    if (firstMsg !== null) {
      body.first_msg = firstMsg;
    }

    console.log('📤 API: POST /chat/send/' + customerId, body);
    console.log('   └─ Customer ID (PM or Service):', customerId);
    console.log('   └─ Service ID:', serviceId);
    console.log('   └─ First Msg:', firstMsg);
    const response = await axiosInstance.post(`/chat/send/${customerId}`, body);
    console.log('✅ API: Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error sending text message:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });
    throw error;
  }
};

/**
 * Send a message with file attachment
 * @param {string} customerId - Project Manager ID (if assigned) or Service ID (if not assigned)
 * @param {File} file - File to upload
 * @param {string} serviceId - Service ID
 * @param {string} message - Optional message text
 * @param {number} msgType - Message type (1 = attachment)
 * @param {number} firstMsg - Optional: 1 if first message without PM assigned
 * @returns {Promise} - Send message response
 */
export const sendMessageWithAttachment = async (
  customerId,
  file,
  serviceId,
  message = '',
  msgType = 1,
  firstMsg = null,
  bookingId = null
) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('serviceId', serviceId);
    formData.append('msg_type', msgType);
    formData.append('msg', message);

    if (bookingId) {
      formData.append('bookingId', bookingId);
    }

    if (firstMsg !== null) {
      formData.append('first_msg', firstMsg);
    }

    console.log('📤 API: POST /chat/send/' + customerId + ' (with attachment)');
    console.log('   └─ Customer ID (PM or Service):', customerId);
    console.log('   └─ Service ID:', serviceId);
    console.log('   └─ File:', file.name);
    const response = await axiosInstance.post(`/chat/send/${customerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message with attachment:', error);
    throw error;
  }
};

/**
 * Send typing status
 * @param {string} customerId - Project Manager ID (if assigned) or Service ID (if not assigned)
 * @param {boolean} isTyping - Typing status
 * @param {string} serviceId - Service ID
 * @returns {Promise} - Typing status response
 */
export const sendTypingStatus = async (customerId, isTyping, serviceId) => {
  try {
    console.log('⌨️ API: POST /chat/typing/' + customerId, { isTyping, serviceId });
    const response = await axiosInstance.post(`/chat/typing/${customerId}`, {
      isTyping,
      serviceId,
    });
    return response.data?.data !== undefined ? response.data.data : response.data;
  } catch (error) {
    console.error('Error sending typing status:', error);
    throw error;
  }
};

/**
 * Mark message as seen
 * @param {string} messageId - Message ID
 * @returns {Promise} - Mark as seen response
 */
export const markMessageAsSeen = async (messageId) => {
  try {
    const response = await axiosInstance.post(`/chat/seen/${messageId}`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  } catch (error) {
    console.error('Error marking message as seen:', error);
    throw error;
  }
};
