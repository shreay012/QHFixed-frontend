# QuickHire — Backend Integration & Services Documentation

> This document covers how the frontend communicates with the backend: the HTTP client configuration, all API service modules, the real-time WebSocket service, Redux async thunks, data models, and error-handling patterns.

---

## Table of Contents

1. [HTTP Client — Axios Instance](#1-http-client--axios-instance)
2. [Authentication Service (`authApi.js`)](#2-authentication-service-authapiJs)
3. [Booking Service (`bookingApi.js`)](#3-booking-service-bookingapiJs)
4. [Chat HTTP Service (`chatApi.js`)](#4-chat-http-service-chatapiJs)
5. [Chat WebSocket Service (`chatSocketService.js`)](#5-chat-websocket-service-chatsocketservicejs)
6. [Payment Service (`paymentApi.js`)](#6-payment-service-paymentapiJs)
7. [Ticket Service (`ticketApi.js`)](#7-ticket-service-ticketapiJs)
8. [Notifications Service (`notificationsApi.js`)](#8-notifications-service-notificationsapiJs)
9. [Dashboard Service (`dashboardApi.js`)](#9-dashboard-service-dashboardapiJs)
10. [Discover Service (`discoverService.js`)](#10-discover-service-discoverservicejs)
11. [Miscellaneous Service (`miscellaneousApi.js`)](#11-miscellaneous-service-miscellaneousapiJs)
12. [Redux Async Thunk Layer](#12-redux-async-thunk-layer)
13. [Data Models & Response Shapes](#13-data-models--response-shapes)
14. [Error Handling Patterns](#14-error-handling-patterns)
15. [Security Considerations](#15-security-considerations)

---

## 1. HTTP Client — Axios Instance

**File:** `lib/axios/axiosInstance.js`

All API calls go through a single configured Axios instance.

### Base Configuration

```js
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // e.g. https://api.quickhire.services
  timeout: 30000,   // 30-second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Public vs Protected Endpoints

The following endpoints bypass authentication and are treated as public:

```
/auth/send-otp
/auth/verify-otp
/auth/guest-access
/miscellaneous/contact-us
```

Any other endpoint automatically has the JWT token injected.

### Request Interceptor

```
For protected endpoints:
  1. Read localStorage.getItem('token')       (user token)
  2. Read localStorage.getItem('guestToken')  (guest token)
  3. Read localStorage.getItem('userType')    ('user' | 'guest')

Priority rule:
  - If userType === 'user' and token exists  → Bearer {token}
  - Else if userType === 'guest' and guestToken exists → Bearer {guestToken}
  - Else → no Authorization header (request proceeds without auth)
```

### Response Interceptor

```
On HTTP 401 (Unauthorized):
  - Clears localStorage 'token'
  - Does NOT auto-redirect (redirect is commented out to avoid loops)

On all other errors:
  - Passes error through to the calling service/thunk
```

### FormData Uploads

Services that upload files (e.g., profile photo, chat attachments) pass `FormData` objects. The Axios instance detects `instanceof FormData` and sets `Content-Type: undefined`, letting the browser auto-set `multipart/form-data` with the correct boundary.

---

## 2. Authentication Service (`authApi.js`)

**File:** `lib/services/authApi.js`  
**Endpoints used:** `ENDPOINTS.AUTH`, `ENDPOINTS.USER`

### Methods

#### `authService.sendOtp(mobileNumber)`
- **HTTP:** `POST /auth/send-otp`
- **Body:** `{ mobile: string, role: "user" }`
- **Purpose:** Sends an OTP SMS to the provided mobile number. Always sends `role: "user"` to distinguish from admin logins.

#### `authService.verifyOtp(mobileNumber, otp, fcmToken = "")`
- **HTTP:** `POST /auth/verify-otp`
- **Body:** `{ mobile: string, otp: string, fcmToken: string }`
- **Purpose:** Verifies the OTP. On success, the backend returns a JWT and user object. `fcmToken` is the Firebase Cloud Messaging token for push notifications (optional, defaults to `""`).
- **Response:** `{ success: true, data: { token, user, isNewUser } }`

#### `authService.logout()`
- **HTTP:** `POST /auth/logout`
- **Purpose:** Invalidates the server-side session.
- **Note:** Frontend also clears localStorage and disconnects sockets (see `lib/utils/authHelpers.js::logout()`).

#### `authService.updateProfile(profileData)`
- **HTTP:** `PUT /user/profile`
- **Body:** JSON object or `FormData` (for avatar upload)
- **FormData handling:** When `profileData instanceof FormData`, the `Content-Type` header is set to `undefined`, allowing the browser to set `multipart/form-data` with correct boundary.

#### `authService.getProfile()`
- **HTTP:** `GET /user/profile`
- **Returns:** `{ data: { name, email, mobile, ongoingJobs, completedJobs } }`

#### `authService.guestAccess()`
- **HTTP:** `POST /auth/guest-access`
- **Public endpoint** (no auth header)
- **Returns:** `{ data: { token } }` — a guest JWT for unauthenticated browsing.

---

## 3. Booking Service (`bookingApi.js`)

**File:** `lib/services/bookingApi.js`  
**Endpoints used:** `ENDPOINTS.BOOKING`, `ENDPOINTS.SERVICES`, `ENDPOINTS.JOBS`

### Methods

#### Service Discovery

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getServices()` | GET | `/services` | Fetch all available services |
| `getServiceById(serviceId)` | GET | `/services/:id` | Fetch single service with full details |
| `getServicesByCategory(category)` | GET | `/services/category/:category` | Filter services by category |
| `getHoursAvailability(duration)` | GET | `/admin/availability?duration=:duration` | Available time slots for a given duration |

#### Booking CRUD

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `createBooking(bookingData)` | POST | `/bookings` | Create a new booking |
| `getAllBookings()` | GET | `/bookings` | Retrieve all user bookings |
| `getBookingById(bookingId)` | GET | `/bookings/:id` | Retrieve a specific booking |
| `updateBooking(bookingId, updateData)` | PATCH | `/bookings/:id` | Update booking details |
| `cancelBooking(bookingId, reason)` | POST | `/bookings/:id/cancel` | Cancel with reason |
| `extendBooking(bookingId, extensionData)` | POST | `/bookings/:id/extend` | Extend booking duration |
| `getBookingHistory(userId)` | GET | `/bookings/history` | Fetch booking history |

#### Customer-Specific Booking Queries

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getCustomerBookingsByStatus(status)` | GET | `/customer/bookings?status=:status` | Filter bookings by status |
| `getOngoingBookings({ page, pageSize, statuses })` | GET | `/customer/bookings?servicesStatus=:statuses&page=:page&pageSize=:pageSize` | Paginated ongoing bookings |
| `getCompletedBookings({ page, pageSize })` | GET | `/customer/bookings?servicesStatus=completed&page=:page&pageSize=:pageSize` | Paginated completed bookings |
| `getBookingTimeline(bookingId, serviceId)` | GET | `/bookingHistories/getBookingHistory?bookingId=:id&serviceId=:id` | Status timeline for a booking |

#### Job Management

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getJobById(jobId)` | GET | `/jobs/:id` | Fetch full job details |
| `createJob(jobData)` | POST | `/jobs` | Create a new job record |
| `updateJob(jobId, jobData)` | PUT | `/jobs/:id?service=create` | Update job record |
| `getPricing(pricingData)` | POST | `/jobs/pricing` | Calculate job price |
| `getAvailableSlots(serviceId, date)` | GET | `/bookings/available-slots?serviceId=…&date=…` | Time slot availability |

### Booking Status Values

| Status | Description |
|---|---|
| `pending` | Booking created, awaiting confirmation |
| `confirmed` | Booking confirmed by admin |
| `assigned_to_pm` | Project Manager assigned |
| `in_progress` | Work actively in progress |
| `completed` | Work completed |
| `cancelled` | Booking cancelled |

---

## 4. Chat HTTP Service (`chatApi.js`)

**File:** `lib/services/chatApi.js`

The chat feature uses a hybrid approach: HTTP for initial message history and sending, Socket.IO for real-time delivery.

### Methods

#### `getChatMessages(customerId, serviceId)`
- **HTTP:** `GET /chat/messages/:customerId?serviceId=:serviceId`
- **Parameters:**
  - `customerId`: Project Manager ID (if assigned) OR Service ID (if PM not yet assigned)
  - `serviceId`: The service associated with the booking
- **Graceful degradation:** If backend returns 500 or 404, returns an empty message list instead of throwing (allows chat UI to load even if the endpoint isn't ready).
- **Response shape:**
```js
{
  success: true,
  count: number,
  total: number,
  page: number,
  totalPages: number,
  data: Message[]
}
```

#### `sendTextMessage(customerId, message, serviceId, firstMsg = null)`
- **HTTP:** `POST /chat/send/:customerId`
- **Body:**
```js
{
  msg: string,
  msg_type: 0,          // 0 = text message
  serviceId: string,
  first_msg?: number    // 1 = first message without PM, omitted otherwise
}
```
- **`firstMsg`:** Set to `1` when the customer sends the first message in a new chat before a PM is assigned.

#### `sendMessageWithAttachment(customerId, file, serviceId, message, msgType, firstMsg)`
- **HTTP:** `POST /chat/send/:customerId` (multipart/form-data)
- **FormData fields:**
```
attachment  → File object
serviceId   → string
msg_type    → 1 (attachment)
msg         → optional text alongside the file
first_msg   → optional, 1 for first unassigned message
```

#### `markMessageAsSeen(messageId)`
- **HTTP:** `POST /chat/seen/:messageId` (or PATCH — verify with backend)
- **Purpose:** Marks a specific message as read.

### Message Types

| `msg_type` | Meaning |
|---|---|
| `0` | Plain text message |
| `1` | File / attachment message |

---

## 5. Chat WebSocket Service (`chatSocketService.js`)

**File:** `lib/services/chatSocketService.js`  
**Class:** `ChatSocketService` (exported as singleton)

### Connection Architecture

The singleton is initialized once at app start. It maintains one active Socket.IO connection at a time.

```
Client                          Server (Socket.IO)
  │                                   │
  ├── connect({ roomId, userId, ... }) │
  │   token sent in query + auth       │
  │──────────────────────────────────►│
  │                                   │ JOIN room: ${pmId}_service_${serviceId}
  │◄──────────────────────────────────│ event: 'connected'
  │                                   │
  │   onMessageReceived(msg)           │
  │◄──────────────────────────────────│ event: 'message' / 'new_message'
  │                                   │
  │   onTypingStatusReceived(data)     │
  │◄──────────────────────────────────│ event: 'typing'
  │                                   │
  │   onMessageSeen(data)              │
  │◄──────────────────────────────────│ event: 'message_seen'
  │                                   │
  │   onNotificationReceived(data)     │
  │◄──────────────────────────────────│ event: 'notification'
  │                                   │
  ├── disconnect()                    │
  │──────────────────────────────────►│ leaves all rooms
```

### Room ID Convention

```
Chat room:               ${pmId}_service_${serviceId}
Notification room:       ${userId}              (no serviceId)
Support ticket room:     ticket_${ticketId}     (or similar)
```

### Connection Lifecycle

```
chatSocketService.connect(config)
  → if same room & already connected: skip (dedup)
  → if old socket exists: disconnect()
  → create new io(baseUrl, socketOptions)
  → emit 'join' or server auto-assigns room from token
  → trigger onConnected()

chatSocketService.disconnect()
  → socket.disconnect()
  → isConnected = false
  → currentRoomId = null
```

### Reconnection Behavior

Socket.IO is configured with automatic reconnection:
- `reconnection: true`
- `reconnectionAttempts: 5`
- `reconnectionDelay: 1000ms`
- On exhausted attempts: `onDisconnected()` is called

### Notification Persistence

The `onNotificationReceived` callback is **preserved across chat reconnections**. When `chatSocketService.connect()` is called for a new chat room, any previously registered notification callback is carried forward unless a new one is explicitly provided.

---

## 6. Payment Service (`paymentApi.js`)

**File:** `lib/services/paymentApi.js`  
**Payment Gateway:** Razorpay

### Methods

#### `paymentService.createOrder(jobId, amount)`
- **HTTP:** `POST /payments/create-order`
- **Body:** `{ jobId: string, amount: number }`
- **Returns:** Razorpay order object including `orderId`, `amount`, `currency`

#### `paymentService.verifyPayment(paymentData)`
- **HTTP:** `POST /payments/verify`
- **Body:** Razorpay callback payload:
```js
{
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string
}
```
- **Purpose:** Server-side HMAC signature verification. Never verify payments client-side.

#### `paymentService.getPaymentStatus(paymentId)`
- **HTTP:** `GET /payments/status/:paymentId`
- **Returns:** Current payment status object

#### `paymentService.getPaymentHistory({ page, limit })`
- **HTTP:** `GET /payments/history?page=:page&limit=:limit`
- **Returns:** Paginated list of payments

#### `paymentService.downloadInvoice(jobId)`
- **HTTP:** `POST /payments/invoice/download/:jobId`
- **Response type:** `blob` (binary PDF)
- **Usage:** Trigger browser file download from the blob response.

### Razorpay Integration Flow

```
1. User confirms booking
   → createOrder(jobId, amount)  → backend creates Razorpay order
   → frontend initializes Razorpay SDK with orderId

2. User completes payment in Razorpay modal
   → Razorpay calls frontend callback with payment_id, order_id, signature

3. Frontend calls verifyPayment({ payment_id, order_id, signature })
   → backend verifies HMAC signature
   → updates booking/job status to 'paid'

4. Frontend redirects to /payment-success
```

---

## 7. Ticket Service (`ticketApi.js`)

**File:** `lib/services/ticketApi.js`  
**Purpose:** Customer support ticket management

### Methods

#### `ticketService.getAllTickets({ page, limit })`
- **HTTP:** `GET /tickets/user/all-tickets?page=:page&limit=:limit`
- **Default:** `page=1, limit=100`
- **Response:** `{ data: { tickets: Ticket[] } }`

#### `ticketService.getTicketMessages(ticketId)`
- **HTTP:** `GET /ticket-messages/:ticketId`
- **Returns:** Message history for a support ticket

#### `ticketService.createTicket(data)`
- **HTTP:** `POST /tickets/ticket`
- **Body:** `{ subject: string, description: string, ... }`

### Support Chat

The `/support-chat/[id]` page combines:
1. HTTP: `getAllTickets` to fetch ticket details
2. Socket.IO: `chatSocketService.connect({ ticketId })` for real-time message exchange with the support team

---

## 8. Notifications Service (`notificationsApi.js`)

**File:** `lib/services/notificationsApi.js`

### Methods

#### `notificationsService.getAllNotifications(page, limit)`
- **HTTP:** `GET /notifications/allnotifications?page=:page&limit=:limit`
- **Defaults:** `page=1, limit=10`
- **Returns:** Paginated notification list

#### `notificationsService.deleteNotification(id)`
- **HTTP:** `DELETE /notifications/deletenotification/:id`
- **Purpose:** Remove a specific notification

### Push Notifications (Socket)

Real-time notifications are delivered via the Socket.IO `notification` event in `chatSocketService`. The `SocketProvider` receives these and calls `showToast` immediately. The notification is also appended to local state for display in the `NotificationDrawer`.

---

## 9. Dashboard Service (`dashboardApi.js`)

**File:** `lib/services/dashboardApi.js`

#### `dashboardService.getStats()`
- **HTTP:** `GET /dashboard/stats`
- **Returns:**
```js
{
  unreadNotificationsCount: number,
  cartItemCount: number,
  totalPendingJobs: number,
  // ...other stats
}
```
- **Usage:** Called in Header whenever `isAuthenticated` changes. Stats power the notification and cart badge counts.

---

## 10. Discover Service (`discoverService.js`)

**File:** `lib/services/discoverService.js`

Thin wrapper that mirrors `bookingApi` for the discovery/browse flow.

| Method | HTTP | Endpoint |
|---|---|---|
| `getAllServices()` | GET | `/services` |
| `getServiceById(serviceId)` | GET | `/services/:id` |

---

## 11. Miscellaneous Service (`miscellaneousApi.js`)

**File:** `lib/services/miscellaneousApi.js`

#### `miscellaneousService.contactUs(contactData)`
- **HTTP:** `POST /miscellaneous/contact-us`
- **Public endpoint** (no auth required)
- **Input shape:**
```js
{
  name: string,
  email: string,
  phone: string,
  organization?: string,
  description: string
}
```
- **Mapped body sent to backend:**
```js
{
  name: string,
  email: string,
  phone_number: string,
  organization: string,   // defaults to "" if not provided
  description: string
}
```

---

## 12. Redux Async Thunk Layer

All API calls from Redux slices use `createAsyncThunk` from Redux Toolkit. The pattern is consistent across all slices:

### Standard Thunk Pattern

```js
export const thunkName = createAsyncThunk(
  'sliceName/actionName',
  async (arg, { rejectWithValue }) => {
    try {
      const response = await someService.method(arg);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Fallback error message');
    }
  }
);
```

### State Shape Template (all async slices)

```js
{
  data: null | object | array,
  isLoading: false,
  error: null | string | object,
}
```

### Fulfilled / Rejected Handling

All slices handle the three lifecycle actions:

```js
.addCase(thunk.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(thunk.fulfilled, (state, action) => {
  state.isLoading = false;
  state.data = action.payload;
})
.addCase(thunk.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
```

---

## 13. Data Models & Response Shapes

### Standard API Response Envelope

```js
{
  success: boolean,
  message?: string,
  data: object | array | null,
}
```

Some endpoints wrap data further:
```js
{
  success: true,
  data: {
    services: Service[],   // for /services
    tickets: Ticket[],     // for /tickets/user/all-tickets
  }
}
```

### User Object

```js
{
  _id: string,
  name: string,
  email: string,
  mobile: string,
  ongoingJobs: number,
  completedJobs: number,
  avatar?: string,         // URL
  isNewUser?: boolean,
}
```

**Note:** `localStorage.getItem('user')` may store the raw API response `{ success: true, data: {...} }` OR just the user object. Both `userResponse.data` and `userResponse` are handled in all parsing logic.

### Service Object

```js
{
  _id: string,
  name: string,
  description: string,
  category: string,
  technologies: string[],
  hourlyRate: number,
  availability: object,
  faqs: FAQ[],
  imageUrl?: string,
}
```

### Booking Object

```js
{
  _id: string,
  serviceId: string,
  jobId: string,
  customerId: string,
  pmId?: string,           // Project Manager (assigned after confirmation)
  status: BookingStatus,   // 'pending' | 'confirmed' | 'assigned_to_pm' | 'in_progress' | 'completed' | 'cancelled'
  startTime: string,       // ISO date
  endTime: string,
  duration: number,        // hours
  amount: number,
  createdAt: string,
}
```

### Job Object

```js
{
  _id: string,
  bookingId: string,
  serviceId: string,
  title: string,
  description: string,
  status: string,
  pricing: {
    basePrice: number,
    totalPrice: number,
    breakdown: object,
  },
  paymentStatus: 'pending' | 'paid',
}
```

### Message Object (Chat)

```js
{
  _id: string,
  senderId: string,
  senderType: 'customer' | 'pm' | 'admin',
  msg: string,
  msg_type: 0 | 1,        // 0 = text, 1 = attachment
  attachment?: string,     // URL for files
  createdAt: string,
  seen: boolean,
}
```

### Ticket Object

```js
{
  _id: string,
  subject: string,
  description: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  createdAt: string,
  updatedAt: string,
}
```

### Notification Object

```js
{
  _id: string,
  type: string,            // 'booking_update' | 'payment' | 'message' | 'general'
  title: string,
  message: string,
  read: boolean,
  createdAt: string,
}
```

---

## 14. Error Handling Patterns

### Axios Level

```
- Network/timeout errors → error.message (no response object)
- HTTP errors → error.response.status + error.response.data
- 401 → token cleared from localStorage
```

### Service Level

Each service method throws the error upward unless a specific graceful fallback is needed. Only `getChatMessages` has special handling: 500/404 returns empty data so the chat UI can still render.

### Redux Thunk Level

All thunks use `rejectWithValue` to pass error payloads to the slice:

```js
catch (error) {
  return rejectWithValue(error.response?.data || 'Human-readable fallback');
}
```

Components read `state.sliceName.error` and display user-facing messages.

### Component Level

Components use `react-hot-toast` (via `useToast()`) to show transient notifications:

```js
const { showToast } = useToast();
showToast('error', 'Payment Failed', 'Please try again.');
```

---

## 15. Security Considerations

### Token Storage

| Token | Location | Risk | Mitigation |
|---|---|---|---|
| User JWT (`token`) | `localStorage` | XSS accessible | Input sanitization; no eval/innerHTML |
| Guest JWT (`guestToken`) | `localStorage` | XSS accessible | Short-lived, limited permissions |

**Note:** `localStorage` is used for convenience and SSR compatibility. For higher security (financial apps), consider `httpOnly` cookies. If that migration is pursued, remove all `localStorage.getItem('token')` reads and rely on cookie-based auth.

### Public Endpoints

Only four endpoints bypass auth:
1. `POST /auth/send-otp`
2. `POST /auth/verify-otp`
3. `POST /auth/guest-access`
4. `POST /miscellaneous/contact-us`

All others require a valid Bearer token.

### Payment Security

- Razorpay signature verification is done **server-side** via `POST /payments/verify`.
- The frontend never performs cryptographic verification — it only forwards the Razorpay callback payload to the backend.
- Invoice downloads use `responseType: 'blob'` — no client-side PDF parsing.

### File Uploads

- Chat attachments use `FormData` with `multipart/form-data`.
- File type and size validation should be enforced on the server.
- The frontend does not validate MIME types before upload — this is a known gap.

### OTP Security

- OTP is a 4-digit code (implied by `["", "", "", ""]` state in login).
- Backend should enforce: rate limiting on OTP send, expiry time, attempt limiting.
- FCM token is optional (`""` default) — not a security concern.

### 401 Handling

On receiving HTTP 401:
- `token` is removed from localStorage.
- Redirect to `/login` is commented out to avoid infinite redirect loops (intentional — the login redirect should be re-evaluated if issues arise).

---

*End of Backend Integration & Services Documentation*
