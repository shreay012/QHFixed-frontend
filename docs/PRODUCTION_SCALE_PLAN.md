# QuickHire — Production Scale Plan

> **Target:** 50,000 active users · 500+ concurrent active bookings · Upwork/Fiverr-grade product
> **Scope:** Multi-country, multi-currency, multi-language with geo-based routing
> **Owner:** Product + Engineering
> **Last updated:** 2026-04-26

---

## 0. Executive Snapshot

| Metric | Target |
|---|---|
| Active users | 50,000 (10K DAU peak) |
| Concurrent bookings | 500+ live, 5,000+ scheduled/day |
| Peak RPS | ~800-1,200 (with 2x burst headroom) |
| Concurrent sockets | 15,000 (3x DAU concurrency) |
| API p95 latency | < 300 ms |
| Uptime SLO | 99.9% (43 min/month error budget) |
| Payment success | > 98% |
| Time-to-first-PM-assign | < 30 s after payment |

---

## 1. Target Architecture

```
                    ┌──────────────┐
                    │  Cloudflare  │  CDN · WAF · Geo-routing · DDoS
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     ┌────▼────┐      ┌────▼────┐      ┌───▼────┐
     │ Next.js │      │ Next.js │      │  ...   │  3+ pods, HPA
     │  (SSR)  │      │  (SSR)  │      │        │
     └────┬────┘      └────┬────┘      └────┬───┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                  ┌────────▼────────┐
                  │  ALB / Nginx    │ sticky sessions for sockets
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐        ┌────▼────┐
   │ API pod │       │ API pod │  ...   │ API pod │  4+ pods
   │ +Socket │       │ +Socket │        │ +Socket │
   └────┬────┘       └────┬────┘        └────┬────┘
        │                 │                   │
        └─────────────────┼───────────────────┘
                          │
        ┌─────────────────┼─────────────────────┐
        │                 │                     │
   ┌────▼─────┐    ┌─────▼──────┐       ┌─────▼──────┐
   │  Mongo   │    │   Redis    │       │ Meilisearch │
   │ Replica  │    │ cache +    │       │   search    │
   │  Set     │    │ pub/sub +  │       └─────────────┘
   │ (1P+2S)  │    │ BullMQ     │
   └──────────┘    └────────────┘
                          │
   ┌──────────────────────┼──────────────────────┐
   │                      │                      │
┌──▼───────┐    ┌─────────▼──────┐      ┌───────▼───────┐
│ Worker:  │    │ Worker:        │      │ Worker:       │
│ lifecycle│    │ notifications  │      │ payouts /     │
│ (sharded)│    │ email/sms/push │      │ analytics     │
└──────────┘    └────────────────┘      └───────────────┘

External: Razorpay/Stripe/Tabby · Twilio/MSG91 · S3/R2 · Sentry · Grafana/Loki
```

---

## 2. Tech Stack (locked)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 16 (Turbopack), Tailwind, shadcn/ui | Already in use, SSR for SEO |
| Mobile | PWA first; React Native later | Faster MVP, single codebase |
| Backend API | Node 20 + Express | Already in use; PM2 cluster + k8s |
| DB | MongoDB 7 replica set | Flexible schema for jobs/chat |
| Cache | Redis 7 (Elasticache / Upstash) | Hot data + pub/sub + BullMQ |
| Queue | BullMQ | Mature, Redis-backed, dashboards |
| Search | Meilisearch | Self-hostable, fast, typo-tolerant |
| Realtime | Socket.IO + Redis adapter | Already wired |
| Storage | S3 / R2 + Cloudflare CDN | Cheap egress |
| Observability | Sentry + Prometheus + Grafana + Loki + OpenTelemetry | Industry standard |
| Auth | JWT (access 15m + refresh 30d), OTP via SMS | Already in use |
| Payments | Razorpay (IN), Stripe (US/EU), Tabby (UAE) | Country-routed |
| i18n | next-intl + DB-backed CMS keys | Editable without deploy |
| Geo | MaxMind GeoIP2 + Cloudflare headers | IP → country/city |
| Email | SendGrid / Postmark | Templates + analytics |
| SMS | MSG91 (IN) + Twilio (intl) | Country-routed |
| Push | FCM | Web + mobile |
| CI/CD | GitHub Actions → k8s (EKS / GKE) | Standard |
| IaC | Terraform | Reproducible infra |

---

## 3. Data Model Additions

### New collections

```
countries        { code, name, currency, defaultLang, supportedLangs[],
                   taxRules{}, gateways[], phoneFormat, addressSchema, active }

currencies       { code, symbol, fxToBase, updatedAt }

translations     { lang, namespace, key, value, country?, version }

promo_codes      { code, type, value,
                   scope { country, city, service[], userSegment[] },
                   minCart, maxDiscount, usageLimitTotal, usageLimitPerUser,
                   validFrom, validTo, stackable, campaignId,
                   ownerId(affiliate?), active }

promo_redemptions{ codeId, userId, bookingId, discount, currency, appliedAt }

payouts          { staffId, role, bookingIds[], grossAmount, deductions,
                   netAmount, currency, country, gateway, status, txnRef,
                   cycleStart, cycleEnd, processedAt }

audit_logs       { actorId, actorRole, action, entity, entityId,
                   before, after, ip, ua, country, at }

feature_flags    { key, enabled, rolloutPct, segments[], updatedBy }

cms_pages        { slug, country?, lang, blocks[], seo{}, status,
                   publishedAt, version }

cms_banners      { id, country?, segment, image, link, validFrom, validTo,
                   abVariant }

notification_templates { event, channel(email|sms|push|inapp), lang,
                         country?, subject, body, vars[] }

reviews          { bookingId, fromId, toId, rating, comment, flagged,
                   moderationStatus }

kyc_documents    { userId, role, type, fileUrl, status, reviewedBy }

incidents        { bookingId, reportedBy, type, photos[], status }

geo_pricing      { serviceId, country, basePrice, currency, surgeRules[] }
```

### Critical indexes

```
jobs:               (status, country, createdAt),
                    (pmId, status),
                    (customerId, status),
                    (assignedResource._id, status),
                    (status, schedule.endTime)
chat:               (roomId, createdAt), (bookingId, createdAt)
users:              (mobile, country), (role, active)
notifications:      (userId, read, createdAt)
promo_redemptions:  (codeId, userId)
audit_logs:         (actorId, at), (entity, entityId, at)
```

---

## 4. Module Inventory

### ✅ Already done
- Booking lifecycle (payment → auto-assign PM → start/stop/complete)
- PM detail page + group chat + resource assignment
- 30-min pre-end reminder (lifecycle worker)
- Notifications (in-app + socket)
- Admin: bookings, users, services, payments (basic)

### 🔨 To build (grouped)

**A. Foundation**
Redis cache, BullMQ queues, audit logs, RBAC, Sentry, indexes, replica-set config, idempotency keys, rate-limiting, helmet/CSRF/sanitization

**B. Promo Code Engine**
Schema, apply/validate API, admin UI, analytics, fraud guard, referral generator, affiliate codes + commissions

**C. Internationalization**
Geo middleware, country/currency/language configs, i18n infra, RTL, payment gateway router, tax engine, hreflang, locale URL prefixes

**D. Resource Panel**
Assignments list, group chat (room exists), GPS check-in, time tracking, earnings, profile, calendar, ratings, incidents, mobile-first PWA

**E. Admin Power**
Live ops, bulk actions, PM/Resource pool mgmt, performance scorecards, payout engine (no wallet), reconciliation, RBAC editor, audit viewer, KYC queue, reviews moderation, fraud dashboard, ticket SLA, country/currency/language managers, promo manager, geo-pricing, tax rules, gateway router, CMS expansion, feature flags, campaign tools, cohorts, segments

**F. PM Power**
Calendar view, capacity meter, multi-resource per booking, timesheet, earnings, availability toggle, escalation, customer history, chat templates, voice/video calls, photo upload, checklists

**G. Customer Power**
Geo auto-detect, currency display, promo apply, referral, multi-booking cart, subscriptions, self-serve reschedule/cancel, live tracking, rate + tip, AI chatbot, locale switcher

**H. Scale & Quality**
Socket Redis adapter + multi-node, k6 load tests (5K), CDN, S3 attachments, mobile PWA polish, Meilisearch, observability dashboards

**I. Compliance**
GDPR / DPDP / PDPL consent, data export & deletion, country data residency, tax invoices per country

> ❌ **Removed from scope:** Customer / PM / Resource wallet — direct payouts only.

---

## 5. Phased Roadmap

### Phase 1 — Foundation & Stability *(Weeks 1-3)*
**Goal:** platform won't fall over at scale; observability in place.

- [ ] Redis (Upstash dev / Elasticache prod) — cache helpers
- [ ] BullMQ — migrate notifications/lifecycle/payouts to queues
- [ ] Mongo replica set + read-from-secondary for dashboards
- [ ] All critical compound indexes
- [ ] RBAC roles: super_admin, ops, finance, support, viewer
- [ ] Audit log middleware on every admin mutation
- [ ] Sentry FE + BE, Prometheus + Grafana
- [ ] Rate-limit (per-IP + per-user) with Redis store
- [ ] Idempotency keys on payment/booking POST
- [ ] Helmet, CSRF, input sanitization sweep (OWASP)
- [ ] Resource panel: assignments + group chat + check-in
- [ ] Socket.IO Redis adapter (multi-node ready)

### Phase 2 — Admin Power & Ops *(Weeks 4-6)*
**Goal:** ops team can run business at scale.

- [ ] Live Ops dashboard (real-time metrics, SLA breaches, alert ticker)
- [ ] PM/Resource pool management (skills, capacity, leaves, KYC)
- [ ] Performance scorecards (auto-computed)
- [ ] Bulk actions (CSV upload, bulk reassign/refund/notify)
- [ ] Booking reassignment with reason + audit
- [ ] Refund workflow (approval chain, partial, taxonomy)
- [ ] Payout engine (direct bank, no wallet) + reconciliation
- [ ] Ticket SLA timers + escalation matrix
- [ ] KYC queue + reviews moderation + audit log viewer
- [ ] Fraud dashboard (velocity, multi-account, suspicious payments)

### Phase 3 — Promo Engine + CMS Expansion *(Weeks 7-8)*
**Goal:** growth team runs campaigns without engineering.

- [ ] Promo code engine (full schema + apply/validate)
- [ ] Admin promo manager (CRUD, clone, pause, preview impact)
- [ ] Referral program (auto-generated codes, attribution)
- [ ] Affiliate codes + commission tracking
- [ ] Promo analytics (redemptions, GMV, ROI)
- [ ] CMS expansion: pages, banners (A/B), templates (email/sms/push/inapp), SEO meta, blog/help center
- [ ] Feature flags admin UI

### Phase 4 — Internationalization *(Weeks 9-11)*
**Goal:** launch a 2nd country with zero code change.

- [ ] Country/Currency/Language config schemas + admin UIs
- [ ] Geo-detect middleware (Cloudflare headers + MaxMind fallback)
- [ ] FX rate updater (BullMQ hourly job)
- [ ] next-intl setup + DB-backed translation loader
- [ ] Locale switcher (header) + persistence
- [ ] Per-country payment gateway router (Razorpay/Stripe/Tabby)
- [ ] Tax engine per country (GST/VAT/sales-tax)
- [ ] Country-aware invoice generator
- [ ] RTL support (Arabic/Hebrew)
- [ ] Geo-pricing per service per country
- [ ] Country-aware phone, address, OTP routing
- [ ] hreflang + locale URL prefixes (`/in/`, `/ae/`, `/us/`)
- [ ] Compliance banners (GDPR/DPDP/PDPL) per region

### Phase 5 — Growth & Trust *(Weeks 12-14)*
**Goal:** move retention, NPS, and conversion.

- [ ] Cohort analytics, RFM segmentation
- [ ] Email/Push campaign tool (audience builder)
- [ ] In-product reviews + ratings
- [ ] Customer self-serve reschedule/cancel with rules
- [ ] Live tracking (resource en-route)
- [ ] Rate + tip post-completion
- [ ] AI help chatbot (RAG over docs/CMS)

### Phase 6 — Scale Hardening *(Weeks 15-16)*
**Goal:** pass 5K-concurrent load test with headroom.

- [ ] k6 load test scripts (5K booking burst, 15K socket)
- [ ] Mongo tuning (connection pool, query plans)
- [ ] HPA tuning, PDBs, graceful shutdown
- [ ] Meilisearch for booking/resource/chat search
- [ ] CDN for static + image optimization
- [ ] S3 chat attachments + signed URLs
- [ ] Backups + DR drill (RTO 1 h, RPO 15 min)
- [ ] On-call runbooks, alerting (PagerDuty)

### Phase 7 — Premium Features *(Weeks 17-19)*
- [ ] PM calendar + multi-resource bookings
- [ ] Subscriptions / recurring bookings
- [ ] Voice / video calls (Twilio Video / Daily.co)
- [ ] Native mobile apps (React Native shell over PWA)
- [ ] Advanced auto-assign rules editor (skill → location → load → rating)

---

## 6. Capacity Plan (Phase 6 target)

| Component | Sizing |
|---|---|
| API pods | 4 × (2 vCPU, 4 GB), HPA 4-12 |
| Socket pods | 3 × (2 vCPU, 4 GB), HPA 3-8, sticky |
| Workers | lifecycle ×2, notif ×3, payout ×1, analytics ×1 |
| Mongo | M30 replica set (or 3 × 8 vCPU/32 GB self-hosted) |
| Redis | 4 GB primary + replica (Elasticache or Upstash) |
| Meilisearch | 2 vCPU, 4 GB |
| CDN | Cloudflare Pro |
| Estimated infra cost | ~$1.2K-2K / month at this scale |

---

## 7. Multi-country / Currency / Language Layer

| Concern | Implementation |
|---|---|
| Geo detection | Cloudflare/MaxMind IP → country/city; fallback `navigator.language` + TZ |
| Country config | `countries` collection (currency, langs, gateways, tax, phone, address schema) |
| Currency | Live FX (exchangerate.host / Open Exchange Rates) cached in Redis, hourly refresh; store `amount + currency + amountInBase(USD)` for reporting |
| Pricing per country | Service prices per-currency or base + auto-convert + per-country override |
| Payment gateways | IN: Razorpay/UPI · UAE: Tabby/Stripe · US/EU: Stripe · SEA: Xendit — gateway-router by country |
| Tax engine | India GST · UAE VAT 5% · EU VAT · US sales tax (Avalara/TaxJar). Country-specific invoice format |
| Language (i18n) | `next-intl` or `i18next`. Translation keys in DB (CMS-editable) + JSON fallback. MVP: English, Hindi, Arabic (RTL), Spanish |
| RTL support | Tailwind `dir="rtl"` switching |
| Locale formatting | `Intl.NumberFormat`, `Intl.DateTimeFormat` per locale |
| Country/Lang switcher | Header dropdown — overrides geo-detect, persisted in cookie + user profile |
| Country-tagged content | CMS pages, banners, FAQs |
| Compliance per country | India DPDP · EU GDPR · UAE PDPL — region-specific consent banners, data residency tags |
| Phone / OTP | Country-code picker, regional SMS gateway routed by `+CC` |
| Address schema | Country-aware fields (state vs emirate vs province), postal-code validation |
| Service availability | Geo-fence services to specific cities/countries |
| Time zones | Stored UTC, displayed in user's TZ |
| Resource pool by region | PMs/Resources tagged by country/city; auto-assign respects geo |
| SEO | `hreflang` tags, country-subdomains or path prefixes |
| CDN edge | Country-aware routing (Cloudflare Workers) |

---

## 8. Promo Code Engine

- Code types: flat-off, %-off, free-service, first-booking, referral, BOGO
- Targeting: city / service / user-segment / new-vs-returning / min-cart-value
- Limits: usage cap (total + per user), validity window, stackable yes/no
- Auto-apply best code at checkout
- Influencer / affiliate codes with attribution + commission tracking
- Fraud guard: device fingerprint + same-card detection
- Admin UI: create / clone / pause / expire / preview impact
- Analytics: redemptions, GMV impact, ROI per campaign
- Referral program auto-generates per-user codes

---

## 9. Security & Compliance Checklist

- OWASP Top 10 audit (injection, XSS, auth, broken access, SSRF, etc.)
- Secrets in AWS Secrets Manager / Doppler — not in repo `.env`
- TLS everywhere, HSTS, CSP headers
- PII encryption at rest (Mongo field-level or volume)
- Append-only immutable audit log
- Per-country data residency tags
- DSAR endpoints (data export, deletion)
- Annual pen-test
- PCI scope minimized (gateway-hosted card forms)

---

## 10. Quality Gates (per release)

- Unit tests > 70% coverage on critical modules
- API integration tests for all booking/payment paths
- Playwright e2e: customer book → pay → PM assign → complete
- k6 smoke (100 RPS) on every PR; full 5K test weekly on staging
- Lighthouse mobile > 85 on customer pages
- Sentry release health: crash-free sessions > 99.5%
- Zero P0/P1 bugs > 24 h old before deploy

---

## 11. Team Cadence

- 2-week sprints; demo every Friday
- One phase = one milestone; small parallel tracks ok
- Daily standup (15 min) + weekly architecture review
- Monthly load test + DR drill post Phase 6

---

## 12. Recommended Start Order (Week 1)

1. **Day 1-2:** Redis + BullMQ infra; migrate notifications to queue
2. **Day 3-4:** Mongo indexes + Sentry + basic Grafana
3. **Day 5-7:** Resource panel (assignments + chat + GPS check-in)
4. **Week 2:** RBAC + audit logs + rate-limit + idempotency
5. **Week 3:** Socket Redis adapter + smoke load test

After Phase 1, move to Phase 2 (Ops Power).

---

## Appendix A — Roles Matrix (target)

| Role | Capabilities |
|---|---|
| super_admin | Everything, including RBAC edits |
| ops | Bookings, PM/Resource pool, reassign, refunds, tickets |
| finance | Payouts, reconciliation, taxes, invoices, refunds approval |
| support | Tickets, chat takeover, customer profiles (read), notes |
| growth | CMS, promo codes, campaigns, segments, banners, feature flags |
| viewer | Read-only dashboards |

## Appendix B — Notification Channels Matrix

| Event | In-app | Push | SMS | Email |
|---|---|---|---|---|
| Booking created | ✓ | ✓ | ✓ | ✓ |
| Payment success | ✓ | ✓ | ✓ | ✓ |
| PM assigned | ✓ | ✓ | ✓ |   |
| Resource assigned | ✓ | ✓ |   |   |
| Booking started / paused / completed | ✓ | ✓ |   |   |
| 30-min pre-end reminder | ✓ | ✓ | ✓ |   |
| Refund processed | ✓ |   | ✓ | ✓ |
| Promo / campaign | ✓ | ✓ |   | ✓ |
| KYC status change | ✓ |   | ✓ | ✓ |

