# QuickHire — User Portal Design Specification
> **Version:** 1.0 · **Date:** 2026-04-30  
> **Scope:** Every user-facing page, component, layout pattern, colour token, typography rule, spacing system, interaction state, and responsive behaviour in the QuickHire frontend.  
> **Rule:** Any new component or page added to the user portal **must** conform to every section of this document without exception.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Colour System](#2-colour-system)
3. [Typography](#3-typography)
4. [Spacing & Layout Grid](#4-spacing--layout-grid)
5. [Breakpoints & Responsive Rules](#5-breakpoints--responsive-rules)
6. [Iconography & Imagery](#6-iconography--imagery)
7. [Component Library](#7-component-library)
   - 7.1 [Header](#71-header)
   - 7.2 [Footer](#72-footer)
   - 7.3 [Buttons](#73-buttons)
   - 7.4 [Cards](#74-cards)
   - 7.5 [Form Inputs](#75-form-inputs)
   - 7.6 [Badges & Pills](#76-badges--pills)
   - 7.7 [Modals & Drawers](#77-modals--drawers)
   - 7.8 [Toast Notifications](#78-toast-notifications)
   - 7.9 [Skeleton Loaders](#79-skeleton-loaders)
   - 7.10 [Pagination](#710-pagination)
   - 7.11 [Section Wrappers](#711-section-wrappers)
8. [Page-by-Page Specification](#8-page-by-page-specification)
   - 8.1 [Home Page (`/`)](#81-home-page-)
   - 8.2 [Login Page (`/login`)](#82-login-page-login)
   - 8.3 [Book Your Resource (`/book-your-resource`)](#83-book-your-resource-book-your-resource)
   - 8.4 [Service Details (`/service-details/[id]`)](#84-service-details-service-detailsid)
   - 8.5 [Cart (`/cart`)](#85-cart-cart)
   - 8.6 [Checkout (`/checkout`)](#86-checkout-checkout)
   - 8.7 [Payment Success (`/payment-success`)](#87-payment-success-payment-success)
   - 8.8 [Booking Workspace (`/booking-workspace/[id]`)](#88-booking-workspace-booking-workspaceid)
   - 8.9 [Booking Ongoing (`/booking-ongoing/[id]`)](#89-booking-ongoing-booking-ongoingid)
   - 8.10 [Profile (`/profile`)](#810-profile-profile)
   - 8.11 [Notifications (`/notifications`)](#811-notifications-notifications)
   - 8.12 [Chat (`/chat`)](#812-chat-chat)
   - 8.13 [Support Chat (`/support-chat/[id]`)](#813-support-chat-support-chatid)
   - 8.14 [About Us (`/about-us`)](#814-about-us-about-us)
   - 8.15 [How It Works (`/how-it-works`)](#815-how-it-works-how-it-works)
   - 8.16 [FAQ (`/faq`)](#816-faq-faq)
   - 8.17 [Contact Us (`/contact-us`)](#817-contact-us-contact-us)
   - 8.18 [Legal Pages](#818-legal-pages)
9. [Interaction & Animation Standards](#9-interaction--animation-standards)
10. [RTL & Internationalisation](#10-rtl--internationalisation)
11. [Accessibility Standards](#11-accessibility-standards)
12. [State Patterns](#12-state-patterns)
13. [Data & API Integration Rules](#13-data--api-integration-rules)
14. [Do's and Don'ts](#14-dos-and-donts)

---

## 1. Design Philosophy

QuickHire's user portal communicates **trust, speed, and professionalism**. Every design decision is driven by three principles:

| Principle | Meaning |
|---|---|
| **Clarity first** | Users must understand what to do on every screen without reading instructions. Primary actions are always visually dominant. |
| **Green = action** | The brand green (`#45A735`) is reserved exclusively for CTAs, active states, and positive confirmations. Never use it decoratively. |
| **Calm confidence** | White and light-green backgrounds (`#F2F9F1`, `#F5F7F5`) create breathing room. Avoid dense, cluttered layouts. Generous whitespace is mandatory. |

The platform is built with:
- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (utility classes)
- **MUI v6** (Material UI — used for complex components: Stepper, Accordion, Chips, Drawer)
- **Redux Toolkit** (global state)
- **next-intl** (i18n — 8 locales)
- **Socket.IO** (real-time chat and notifications)

---

## 2. Colour System

### 2.1 Brand Palette (CSS Variables)

All colours are defined in `globals.css` as CSS custom properties. **Never use raw hex values in JSX — always use the variable or a Tailwind class mapped to the variable.**

| Variable | Hex | Usage |
|---|---|---|
| `--quickhire-green` | `#45A735` | Primary CTAs, active nav, icons, borders on active cards |
| `--quickhire-green-dark` | `#26472B` | Headings on green backgrounds, sidebar text |
| `--quickhire-green-light` | `#78EB54` | Decorative accents only — never for text |
| `--quickhire-green-light-second` | `#4FA735` | Hover states on green elements |
| `--section-title-green` | `#3fa92d` | Section heading highlights |

### 2.2 Text Colours

| Variable | Hex | Usage |
|---|---|---|
| `--text-primary` | `#484848` | Default body text |
| `--text-secondary` | `#636363` | Subtitles, helper text |
| `--text-muted` | `#909090` | Placeholder text, timestamps, meta labels |
| `--text-tertiary` | `#D9D9D9` | Disabled states, dividers |
| `--dark-text-primary` | `#000000` | High-contrast headings |
| `--dark--text-secondary` | `#242424` | Section titles |

### 2.3 Background Colours

| Variable | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Card backgrounds, modals, default page |
| `--bg-secondary` | `#F5F7F5` | Page backgrounds, admin shells |
| `--bg-tertiary` | `#F2F9F1` | Section backgrounds (light green tint), header strip |

### 2.4 Semantic Colours (Hardcoded, contextual)

| Purpose | Hex | Usage |
|---|---|---|
| Error / Danger | `#EF4444` (red-500) | Error messages, "What's Not Included" borders |
| Error background | `#FFF5F5` | Error section backgrounds |
| Warning | `#F59E0B` | Expiring badges, pending states |
| Success dark | `#26472B` | Active stat cards |
| Card border | `#E5F1E2` | All card borders throughout the portal |
| Connector inactive | `#D1D5DB` | Stepper connectors, inactive step icons |

### 2.5 Card & Interactive Colours

| Token | Hex | Usage |
|---|---|---|
| `--card-bg` | `#45A7350D` | Service card light background tint |
| `--card-bg-hover` | `#44A7355F` | Service card hover background |

### 2.6 Colour Rules

- **Green on white only.** Never place `#45A735` text on a green background.
- **Red is error-only.** No decorative red anywhere.
- **Badges use tinted backgrounds.** Active = `#E5F1E2` bg + `#26472B` text. Inactive = `#F5F5F5` bg + `#909090` text.
- **Hover darken rule.** Green buttons hover to `#3d9230`. White/outline buttons hover to `#F2F9F1` bg.

---

## 3. Typography

### 3.1 Font Family

The portal uses exclusively **Open Sauce One** — a custom web font served from `/fonts/open-sauce-one-webfont (1)/`. No Google Fonts, no system fonts for UI text.

| Weight Class | CSS font-family | Tailwind Class | Usage |
|---|---|---|---|
| Light (300) | `Open Sauce One Light` | — | Rarely used; large decorative text only |
| Regular (400) | `Open Sauce One Regular` | `font-open-sauce` | Default body, labels |
| Medium (500) | `Open Sauce One Medium` | `font-open-sauce-medium` | Sub-labels, card descriptions |
| SemiBold (600) | `Open Sauce One SemiBold` | `font-open-sauce-semibold` | Table headers, secondary CTAs |
| Bold (700) | `Open Sauce One Bold` | `font-open-sauce-bold` | Section headings, modal titles |
| ExtraBold (800) | `Open Sauce One ExtraBold` | — | Hero headings only |
| Italic | `Open Sauce One Italic` | — | Brand highlights (e.g. "QuickHire" in hero) |

> **MUI components** use `font-opensauce` (Tailwind shorthand) via the ThemeRegistry override.

### 3.2 Font Size Scale

Defined as CSS variables **and** used directly via Tailwind responsive variants.

| Variable | Value | Usage |
|---|---|---|
| `--font-size-35` | 35px | Page H1 (desktop) |
| `--font-size-24` | 24px | Section H2 |
| `--font-size-22` | 22px | Hero heading highlight |
| `--font-size-20` | 20px | Card titles, footer column headers |
| `--font-size-18` | 18px | Tech chips, large body |
| `--font-size-16` | 16px | Standard body, nav links |
| `--font-size-14` | 14px | Small body, descriptions |
| `--font-size-12` | 12px | Labels, captions, meta text |

### 3.3 Responsive Typography Rules

- H1 on mobile: `text-2xl` (24px) → on desktop: `var(--font-size-35)` (35px)
- H2 on mobile: `text-2xl` → on desktop: `var(--font-size-24)` or `var(--font-size-35)`
- Body: always 14–16px, never smaller than 12px
- All font sizes use `clamp()` or Tailwind responsive prefixes (`xs:`, `md:`, `lg:`) — **no fixed px for body text on mobile**

### 3.4 Line Height

- Headings: `lineHeight: 1.2`
- Body: `lineHeight: 1.6`
- Small labels: `lineHeight: 1.4`

---

## 4. Spacing & Layout Grid

### 4.1 Container Widths

| Context | Rule |
|---|---|
| Full-width sections (Hero, Footer) | `width: 100%`, no max-width container |
| Content sections | `max-w-7xl mx-auto` |
| Narrow text sections (FAQ answers, legal) | `max-w-4xl mx-auto` |
| Modal content | `max-w-lg` (small) · `max-w-2xl` (medium) · `max-w-4xl` (large form) |

### 4.2 Horizontal Padding

| Breakpoint | px class | Actual value |
|---|---|---|
| Mobile (`< 768px`) | `px-4` | 16px |
| Tablet (`768–1023px`) | `px-8` | 32px |
| Desktop (`≥ 1024px`) | `px-20` | 80px |

In the Header: `px-4` → `px-8` → `px-20` explicitly applied via JS screen-size detection.  
In Footer: `pl-3/pr-3` → `pl-4/pr-4` → `pl-[66px]/pr-[66px]`.

### 4.3 Vertical Rhythm

- Section padding: `py-12` (48px) on desktop, `py-6` (24px) on mobile
- Card internal padding: `p-5` to `p-8` depending on card size
- Between sections on a page: minimum `gap-6` (24px), typically `gap-8` to `gap-12`
- Grid gaps: `gap-4` (16px) for card grids, `gap-6` (24px) for large cards

### 4.4 Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Inputs, small buttons, badges |
| `rounded-xl` | 12px | Cards, medium buttons |
| `rounded-2xl` | 16px | Large cards, modals, drawers |
| `rounded-full` | 50% | Chips, avatar circles, step icons, pills |

### 4.5 Shadow Scale

| Class | Usage |
|---|---|
| `shadow-none` | Default cards (border only) |
| `shadow-[0_1px_3px_rgba(38,71,43,0.04)]` | Subtle card elevation |
| `shadow-2xl` | Modals, mobile sidebar |
| `boxShadow: '0px 23px 45.6px 0px #0000000A'` | Booking stepper panel |

---

## 5. Breakpoints & Responsive Rules

| Name | Min width | Tailwind prefix | JS detection |
|---|---|---|---|
| Mobile | 0px | `xs:` (default) | `width < 768` |
| Tablet | 768px | `md:` | `width < 1024` |
| Desktop | 1024px | `lg:` | `width ≥ 1024` |
| Wide | 1280px | `xl:` | — |

### 5.1 Layout Shifts by Breakpoint

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header height | 57px (mobile bar) | 72px | 72px |
| Header padding | `px-4` | `px-8` | `px-20` |
| Logo size | 28×28px | 32×32px | 36×36px |
| Nav items | Hidden (burger menu) | Visible | Visible |
| Cart/Notif icons | Inline in header | Part of nav | Part of nav |
| Service detail layout | Stacked (single col) | Stacked | Side-by-side (55% / 45%) |
| Profile layout | Stacked (tabs) | Stacked | Sidebar + content |
| Footer columns | Stacked + centered | Row | Row with `gap-120px` |
| Card grids | 1 col | 2 col | 3–4 col |

### 5.2 Mobile-Specific Rules

- All `<a>` / `<button>` touch targets: **minimum 44×44px**
- Mobile menu: slides in from the right (LTR) / left (RTL) as an overlay drawer, width 280px
- Body scroll is locked (`overflow: hidden`) when mobile menu is open
- Cart and notification icons appear **inline in the header bar** (not in the burger menu) when authenticated on mobile

---

## 6. Iconography & Imagery

### 6.1 Icons

- **Source:** All icons are SVG files served from the `/public` root (e.g. `/cartIcon.svg`, `/bellIcon.svg`, `/profileIcon.svg`)
- **Inline SVG** is used for custom icons in components (stepper connector, breadcrumb chevrons, close buttons)
- **MUI Icons** are used only inside MUI components (e.g. `CheckCircleIcon`, `CancelIcon`, `ExpandMoreIcon`, `ArrowOutwardIcon`)
- **No icon font libraries** (FontAwesome, Heroicons package, etc.) are used

### 6.2 Icon Sizes

| Context | Size |
|---|---|
| Header nav icons (mobile) | 20×20px |
| Header nav icons (desktop) | 24×24px |
| Footer social icons | 24×24px |
| Service feature icons | 24×24px |
| Inline SVG (buttons, breadcrumbs) | 16×16px |

### 6.3 Notification & Cart Badges

- Position: `absolute -top-1 -end-1` (RTL-safe using logical property `end`)
- Size: `h-5 w-5` (20px circle)
- Colour: `bg-red-500 text-white`
- Font: `text-xs font-bold`
- Shown only when count `> 0`

### 6.4 Images

- All images use Next.js `<Image />` component — mandatory for performance
- `priority` prop on above-the-fold images (logo, hero)
- Aspect ratios preserved with `h-auto w-auto`
- Service card illustration: `/images/book-services/service_man.png`
- Banner asset: `/images/book-services/service-banner.svg`
- Social: `/images/footer/insta_logo.png`, `linkedin_logo.png`, `pinterest_logo.png`, `yt_logo.png`

---

## 7. Component Library

### 7.1 Header

**File:** `components/layout/Header.jsx`  
**Position:** `sticky top-0 z-50`  
**Height:** `h-[72px]` (desktop/tablet) · `h-[57px]` (mobile bar portion)  
**Background:** `bg-white`  
**Border:** `border-b border-gray-200`

#### Nav Links
```
Home · Book Experts · How It Works · Contact Us
```
- Active: `text-[#45A735] font-semibold`
- Inactive: `text-gray-600 font-normal hover:text-[#45A735]`
- Font: `font-opensauce`
- Desktop size: `text-base` · Tablet: `text-sm`

#### Authenticated State (Desktop)
Right side of header shows (left to right):
1. **LocaleCurrencySwitcher** — language + currency selector
2. **Cart icon** (`/cartIcon.svg`) — red badge when `cartItemCount > 0`
3. **Bell icon** (`/bellIcon.svg`) — red badge when `unreadNotificationsCount > 0`
4. **Profile icon** → dropdown with: My Profile, Bookings, Payments, Support & Help, Log Out

#### Unauthenticated State
Shows **Sign In** button: `border border-[#45A735] rounded-lg text-[#45A735] hover:bg-[#45A735] hover:text-white`

#### Stats Caching
- Stats (`cartItemCount`, `unreadNotificationsCount`) fetched from `GET /dashboard/stats`
- TTL: 60 seconds — no re-fetch on every route change
- Real-time badge update: Socket `notification:new` event increments badge instantly without API call

#### Mobile Menu
- Trigger: hamburger icon (3 lines) → X icon when open
- Drawer: slides from `end` (right in LTR, left in RTL), width 280px, `z-40`
- Backdrop: `bg-black/50 z-30` — click to close
- Contains: nav links, LocaleCurrencySwitcher, profile links (if auth) or Sign In button

---

### 7.2 Footer

**File:** `components/layout/Footer.jsx`  
**Background:** `#F2F9F1`  
**Padding:** `py-4` · `pl-3/pr-3` → `pl-4/pr-4` → `pl-[66px]/pr-[66px]`

#### Columns (Desktop — horizontal row)

| Column | Content |
|---|---|
| Brand | Logo + tagline (i18n: `footer.tagline`) |
| Knowledge Hub | Industry Perspectives (blog), Enterprise, About Us, FAQs |
| Company | How It Works, Contact Us, Terms & Conditions, Privacy Policy, Cancellation Policy |
| Follow Us | Instagram, LinkedIn, Pinterest, YouTube (24×24px icons) |

- Column header: `fontSize: 20–22px, fontWeight: 600, color: var(--quickhire-green)`
- Links: `fontSize: 12–15px, fontWeight: 400, color: #322C42, hover: var(--quickhire-green)`
- All external links: `target="_blank" rel="noopener noreferrer"`

#### Mobile
Columns stack vertically, content centered (`alignItems: center, textAlign: center`)

---

### 7.3 Buttons

#### Primary Button
```
bg-[#45A735] text-white font-semibold rounded-lg
hover:bg-[#3d9230]
px-5 py-2.5 text-base (desktop)
px-4 py-2 text-sm (compact / tablet)
transition-all duration-200
```

#### Outline Button
```
border border-[#45A735] text-[#45A735] bg-transparent rounded-lg font-semibold
hover:bg-[#45A735] hover:text-white
px-5 py-2.5
transition-all duration-200
```

#### Ghost / Subtle Button
```
text-[#636363] border border-[#E5F1E2] rounded-xl
hover:bg-[#F7FBF6]
```

#### Danger Button
```
bg-red-500 text-white rounded-lg
hover:bg-red-600
```

#### Disabled State
All buttons: `disabled:opacity-50 cursor-not-allowed`

#### Loading State
Show inline spinner SVG + "Saving…" / "Loading…" text. Never hide the button.

#### Size Variants
- `sm`: `px-3 py-1.5 text-xs`
- `md` (default): `px-4 py-2 text-sm`
- `lg`: `px-5 py-2.5 text-base`

---

### 7.4 Cards

#### Service Card (Grid)
- Border: `border border-[#E5F1E2] rounded-2xl`
- Background: white with `bg-[--card-bg]` tint on hover
- Shadow: none by default, subtle on hover
- Contains: service image, name, tech tags, price, "Book Now" CTA

#### Info Card (ServiceHeader features)
```
border: 1px solid var(--Ui-Color-Secondary-Light, #D9E5E3)
borderRadius: 12px
padding: 12px 16px
display: flex + gap 12px
```

#### Process Step Card (BookingCard)
```
borderRadius: 16px
padding: 24px
backgroundColor: #FFFFFF
minHeight: 220px
boxShadow: none
```
- Number badge: 33×33px circle, `bg-[#45A735]`, white text, `fontWeight: 700`

#### Transparent Execution Promise Box (What You Get)
```
border: 2px solid #45A735
borderRadius: 16px
padding: 32px
backgroundColor: #F5FFF5
```

#### Not Included Box
```
border: 2px solid #EF4444
borderRadius: 16px
padding: 32px
backgroundColor: #FFF5F5
```

---

### 7.5 Form Inputs

#### Text Input (standard)
```
w-full border border-[#E5F1E2] rounded-xl px-4 py-2.5 text-sm
outline-none focus:border-[#45A735] focus:ring-1 focus:ring-[#45A73520]
transition-colors
placeholder: text-[#909090]
```

#### Textarea
Same as input but `resize-none` and explicit `rows` prop

#### Select
```
w-full border border-[#E5F1E2] rounded-xl px-3 py-2.5 text-sm bg-white
focus:outline-none focus:border-[#45A735]
```

#### Label
```
text-[10px] OR text-xs
font-semibold (font-open-sauce-semibold)
text-[#636363]
UPPERCASE tracking-wider
mb-1 or mb-1.5
```

#### Validation States
- Valid: default border `border-[#E5F1E2]`
- Error: `border-red-300 bg-red-50/30`
- Focused: `border-[#45A735] ring-1 ring-[#45A73520]`

#### Tag Input (Technologies)
- Container: `flex flex-wrap gap-1.5 min-h-[42px] border border-[#E5F1E2] rounded-lg px-2 py-1.5 cursor-text`
- Tags: `bg-[#E5F1E2] text-[#26472B] text-xs font-medium px-2 py-1 rounded-md`
- Remove: `×` button with `hover:text-red-500`
- Trigger: Enter, comma, or Tab to add · Backspace to remove last

---

### 7.6 Badges & Pills

#### Status Active
```
bg-[#E5F1E2] text-[#26472B] text-xs font-semibold px-2.5 py-1 rounded-full
```

#### Status Inactive
```
bg-[#F5F5F5] text-[#909090] text-xs font-semibold px-2.5 py-1 rounded-full
```

#### Tech Chip (MUI Chip on service page)
```
backgroundColor: #45A73512
padding: 24px 16px
fontSize: var(--font-size-18)
fontWeight: 400
color: var(--text-primary)
borderRadius: 50px
icon: ArrowOutwardIcon color #45A735
```

#### Notification Red Badge
```
bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5
absolute -top-1 -end-1
```

#### Booking Status Badge (in profile/booking lists)
Colour mapping:
- `pending` → yellow bg
- `confirmed` → green bg
- `in_progress` → blue bg
- `completed` → grey bg
- `cancelled` → red bg

---

### 7.7 Modals & Drawers

#### Standard Modal
```
fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
```
Inner container:
```
bg-white rounded-2xl shadow-2xl w-full max-w-{size} max-h-[90vh] overflow-y-auto
```

#### Modal Header
```
px-6 pt-6 pb-4 border-b border-[#E5F1E2]
Title: text-lg font-open-sauce-bold text-[#26472B]
Close button: top-right, × character or SVG, text-[#909090] hover:text-[#484848]
```

#### Dismissal
- Click backdrop → close
- Escape key → close (implement `useEffect` with keydown listener)
- Explicit cancel/close button

#### Notification Drawer
- Slides from right side
- Width: full screen on mobile, 400px on desktop
- `z-50` overlay

---

### 7.8 Toast Notifications

**File:** `lib/utils/toast.js`  
**Provider:** `components/providers/ToastProvider.jsx`

| Function | Style | Position |
|---|---|---|
| `showSuccess(msg)` | Green background | Top-right |
| `showError(msg)` | Red background | Top-right |
| `showWarning(msg)` | Amber background | Top-right |

- **Never use `window.alert()`** or `window.confirm()` — all feedback must use toasts or inline confirm UI
- Auto-dismiss after 4 seconds
- Stack maximum 3 toasts at a time

---

### 7.9 Skeleton Loaders

**File:** `features/homepage/components/ServiceCardSkeleton.jsx`

- Animated shimmer: `animate-pulse bg-gray-200 rounded`
- Match exact dimensions of the real content they replace
- Show immediately on mount before data arrives
- Remove immediately when data resolves — never show both skeleton and content simultaneously

---

### 7.10 Pagination

**File:** `components/common/Pagination.jsx`

- Show only when `totalPages > 1`
- Active page: `bg-[#45A735] text-white`
- Inactive: `border border-[#E5F1E2] text-[#636363] hover:bg-[#F7FBF6]`
- Previous/Next: disabled when at boundaries (`opacity-40`)
- Page number buttons: `rounded-lg px-3 py-1.5 text-sm`

---

### 7.11 Section Wrappers

**Files:** `components/common/SectionWrapper.jsx`, `SectionHeader.jsx`

#### SectionWrapper
```
<section className="py-12 px-4 md:px-8 lg:px-20">
  <div className="max-w-7xl mx-auto">
    {children}
  </div>
</section>
```

#### SectionHeader
```
<div className="text-center mb-8 md:mb-12">
  <p className="text-sm text-[#636363] font-medium mb-2">{subtitle}</p>
  <h2 className="text-3xl md:text-4xl font-bold text-[#242424]">
    {titlePart1} <span className="text-[#45A735] italic">{highlight}</span> {titlePart2}
  </h2>
</div>
```

The **italic green highlight** pattern (e.g. *"QuickHire"*, *"Hire"*) is used consistently across section headings on the homepage, about us, and how-it-works pages.

---

## 8. Page-by-Page Specification

### 8.1 Home Page (`/`)

**File:** `app/(home-page)/page.jsx`  
**Layout:** Full-width sections stacked vertically. Header + Footer wrap.

#### Sections (in order)

| # | Section Component | Description |
|---|---|---|
| 1 | `HeroSection` | Animated headline, subtitle, primary CTA "Book Expert" |
| 2 | `ClientLogos` | Horizontal scroll of client brand logos |
| 3 | `ClientSection` | Testimonials / client quotes |
| 4 | `BookResourceSection` | Service category cards — links to `/book-your-resource` |
| 5 | `WhyQuickSection` | 4-column USP grid |
| 6 | `HireWithConfidence` | Trust badges, verification process |
| 7 | `HowHireWork` | 5-step process visualization |
| 8 | `TechStack` | Tech icons / supported technologies |
| 9 | `VibeCoding` | Video or illustration section |
| 10 | `WeDeploy` | Deployment/output examples |
| 11 | `CarouselSection` | Rotating testimonials or feature carousel |
| 12 | `HowItWorksFaq` | Collapsed FAQ accordion |
| 13 | `LetAnswer` | Final CTA section |

#### Hero Section Rules
- Heading: animated word cycling (fadeSlideIn / fadeSlideOut CSS keyframes, 500ms)
- Primary CTA: `bg-[#45A735] text-white rounded-lg px-6 py-3 text-base font-semibold`
- Background: gradient from `rgba(243, 249, 241, 1)` to `rgba(255, 255, 255, 1)`

#### Service Cards Loading
- Show `ServiceCardSkeleton` while fetching from Redux store
- Cards appear in a grid: 1 col mobile, 2 col tablet, 3–4 col desktop

---

### 8.2 Login Page (`/login`)

**File:** `app/login/page.jsx`  
**Component:** `components/auth/LoginForm.jsx`

#### Layout
- Centered card, max-width `max-w-md`, `mx-auto`, `mt-20`
- Logo at top of card
- Clean white card with `rounded-2xl shadow-lg p-8`

#### Form Fields
- Mobile number input (OTP-based auth)
- OTP input (6 digits, separated boxes or single field)
- Submit: `bg-[#45A735] text-white w-full`

#### Guest Access
- **GuestAccessProvider** (`components/auth/GuestAccessProvider.jsx`) issues a guest token for unauthenticated browsing
- Guest token stored in `localStorage.guestToken`
- Triggers `dispatch(guestAccess())` if no auth token and no guest token exists

#### Post-Login Redirect
- On success: `router.replace(next || '/')` where `next` is the `?next=` query param
- On login: fires `window.dispatchEvent(new Event('userLoggedIn'))` to refresh header stats

---

### 8.3 Book Your Resource (`/book-your-resource`)

**File:** `app/book-your-resource/page.jsx` + `BookResourceClient.jsx`

#### Layout
- Full-width page within header/footer
- Service selection grid

#### Components
| Component | Purpose |
|---|---|
| `HeroSectionV3` | Page hero with headline and search |
| `Mainbanner` | Promotional banner below hero |
| `ServiceSelectionGridV5` | Main service card grid |
| `ServiceCardGridV3` | Alternate service card layout |
| `BookYourResourceGrid` | Resource-type filter + grid |
| `Bookresourceservices` | Service list with filters |
| `ExpertCardV3` | Individual expert preview card |
| `VideoSectionV3` | Embedded video / demo |
| `VibeCoding` | Vibe coding CTA block |
| `BookingTimeline` | Visual booking process timeline |
| `BookingFaq` | Page-specific FAQ accordion |

#### Service Card (`ServiceCardGridV3` / `ExpertCardV3`)
- Hover: background tints to `--card-bg-hover`
- Clicking a card → navigates to `/service-details/{id}`

---

### 8.4 Service Details (`/service-details/[id]`)

**File:** `app/service-details/[id]/page.jsx`

#### Layout
- **Desktop:** Two-column side-by-side, sticky right panel
  - Left: `w-[55%]`, scrollable with custom progress scrollbar
  - Right: `w-[45%]`, sticky, `h-[calc(100vh-64px)]`
- **Mobile/Tablet:** Single column, stacked

#### Left Side — `LeftComponent`
Sections in order:

**1. `ServiceHeader`**
- Background gradient: `linear-gradient(180deg, rgba(243,249,241,1) 0%, rgba(255,255,255,1) 100%)`
- Padding: `48px 16px`
- Service name badge: white pill, `borderRadius: 24px, padding: 8px 24px`
- H1: `"Hire your {serviceName} team"` + green italic highlight
- Subheading: `serviceData.description` (supports i18n object `{ en, hi, ... }`)
- Feature chips grid (2×2): icon + text, `border: 1px solid #D9E5E3, borderRadius: 12px`
- Service illustration + banner image

**2. `BookingCard`** — "How QuickHire Can Help You"
- 5-step process cards (2 in row 1, 3 in row 2)
- Background: `var(--bg-tertiary)` = `#F2F9F1`
- Each card: white, `borderRadius: 16px, padding: 24px, minHeight: 220px`
- Step number: green circle 33×33px

**3. `SelectiveCard`** — "Curated Engineers For You"
- Tech chips: MUI `<Chip>` with `ArrowOutwardIcon`, `backgroundColor: #45A73512, borderRadius: 50px`
- **Technologies from `serviceData.technologies`** — i18n objects flattened per locale
- "Transparent Execution" section with working hours badge
- "What You Get" (green border box) vs "What's Not Included" (red border box)

**4. `ServiceFaq`** — FAQ Accordion
- MUI `Accordion` components
- `ExpandMoreIcon` color `#45A735, fontSize: 28px`
- Question: `fontWeight: 500, color: #374151`
- Answer: `fontSize: 15px, color: #6B7280`
- Falls back to static translation keys if `serviceData.faqs` is empty

#### Right Side — `RightComponent`
Contains `StepperProvider` + `ProcessStepper` + `StepContent`

**ProcessStepper**
- MUI `<Stepper>` with `alternativeLabel`
- Steps (authenticated): Services → Hours → Summary → Payment (4 steps)
- Steps (guest): Services → Hours → Summary → Details → Payment (5 steps)
- Step icon: circle `40/48/56px`, green when active/completed, grey `#D1D5DB` when inactive
- Connector: 30% width, `height: 2px`, green when active
- Label: `fontWeight: 600` for active/past steps, `color: #9CA3AF` for future

**Step 1 — ServicesStep**
- Sub-service or add-on selection
- Checkboxes or radio cards

**Step 2 — HoursStep**
- Hour quantity selector (+ / −)
- Pricing preview updates in real-time

**Step 3 — SummaryStep**
- Order summary: service, hours, subtotal, taxes

**Step 4 — DetailsStep** (guest only)
- Name, email, phone fields for account creation / login

**Step 5 — PaymentStep**
- Country-aware pricing: uses `selectCurrency` + `selectTaxInfo` from Redux `regionSlice`
- Currency symbols: `{ INR: '₹', USD: '$', AED: 'د.إ', EUR: '€', GBP: '£', AUD: 'A$', SGD: 'S$', CAD: 'C$' }`
- Amount formatted with `toLocaleString(locale, { minimumFractionDigits: 2 })`
- Tax label dynamic from region (e.g. "GST @ 18%", "VAT @ 5%")
- Payment gateway integration

---

### 8.5 Cart (`/cart`)

**File:** `app/cart/page.jsx`

#### Components
- `CartDrawer` — slide-in cart panel or full page
- `CartItems` — list of service items with remove option
- `EmptyCart` — illustration + "Browse Services" CTA when cart is empty

#### Rules
- Cart count shown in header badge, synced from `GET /dashboard/stats`
- Removing an item: optimistic UI update, then API call
- "Proceed to Checkout" CTA: `bg-[#45A735]`, disabled if cart empty

---

### 8.6 Checkout (`/checkout`)

**File:** `app/checkout/page.jsx`

- Order confirmation summary
- Final payment step with country-aware currency
- Promo code input field
- Redirects to `/payment-success` on completion

---

### 8.7 Payment Success (`/payment-success`)

**File:** `app/payment-success/page.jsx`  
**Component:** `components/common/PaymentSuccessMessage.jsx`

- Large green checkmark or success illustration
- Booking confirmation number
- "View Booking" and "Go Home" CTAs
- Auto-redirect to booking workspace after 5 seconds (optional)

---

### 8.8 Booking Workspace (`/booking-workspace/[id]`)

**File:** `app/booking-workspace/[id]/page.jsx`

#### Layout
- Two-panel layout on desktop: chat left (55%), details right (45%)
- Single column on mobile

#### Left Panel — `ChatPanel`
**File:** `features/booking/components/ChatPanel.jsx`

- Real-time messaging via Socket.IO
- Polling fallback: every 5s when socket disconnected, every 30s when connected
- Message list scrolls to bottom on new message
- Wrapped in `<ErrorBoundary>` for crash safety

**`MessageBubble`:**
- Self (user): right-aligned, `bg-[#45A735] text-white rounded-tl-xl rounded-bl-xl rounded-tr-xl`
- Other: left-aligned, `bg-[#F2F9F1] text-[#26472B] rounded-tr-xl rounded-br-xl rounded-tl-xl`
- Timestamp: `text-xs text-[#909090]`

**`MessageInputBar`:**
- `border-t border-[#E5F1E2]`
- Attachment button + text input + send button
- Send on Enter (not Shift+Enter)
- Typing indicator sent on input focus/change

**`TypingIndicator`:**
- 3 animated dots, shown when remote party is typing
- Fades in/out with CSS animation

#### Right Panel — Booking Details
- Service name, status badge
- Timeline of booking stages
- "Report Issue" button → `ReportIssueModal`

**`ReportIssueModal`:**
- Title, description textarea, submit
- On success: `showSuccess('Issue reported successfully! Our team will review it shortly.')`
- No `window.alert()` — toast only

---

### 8.9 Booking Ongoing (`/booking-ongoing/[id]`)

**File:** `app/booking-ongoing/[id]/page.jsx`

- Active booking progress view
- `BookingTimeline` component showing stages
- Status polling or socket updates
- Direct link to the booking workspace chat

---

### 8.10 Profile (`/profile`)

**File:** `app/profile/page.jsx`  
**Client Component:** `features/profile/components/ProfilePageClient.jsx`

#### Layout (Desktop)
```
┌─────────────────┬──────────────────────────────────────────┐
│  ProfileSidebar │  Active Section Content                  │
│  (240px fixed)  │  (flex-1)                                │
└─────────────────┴──────────────────────────────────────────┘
```

#### Layout (Mobile)
- Sidebar tabs at top (horizontal scroll)
- Content below

#### URL-driven sections
`/profile?section=profile` | `bookings` | `payments` | `support`

#### `ProfileSidebar`
- Avatar circle: gradient `from-[#45A735] to-[#26472B]`, initials
- User name and mobile/email
- Nav items: Profile, My Bookings, Payments, Support & Help
- Active: `bg-[#F2F9F1] border-l-[3px] border-[#45A735]`

#### `ProfileForm` (section=profile)
- Fields: Full Name, Email, Mobile, Profile Picture upload
- Save: `PUT /profile`
- Toast on success/error

#### `BookingsSection` (section=bookings)
- Table or card list of all bookings
- Status badges per booking
- Clicking a booking → `/booking-workspace/{id}`
- Pagination when > 10 items

#### `PaymentsSection` (section=payments)
- List of payment transactions
- Invoice download link
- Filter by date range

#### `SupportSection` (section=support)
- Create support ticket form: Subject, Description, Priority
- List of existing tickets with status
- Clicking a ticket → `/support-chat/{ticketId}`

---

### 8.11 Notifications (`/notifications`)

**File:** `app/notifications/page.jsx`  
**Drawer:** `features/notification/components/NotificationDrawer.jsx`

- Full page list of all notifications (or drawer from bell icon)
- Unread: `bg-[#F2F9F1]` background
- Read: `bg-white`
- "Mark all as read" button
- Notification types: booking update, payment, support reply, system
- Real-time: Socket `notification:new` event adds to top of list and increments badge

---

### 8.12 Chat (`/chat`)

**File:** `app/chat/page.jsx`

- Booking chat list / inbox
- Each row: booking thumbnail, last message preview, unread count, timestamp
- Clicking → `/booking-workspace/{id}`

---

### 8.13 Support Chat (`/support-chat/[id]`)

**File:** `app/support-chat/[id]/page.jsx`

- Ticket-specific messaging with support team
- Same `ChatPanel` or similar UI as booking workspace
- Ticket status shown at top

---

### 8.14 About Us (`/about-us`)

**File:** `app/about-us/page.jsx`

#### Sections (in order)
| Component | Content |
|---|---|
| `AboutUsHero` | Mission statement, hero image/illustration |
| `WhoWeAreFullSection` | Company story, values, team |
| `WhoWeServeSection` | Target segments (startups, enterprises, etc.) |
| `HowQuickHireWorks` | Process overview |
| `HowQuickHireWorksWithvideo` | Video-enhanced process section |

All sections use the standard section padding and `max-w-7xl mx-auto` container.

---

### 8.15 How It Works (`/how-it-works`)

**File:** `app/how-it-works/page.jsx`

- Step-by-step visual process
- Numbered step cards (same style as `BookingCard` on service page)
- Timeline or vertical stepper layout
- CTA at bottom: "Start Hiring Now" → `/book-your-resource`

---

### 8.16 FAQ (`/faq`)

**File:** `app/faq/page.jsx`  
**Components:** `FaqHero`, `FaqContent`

- `FaqHero`: Heading + search input (if implemented)
- `FaqContent`: MUI Accordion list, categorised by topic
- Same accordion style as `ServiceFaq`:
  - `ExpandMoreIcon` `#45A735`
  - Question `fontWeight: 500, color: #374151`
  - Answer `color: #6B7280`

---

### 8.17 Contact Us (`/contact-us`)

**File:** `app/contact-us/page.jsx`

#### Form Fields
- Name, Email, Phone, Message (textarea)
- Subject / Category select
- Submit: `POST /contact` API call
- Toast on success/error
- No `window.alert()`

#### Additional Content
- Office address / contact info
- Social media links (same as footer)
- Map embed (optional)

---

### 8.18 Legal Pages

| Route | File | Component |
|---|---|---|
| `/terms-and-conditions` | `app/terms-and-conditions/page.jsx` | `LegalDocumentPage` |
| `/privacy-policy` | `app/privacy-policy/page.jsx` | `LegalDocumentPage` |
| `/cancellation-and-refund-policy` | `app/cancellation-and-refund-policy/page.jsx` | `LegalDocumentPage` |

**`LegalDocumentPage`** (`components/common/LegalDocumentPage.jsx`):
- Fetches content from `GET /legal/doc?docType=terms&country={activeCountry}`
- Renders markdown/HTML content
- Shows version number + effective date
- `LegalAcceptanceProvider` tracks whether user has accepted the current version
- If `materialChange: true` on current version → shows acceptance modal blocking navigation

---

## 9. Interaction & Animation Standards

### 9.1 Transitions

All hover/focus transitions: `transition-all duration-200` (200ms ease).  
Modal open/close: `transition-opacity duration-300` or `transition-transform duration-300 ease-in-out`.  
Mobile menu: `transform transition-transform duration-300 ease-in-out`.

### 9.2 Keyframe Animations Defined

| Name | Effect | Used in |
|---|---|---|
| `fadeIn` | opacity 0→1, translateY -10px→0 | General fade-ins |
| `fadeSlideIn` | opacity 0→1, translateY 30px→0 | Hero headline word cycling |
| `fadeSlideOut` | opacity 1→0, translateY 0→-30px | Hero headline word cycling |
| `animate-spin` | 360deg rotation | Loading spinners |
| `animate-pulse` | opacity pulse | Skeleton loaders |

### 9.3 Scroll Behaviour

- Custom progress scrollbar on service detail left panel: `CustomProgressScrollbar`
- All other scrollable areas: `overflow-y-auto` with `hide-scrollbar` class (custom CSS to hide native scrollbar while preserving scroll)
- Body scroll locked when mobile menu or modal is open

### 9.4 Loading States

Priority order:
1. **Skeleton loader** — for initial page data (lists, cards)
2. **Inline spinner** — for button actions, secondary loads
3. **Full-page spinner** — only for critical auth-gated loads

Never leave a page with no visual feedback during a load.

### 9.5 Empty States

`EmptyState` component pattern:
- Illustration or icon (SVG)
- Heading: "No {items} yet"
- Subtext: explanation
- Optional CTA button

---

## 10. RTL & Internationalisation

### 10.1 Supported Locales

| Code | Language | Direction |
|---|---|---|
| `en` | English | LTR |
| `hi` | Hindi | LTR |
| `de` | German | LTR |
| `es` | Spanish | LTR |
| `fr` | French | LTR |
| `ar` | Arabic | RTL |
| `ja` | Japanese | LTR |
| `zh-CN` | Chinese Simplified | LTR |

### 10.2 RTL Rules

- `dir` attribute set on `<html>` element from server via `getLocaleDir(locale)`
- Use **CSS logical properties** everywhere:
  - `start-*` / `end-*` instead of `left-*` / `right-*` for absolute positioning
  - `ms-*` / `me-*` instead of `ml-*` / `mr-*` for margins
  - `ps-*` / `pe-*` instead of `pl-*` / `pr-*` for padding
- Arrow icons: use `rtl:rotate-180` class so "go forward" chevrons flip direction
- Mobile menu: `ltr:translate-x-full rtl:-translate-x-full` for slide direction
- Badge positions: `-top-1 -end-1` (RTL-safe)

### 10.3 Translation Keys

- All UI strings go through `useTranslations('namespace.key')`
- No hardcoded English strings in components (except admin portal)
- Namespace mapping:
  - `header.*` — navigation, user menu
  - `footer.*` — footer links, tagline
  - `serviceHeader.*` — service page top section
  - `serviceDetails.*` — service detail labels
  - `serviceFaq.*` — FAQ section labels
  - `admin.services.*` — admin services page (title, subtitle, noResults)
  - `resource.dashboard.*` — resource workspace stats

### 10.4 i18n Object Handling

Service data (`name`, `description`, `technologies`) may be stored as i18n objects: `{ en: "...", hi: "...", de: "..." }`.

The `flattenI18nDeep` function in `lib/i18n/flattenI18nDeep.js` automatically flattens these on every API response via the Axios interceptor in both `axiosInstance.js` and `staffApi.js`.

**Detection rule:** An object is i18n if it has at least one key from `['en', 'hi', 'ar', 'de', 'es', 'fr', 'ja', 'zh-CN']` AND all i18n-keyed values are strings.

### 10.5 Currency & Region

`RegionInitializer` reads the `qh_country` and `qh_locale` cookies and populates Redux `regionSlice` with:
```js
{ country, currency, locale, taxRate, taxLabel }
```

`selectCurrency`, `selectTaxInfo`, `selectCountry` selectors used by PaymentStep.

`LocaleCurrencySwitcher` component (header + mobile menu) lets users change locale and currency, updating both cookies and Redux store.

---

## 11. Accessibility Standards

### 11.1 Mandatory Requirements

- All interactive elements have `aria-label` or visible text
- Images have `alt` text (decorative images: `alt=""`)
- Focus is managed when modals open: focus trap inside modal
- Escape key closes modals and drawers
- Colour contrast: all text/background combinations meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Touch targets: minimum 44×44px on all interactive elements

### 11.2 Keyboard Navigation

- All nav links, buttons, inputs reachable via Tab
- Enter/Space activates buttons and links
- Escape closes overlays (mobile menu, modals, dropdowns)
- Arrow keys navigate within accordions (native MUI behaviour)

### 11.3 Semantic HTML

- `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>` used correctly
- Heading hierarchy: H1 per page → H2 per section → H3 per card
- Form fields always paired with `<label>` (or `aria-label`)
- Lists use `<ul>` / `<ol>` / `<li>`

---

## 12. State Patterns

### 12.1 Redux Slices

| Slice | Location | Manages |
|---|---|---|
| `authSlice` | `lib/redux/slices/authSlice` | isAuthenticated, guestToken, user |
| `discoverSlice` | `lib/redux/slices/discoverSlice` | services list, selectedService, loading |
| `bookingSlice` | `lib/redux/slices/bookingSlice` | serviceDetails, current booking |
| `regionSlice` | `lib/redux/slices/regionSlice` | country, currency, locale, taxRate, taxLabel |
| `notificationsSlice` | `lib/redux/slices/notificationsSlice` | notifications list, unread count |
| `paymentSlice` | `lib/redux/slices/paymentSlice` | payment state, order |
| `chatSlice` | `lib/redux/slices/chatSlice` | (defined but not yet active in ChatPanel) |

### 12.2 Local State Patterns

| Pattern | When to use |
|---|---|
| `useState(null)` | For async data: null = loading, value = loaded, null after error = error shown separately |
| `useState([])` | For lists that should never be null — use `Array.isArray()` guard before rendering |
| `useState(false)` | For modal open/close, toggle states |
| `useCallback` | For any function passed to `useEffect` dependency array |
| `useRef` | For DOM refs (scroll containers), timer refs, TTL tracking |

### 12.3 Data Fetching Rules

- Always set loading state before fetch, clear on resolve or reject
- Always catch errors and store in `error` state — never swallow silently
- Show `<ErrorBox>` or inline error when `error` is non-null
- Use `Promise.allSettled` (not `Promise.all`) when fetching multiple endpoints in parallel, so one failure doesn't block others

### 12.4 Token Management

| Token | Key | Storage |
|---|---|---|
| Auth token | `token` | `localStorage` |
| Refresh token | `refreshToken` | `localStorage` |
| User data | `user` | `localStorage` |
| User type | `userType` | `localStorage` |
| Guest token | `guestToken` | `localStorage` |

- JWT silent refresh: `axiosInstance` queues all 401 requests, calls `POST /auth/refresh`, retries with new token
- On refresh failure: clears all auth storage, redirects to `/login?next={currentPath}`
- HTTP 429: shows `showWarning(...)` toast with retry-after seconds

---

## 13. Data & API Integration Rules

### 13.1 Base URLs

```
User API:  NEXT_PUBLIC_API_URL || 'http://localhost:4000'
Staff API: NEXT_PUBLIC_API_URL || 'http://localhost:4000'
Blog:      NEXT_PUBLIC_BLOG_BASE_URL
Enterprise: NEXT_PUBLIC_ENTERPRISE_BASE_URL
```

### 13.2 Request Headers (Auto-injected)

| Header | Value | Source |
|---|---|---|
| `Authorization` | `Bearer {token}` | `localStorage.token` or `localStorage.guestToken` |
| `Content-Type` | `application/json` | Default (removed for FormData) |
| `X-Country` | country code | `qh_country` cookie |
| `X-Lang` | locale code | `qh_locale` cookie |

### 13.3 Idempotency

- Payment POST requests should include `X-Idempotency-Key` header (UUID v4, stored per session)
- Prevents duplicate charges on retry

### 13.4 Response Shape

All successful API responses follow:
```json
{ "data": { ... } }   // single item
{ "data": [ ... ] }   // list
{ "data": { "items": [...], "total": N } }  // paginated
```

Always extract with `r.data?.data || []` and **always guard with `Array.isArray()`** before calling `.map()` or `.filter()` on the result.

### 13.5 Error Extraction

```js
function extractError(e) {
  return e?.response?.data?.error?.message
    || e?.response?.data?.message
    || e?.message
    || 'Something went wrong';
}
```

---

## 14. Do's and Don'ts

### ✅ Do

- Use `showSuccess()` / `showError()` from `@/lib/utils/toast` for all user feedback
- Use `<Image>` from `next/image` for all images
- Use `staffApi` for all admin/staff API calls, `axiosInstance` for user-facing calls
- Use `useTranslations()` for all visible strings on user-facing pages
- Use `Array.isArray()` guard before `.map()` / `.filter()` on API data
- Use `<React.Fragment key={...}>` when keying fragment groups in lists
- Use CSS logical properties (`start-`, `end-`, `ms-`, `me-`) for RTL safety
- Wrap crash-prone components (ChatPanel, PaymentStep) in `<ErrorBoundary>`
- Use `transition-all duration-200` on all hover/focus state changes
- Validate with `!form.fieldName.trim()` before API calls, show error toast and focus offending tab

### ❌ Don't

- Never use `window.alert()` or `window.confirm()` — use toasts + inline confirm UI
- Never use `left-*` / `right-*` for positioned elements — use logical properties
- Never hardcode `'₹'` or `'en-IN'` — always use region selectors from Redux
- Never store i18n strings in component files — use `messages/*.json`
- Never call `.filter()` or `.map()` on state that could be a non-array object
- Never swallow API errors silently — always set error state and display it
- Never use `console.log` in production-committed code
- Never use `window.confirm()` for delete confirmations — use inline two-step confirm buttons
- Never put `key` prop on `<>` shorthand fragment — use `<React.Fragment key={...}>`
- Never use `px-left/px-right` inline styles without RTL consideration
- Never use a wildcard `Bash(*)` allowlist rule or interpreter patterns in `.claude/settings.json`
- Never import MUI components when a simpler Tailwind implementation suffices for user-facing pages

---

*This document is the single source of truth for all user portal design decisions. Any deviation requires explicit team approval and this document must be updated to reflect the change.*
