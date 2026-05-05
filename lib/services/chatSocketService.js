import { io } from 'socket.io-client';

/**
 * Chat WebSocket Service — singleton that manages the Socket.IO connection
 * for real-time chat and global push notifications.
 */
class ChatSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoomId = null;
    this.currentUserId = null;
    this.baseUrl = null;
    this.callbacks = {
      onMessageReceived: null,
      onConnected: null,
      onDisconnected: null,
      onError: null,
      onTypingStatusReceived: null,
      onMessageSeen: null,
      onNotificationReceived: null,
    };
  }

  connect(config) {
    const {
      baseUrl,
      roomId,
      userId,
      serviceId,
      authToken,
      ticketId,
      onMessageReceived,
      onConnected,
      onDisconnected,
      onError,
      onTypingStatusReceived,
      onMessageSeen,
    } = config;

    // Skip if already connected to the same room
    if (this.socket && this.isConnected && this.currentRoomId === roomId && this.currentUserId === userId) {
      return;
    }

    this.baseUrl = baseUrl;
    this.currentUserId = userId;

    // CHAT_CALLBACK_PRESERVE_FIX_V1: callers that don't supply a particular
    // callback should NOT clobber an existing one. Previously SocketProvider
    // (which only cares about notifications) would wipe ChatPanel's
    // onMessageReceived on every reconnect, so chat messages stopped showing
    // on the screen. Preserve every callback when the new config omits it.
    const prev = this.callbacks;
    this.callbacks = {
      onMessageReceived: onMessageReceived || prev.onMessageReceived,
      onConnected:       onConnected       || prev.onConnected,
      onDisconnected:    onDisconnected    || prev.onDisconnected,
      onError:           onError           || prev.onError,
      onTypingStatusReceived: onTypingStatusReceived || prev.onTypingStatusReceived,
      onMessageSeen:     onMessageSeen     || prev.onMessageSeen,
      onRefreshMessages: config.onRefreshMessages    || prev.onRefreshMessages,
      onNotificationReceived: config.onNotificationReceived || prev.onNotificationReceived,
    };

    // Canonical rooms already contain `_service_` or `_pending_`
    const isCanonical = typeof roomId === 'string' && (roomId.includes('_service_') || roomId.includes('_pending_'));
    const actualRoomId = isCanonical || !serviceId ? roomId : `${roomId}_service_${serviceId}`;
    this.currentRoomId = actualRoomId;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketOptions = {
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    };

    if (authToken) {
      const cleanToken = authToken.startsWith('Bearer ') ? authToken.substring(7) : authToken;
      socketOptions.query = { token: cleanToken };
      socketOptions.auth = { token: cleanToken };
    }

    try {
      this.socket = io(baseUrl, socketOptions);
    } catch (err) {
      console.error('ChatSocket: failed to create socket:', err);
      if (this.callbacks.onError) this.callbacks.onError('Failed to create socket: ' + err.message);
      return;
    }

    this._setupEventListeners(actualRoomId, userId, ticketId);
  }

  _setupEventListeners(roomId, userId, ticketId) {
    this.socket.on('connect', () => {
      this.isConnected = true;

      if (ticketId) {
        this.socket.emit('join-ticket-room', { ticketId });
      } else if (roomId) {
        this.socket.emit('chat:join', { roomId });
        this.socket.emit('join-room', roomId);
      }

      const userIdNum = parseInt(userId) || userId;
      this.socket.emit('user_online', userIdNum);
      this.socket.emit('join_user_room', userIdNum);

      if (this.callbacks.onConnected) this.callbacks.onConnected();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      if (this.callbacks.onDisconnected) this.callbacks.onDisconnected();
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      if (this.callbacks.onError) this.callbacks.onError(`Connection error: ${error.message}`);
    });

    this.socket.on('error', (error) => {
      if (this.callbacks.onError) this.callbacks.onError(`Socket error: ${error}`);
    });

    // All message event variants — backend may emit any of these
    const onMsg = (data) => {
      if (this.callbacks.onMessageReceived) this.callbacks.onMessageReceived(data);
    };
    this.socket.on('new-message', onMsg);
    this.socket.on('message:new', onMsg);
    this.socket.on('new_message', onMsg);
    this.socket.on('message', onMsg);
    this.socket.on('chat-message', onMsg);
    this.socket.on('receive-message', onMsg);

    // Global push notifications
    this.socket.on('notification:new', (data) => {
      // Fire a browser event so Header badge updates regardless of mounted component
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
      }

      if (this.callbacks.onNotificationReceived) {
        this.callbacks.onNotificationReceived(data);
      }

      // If it's a chat notification, inject it as a message update
      if (data.type === 'chat' && data.route === '/chat') {
        if (this.callbacks.onRefreshMessages) {
          this.callbacks.onRefreshMessages();
        }
      }
    });

    // Typing indicators
    const typingListener = (data) => {
      if (this.callbacks.onTypingStatusReceived) {
        const senderId = data.senderId || data.userId;
        const { isTyping, ...rest } = data;
        this.callbacks.onTypingStatusReceived(senderId, isTyping, rest);
      }
    };
    this.socket.on('user_typing', typingListener);
    this.socket.on('typing', typingListener);

    this.socket.on('message_seen', (data) => {
      if (this.callbacks.onMessageSeen) this.callbacks.onMessageSeen(data);
    });
  }

  sendMessage(messageData) {
    const { message, recipientId, roomId, serviceId } = messageData;
    if (!this.isConnected) return;
    this.socket.emit('send-message', { roomId, message, recipientId, serviceId });
  }

  sendTicketMessage(messageData) {
    const { ticketId, message, token } = messageData;
    if (!this.isConnected) return false;
    this.socket.emit('send-ticket-message', {
      ticketId,
      message,
      timestamp: new Date().toISOString().slice(0, -1),
      token,
    });
    return true;
  }

  sendTypingStatus(isTyping, serviceId) {
    if (!this.isConnected) return;
    this.socket.emit('user_typing', { isTyping, serviceId, userId: this.currentUserId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentRoomId = null;
      this.currentUserId = null;
    }
  }

  getIsConnected() { return this.isConnected; }
  getCurrentRoomId() { return this.currentRoomId; }
}

export default new ChatSocketService();
