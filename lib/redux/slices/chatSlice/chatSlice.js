/**
 * Chat Redux Slice
 *
 * Manages real-time chat state across the app:
 *
 *   messages       — bookingId → Message[] for the currently open room
 *   unreadCounts   — bookingId → number  (drives badge indicators in the nav)
 *   activeBookingId — which room is currently visible (clears unread on open)
 *   isConnected    — socket connection status (drives the "online" indicator)
 *   typingUsers    — bookingId → Set<userId>  (shows "Someone is typing…")
 *
 * Socket events (from chatSocketService) call these actions directly:
 *
 *   chatSocketService.on('message', (msg) =>
 *     dispatch(addMessage({ bookingId: msg.bookingId, message: msg }))
 *   );
 *
 * Unread counts auto-increment when a message arrives for any room that is
 * NOT the currently active room, and auto-clear when setActiveRoom() is called.
 */
import { createSlice } from '@reduxjs/toolkit';

/* ─── initial state ─────────────────────────────────────────────── */

const initialState = {
  /** Record<bookingId, Message[]> — only the active room is populated in memory */
  messages: {},

  /** Record<bookingId, number> — unread message counts per booking */
  unreadCounts: {},

  /** Booking ID of the currently open chat window, or null */
  activeBookingId: null,

  /** Whether the Socket.IO connection is live */
  isConnected: false,

  /** Record<bookingId, string[]> — user IDs currently typing in each room */
  typingUsers: {},
};

/* ─── slice ─────────────────────────────────────────────────────── */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * Set the active chat room.
     * Automatically clears unread count for that booking.
     */
    setActiveRoom(state, action) {
      const bookingId = action.payload;
      state.activeBookingId = bookingId;
      if (bookingId && state.unreadCounts[bookingId]) {
        state.unreadCounts[bookingId] = 0;
      }
    },

    /**
     * Bulk-load historical messages for a room (from REST API on room open).
     * Replaces any previously cached messages for the same booking.
     */
    setMessages(state, action) {
      const { bookingId, messages } = action.payload;
      if (!bookingId) return;
      state.messages[bookingId] = messages || [];
    },

    /**
     * Append a single incoming message to its room.
     * Increments unread count if the room is not currently active.
     */
    addMessage(state, action) {
      const { bookingId, message } = action.payload;
      if (!bookingId || !message) return;

      if (!state.messages[bookingId]) {
        state.messages[bookingId] = [];
      }
      // Deduplicate by message._id or message.id
      const msgId = message._id || message.id;
      const alreadyExists = msgId
        ? state.messages[bookingId].some((m) => (m._id || m.id) === msgId)
        : false;
      if (!alreadyExists) {
        state.messages[bookingId].push(message);
      }

      // Increment unread only for rooms not currently open
      if (state.activeBookingId !== bookingId) {
        state.unreadCounts[bookingId] = (state.unreadCounts[bookingId] || 0) + 1;
      }
    },

    /**
     * Mark all messages in a room as read (called when user opens / focuses the room).
     */
    markRoomRead(state, action) {
      const bookingId = action.payload;
      if (bookingId) {
        state.unreadCounts[bookingId] = 0;
      }
    },

    /**
     * Update socket connection status.
     */
    setConnected(state, action) {
      state.isConnected = !!action.payload;
    },

    /**
     * Update typing indicator state for a room.
     * payload: { bookingId, userId, isTyping }
     */
    setTyping(state, action) {
      const { bookingId, userId, isTyping } = action.payload;
      if (!bookingId || !userId) return;
      if (!state.typingUsers[bookingId]) {
        state.typingUsers[bookingId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[bookingId].includes(userId)) {
          state.typingUsers[bookingId].push(userId);
        }
      } else {
        state.typingUsers[bookingId] = state.typingUsers[bookingId].filter(
          (id) => id !== userId,
        );
      }
    },

    /**
     * Remove messages and unread count for a specific booking from memory.
     * Call when the user navigates away from a chat room to free memory.
     */
    clearRoom(state, action) {
      const bookingId = action.payload;
      delete state.messages[bookingId];
      delete state.unreadCounts[bookingId];
      delete state.typingUsers[bookingId];
    },

    /**
     * Full reset — called on logout.
     */
    resetChat() {
      return initialState;
    },
  },
});

/* ─── actions ───────────────────────────────────────────────────── */

export const {
  setActiveRoom,
  setMessages,
  addMessage,
  markRoomRead,
  setConnected,
  setTyping,
  clearRoom,
  resetChat,
} = chatSlice.actions;

/* ─── selectors ─────────────────────────────────────────────────── */

/** Total unread message count across all rooms — used for nav badge */
export const selectUnreadTotal = (state) =>
  Object.values(state.chat.unreadCounts).reduce((sum, n) => sum + (n || 0), 0);

/** Unread count for a specific booking */
export const selectUnreadForBooking = (bookingId) => (state) =>
  state.chat.unreadCounts[bookingId] || 0;

/** Messages for the currently active room */
export const selectActiveMessages = (state) => {
  const id = state.chat.activeBookingId;
  return id ? (state.chat.messages[id] || []) : [];
};

/** Messages for a specific booking */
export const selectMessagesForBooking = (bookingId) => (state) =>
  state.chat.messages[bookingId] || [];

/** Whether Socket.IO is connected */
export const selectChatConnected = (state) => state.chat.isConnected;

/** Typing users for the active room */
export const selectTypingUsers = (bookingId) => (state) =>
  state.chat.typingUsers[bookingId] || [];

export default chatSlice.reducer;
