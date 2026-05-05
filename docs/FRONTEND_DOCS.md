# QuickHire — Frontend Documentation

> **Project:** QuickHire  
> **Framework:** Next.js 16 (App Router) + React 19  
> **Styling:** Tailwind CSS v4 + MUI v7 + Emotion  
> **State Management:** Redux Toolkit  
> **Real-time:** Socket.IO Client  
> **Version:** 0.1.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [App Router — Pages](#4-app-router--pages)
5. [Components](#5-components)
6. [Features (Domain Modules)](#6-features-domain-modules)
7. [State Management (Redux)](#7-state-management-redux)
8. [Providers & Context](#8-providers--context)
9. [Styling System](#9-styling-system)
10. [Real-time / Socket Layer](#10-real-time--socket-layer)
11. [Routing & Navigation](#11-routing--navigation)
12. [Authentication Flow](#12-authentication-flow)
13. [Environment Variables](#13-environment-variables)
14. [Build & Configuration](#14-build--configuration)

---

## 1. Project Overview

QuickHire is an **on-demand tech talent marketplace**. Customers browse services (development, design, QA, etc.), book verified professionals, communicate with assigned Project Managers over real-time chat, and pay through Razorpay.

### Core User Journeys
| Journey | Entry Route |
|---|---|
| Browse services | `/` → `/book-your-resource` |
| View service details | `/service-details/[id]` |
| Book a resource | `/book-your-resource` → checkout flow |
| Track ongoing booking | `/booking-ongoing/[id]` |
| Collaborate (chat + timeline) | `/booking-workspace/[id]` |
| Real-time chat with PM | `/chat` |
| Support ticket chat | `/support-chat/[id]` |
| Profile management | `/profile` |
| Payments / invoices | `/profile` → Payments tab |
| Cart | `/cart` |
| Payment confirmation | `/payment-success` |

---

## 2. Tech Stack

| Concern | Library / Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI library | React | 19.2.3 |
| Component library | MUI (Material UI) | ^7.3.7 |
| CSS framework | Tailwind CSS | ^4.2.1 |
| CSS-in-JS | Emotion (`@emotion/react`, `@emotion/styled`) | ^11.14 |
| Global state | Redux Toolkit | ^2.11.2 |
| HTTP client | Axios | ^1.13.6 |
| Real-time | Socket.IO Client | ^4.8.3 |
| Carousel / Slider | Swiper | ^12.1.2 |
| Toast notifications | react-hot-toast | ^2.6.0 |
| Class merging | tailwind-merge | ^3.5.0 |

---

## 3. Project Structure

```
/
├── app/                    # Next.js App Router (pages + layouts)
│   ├── layout.jsx          # Root layout — providers + metadata
│   ├── globals.css         # Global CSS variables + base styles
│   ├── (home-page)/        # Route group — homepage
│   ├── about-us/
│   ├── book-your-resource/
│   ├── booking-ongoing/[id]/
│   ├── booking-workspace/[id]/
│   ├── cancellation-and-refund-policy/
│   ├── cart/
│   ├── chat/
│   ├── contact-us/
│   ├── faq/
│   ├── how-it-works/
│   ├── login/
│   ├── notifications/
│   ├── payment-success/
│   ├── profile/
│   ├── service-details/[id]/
│   ├── support-chat/[id]/
│   └── terms-and-conditions/
│
├── components/             # Shared/reusable UI components
│   ├── auth/               # GuestAccessProvider, LoginForm
│   ├── common/             # FaqSection, Pagination, SectionHeader…
│   ├── layout/             # Header, Footer, LayoutWrapper
│   ├── providers/          # ThemeRegistry, SocketProvider, ToastProvider
│   └── ui/                 # ButtonPrimary, CardPrimary, Scrollbar…
│
├── features/               # Domain-sliced feature modules
│   ├── about/
│   ├── booking/            # ChatPanel, BookingTimeline, forms, modals
│   ├── cart/               # CartDrawer, CartItems, EmptyCart
│   ├── faq/
│   ├── homepage/           # Hero, Carousel, WhyQuick, TechStack…
│   ├── logout/
│   ├── notification/       # NotificationDrawer
│   ├── profile/            # ProfileForm, BookingsSection, PaymentsSection…
│   └── services/           # ServiceHeader, LeftComponent, RightComponent…
│
├── lib/                    # Shared utilities, services, Redux
│   ├── axios/              # Configured Axios instance
│   ├── endpoints.js        # All API endpoint definitions (single source)
│   ├── redux/
│   │   ├── store/          # Redux store + hooks
│   │   ├── slices/         # authSlice, bookingSlice, userSlice…
│   │   └── providers/      # ReduxProvider
│   ├── services/           # API service modules (authApi, bookingApi…)
│   └── utils/              # authHelpers, userHelpers, chatHelpers
│
├── public/                 # Static assets
│   ├── fonts/              # Open Sauce One font variants
│   ├── images/
│   └── videos/
│
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 4. App Router — Pages

### Root Layout (`app/layout.jsx`)

The root layout wraps the entire application. It:
- Sets global metadata (title, description, OG tags, Twitter cards)
- Nests all providers in this order:

```
ReduxProvider
  └─ GuestAccessProvider
       └─ ToastProvider
            └─ SocketProvider
                 └─ ThemeRegistry (MUI)
                      └─ LayoutWrapper (Header + Footer + children)
```

### Page Reference

| Route | File | Auth Required | Description |
|---|---|---|---|
| `/` | `app/(home-page)/page.jsx` | No | Marketing homepage |
| `/book-your-resource` | `app/book-your-resource/page.jsx` | No | Service catalog + booking entry |
| `/service-details/[id]` | `app/service-details/[id]/page.jsx` | No | Full service detail + booking form |
| `/booking-ongoing/[id]` | `app/booking-ongoing/[id]/page.jsx` | Yes | Ongoing booking status view |
| `/booking-workspace/[id]` | `app/booking-workspace/[id]/page.jsx` | Yes | Workspace: chat + timeline tabs |
| `/chat` | `app/chat/page.jsx` | Yes | Direct PM chat (query-param driven) |
| `/support-chat/[id]` | `app/support-chat/[id]/page.jsx` | Yes | Support ticket real-time chat |
| `/profile` | `app/profile/page.jsx` | Yes | Profile, bookings, payments |
| `/login` | `app/login/page.jsx` | No | OTP-based login |
| `/cart` | `app/cart/page.jsx` | No | Cart (empty/items) |
| `/payment-success` | `app/payment-success/page.jsx` | Yes | Post-payment confirmation |
| `/notifications` | `app/notifications/page.jsx` | Yes | Notifications list |
| `/about-us` | `app/about-us/page.jsx` | No | About page |
| `/contact-us` | `app/contact-us/page.jsx` | No | Contact form |
| `/faq` | `app/faq/page.jsx` | No | FAQ |
| `/how-it-works` | `app/how-it-works/page.jsx` | No | How It Works |
| `/terms-and-conditions` | `app/terms-and-conditions/page.jsx` | No | Legal |
| `/cancellation-and-refund-policy` | `app/cancellation-and-refund-policy/page.jsx` | No | Policy |

### Chat Page Query Parameters (`/chat`)

The `/chat` page is driven entirely by URL query parameters:

| Parameter | Type | Description |
|---|---|---|
| `bookingId` | string | The booking's unique ID |
| `adminId` | string | Project Manager (PM) user ID |
| `serviceId` | string | Service ID for the chat room |
| `projectTitle` | string | Display name for the chat header |
| `serviceInfo` | string | Additional service metadata |
| `hourlyRate` | string | Rate shown in the chat header |

### Dynamic Routes

- **`/service-details/[id]`** — `id` is the service `_id`. The page pulls full service details from the `services` Redux slice, matches via `_id`, and stores the selection to `sessionStorage`.
- **`/booking-workspace/[id]`** — `id` is the booking ID (URL-decoded on load). Booking data is loaded from `sessionStorage.currentBooking`.
- **`/support-chat/[id]`** — `id` is the ticket ID. Fetches ticket detail via `ticketService.getAllTickets()` and connects Socket.IO.

---

## 5. Components

### `components/layout/`

#### `LayoutWrapper.jsx`
- Dispatches `initializeAuth` on mount to restore session from `localStorage`.
- Hides the `Header` + `Footer` on `/login`.
- Hides `Footer` on `/service-details/*`, `/booking-workspace/*`, `/support-chat/*`.

#### `Header.jsx`
- Reads `isAuthenticated` and `user` from the `auth` Redux slice.
- Reads `stats` (notification count, cart count) from `dashboard` Redux slice.
- Contains: Logo, nav links, cart icon (badge), notification icon (badge), user avatar/menu, mobile hamburger menu.
- Opens `CartDrawer` and `NotificationDrawer` as side panels.
- Dispatches `logout` action and shows `LogoutModal`.

#### `Footer.jsx`
- Static footer with navigation links and brand information.

### `components/auth/`

#### `GuestAccessProvider.jsx`
- Runs once on mount to bootstrap authentication:
  1. If a `token` + `user` exist in `localStorage` → restores the user session (`setAuthFromStorage`).
  2. Else if a `guestToken` + `guestData` exist → restores the guest session (`setGuestFromStorage`).
  3. Else → calls `POST /auth/guest-access` API and stores the returned token as `guestToken`.

### `components/providers/`

#### `SocketProvider.jsx`
- Watches `localStorage` for user login/logout (storage events + custom `userLoggedIn` event).
- On user login: connects `chatSocketService` using the user's `_id` as `roomId`.
- On notification receive: calls `showToast` with notification data.
- Exposes `{ isConnected, notifications }` via `SocketContext`.

#### `ToastProvider.jsx`
- Wraps `react-hot-toast`'s `Toaster` component.
- Provides `showToast(type, title, message)` helper via `ToastContext`.

#### `ThemeRegistryFixed.jsx`
- MUI + Emotion SSR-safe theme provider using the `useServerInsertedHTML` hook.
- Registers Emotion's cache so MUI styles are correctly injected on the server.

### `components/common/`

| Component | Purpose |
|---|---|
| `FaqSection.jsx` | Accordion-based FAQ renderer |
| `Pagination.jsx` | Reusable page pagination |
| `PaymentSuccessMessage.jsx` | Success screen after Razorpay payment |
| `SectionHeader.jsx` | Consistent section heading with subtitle |
| `SectionWrapper.jsx` | Adds standard vertical padding to a section |

### `components/ui/`

| Component | Purpose |
|---|---|
| `ButtonPrimary.jsx` | QuickHire-branded primary action button |
| `ButtonPrimaryhowitwork.jsx` | Variant for the how-it-works section |
| `CardPrimary.jsx` | Standard content card container |
| `CustomProgressScrollbar.jsx` | Custom-styled scrollbar for panels |

---

## 6. Features (Domain Modules)

Each feature folder encapsulates all UI components for one domain area.

### `features/homepage/components/`

| Component | Description |
|---|---|
| `HeroSection.jsx` | Main landing banner with animated headline |
| `ClientLogos.jsx` | Scrolling trust-badge logo strip |
| `CarouselSection.jsx` | Swiper-based service/testimonial carousel |
| `WhyQuickSection.jsx` | Value proposition cards |
| `BookResourceSection.jsx` | CTA linking to `/book-your-resource` |
| `VibeCoding.jsx` | Vibe-coding marketing section |
| `HowHireWork.jsx` | Step-by-step hiring process |
| `HireWithConfidence.jsx` | Trust/confidence building section |
| `WeDeploy.jsx` | Deployment/tech capabilities section |
| `ClientSection.jsx` | Client testimonials / logos |
| `TechStack.jsx` | Technology expertise grid |
| `LetAnswer.jsx` | FAQ teaser linking to `/faq` |

### `features/booking/components/`

| Component | Description |
|---|---|
| `Mainbanner.jsx` | Top banner for the booking page |
| `ServiceSelectionGridV5.jsx` | Service category grid with filtering |
| `HeroSectionV3.jsx` | Secondary hero for the booking page |
| `BookYourResourceGrid.jsx` | Resource grid with booking CTAs |
| `VideoSectionV3.jsx` | Explainer video section |
| `BookingFaq.jsx` | Booking-specific FAQ accordion |
| `ExpertCardV3.jsx` | Individual expert card |
| `ChatPanel.jsx` | **Core real-time chat UI** (messages + input + file upload) |
| `BookingTimeline.jsx` | Booking status timeline view |
| `MessageBubble.jsx` | Single chat message bubble (text + attachment) |
| `MessageInputBar.jsx` | Chat input with text and file upload |
| `TypingIndicator.jsx` | Animated "user is typing" indicator |
| `ReportIssueModal.jsx` | Modal to report a booking issue |

### `features/services/components/`

| Component | Description |
|---|---|
| `ServiceHeader.jsx` | Service page breadcrumb + title block |
| `LeftComponent.jsx` | Left panel: service info, FAQ, availability |
| `RightComponent.jsx` | Right panel: booking form, process stepper |
| `BookingCard.jsx` | Service summary card for checkout |
| `ServiceAvalibility.jsx` | Calendar/slot availability picker |
| `ServiceFaq.jsx` | Service-specific FAQ |
| `ProcessStepper/` | Multi-step booking process stepper |
| `SelectiveCard.jsx` | Option selection card (e.g., duration) |
| `ProcessQuestion.jsx` | Dynamic booking questionnaire step |

### `features/profile/components/`

| Component | Description |
|---|---|
| `ProfilePageClient.jsx` | Parent client component for profile page |
| `ProfileSidebar.jsx` | Left nav: photo, name, tab links |
| `ProfileForm.jsx` | Editable user profile fields |
| `BookingsSection.jsx` | Tabbed list of ongoing + completed bookings |
| `PaymentsSection.jsx` | Payment history + invoice downloads |
| `SupportSection.jsx` | Support ticket list + create new ticket |
| `Breadcrumb.jsx` | Profile page breadcrumb navigation |

### `features/cart/components/`

| Component | Description |
|---|---|
| `CartDrawer.jsx` | Slide-in cart side panel |
| `CartItems.jsx` | Cart item list with quantity/remove |
| `EmptyCart.jsx` | Empty cart illustration + CTA |

### `features/notification/components/`

| Component | Description |
|---|---|
| `NotificationDrawer.jsx` | Slide-in notifications panel |

### `features/logout/components/`

Contains `LogoutModal.jsx` — a confirmation dialog before signing out.

---

## 7. State Management (Redux)

### Store Configuration (`lib/redux/store/index.js`)

```js
store = configureStore({
  reducer: {
    auth,          // login state, user object, token
    booking,       // current booking, service details, history
    user,          // lightweight user state (sync with auth)
    services,      // discover/services list from API
    userProfile,   // full profile data for profile page
    availability,  // time-slot availability data
    pricing,       // job pricing calculations
    payment,       // Razorpay order & verification state
    tickets,       // support ticket list
    dashboard,     // header stats: notifications, cart count
    notifications, // notifications list with pagination
  }
})
```

`devTools` is enabled only in development. The `serializableCheck` ignores `auth/login/fulfilled` and `auth.user.createdAt`.

### Custom Hooks (`lib/redux/store/hooks.js`)

```js
useAppDispatch()   // typed dispatch
useAppSelector()   // typed selector
```

---

### Slice Reference

#### `authSlice`

**State shape:**
```js
{
  isAuthenticated: boolean,
  token: string | null,
  user: object | null,
  guestToken: string | null,
  guestData: object | null,
  userType: 'user' | 'guest' | null,
  isLoading: boolean,
  error: string | null,
  otpSent: boolean,
}
```

**Async Thunks:**
| Thunk | API Call | Description |
|---|---|---|
| `sendOtp(mobileNumber)` | `POST /auth/send-otp` | Send OTP to phone |
| `verifyOtp({ mobileNumber, otp, fcmToken })` | `POST /auth/verify-otp` | Verify OTP + receive token |
| `logout()` | `POST /auth/logout` | Server-side logout |
| `getProfile()` | `GET /user/profile` | Fetch current user profile |
| `guestAccess()` | `POST /auth/guest-access` | Get guest token for unauthenticated browsing |
| `initializeAuth()` | Local only | Restore auth state from localStorage on app load |

**Synchronous actions:**
- `setAuthFromStorage({ token, user })` — restore session from localStorage
- `setGuestFromStorage({ token, guestData })` — restore guest session
- `clearError()` — reset error state
- `resetOtpState()` — reset OTP flow

---

#### `bookingSlice`

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchServiceById(serviceId)` | `GET /services/:id` |
| `createBooking(bookingData)` | `POST /bookings` |
| `fetchBookingHistory(userId)` | `GET /bookings/history` |
| `fetchCustomerBookings(status)` | `GET /customer/bookings` |
| `fetchOngoingBookings({ page, pageSize, statuses })` | `GET /customer/bookings?servicesStatus=…` |
| `fetchCompletedBookings({ page, pageSize })` | `GET /customer/bookings?servicesStatus=completed` |

---

#### `discoverSlice` (services)

Handles the full service/category catalog for the Discover/Book pages.

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchAllServices()` | `GET /services` |
| `fetchServiceById(id)` | `GET /services/:id` |

---

#### `userProfileSlice`

Manages the full user profile for the Profile page, including save/update.

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `getUserProfile()` | `GET /user/profile` |
| `updateUserProfile(profileData)` | `PUT /user/profile` (supports `FormData` for avatar) |

---

#### `availabilitySlice`

Fetches available time-slots for a given service duration.

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchHoursAvailability(duration)` | `GET /admin/availability?duration=…` |

---

#### `pricingSlice`

Calculates pricing for a job configuration.

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchPricing(pricingData)` | `POST /jobs/pricing` |

---

#### `paymentSlice`

Handles Razorpay order creation and verification.

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `createPaymentOrder({ jobId, amount })` | `POST /payments/create-order` |
| `verifyPayment(paymentData)` | `POST /payments/verify` |
| `fetchPaymentHistory({ page, limit })` | `GET /payments/history` |
| `downloadInvoice(jobId)` | `POST /payments/invoice/download/:jobId` (blob) |

---

#### `ticketSlice`

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchTickets({ page, limit })` | `GET /tickets/user/all-tickets` |
| `createTicket(data)` | `POST /tickets/ticket` |
| `fetchTicketMessages(ticketId)` | `GET /ticket-messages/:ticketId` |

---

#### `dashboardSlice`

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchDashboardStats()` | `GET /dashboard/stats` |

Provides: `unreadNotificationsCount`, `cartItemCount`, `totalPendingJobs` — displayed as badges in the Header.

---

#### `notificationsSlice`

**Async Thunks:**
| Thunk | API Call |
|---|---|
| `fetchAllNotifications({ page, limit })` | `GET /notifications/allnotifications` |
| `deleteNotification(id)` | `DELETE /notifications/deletenotification/:id` |

---

## 8. Providers & Context

### Provider Nesting Order

```
ReduxProvider                  ← Enables useSelector/useDispatch everywhere
  GuestAccessProvider          ← Bootstraps auth (user or guest token) on first load
    ToastProvider              ← Provides showToast() via ToastContext
      SocketProvider           ← Manages global Socket.IO connection + push notifications
        ThemeRegistry (MUI)    ← MUI theme + Emotion SSR cache
          LayoutWrapper        ← Header + Footer + auth init
            {page children}
```

### Context APIs

#### `ToastContext`
```js
const { showToast } = useToast();
showToast('success' | 'error' | 'info' | 'general', title, message);
```

#### `SocketContext`
```js
const { isConnected, notifications } = useSocket();
```

---

## 9. Styling System

### Design Tokens (CSS Variables in `globals.css`)

```css
/* Brand colors */
--quickhire-green: #45A735
--quickhire-green-dark: #26472B
--quickhire-green-light: #78EB54

/* Text */
--text-primary: #484848
--text-secondary: #636363
--dark-text-primary: #000000

/* Backgrounds */
--bg-primary: #ffffff
--bg-secondary: #f5f7f5
--bg-tertiary: #F2F9F1

/* Typography scale */
--font-size-12 to --font-size-35
--font-weight-400 to --font-weight-700
```

### Tailwind Configuration

Extended with:
- **Custom brand colors:** `quickhire.green`, `quickhire.green-dark`, `quickhire.green-light`
- **Custom fonts:** `open-sauce`, `open-sauce-bold`, `open-sauce-medium`, `open-sauce-semibold`, `open-sauce-extrabold` (hosted in `/public/fonts/`)
- **Custom spacing:** `18`, `70`, `78`, `90`
- **Custom animation:** `float` (floatUpDown, 3s infinite)

### Typography

The base font is **Open Sauce One** (custom web font, multiple weights). It is loaded via `@font-face` in `globals.css`.

### MUI Theme

MUI components are used for complex interactive UI (drawers, modals, menus, icons). The theme is injected via `ThemeRegistryFixed`, which ensures SSR compatibility with Next.js App Router.

---

## 10. Real-time / Socket Layer

### `lib/services/chatSocketService.js`

A **singleton class** managing the Socket.IO connection.

#### Connection Config
```js
chatSocketService.connect({
  baseUrl,       // NEXT_PUBLIC_API_URL
  roomId,        // PM user ID or user ID for global notifications
  userId,        // Current authenticated user ID
  serviceId,     // Combined into room: `${roomId}_service_${serviceId}`
  authToken,     // JWT, added to socket `query.token` and `auth.token`
  ticketId,      // For support-chat rooms

  // Callbacks
  onMessageReceived,
  onConnected,
  onDisconnected,
  onError,
  onTypingStatusReceived,
  onMessageSeen,
})
```

#### Socket Options
```js
{
  path: '/api/socket.io',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
}
```

#### Key Behaviors
- **Room ID construction:** `${roomId}_service_${serviceId}` for chat rooms; plain `userId` for global notifications.
- **Auth token:** JWT stripped of `Bearer ` prefix, sent in both `query.token` and `auth.token`.
- **Notification persistence:** The `onNotificationReceived` callback persists across chat reconnections (preserved by `SocketProvider`).
- **Duplicate connection prevention:** If already connected to the same room/user, reconnection is skipped.

#### Callbacks Map

| Callback | Triggered By |
|---|---|
| `onMessageReceived` | Incoming chat message |
| `onConnected` | Socket `connect` event |
| `onDisconnected` | Socket `disconnect` event |
| `onError` | Socket `connect_error` event |
| `onTypingStatusReceived` | Remote typing indicator |
| `onMessageSeen` | Message read receipt |
| `onNotificationReceived` | Push notification (global, persistent) |
| `onRefreshMessages` | Server-side trigger to reload messages |

---

## 11. Routing & Navigation

### Next.js App Router

- **Route groups:** `(home-page)` groups the homepage without adding a URL segment.
- **Dynamic routes:** `[id]` folders for service details, booking workspace, booking ongoing, and support chat.
- **Metadata exports:** Each major page exports a `metadata` object for SEO.

### Header vs Footer Visibility

```
Login page   → No Header, No Footer
/service-details/*   → Header shown, Footer hidden
/booking-workspace/* → Header shown, Footer hidden
/support-chat/*      → Header shown, Footer hidden
All others   → Header + Footer shown
```

### Client-Side Navigation

- `useRouter()` from `next/navigation` is used for programmatic navigation.
- `usePathname()` drives conditional Header/Footer rendering.
- `useParams()` reads dynamic route segments.
- `useSearchParams()` reads query parameters in `/chat`.

---

## 12. Authentication Flow

### OTP Login Flow

```
User enters mobile → sendOtp(mobile)
  → POST /auth/send-otp
  → otpSent = true → show OTP input

User enters OTP → verifyOtp({ mobile, otp, fcmToken })
  → POST /auth/verify-otp
  → response: { token, user, isNewUser }

If isNewUser = true  → show profile setup form → PUT /user/profile
If isNewUser = false → store token + user in localStorage → redirect to home
```

### Session Persistence

Tokens are stored in `localStorage`:
| Key | Value |
|---|---|
| `token` | JWT for authenticated users |
| `user` | JSON of user object (may be nested: `{ data: {...} }`) |
| `userType` | `'user'` or `'guest'` |
| `guestToken` | JWT for guest access |
| `guestData` | JSON of guest data object |

On page load, `LayoutWrapper` dispatches `initializeAuth` which reads `localStorage` and populates Redux state.

### Guest Access

Unauthenticated visitors are assigned a guest token automatically by `GuestAccessProvider`. This allows them to browse services and view details without logging in.

### Logout

The `logout()` helper in `lib/utils/authHelpers.js`:
1. Disconnects the Socket.IO connection.
2. Clears all auth keys from `localStorage`.
3. Redirects to `/login`.

### Token Injection (Axios Interceptor)

All non-public requests automatically include the auth token via the Axios request interceptor in `lib/axios/axiosInstance.js`:

```
request.headers.Authorization = `Bearer ${token}`
```

Public endpoints (OTP, guest access, contact-us) skip token injection.

---

## 13. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend REST API base URL |

---

## 14. Build & Configuration

### `next.config.js` Highlights

```js
distDir: 'build'                     // Custom build output (not .next/)
pageExtensions: ['js', 'jsx']        // No TypeScript
turbopack.resolveAlias: { '@': '.' } // Path alias for @/ imports
experimental.optimizePackageImports  // Tree-shake MUI
images.remotePatterns                // Allowed external image hosts:
                                     //   unsplash.com, quickhire.services, demo16.vcto.in
images.formats: ['webp', 'avif']     // Modern image formats
```

### Path Aliases

`@/` maps to the workspace root (e.g., `@/lib/services/authApi.js`), configured in both `jsconfig.json` and `next.config.js` turbopack.

### Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build → /build/
npm run start    # Start production server
npm run lint     # ESLint
```

### Custom Build Output

The project uses `distDir: 'build'` in `next.config.js`. This means the compiled output is at `/build/` instead of the default `/.next/`. Ensure the production server points to the `build` directory.

---

*End of Frontend Documentation*
