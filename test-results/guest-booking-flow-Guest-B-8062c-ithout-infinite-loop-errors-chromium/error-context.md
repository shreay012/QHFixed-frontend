# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-booking-flow.spec.js >> Guest Booking Flow - Complete Journey >> Guest Booking Steps Validation >> GBF-002: Guest HoursStep loads without infinite loop errors
- Location: tests/e2e/guest-booking-flow.spec.js:31:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/book-your-resource", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "QuickHire" [ref=e4] [cursor=pointer]:
        - /url: /
        - img "QuickHire" [ref=e5]
      - navigation [ref=e6]:
        - link "Home" [ref=e7] [cursor=pointer]:
          - /url: /
        - link "Book Experts" [ref=e8] [cursor=pointer]:
          - /url: /book-your-resource
        - link "How It Works" [ref=e9] [cursor=pointer]:
          - /url: /how-it-works
        - link "Contact Us" [ref=e10] [cursor=pointer]:
          - /url: /contact-us
        - link "Sign In" [ref=e11] [cursor=pointer]:
          - /url: /login
  - main [ref=e12]:
    - generic [ref=e13]:
      - img "Resource Team" [ref=e15]
      - generic [ref=e16]:
        - heading "The fastest way to add flexible tech expertise" [level=1] [ref=e17]:
          - text: The fastest way to add
          - text: flexible tech expertise
        - paragraph [ref=e18]: Developers, designers, QA, and more - on demand, led by a dedicated Technical Project Manager.
        - button "Hire in 10 Minutes" [ref=e20] [cursor=pointer]:
          - generic [ref=e21]: Hire in 10 Minutes
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "Book Experts" [level=2] [ref=e26]
          - paragraph [ref=e27]: Fulfill tech resource requirement fast.
        - button "All Services" [ref=e29]:
          - generic [ref=e30]: All Services
          - img [ref=e31]
      - paragraph [ref=e34]: No services available
    - generic [ref=e37]:
      - generic [ref=e38]:
        - heading "Not sure what you need?" [level=2] [ref=e39]:
          - text: Not sure what
          - text: you need?
        - paragraph [ref=e40]: Tell us what you're trying to build or fix, and we'll match you with the right expert.
        - button "Find Right Experts" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]: Find Right Experts
      - img "Find Experts" [ref=e45]
    - generic [ref=e47]:
      - generic [ref=e51]:
        - heading "Book Experts" [level=2] [ref=e52]
        - paragraph [ref=e53]: Fulfill tech resource requirement fast.
      - paragraph [ref=e55]: No services available
    - generic [ref=e60] [cursor=pointer]:
      - img [ref=e61]
      - generic [ref=e63]: Click to unmute
    - generic [ref=e65]:
      - heading "Frequently Asked Questions" [level=2] [ref=e67]
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e71] [cursor=pointer]: How quickly can I book a resource?
          - paragraph [ref=e73] [cursor=pointer]: What types of resources are available?
          - separator [ref=e74]
          - paragraph [ref=e76] [cursor=pointer]: Can I change my resource requirements after booking?
          - separator [ref=e77]
          - paragraph [ref=e79] [cursor=pointer]: What payment methods do you accept?
          - separator [ref=e80]
          - paragraph [ref=e82] [cursor=pointer]: Is there a minimum booking duration?
        - paragraph [ref=e85]: You can book a resource within minutes. Simply select your requirements, complete the payment, and get connected with your dedicated expert immediately.
  - contentinfo [ref=e86]:
    - generic [ref=e88]:
      - generic [ref=e89]:
        - img "QuickHire" [ref=e91]
        - paragraph [ref=e92]: A faster way to get tech & software work done.
      - generic [ref=e93]:
        - heading "Knowledge Hub" [level=6] [ref=e94]
        - generic [ref=e95]:
          - link "Industry Perspectives" [ref=e96] [cursor=pointer]:
            - /url: undefined/industry-perspectives/
            - paragraph [ref=e97]: Industry Perspectives
          - link "Enterprise" [ref=e98] [cursor=pointer]:
            - /url: undefined/home
            - paragraph [ref=e99]: Enterprise
          - link "About Us" [ref=e100] [cursor=pointer]:
            - /url: /about-us
            - paragraph [ref=e101]: About Us
          - link "FAQs" [ref=e102] [cursor=pointer]:
            - /url: /faq
            - paragraph [ref=e103]: FAQs
      - generic [ref=e104]:
        - heading "Company" [level=6] [ref=e105]
        - generic [ref=e106]:
          - link "How it Works" [ref=e107] [cursor=pointer]:
            - /url: /how-it-works
            - paragraph [ref=e108]: How it Works
          - link "Contact Us" [ref=e109] [cursor=pointer]:
            - /url: /contact-us
            - paragraph [ref=e110]: Contact Us
          - link "Terms & Conditions" [ref=e111] [cursor=pointer]:
            - /url: /terms-and-conditions
            - paragraph [ref=e112]: Terms & Conditions
          - link "Cancellation & Refund Policy" [ref=e113] [cursor=pointer]:
            - /url: /cancellation-and-refund-policy
            - paragraph [ref=e114]: Cancellation & Refund Policy
      - generic [ref=e115]:
        - heading "Follow Us" [level=6] [ref=e116]
        - generic [ref=e117]:
          - link "Instagram" [ref=e118] [cursor=pointer]:
            - /url: https://www.instagram.com/quickhire__services_/
            - img "Instagram" [ref=e120]
          - link "LinkedIn" [ref=e121] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/quickhire-services/?viewAsMember=true
            - img "LinkedIn" [ref=e123]
          - link "Pinterest" [ref=e124] [cursor=pointer]:
            - /url: https://in.pinterest.com/quickhire_services/
            - img "Pinterest" [ref=e126]
          - link "YouTube" [ref=e127] [cursor=pointer]:
            - /url: https://www.youtube.com/@QuickhireServices
            - img "YouTube" [ref=e129]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Guest Booking Flow Test Suite
  4   | // Tests: Guest can proceed through booking steps without premature redirects
  5   | // Focus: HoursStep useMemo fix validation, state persistence, infinite loop prevention
  6   | 
  7   | test.describe('Guest Booking Flow - Complete Journey', () => {
  8   |   test.beforeEach(async ({ page }) => {
  9   |     // Clear any auth tokens to ensure guest status
  10  |     await page.context().clearCookies();
  11  |     await page.goto('/', { waitUntil: 'networkidle' });
  12  |     await page.evaluate(() => {
  13  |       localStorage.clear();
  14  |       sessionStorage.clear();
  15  |     });
  16  |   });
  17  | 
  18  |   test.describe('Guest Booking Steps Validation', () => {
  19  |     test('GBF-001: Guest can navigate to booking page without redirect', async ({ page }) => {
  20  |       // Navigate to booking page as guest
  21  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  22  |       
  23  |       // Verify booking page loads
  24  |       const pageContent = page.locator('body');
  25  |       await expect(pageContent).toBeVisible();
  26  |       
  27  |       // Should NOT be redirected to login
  28  |       expect(page.url()).toContain('/book-your-resource');
  29  |     });
  30  | 
  31  |     test('GBF-002: Guest HoursStep loads without infinite loop errors', async ({ page }) => {
  32  |       // Navigate to a service directly - need to check if there's a specific service page
  33  |       // For now, navigate to book-your-resource
> 34  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  35  | 
  36  |       // Capture console errors
  37  |       const errors = [];
  38  |       page.on('console', msg => {
  39  |         if (msg.type() === 'error') {
  40  |           errors.push(msg.text());
  41  |         }
  42  |       });
  43  | 
  44  |       // Wait for any components to render
  45  |       await page.waitForTimeout(3000);
  46  | 
  47  |       // Check that there are NO "Maximum update depth exceeded" errors
  48  |       const hasMaxDepthError = errors.some(err => 
  49  |         err.includes('Maximum update depth') || 
  50  |         err.includes('setState loop')
  51  |       );
  52  |       
  53  |       expect(hasMaxDepthError).toBe(false);
  54  |     });
  55  | 
  56  |     test('GBF-003: Guest booking data persists in localStorage', async ({ page }) => {
  57  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  58  | 
  59  |       // Wait for any booking-related JS to run
  60  |       await page.waitForTimeout(2000);
  61  | 
  62  |       // Check if pending booking data is preserved
  63  |       const bookingData = await page.evaluate(() => {
  64  |         return {
  65  |           pendingBooking: localStorage.getItem('_pending_booking'),
  66  |           reduxState: localStorage.getItem('persist:root')
  67  |         };
  68  |       });
  69  | 
  70  |       // At minimum, Redux state should exist
  71  |       expect(bookingData.reduxState).toBeTruthy();
  72  |     });
  73  | 
  74  |     test('GBF-004: Guest state is preserved after navigation', async ({ page }) => {
  75  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  76  | 
  77  |       // Store initial auth status from Redux
  78  |       const initialState = await page.evaluate(() => {
  79  |         const reduxState = localStorage.getItem('persist:root');
  80  |         if (reduxState) {
  81  |           const parsed = JSON.parse(reduxState);
  82  |           return parsed;
  83  |         }
  84  |         return null;
  85  |       });
  86  | 
  87  |       // Navigate to another page and back
  88  |       await page.goto('/about-us', { waitUntil: 'networkidle' });
  89  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  90  | 
  91  |       // Check that state is still preserved
  92  |       const finalState = await page.evaluate(() => {
  93  |         const reduxState = localStorage.getItem('persist:root');
  94  |         if (reduxState) {
  95  |           const parsed = JSON.parse(reduxState);
  96  |           return parsed;
  97  |         }
  98  |         return null;
  99  |       });
  100 | 
  101 |       expect(finalState).toBeTruthy();
  102 |     });
  103 |   });
  104 | 
  105 |   test.describe('Guest Authentication & Redirect Handling', () => {
  106 |     test('GBF-005: Unauthenticated user can access public endpoints', async ({ page }) => {
  107 |       // Monitor network requests to catch any unwanted 401 redirects
  108 |       const requests = [];
  109 |       page.on('request', req => {
  110 |         requests.push({
  111 |           url: req.url(),
  112 |           method: req.method()
  113 |         });
  114 |       });
  115 | 
  116 |       const responses = [];
  117 |       page.on('response', res => {
  118 |         responses.push({
  119 |           url: res.url(),
  120 |           status: res.status()
  121 |         });
  122 |       });
  123 | 
  124 |       // Navigate to booking page
  125 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  126 | 
  127 |       // Check that we're not getting 401 responses for essential endpoints
  128 |       const unauthorized = responses.filter(r => 
  129 |         r.status === 401 && 
  130 |         (r.url.includes('/api/') && !r.url.includes('/auth/'))
  131 |       );
  132 | 
  133 |       expect(unauthorized).toHaveLength(0);
  134 |     });
```