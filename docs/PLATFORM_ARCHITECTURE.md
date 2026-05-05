# QuickHire — Platform Architecture & Backend Contract

> **Audience**: Backend engineers, DevOps, QA, future maintainers.
> **Source of truth**: This document is derived directly from the live frontend code in `quickhire AI mode/` (Next.js 16, App Router) plus the existing `backend/` Express service. Every endpoint, payload, socket event, and storage key listed below is consumed somewhere in the FE — none of it is speculative.
> **Authoring stance**: Senior product architect. Covers all flows, all roles, all dependencies, all linkages. No major or minor flow is omitted.

---

## 0. Quick map

```
┌────────────────────┐        HTTPS / JSON         ┌─────────────────────┐
│  Customer Web App  │ ─────────────────────────►  │                     │
│  Next.js :3000     │                             │   Express API       │
│  (App Router, MUI) │ ◄─── Socket.IO (WS) ─────►  │   :4000  /api/*     │
└────────────────────┘                             │                     │
         ▲                                          │  ┌───────────────┐ │
         │ shared CMS / services                    │  │ Mongo (data)  │ │
┌────────────────────┐                              │  │ Redis (cache) │ │
│  Admin Panel       │ ─────────────────────────►   │  │ S3 / disk     │ │
│  Vite/React :3004  │                              │  │ Razorpay API  │ │
└────────────────────┘                              │  │ FCM / SMS GW  │ │
         ▲                                          │  └───────────────┘ │
┌────────────────────┐                              └─────────────────────┘
│  Staff sub-apps    │ (PM / Resource — Next.js routes inside FE)
└────────────────────┘
```

Single backend. Three logical FE surfaces: **customer**, **staff** (PM / resource pages live inside the same Next.js app under `/pm/*`, `/resource/*`), and **admin** (separate React app).

---

## 1. Personas & permission matrix

| Role         | Logs in via                | Token role claim | Accesses                                              |
| ------------ | -------------------------- | ---------------- | ----------------------------------------------------- |
| `customer`   | `/login` (mobile + OTP)    | `customer`       | Browse, book, pay, chat, support, profile, notifs     |
| `pm`         | `/staff-login`             | `pm`             | Assigned bookings, chat with customer, status update  |
| `resource`   | `/staff-login`             | `resource`       | Assignments, time-logs, chat                          |
| `admin`      | `/staff-login` (mobile `9000000000`) | `admin` | Everything: services, users, jobs, tickets, CMS, payments, dashboards |
| `guest`      | `POST /auth/guest-access`  | `guest`          | Read-only catalog browsing, login wall on Continue    |

Backend **must** enforce role per endpoint; FE only hides UI, never trusts role for security.

---

## 2. Tech stack contract

### 2.1 Customer FE (`quickhire AI mode/`)
- **Framework**: Next.js 16.1.6, App Router, Turbopack dev (port `3000`).
- **UI**: MUI v6 + Tailwind v4 (utilities). Theme registered in `components/providers/ThemeRegistry.jsx`.
- **State**: Redux Toolkit slices in `lib/redux/slices/*` (auth, booking, cart, services, notifications, chat). Persistence: `localStorage`.
- **HTTP**: single axios instance (`lib/axios/axiosInstance.js`) — base `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`), attaches `Authorization: Bearer ${localStorage.token}`.
- **Realtime**: `socket.io-client` (`lib/services/chatSocketService.js`) connects to `:4000` with `auth: { token }`.
- **Routing**: file-based, see `app/`.
- **Env**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

### 2.2 Backend (`quickhire AI mode /backend/`)
- **Runtime**: Node 20+, Express 4, ES modules.
- **DB**: MongoDB (Mongoose).
- **Cache**: Redis (`cache:services:*`, `cache:cms:*`).
- **Auth**: JWT RS256 (`JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY` in `.env`, must be persisted, not regenerated on restart).
- **File storage**: local `/uploads` static OR S3 — return absolute URLs in responses.
- **Realtime**: Socket.IO bound to same HTTP server on `:4000`.
- **Validation**: zod per route.

### 2.3 Cross-cutting
- **CORS**: allow `http://localhost:3000` (and admin origin), `credentials: true`, methods `GET,POST,PUT,PATCH,DELETE,OPTIONS`, headers `Authorization,Content-Type`.
- **Response envelope**:
  - Success → `{ success: true, data, message?, meta?: { page, pageSize, total, totalPages } }`
  - Error   → HTTP 4xx/5xx + `{ success: false, error: { code, message, details? } }`
- **Time**: All timestamps ISO-8601 UTC. Slot times in IST (`Asia/Kolkata`) string `HH:mm`.
- **Money**: Display in INR rupees (integer). Razorpay order in **paise** (`amount * 100`).

---

## 3. URL surface (frontend → backend)

Base path: `/api`. Public means **no Bearer required**. All others require Bearer + correct role.

### 3.1 Auth — `lib/services/authApi.js`, `LoginForm.jsx`, `Header.jsx`
| # | Method | Path | Public | Body | Returns |
|---|--------|------|-------|------|---------|
| A1 | POST | `/auth/send-otp` | ✅ | `{mobile, role}` | `{otpSent:true}` |
| A2 | POST | `/auth/verify-otp` | ✅ | `{mobile, otp, fcmToken, role}` | `{token, user, isNewUser}` |
| A3 | POST | `/auth/logout` | 🔒 | — | `{success:true}` |
| A4 | POST | `/auth/refresh` | 🔒 | — | `{token}` (used by 401 path; currently FE just redirects) |
| A5 | POST | `/auth/guest-access` | ✅ | — | `{token}` short-lived guest |

### 3.2 User profile — `lib/services/authApi.js`, `app/profile/page.jsx`
| # | Method | Path | Body | Notes |
|---|--------|------|------|-------|
| U1 | GET  | `/user/profile` | — | Returns `{name,email,mobile,role,avatar,…}` |
| U2 | PUT  | `/user/profile` | multipart `avatar?` + JSON fields | Returns updated user |

### 3.3 Public CMS — `lib/hooks/useCmsContent.js`
| # | Method | Path | Item shape used by FE |
|---|--------|------|------------------------|
| C1 | GET | `/cms/technologies`  | `{name,image,alt}` |
| C2 | GET | `/cms/testimonials`  | `{name,role,avatar,rating,message}` |
| C3 | GET | `/cms/features`      | `{icon,title,description}` |
| C4 | GET | `/cms/segments`      | `{title,description,image}` |
| C5 | GET | `/cms/process_steps` | `{step,title,description,image}` |
| C6 | GET | `/cms/faqs`          | `{question,answer}` |
| C7 | PUT | `/cms/:key`          | admin only — overrides defaults |

### 3.4 Services & availability — `lib/services/bookingApi.js`, ServicesStep, HoursStep
| # | Method | Path | Notes |
|---|--------|------|-------|
| S1 | GET | `/services` | Public list. Cache 300s. **Each service.technologies[].id MUST be unique within the service** (otherwise checkbox UI bug). |
| S2 | GET | `/services/:idOrSlug` | Single. FE accepts both Mongo `_id` and slug. |
| S3 | GET | `/bookings/availability?duration=&serviceId=&date=YYYY-MM-DD` | `{slots:[{start,end,isAvailable}]}` |

### 3.5 Jobs (the cart for an in-progress booking) — `lib/services/bookingApi.js`
| # | Method | Path | Body | Returns |
|---|--------|------|------|---------|
| J1 | POST | `/jobs/pricing` | `{serviceId,technologyIds,durationHours,slot:{start,end},addons?}` | `{subtotal,gst,discount,total,breakdown[]}` |
| J2 | POST | `/jobs` | v3 shape (see §6.2) | `{jobId,status:"pending_payment"}` |
| J3 | GET  | `/jobs/:id` | — | full job |
| J4 | PUT  | `/jobs/:id?service=create` | partial update | updated job |

### 3.6 Bookings — `lib/services/bookingApi.js`, booking pages
| # | Method | Path | Notes |
|---|--------|------|-------|
| B1 | POST | `/bookings` | `{jobId,paymentId}` → creates booking |
| B2 | GET  | `/bookings` | All for caller |
| B3 | GET  | `/bookings/:id` | single |
| B4 | PATCH | `/bookings/:id` | update |
| B5 | POST | `/bookings/:id/cancel` | `{reason}` |
| B6 | POST | `/bookings/:id/extend` | `{extraHours,schedule?}` |
| B7 | GET  | `/bookings/history?…` | past |
| B8 | GET  | `/bookings/available-slots?serviceId=&date=` | alt slot endpoint |
| B9 | GET  | `/customer/bookings?servicesStatus=&page=&pageSize=` | paginated. Status whitelist: `ongoing,in_progress,assigned,scheduled,completed,cancelled` |
| B10 | GET | `/bookingHistories/getBookingHistory?bookingId=&serviceId=` | timeline `[{type,status,at,by}]` |

### 3.7 Payments — `lib/services/paymentApi.js`, payment-success page
| # | Method | Path | Body | Returns |
|---|--------|------|------|---------|
| P1 | POST | `/payments/create-order` | `{jobId,amount,currency:"INR"}` | `{orderId,keyId,amount}` |
| P2 | POST | `/payments/verify` | `{razorpay_order_id,razorpay_payment_id,razorpay_signature,jobId}` | `{success,paymentId,bookingId}` |
| P3 | GET  | `/payments/status/:paymentId` | — | `{status:"paid"\|"failed"}` |
| P4 | GET  | `/payments/history?page=&limit=` | — | paginated invoices |
| P5 | POST | `/payments/invoice/download/:jobId` | `{}` | PDF blob (FE: `responseType:'blob'`) |
| P6 | POST | `/payments/webhook` | Razorpay sig | Server-only, **must verify signature** |

### 3.8 Chat (REST) — `lib/services/chatApi.js`
| # | Method | Path | Notes |
|---|--------|------|-------|
| CH1 | GET  | `/chat/messages/:customerId?serviceId=` | Envelope `{success,count,total,page,totalPages,data:[…]}` |
| CH2 | POST | `/chat/send/:customerId` | JSON `{msg,serviceId,firstMsg?}` OR multipart `file` |
| CH3 | POST | `/chat/typing/:customerId` | `{isTyping,serviceId}` |
| CH4 | POST | `/chat/seen/:messageId` | mark seen |

### 3.9 Tickets / Support — `lib/services/ticketApi.js`, SupportSection, support-chat page
| # | Method | Path | Body |
|---|--------|------|------|
| T1 | GET  | `/tickets/user/all-tickets?page=&limit=` | paginated |
| T2 | POST | `/tickets/ticket` | `{subject,category,message,attachments?}` |
| T3 | GET  | `/ticket-messages/:ticketId` | messages |
| T4 | POST | `/tickets/:ticketId/message` | `{msg}` |

### 3.10 Notifications — `lib/services/notificationsApi.js`
| # | Method | Path | Notes |
|---|--------|------|-------|
| N1 | GET | `/notifications?page=&pageSize=` | `{data:[{_id,title,body,type,read,createdAt}],total}` |
| N2 | POST | `/notifications/:id/read` | mark one |
| N3 | POST | `/notifications/mark-all-read` | mark all |

### 3.11 Dashboard (header counters) — `Header.jsx`
| # | Method | Path | Returns |
|---|--------|------|---------|
| D1 | GET | `/dashboard/stats` | `{unreadNotifications,cartCount,walletBalance,…}` |

### 3.12 Misc — `lib/services/miscellaneousApi.js`
| # | Method | Path | Body |
|---|--------|------|------|
| M1 | POST | `/miscellaneous/contact-us` | `{name,email,mobile,subject,message}` |

### 3.13 Admin (separate panel) — `/api/admin/*`
Verified live: `dashboard/stats`, `dashboard/revenue`, `dashboard/recent-activity`, `bookings`, `users`, `jobs`, `tickets`, `services` (CRUD), `pms`, `resources`. All require `role=admin`.

---

## 4. Realtime (Socket.IO) contract

- Server: same `:4000`, default namespace `/`.
- Handshake: `io(url, { auth: { token } })`. Backend middleware verifies JWT, attaches `socket.userId`, `socket.role`.
- On connect, server auto-joins `user:<userId>`.

### 4.1 Client → Server (emits FE makes)
| Event                | Payload                          | Purpose |
|----------------------|----------------------------------|---------|
| `chat:join`          | `{roomId}` (with ack)            | join booking room |
| `join-room`          | `roomId` (string)                | legacy alias |
| `join-ticket-room`   | `{ticketId}`                     | support ticket room |
| `user_online`        | `<userId:Number>`                | presence |
| `join_user_room`     | `<userId:Number>`                | direct push room |
| `send-message`       | `{roomId,msg,attachments?,…}`    | low-latency send (REST also works) |
| `send-ticket-message`| `{ticketId,msg}`                 | ticket reply |

### 4.2 Server → Client (FE listens for)
| Event              | When emitted | Payload |
|--------------------|--------------|---------|
| `new-message` / `message:new` / `new_message` / `message` / `chat-message` / `receive-message` | new chat msg | `{_id,roomId,senderId,msg,attachments,createdAt}` (FE accepts any of these aliases — pick **one** server-side and stick with it; recommend `message:new` + room broadcast `new-message`) |
| `user_typing` / `typing` | typing start/stop | `{userId,isTyping}` |
| `message_seen`     | recipient opened | `{messageId}` |
| `notification:new` | server-side notif create | `{_id,title,body,type,createdAt}` → push to `user:<id>` |
| `connect` / `disconnect` / `connect_error` / `error` | transport | — |

> **Action item**: backend should canonicalize on `message:new` (direct user push) + `new-message` (room broadcast). Do NOT spam all 6 aliases; one of each is enough. FE is forgiving but duplicate emits = duplicate UI bubbles.

---

## 5. Data models (canonical, used by FE)

### 5.1 User
```ts
{ _id, name, email, mobile, role: "customer"|"pm"|"resource"|"admin",
  avatar, fcmTokens:[…], createdAt, updatedAt,
  walletBalance:Number,            // surfaced via dashboard/stats
  guestAccess?:Boolean }
```

### 5.2 Service
```ts
{ _id, name, slug, description, image, hourlyRate, currency:"INR",
  technologies:[{ id:String /* unique per service */, name, image? }],
  faqs?:[{q,a}], deliverables?:[String],
  active:Boolean, createdAt, updatedAt }
```

### 5.3 Job (a draft booking, pre-payment)
```ts
{ _id, userId, serviceId,
  technologies:[String],           // tech ids the user picked
  hours:Number,
  schedule:{ date:"YYYY-MM-DD", start:"HH:mm", end:"HH:mm", tz:"Asia/Kolkata" },
  urgency?:"normal"|"urgent",
  notes?:String,
  pricing:{ subtotal, gst, discount, total, breakdown:[…] },
  totalAmount:Number,
  status:"draft"|"pending_payment"|"paid"|"cancelled",
  slotLockExpiresAt:Date,           // ~10 min lock from /jobs/pricing
  createdAt, updatedAt }
```

### 5.4 Booking (post-payment, the work item)
```ts
{ _id, jobId, userId, pmId?:ObjectId, resourceIds:[ObjectId],
  serviceId, schedule:{…},
  status:"scheduled"|"in_progress"|"completed"|"cancelled"|"assigned",
  paymentId, totalAmount,
  cancellation?:{ reason, at, by },
  extension?:{ extraHours, schedule },
  createdAt, updatedAt }
```

### 5.5 Payment
```ts
{ _id, jobId, bookingId?, userId,
  provider:"razorpay", orderId, paymentId, signature,
  amount, currency:"INR",
  status:"created"|"paid"|"failed"|"refunded",
  invoiceUrl?, createdAt }
```

### 5.6 ChatMessage
```ts
{ _id, roomId /* = bookingId or ticketId */,
  senderId, senderRole:"customer"|"pm"|"resource"|"admin",
  msg, attachments:[{url,name,mime,size}],
  seen:Boolean, seenAt?, createdAt }
```

### 5.7 Ticket
```ts
{ _id, userId, subject, category, status:"open"|"pending"|"closed",
  lastMessageAt, createdAt, messages:[ChatMessage] }
```

### 5.8 Notification
```ts
{ _id, userId, title, body,
  type:"booking"|"payment"|"chat"|"system"|"ticket",
  refId?, read:Boolean, createdAt }
```

### 5.9 BookingHistory (timeline)
```ts
{ _id, bookingId, serviceId,
  type:"created"|"paid"|"assigned"|"started"|"extended"|"completed"|"cancelled",
  status, at, by:{ userId, role }, meta? }
```

### 5.10 CMSDoc
```ts
{ _id, key:String /* unique */, items:[…freeform per key…], updatedBy, updatedAt }
```

---

## 6. End-to-end flows

### 6.1 Bootstrapping a session
```
1. Browser opens /                                (no auth needed)
2. LayoutWrapper mounts → reads localStorage.token
3. Header → GET /dashboard/stats   (only if token)
4. Page does GET /services + 6× GET /cms/*       (parallel, public)
5. SocketProvider connects with auth.token       (only if token)
   → server joins user:<id> room
```

### 6.2 Booking journey (the critical path)
```
Step 1  /service-details/[id]
        → GET /services/:id          (service + technologies)
        → optional GET /bookings/availability for default duration

Step 2  ServicesStep   (local state only, no API)
        User picks 1..N technologies. selectedTechnologies = [tech.id, …]

Step 3  HoursStep
        → POST /jobs/pricing  { serviceId, technologyIds, durationHours, slot }
                              (debounced, on every change)
        → on Continue:
            if (!token) router.push('/login?next=…')   (FE guard)
            POST /jobs    {              ← v3 shape
              serviceId,
              technologies:[String],
              hours:Number,
              schedule:{date,start,end},
              urgency, notes, totalAmount
            }
            ← { jobId, status:"pending_payment" }
            store jobId in Redux + localStorage

Step 4  SummaryStep / PaymentStep
        → POST /payments/create-order { jobId, amount, currency:"INR" }
        ← { orderId, keyId, amount }
        FE opens Razorpay checkout (window.Razorpay)
        On success callback:
        → POST /payments/verify { razorpay_order_id, razorpay_payment_id,
                                  razorpay_signature, jobId }
        ← { success, paymentId, bookingId }
        router.push('/payment-success?bookingId=…')

Step 5  /payment-success
        → GET /jobs/:id (to display order recap)
        → GET /bookings/:id

Step 6  /booking-ongoing/[id]
        → GET /customer/bookings?servicesStatus=ongoing
        → GET /bookingHistories/getBookingHistory?bookingId&serviceId

Step 7  /booking-workspace/[id]
        Socket connect (already connected globally)
        emit chat:join { roomId: bookingId }
        → GET /chat/messages/:customerId?serviceId
        send: POST /chat/send/:customerId  OR  emit send-message
        receive: on('message:new'), on('user_typing'), on('message_seen')
```

### 6.3 Auth & 401 lifecycle
```
Login:
  POST /auth/send-otp → POST /auth/verify-otp
  → save token, user, userType, isNewUser into localStorage
  → router.push(next || '/')

Every API call:
  axios req interceptor → headers.Authorization = `Bearer ${token}`

On 401 (any endpoint, except /auth/*):
  axios res interceptor →
    localStorage.removeItem('token','user','userType','isNewUser')
    router.push(`/login?next=${currentPath}`)

Logout:
  POST /auth/logout  (fire and forget)
  → clear localStorage  → router.push('/login')
```

### 6.4 Realtime notifications
```
Trigger (server-side):                 Effect:
  Booking created/cancelled/extended  → NotificationModel.create + io.to(user:<id>).emit('notification:new', n)
  PM assigned                         → same, also io.to(user:<pmId>).emit(…)
  New chat msg                        → io.to(booking:<id>).emit('new-message', m)
                                        io.to(user:<recipient>).emit('message:new', m)
  Payment success (webhook)           → notif + booking status update + emit
FE reaction:
  SocketProvider listens for 'notification:new' → bumps Header badge,
    revalidates GET /notifications on next open
```

### 6.5 Support / ticketing
```
Profile → Support form
  → POST /tickets/ticket
  → router.push(`/support-chat/${ticketId}`)
Chat page
  emit join-ticket-room { ticketId }
  → GET /ticket-messages/:ticketId
  → POST /tickets/:ticketId/message  OR  emit send-ticket-message
```

### 6.6 Admin lifecycle (managed by separate React app)
- Admin logs in via `/auth/verify-otp` with `role:"admin"`.
- Hits `/api/admin/*` for everything (services CRUD, bookings, users, tickets, jobs, dashboards).
- Service/CMS writes **must** invalidate Redis caches (`cache:services:*`, `cache:cms:<key>`) — otherwise FE shows stale data for up to 300s.

---

## 7. Storage, caching, jobs

### 7.1 Redis keys
| Key                       | TTL    | Invalidate on |
|---------------------------|--------|---------------|
| `cache:services:all`      | 300s   | admin write to any service |
| `cache:services:<idOrSlug>` | 300s | admin write to that service |
| `cache:cms:<key>`         | 300s   | `PUT /cms/:key` |
| `slot:lock:<svcId>:<date>:<start>` | 600s | `/jobs` create OR explicit release |

### 7.2 Cron / background workers
1. **Slot lock release** — auto-expire (Redis TTL handles it).
2. **Booking lifecycle ticker** — every minute: scheduled→in_progress when `now ≥ schedule.start`, in_progress→completed when `now ≥ schedule.end`. Emits `notification:new` on each transition.
3. **Razorpay webhook** — `POST /payments/webhook` verifies sig, marks Payment paid, creates Booking if not yet created (idempotent on `orderId`).
4. **Notification dispatcher** — for each Notification create, fan out: socket emit + (optional) FCM push using `user.fcmTokens`.
5. **Cache warmer** — optional: pre-populate `cache:services:all` on boot.

### 7.3 File storage
- Chat attachments + avatars + invoices.
- Backend returns absolute URLs (CDN/S3 or `http://localhost:4000/uploads/...`).
- Max size: enforce 10MB chat attachment, 2MB avatar.

---

## 8. Security checklist

1. JWT RS256, keys persisted, 7-day exp, refresh via `/auth/refresh`.
2. OTP: rate-limit `send-otp` per mobile (e.g., 3/min, 10/hr). Test mobiles bypass.
3. Razorpay signature **must** be verified on `/payments/verify` AND `/payments/webhook` using `RAZORPAY_KEY_SECRET`.
4. CORS strict origin allowlist (no `*` with credentials).
5. Input validation: zod on every body/query/params. Reject unknown fields.
6. File uploads: validate mime + size + virus-scan if possible. Never trust client-sent filename.
7. Authorization: every `/api/admin/*` requires `role==='admin'`. Customer endpoints scope by `req.user.id`.
8. Rate limit per IP+token on chat send (e.g., 60/min).
9. NoSQL injection: never pass raw `req.query` into Mongo filters; whitelist fields.
10. Logs: never log JWT, OTP, Razorpay secret, or PII bodies.

---

## 9. Failure modes the FE already handles

| Scenario                                  | FE behavior                                        | Backend should…                                |
|-------------------------------------------|----------------------------------------------------|-----------------------------------------------|
| Token expired / missing on private call   | clear storage, redirect `/login?next=…`            | return **401** with `{success:false,error:{message}}` |
| `/jobs` rejected (validation)             | alert + console error, stay on HoursStep           | return **400** with `error.details` (zod issues) |
| Razorpay verify fails                     | show toast, keep job in `pending_payment`          | mark Payment `failed`, do NOT create Booking |
| Chat REST 500/404                         | UI still loads with empty messages                 | always return envelope, even on empty |
| Socket disconnect                         | auto-reconnect (socket.io default)                 | accept resume; idempotent room joins |
| Slot already taken (race)                 | FE shows the alert from `error.message`            | return **409** with clear message |
| CMS key missing                           | FE falls back to defaults via `useCmsContent`      | return `{success:true, data:{ items: [] }}` |

---

## 10. Environment & ports

| Component | Port | Env vars |
|-----------|------|----------|
| Backend Express + Socket.IO | 4000 | `MONGODB_URI`, `REDIS_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FCM_SERVER_KEY`, `SMS_GATEWAY_*`, `UPLOAD_DIR` |
| Customer FE Next.js | 3000 | `NEXT_PUBLIC_API_URL=http://localhost:4000/api`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| Admin React app | 3004 | `VITE_API_URL=http://localhost:4000/api` |

Test credentials (dev): customer `9999988887`, admin `9000000000`, OTP `1234`.

---

## 11. Verification matrix (smoke)

```bash
# health
curl -s -o/dev/null -w '%{http_code}\n' http://localhost:4000/api/services   # 200

# auth + token (customer)
TOKEN=$(curl -s -X POST localhost:4000/api/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"mobile":"9999988887","otp":"1234","fcmToken":"","role":"customer"}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).data.token))')

# private endpoints
for ep in user/profile dashboard/stats customer/bookings notifications; do
  printf '%-25s ' "$ep"
  curl -s -o/dev/null -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" \
    "http://localhost:4000/api/$ep"
done

# CMS
for k in technologies testimonials features segments process_steps faqs; do
  printf 'cms/%-15s ' "$k"
  curl -s -o/dev/null -w '%{http_code}\n' "http://localhost:4000/api/cms/$k"
done
```

A green run = backend covers everything the customer FE consumes today.

---

## 12. Open items / hardening backlog

1. **Idempotency keys** on `POST /jobs`, `POST /payments/verify`, `POST /bookings` to survive client retries.
2. **Refresh token endpoint actually wired** (FE currently nukes session on 401; long-term should silent-refresh).
3. **Socket event canonicalization** — pick one of the 6 chat aliases, deprecate the rest.
4. **Webhook**-based booking creation (don't depend solely on `/payments/verify` happy-path).
5. **Audit log** collection for admin writes.
6. **Soft-delete + restore** for services/users instead of hard delete.
7. **Pagination consistency** — pick `page`+`pageSize` everywhere (some endpoints use `limit`).
8. **OpenAPI / Swagger** spec generated from zod schemas.
9. **E2E test** for full booking journey (Playwright) hitting real backend in CI.

---

*Last updated: April 2026. If you change a request or response shape, update this file in the same PR.*
