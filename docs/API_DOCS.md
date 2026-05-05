# QuickHire — API Reference Documentation

> **Base URL:** `NEXT_PUBLIC_API_URL` (e.g. `https://api.quickhire.services`)  
> **Protocol:** HTTPS + REST + WebSocket (Socket.IO)  
> **Authentication:** Bearer JWT token in `Authorization` header  
> **Content-Type:** `application/json` (unless noted as `multipart/form-data`)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Profile](#2-user-profile)
3. [Services (Catalog)](#3-services-catalog)
4. [Bookings](#4-bookings)
5. [Jobs & Pricing](#5-jobs--pricing)
6. [Payments](#6-payments)
7. [Chat (HTTP)](#7-chat-http)
8. [Tickets (Support)](#8-tickets-support)
9. [Notifications](#9-notifications)
10. [Dashboard](#10-dashboard)
11. [Miscellaneous](#11-miscellaneous)
12. [WebSocket Events](#12-websocket-events)
13. [Error Response Format](#13-error-response-format)
14. [HTTP Status Code Reference](#14-http-status-code-reference)

---

## 1. Authentication

All auth endpoints are **public** — no `Authorization` header required.

---

### `POST /auth/send-otp`

Send a one-time password to a mobile number.

**Request Body**
```json
{
  "mobile": "9876543210",
  "role": "user"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mobile` | string | Yes | 10-digit mobile number |
| `role` | string | Yes | Always `"user"` from the customer app |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error Responses**
| Status | Meaning |
|---|---|
| 400 | Invalid mobile number format |
| 429 | Rate limit exceeded — too many OTP requests |

---

### `POST /auth/verify-otp`

Verify OTP and receive authentication tokens.

**Request Body**
```json
{
  "mobile": "9876543210",
  "otp": "1234",
  "fcmToken": ""
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mobile` | string | Yes | Same mobile used in send-otp |
| `otp` | string | Yes | 4-digit OTP received via SMS |
| `fcmToken` | string | No | Firebase Cloud Messaging token for push notifications |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64a3f1b2c5d8e9f000000001",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "ongoingJobs": 2,
      "completedJobs": 5
    },
    "isNewUser": false
  }
}
```

| Field | Type | Description |
|---|---|---|
| `token` | string | JWT Bearer token — store in `localStorage.token` |
| `user` | object | User profile object |
| `isNewUser` | boolean | `true` if user needs to complete profile setup |

**Error Responses**
| Status | Meaning |
|---|---|
| 400 | OTP expired or invalid |
| 404 | Mobile number not found |

**Frontend Action After Success:**
- `isNewUser = true` → Show profile setup form, call `PUT /user/profile`
- `isNewUser = false` → Store `token` + `user` in `localStorage`, dispatch `setAuthFromStorage`, redirect to home

---

### `POST /auth/logout`

**Auth:** Required (Bearer token)

Invalidate the server-side session.

**Request Body:** Empty `{}`

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `POST /auth/guest-access`

**Auth:** Not required (public)

Obtain a guest token for unauthenticated browsing.

**Request Body:** Empty `{}`

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- Store as `localStorage.guestToken`
- Set `localStorage.userType = "guest"`
- Guest tokens have limited permissions: read-only service browsing

---

### `POST /auth/refresh`

Refresh an expired JWT token.

**Auth:** Required (expired Bearer token)

**Request Body:** Empty `{}`

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

---

## 2. User Profile

**Auth:** Required for all endpoints

---

### `GET /user/profile`

Retrieve the current authenticated user's profile.

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "64a3f1b2c5d8e9f000000001",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "avatar": "https://quickhire.services/avatars/user123.jpg",
    "ongoingJobs": 2,
    "completedJobs": 5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### `PUT /user/profile`

Update the current user's profile. Supports both JSON and multipart form data (for avatar upload).

**Content-Type:** `application/json` OR `multipart/form-data`

**JSON Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**FormData Fields** (for avatar upload)
```
name           → string
email          → string
avatar         → File (image/jpeg, image/png, image/webp)
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "64a3f1b2c5d8e9f000000001",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://quickhire.services/avatars/user123.jpg"
  }
}
```

---

## 3. Services (Catalog)

**Auth:** Guest token or user token accepted

---

### `GET /services`

Retrieve all available services.

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "_id": "64a3f1b2c5d8e9f000000010",
        "name": "React Developer",
        "description": "Expert React developer for your web project",
        "category": "frontend",
        "technologies": ["React", "Next.js", "TypeScript"],
        "hourlyRate": 50,
        "imageUrl": "https://quickhire.services/images/react-dev.jpg",
        "availability": {
          "monday": true,
          "tuesday": true
        },
        "faqs": [
          { "question": "...", "answer": "..." }
        ]
      }
    ]
  }
}
```

---

### `GET /services/:id`

Retrieve a single service by its ID.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Service `_id` from the catalog |

**Success Response** `200 OK` — same as single service object inside `data`

**Error Responses**
| Status | Meaning |
|---|---|
| 404 | Service not found |

---

### `GET /services/category/:category`

Filter services by category.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `category` | string | Category slug (e.g., `frontend`, `backend`, `design`, `qa`) |

**Success Response** `200 OK` — array of services in the given category

---

### `GET /admin/availability?duration=:duration`

Check available time slots for a given booking duration.

**Auth:** User token required

**Query Parameters**
| Param | Type | Required | Description |
|---|---|---|---|
| `duration` | number | Yes | Duration in hours (e.g., `8`, `16`, `40`) |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "availableSlots": [
      {
        "date": "2026-04-25",
        "slots": ["09:00", "10:00", "14:00"]
      }
    ]
  }
}
```

---

## 4. Bookings

**Auth:** User token required for all booking endpoints

---

### `POST /bookings`

Create a new booking.

**Request Body**
```json
{
  "serviceId": "64a3f1b2c5d8e9f000000010",
  "startTime": "2026-04-25T09:00:00Z",
  "duration": 8,
  "requirements": "Build a dashboard with charts",
  "technologies": ["React", "Chart.js"]
}
```

**Success Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "64b2g3c4d7e0f1000000020",
    "serviceId": "64a3f1b2c5d8e9f000000010",
    "customerId": "64a3f1b2c5d8e9f000000001",
    "status": "pending",
    "startTime": "2026-04-25T09:00:00Z",
    "duration": 8,
    "amount": 400,
    "createdAt": "2026-04-24T10:00:00Z"
  }
}
```

---

### `GET /bookings`

Get all bookings for the authenticated user.

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [ /* Booking[] */ ]
  }
}
```

---

### `GET /bookings/:id`

Get a specific booking by ID.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Booking `_id` |

**Success Response** `200 OK` — single booking object

---

### `PATCH /bookings/:id`

Update a booking's details.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Booking `_id` |

**Request Body** (partial update)
```json
{
  "requirements": "Updated requirements text",
  "startTime": "2026-04-26T10:00:00Z"
}
```

---

### `POST /bookings/:id/cancel`

Cancel a booking.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Booking `_id` |

**Request Body**
```json
{
  "reason": "Project scope changed"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### `POST /bookings/:id/extend`

Extend a booking's duration.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Booking `_id` |

**Request Body**
```json
{
  "additionalHours": 4,
  "newEndTime": "2026-04-25T17:00:00Z"
}
```

---

### `GET /bookings/history`

Get complete booking history for the authenticated user.

**Query Parameters**
| Param | Type | Description |
|---|---|---|
| `userId` | string | User ID (passed as query param) |

---

### `GET /customer/bookings`

Get customer bookings with flexible filtering and pagination.

**Query Parameters**
| Param | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filter by single status value |
| `servicesStatus` | string | No | Comma-separated status list (e.g., `confirmed,in_progress,assigned_to_pm`) |
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |

**Example Requests**
```
GET /customer/bookings?servicesStatus=confirmed,in_progress,assigned_to_pm&page=1&pageSize=10
GET /customer/bookings?servicesStatus=completed&page=1&pageSize=10
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [ /* Booking[] */ ],
    "total": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

---

### `GET /bookingHistories/getBookingHistory`

Retrieve the timeline/history of status changes for a booking.

**Query Parameters**
| Param | Type | Required | Description |
|---|---|---|---|
| `bookingId` | string | Yes | Booking `_id` |
| `serviceId` | string | Yes | Service `_id` |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "status": "pending",
      "timestamp": "2026-04-24T10:00:00Z",
      "note": "Booking created"
    },
    {
      "status": "confirmed",
      "timestamp": "2026-04-24T10:15:00Z",
      "note": "Confirmed by admin"
    },
    {
      "status": "assigned_to_pm",
      "timestamp": "2026-04-24T11:00:00Z",
      "note": "PM John Smith assigned"
    }
  ]
}
```

---

## 5. Jobs & Pricing

**Auth:** User token required

---

### `GET /jobs/:id`

Get full job details by ID.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Job `_id` |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "64b2g3c4d7e0f1000000030",
    "bookingId": "64b2g3c4d7e0f1000000020",
    "serviceId": "64a3f1b2c5d8e9f000000010",
    "title": "React Dashboard Development",
    "status": "in_progress",
    "paymentStatus": "paid",
    "pricing": {
      "basePrice": 400,
      "totalPrice": 400,
      "breakdown": {
        "hourlyRate": 50,
        "hours": 8
      }
    }
  }
}
```

---

### `POST /jobs`

Create a new job record (typically created automatically on booking, but can be created manually).

**Request Body**
```json
{
  "bookingId": "64b2g3c4d7e0f1000000020",
  "serviceId": "64a3f1b2c5d8e9f000000010",
  "title": "React Dashboard Development",
  "description": "Build a data dashboard"
}
```

---

### `PUT /jobs/:id?service=create`

Update a job record.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Job `_id` |

**Query Parameters**
| Param | Type | Value | Description |
|---|---|---|---|
| `service` | string | `"create"` | Required flag for the update operation |

**Request Body** — partial job fields to update

---

### `POST /jobs/pricing`

Calculate the price for a job configuration.

**Request Body**
```json
{
  "serviceId": "64a3f1b2c5d8e9f000000010",
  "duration": 8,
  "startTime": "2026-04-25T09:00:00Z"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "basePrice": 400,
    "totalPrice": 400,
    "currency": "INR",
    "breakdown": {
      "hourlyRate": 50,
      "hours": 8,
      "taxes": 0
    }
  }
}
```

---

## 6. Payments

**Auth:** User token required for all payment endpoints  
**Payment Gateway:** Razorpay

---

### `POST /payments/create-order`

Create a Razorpay payment order.

**Request Body**
```json
{
  "jobId": "64b2g3c4d7e0f1000000030",
  "amount": 400
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `jobId` | string | Yes | The job to pay for |
| `amount` | number | Yes | Amount in INR (or applicable currency) |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "orderId": "order_AbCdEfGhIjKlMn",
    "amount": 40000,
    "currency": "INR",
    "key": "rzp_live_xxxxxxxxxxxx"
  }
}
```

**Note:** `amount` is returned in **paise** (multiply by 100 from INR). Use `orderId` and `key` to initialize the Razorpay checkout widget.

---

### `POST /payments/verify`

Verify a completed Razorpay payment (server-side signature verification).

**Request Body**
```json
{
  "razorpay_payment_id": "pay_AbCdEfGhIjKlMn",
  "razorpay_order_id": "order_AbCdEfGhIjKlMn",
  "razorpay_signature": "HMAC_SHA256_signature_hex"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `razorpay_payment_id` | string | Yes | Payment ID from Razorpay callback |
| `razorpay_order_id` | string | Yes | Order ID from create-order response |
| `razorpay_signature` | string | Yes | HMAC-SHA256 signature for verification |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "pay_AbCdEfGhIjKlMn",
    "jobId": "64b2g3c4d7e0f1000000030",
    "status": "paid"
  }
}
```

**Error Response** `400 Bad Request`
```json
{
  "success": false,
  "message": "Payment verification failed - invalid signature"
}
```

---

### `GET /payments/status/:paymentId`

Get the current status of a payment.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `paymentId` | string | Razorpay payment ID |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_AbCdEfGhIjKlMn",
    "status": "captured",
    "amount": 40000,
    "currency": "INR",
    "createdAt": "2026-04-24T12:00:00Z"
  }
}
```

---

### `GET /payments/history`

Get paginated payment history for the current user.

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "64c3h4d5e8f1g2000000040",
        "paymentId": "pay_AbCdEfGhIjKlMn",
        "jobId": "64b2g3c4d7e0f1000000030",
        "amount": 400,
        "currency": "INR",
        "status": "captured",
        "createdAt": "2026-04-24T12:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### `POST /payments/invoice/download/:jobId`

Download a payment invoice as a PDF.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `jobId` | string | Job `_id` |

**Request Body:** Empty `{}`

**Response**
- **Content-Type:** `application/pdf`
- **Body:** Binary PDF blob
- **Frontend usage:** Create a blob URL and trigger browser download

```js
const response = await paymentService.downloadInvoice(jobId);
const url = URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = `invoice-${jobId}.pdf`;
link.click();
```

---

## 7. Chat (HTTP)

**Auth:** User token required

---

### `GET /chat/messages/:customerId`

Retrieve the message history for a chat room.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `customerId` | string | Project Manager ID (if PM assigned) OR Service ID (if not yet assigned) |

**Query Parameters**
| Param | Type | Required | Description |
|---|---|---|---|
| `serviceId` | string | Yes | Service ID for the chat context |

**Success Response** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "64d4i5j6k9l2m3000000050",
      "senderId": "64a3f1b2c5d8e9f000000001",
      "senderType": "customer",
      "msg": "Hello, I need help with the dashboard",
      "msg_type": 0,
      "createdAt": "2026-04-24T13:00:00Z",
      "seen": true
    },
    {
      "_id": "64d4i5j6k9l2m3000000051",
      "senderId": "64e5j6k7l0m3n4000000002",
      "senderType": "pm",
      "msg": "Hi! I am your PM. Let's get started.",
      "msg_type": 0,
      "createdAt": "2026-04-24T13:05:00Z",
      "seen": false
    }
  ]
}
```

**Graceful Degradation:** Frontend treats 404 and 500 as empty message lists (not errors).

---

### `POST /chat/send/:customerId`

Send a text message.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `customerId` | string | PM ID (if assigned) or Service ID (if not assigned) |

**Request Body**
```json
{
  "msg": "Hello, I have a question about the project",
  "msg_type": 0,
  "serviceId": "64a3f1b2c5d8e9f000000010",
  "first_msg": 1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `msg` | string | Yes | Message text content |
| `msg_type` | number | Yes | `0` = text, `1` = attachment |
| `serviceId` | string | Yes | Service context for the message |
| `first_msg` | number | No | `1` if this is the first message without a PM assigned |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "64d4i5j6k9l2m3000000052",
    "msg": "Hello, I have a question about the project",
    "senderId": "64a3f1b2c5d8e9f000000001",
    "senderType": "customer",
    "createdAt": "2026-04-24T14:00:00Z"
  }
}
```

---

### `POST /chat/send/:customerId` (with attachment)

Send a message with a file attachment.

**Content-Type:** `multipart/form-data`

**FormData Fields**
| Field | Type | Required | Description |
|---|---|---|---|
| `attachment` | File | Yes | The file to upload |
| `serviceId` | string | Yes | Service context |
| `msg_type` | number | Yes | `1` for attachment |
| `msg` | string | No | Optional text alongside the file |
| `first_msg` | number | No | `1` for first message |

**Success Response** — same as text message, with `attachment` URL in response data

---

### `POST /chat/seen/:messageId`

Mark a message as read/seen.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `messageId` | string | Message `_id` to mark as seen |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Message marked as seen"
}
```

---

## 8. Tickets (Support)

**Auth:** User token required

---

### `GET /tickets/user/all-tickets`

Get all support tickets for the current user with pagination.

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 100 | Items per page |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "_id": "64e5k6l7m0n3o4000000060",
        "subject": "Issue with PM communication",
        "description": "The PM hasn't responded in 24 hours",
        "status": "open",
        "createdAt": "2026-04-23T10:00:00Z",
        "updatedAt": "2026-04-24T09:00:00Z"
      }
    ],
    "total": 3,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### `GET /ticket-messages/:ticketId`

Get all messages for a specific support ticket.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `ticketId` | string | Ticket `_id` |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f6l7m8n1o4p5000000070",
      "ticketId": "64e5k6l7m0n3o4000000060",
      "senderId": "64a3f1b2c5d8e9f000000001",
      "senderType": "customer",
      "message": "The PM hasn't responded in 24 hours",
      "createdAt": "2026-04-23T10:00:00Z"
    }
  ]
}
```

---

### `POST /tickets/ticket`

Create a new support ticket.

**Request Body**
```json
{
  "subject": "Issue with PM communication",
  "description": "The PM hasn't responded in 24 hours",
  "bookingId": "64b2g3c4d7e0f1000000020"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | Short title for the issue |
| `description` | string | Yes | Detailed description |
| `bookingId` | string | No | Related booking ID if applicable |

**Success Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "64e5k6l7m0n3o4000000060",
    "subject": "Issue with PM communication",
    "status": "open",
    "createdAt": "2026-04-24T15:00:00Z"
  }
}
```

---

## 9. Notifications

**Auth:** User token required

---

### `GET /notifications/allnotifications`

Get paginated notifications for the current user.

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "64g7m8n9o2p5q6000000080",
        "type": "booking_update",
        "title": "Booking Confirmed",
        "message": "Your React Developer booking has been confirmed",
        "read": false,
        "createdAt": "2026-04-24T11:00:00Z"
      }
    ],
    "total": 12,
    "unreadCount": 3,
    "page": 1,
    "totalPages": 2
  }
}
```

**Notification Types**
| `type` | Description |
|---|---|
| `booking_update` | Booking status changed (confirmed, assigned, completed) |
| `payment` | Payment received or failed |
| `message` | New chat message from PM or support |
| `general` | Platform announcements |

---

### `DELETE /notifications/deletenotification/:id`

Delete a specific notification.

**Path Parameters**
| Param | Type | Description |
|---|---|---|
| `id` | string | Notification `_id` |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## 10. Dashboard

**Auth:** User token required

---

### `GET /dashboard/stats`

Get aggregated stats for the authenticated user — powers Header badge counts.

**Success Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "unreadNotificationsCount": 3,
    "cartItemCount": 1,
    "totalPendingJobs": 2,
    "ongoingBookingsCount": 2,
    "completedBookingsCount": 5
  }
}
```

---

## 11. Miscellaneous

---

### `POST /miscellaneous/contact-us`

**Auth:** Not required (public endpoint)

Submit a contact form message.

**Request Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone_number": "9876543210",
  "organization": "Acme Corp",
  "description": "I'd like to discuss a large project"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Contact's full name |
| `email` | string | Yes | Contact's email address |
| `phone_number` | string | Yes | Contact's phone number |
| `organization` | string | No | Company name (empty string if not provided) |
| `description` | string | Yes | Message / inquiry details |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## 12. WebSocket Events

**Connection URL:** `NEXT_PUBLIC_API_URL`  
**Socket.IO Path:** `/api/socket.io`  
**Transports:** WebSocket (preferred), HTTP Long Polling (fallback)

### Authentication

Token is passed in both query string and auth object:
```js
io(baseUrl, {
  path: '/api/socket.io',
  query: { token: 'jwt_without_bearer_prefix' },
  auth: { token: 'jwt_without_bearer_prefix' },
  transports: ['websocket', 'polling'],
})
```

### Room Conventions

| Room ID Format | Used For |
|---|---|
| `{userId}` | Global notifications (login connection) |
| `{pmId}_service_{serviceId}` | PM ↔ customer project chat |
| `ticket_{ticketId}` | Support ticket real-time chat |

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join` | `{ roomId: string }` | Join a chat or notification room |
| `leave` | `{ roomId: string }` | Leave a room |
| `typing_start` | `{ roomId: string, userId: string }` | User started typing |
| `typing_stop` | `{ roomId: string, userId: string }` | User stopped typing |
| `message_seen` | `{ messageId: string }` | Acknowledge message read |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `connected` | `{ roomId: string }` | Successfully joined a room |
| `message` | `Message` object | New chat message received |
| `new_message` | `Message` object | Alternative message event name |
| `typing` | `{ userId: string, isTyping: boolean }` | Remote user typing indicator |
| `message_seen` | `{ messageId: string }` | Message read acknowledgment |
| `notification` | `Notification` object | Push notification |
| `refresh_messages` | `{}` | Signal to reload message history from HTTP |
| `disconnect` | — | Connection closed |
| `connect_error` | `Error` object | Connection failed |

### Notification Push Payload

```json
{
  "type": "booking_update",
  "title": "Booking Confirmed",
  "message": "Your React Developer booking has been confirmed",
  "bookingId": "64b2g3c4d7e0f1000000020",
  "timestamp": "2026-04-24T11:00:00Z"
}
```

### Reconnection Policy

The Socket.IO client will automatically attempt to reconnect on disconnect:
- **Max attempts:** 5
- **Delay between attempts:** 1000ms
- **Timeout per attempt:** 10000ms
- If all attempts fail, `onDisconnected` callback is called

---

## 13. Error Response Format

All error responses follow this standard shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Optional additional context"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `INVALID_OTP` | 400 | OTP is wrong or expired |
| `OTP_EXPIRED` | 400 | OTP timed out |
| `RATE_LIMITED` | 429 | Too many OTP requests |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Token valid but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `PAYMENT_FAILED` | 400 | Razorpay payment verification failed |
| `BOOKING_CONFLICT` | 409 | Time slot already booked |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 14. HTTP Status Code Reference

| Code | Meaning | Common Cause |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Invalid input, failed validation |
| 401 | Unauthorized | Missing or expired JWT token |
| 403 | Forbidden | Valid token but wrong role/permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or scheduling conflict |
| 422 | Unprocessable Entity | Validation error with field details |
| 429 | Too Many Requests | Rate limit exceeded (OTP, login) |
| 500 | Internal Server Error | Backend exception — retry or contact support |

---

## Quick Reference: Full Endpoint List

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/send-otp` | Public | Send OTP to mobile |
| POST | `/auth/verify-otp` | Public | Verify OTP, get token |
| POST | `/auth/logout` | User | Logout |
| POST | `/auth/refresh` | User | Refresh token |
| POST | `/auth/guest-access` | Public | Get guest token |
| GET | `/user/profile` | User | Get own profile |
| PUT | `/user/profile` | User | Update profile / avatar |
| GET | `/services` | Guest/User | All services catalog |
| GET | `/services/:id` | Guest/User | Single service |
| GET | `/services/category/:category` | Guest/User | Services by category |
| GET | `/admin/availability?duration=` | User | Available time slots |
| POST | `/bookings` | User | Create booking |
| GET | `/bookings` | User | List all bookings |
| GET | `/bookings/:id` | User | Single booking |
| PATCH | `/bookings/:id` | User | Update booking |
| POST | `/bookings/:id/cancel` | User | Cancel booking |
| POST | `/bookings/:id/extend` | User | Extend booking |
| GET | `/bookings/history` | User | Booking history |
| GET | `/customer/bookings` | User | Filtered customer bookings |
| GET | `/bookingHistories/getBookingHistory` | User | Booking timeline |
| GET | `/jobs/:id` | User | Job details |
| POST | `/jobs` | User | Create job |
| PUT | `/jobs/:id?service=create` | User | Update job |
| POST | `/jobs/pricing` | User | Calculate pricing |
| POST | `/payments/create-order` | User | Create Razorpay order |
| POST | `/payments/verify` | User | Verify payment |
| GET | `/payments/status/:paymentId` | User | Payment status |
| GET | `/payments/history` | User | Payment history |
| POST | `/payments/invoice/download/:jobId` | User | Download invoice PDF |
| GET | `/chat/messages/:customerId` | User | Chat message history |
| POST | `/chat/send/:customerId` | User | Send text message |
| POST | `/chat/send/:customerId` | User | Send file attachment |
| POST | `/chat/seen/:messageId` | User | Mark message as seen |
| GET | `/tickets/user/all-tickets` | User | All support tickets |
| GET | `/ticket-messages/:ticketId` | User | Ticket message history |
| POST | `/tickets/ticket` | User | Create support ticket |
| GET | `/notifications/allnotifications` | User | All notifications |
| DELETE | `/notifications/deletenotification/:id` | User | Delete notification |
| GET | `/dashboard/stats` | User | Header stats |
| POST | `/miscellaneous/contact-us` | Public | Contact form |

---

*End of API Reference Documentation*
