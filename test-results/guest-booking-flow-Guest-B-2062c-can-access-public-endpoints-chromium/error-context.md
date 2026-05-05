# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-booking-flow.spec.js >> Guest Booking Flow - Complete Journey >> Guest Authentication & Redirect Handling >> GBF-005: Unauthenticated user can access public endpoints
- Location: tests/e2e/guest-booking-flow.spec.js:106:9

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
      - generic [ref=e33]:
        - generic [ref=e35]:
          - generic [ref=e36]:
            - img "AI Engineers" [ref=e38]
            - heading "AI Engineers" [level=3] [ref=e39]
          - paragraph [ref=e40]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e42]:
            - generic [ref=e43] [cursor=pointer]:
              - generic [ref=e44]: Gen AI Solutions
              - img "arrow" [ref=e45]
            - generic [ref=e46] [cursor=pointer]:
              - generic [ref=e47]: Prompt Engineering
              - img "arrow" [ref=e48]
            - generic [ref=e49] [cursor=pointer]:
              - generic [ref=e50]: Predictive Analytics
              - img "arrow" [ref=e51]
            - generic [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: Computer Vision
              - img "arrow" [ref=e54]
            - generic [ref=e55] [cursor=pointer]:
              - generic [ref=e56]: NLP
              - img "arrow" [ref=e57]
            - generic [ref=e58] [cursor=pointer]:
              - generic [ref=e59]: AI Chatbots
              - img "arrow" [ref=e60]
            - generic [ref=e61] [cursor=pointer]:
              - generic [ref=e62]: ML Engineer
              - img "arrow" [ref=e63]
          - generic [ref=e64]:
            - button "View All (10)" [ref=e65] [cursor=pointer]
            - button "Book Now" [ref=e66] [cursor=pointer]
        - generic [ref=e68]:
          - generic [ref=e69]:
            - img "Backend Developers" [ref=e71]
            - heading "Backend Developers" [level=3] [ref=e72]
          - paragraph [ref=e73]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e75]:
            - generic [ref=e76] [cursor=pointer]:
              - generic [ref=e77]: Rest API Development
              - img "arrow" [ref=e78]
            - generic [ref=e79] [cursor=pointer]:
              - generic [ref=e80]: GraphQL API Development
              - img "arrow" [ref=e81]
            - generic [ref=e82] [cursor=pointer]:
              - generic [ref=e83]: Database Management
              - img "arrow" [ref=e84]
            - generic [ref=e85] [cursor=pointer]:
              - generic [ref=e86]: Microservices Architecture
              - img "arrow" [ref=e87]
            - generic [ref=e88] [cursor=pointer]:
              - generic [ref=e89]: Server Integration
              - img "arrow" [ref=e90]
            - generic [ref=e91] [cursor=pointer]:
              - generic [ref=e92]: Cloud Functions (Serverless)
              - img "arrow" [ref=e93]
            - generic [ref=e94] [cursor=pointer]:
              - generic [ref=e95]: Authentication Setup
              - img "arrow" [ref=e96]
          - generic [ref=e97]:
            - button "View All (10)" [ref=e98] [cursor=pointer]
            - button "Book Now" [ref=e99] [cursor=pointer]
        - generic [ref=e101]:
          - generic [ref=e102]:
            - img "Frontend Development" [ref=e104]
            - heading "Frontend Development" [level=3] [ref=e105]
          - paragraph [ref=e106]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e108]:
            - generic [ref=e109] [cursor=pointer]:
              - generic [ref=e110]: React.js Development
              - img "arrow" [ref=e111]
            - generic [ref=e112] [cursor=pointer]:
              - generic [ref=e113]: Nxt.js Development
              - img "arrow" [ref=e114]
            - generic [ref=e115] [cursor=pointer]:
              - generic [ref=e116]: Vue.js Development
              - img "arrow" [ref=e117]
            - generic [ref=e118] [cursor=pointer]:
              - generic [ref=e119]: Angular Development
              - img "arrow" [ref=e120]
            - generic [ref=e121] [cursor=pointer]:
              - generic [ref=e122]: PWA (Progressive Web Apps)
              - img "arrow" [ref=e123]
            - generic [ref=e124] [cursor=pointer]:
              - generic [ref=e125]: Web Performance Optimization
              - img "arrow" [ref=e126]
            - generic [ref=e127] [cursor=pointer]:
              - generic [ref=e128]: Single Page Applications (SPA)
              - img "arrow" [ref=e129]
          - generic [ref=e130]:
            - button "View All (11)" [ref=e131] [cursor=pointer]
            - button "Book Now" [ref=e132] [cursor=pointer]
        - generic [ref=e134]:
          - generic [ref=e135]:
            - img "UI/UX Designer" [ref=e137]
            - heading "UI/UX Designer" [level=3] [ref=e138]
          - paragraph [ref=e139]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e141]:
            - generic [ref=e142] [cursor=pointer]:
              - generic [ref=e143]: Brand Book
              - img "arrow" [ref=e144]
            - generic [ref=e145] [cursor=pointer]:
              - generic [ref=e146]: Company Deck
              - img "arrow" [ref=e147]
            - generic [ref=e148] [cursor=pointer]:
              - generic [ref=e149]: Mobile App
              - img "arrow" [ref=e150]
            - generic [ref=e151] [cursor=pointer]:
              - generic [ref=e152]: Website Design
              - img "arrow" [ref=e153]
            - generic [ref=e154] [cursor=pointer]:
              - generic [ref=e155]: Landing Page
              - img "arrow" [ref=e156]
            - generic [ref=e157] [cursor=pointer]:
              - generic [ref=e158]: Graphic Designer
              - img "arrow" [ref=e159]
            - generic [ref=e160] [cursor=pointer]:
              - generic [ref=e161]: UI/UX Designer
              - img "arrow" [ref=e162]
          - generic [ref=e163]:
            - button "View All (9)" [ref=e164] [cursor=pointer]
            - button "Book Now" [ref=e165] [cursor=pointer]
        - generic [ref=e167]:
          - generic [ref=e168]:
            - img "IT Support" [ref=e170]
            - heading "IT Support" [level=3] [ref=e171]
          - paragraph [ref=e172]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e174]:
            - generic [ref=e175] [cursor=pointer]:
              - generic [ref=e176]: Server Administration
              - img "arrow" [ref=e177]
            - generic [ref=e178] [cursor=pointer]:
              - generic [ref=e179]: 24/7 Help Desk (L1/L2/L3)
              - img "arrow" [ref=e180]
            - generic [ref=e181] [cursor=pointer]:
              - generic [ref=e182]: Remote Monitoring (RMM)
              - img "arrow" [ref=e183]
            - generic [ref=e184] [cursor=pointer]:
              - generic [ref=e185]: Network Administration
              - img "arrow" [ref=e186]
            - generic [ref=e187] [cursor=pointer]:
              - generic [ref=e188]: Cloud Migration & Support
              - img "arrow" [ref=e189]
            - generic [ref=e190] [cursor=pointer]:
              - generic [ref=e191]: Backup Expert
              - img "arrow" [ref=e192]
            - generic [ref=e193] [cursor=pointer]:
              - generic [ref=e194]: VPN & Firewall Setup
              - img "arrow" [ref=e195]
          - generic [ref=e196]:
            - button "View All (10)" [ref=e197] [cursor=pointer]
            - button "Book Now" [ref=e198] [cursor=pointer]
        - generic [ref=e200]:
          - generic [ref=e201]:
            - img "DevOps" [ref=e203]
            - heading "DevOps" [level=3] [ref=e204]
          - paragraph [ref=e205]: Need Smarter AI Solutions? We Build & Optimize.
          - generic [ref=e207]:
            - generic [ref=e208] [cursor=pointer]:
              - generic [ref=e209]: CI/CD Pipeline Management
              - img "arrow" [ref=e210]
            - generic [ref=e211] [cursor=pointer]:
              - generic [ref=e212]: Infrastructure as Code (IaC)
              - img "arrow" [ref=e213]
            - generic [ref=e214] [cursor=pointer]:
              - generic [ref=e215]: Containerization (Docker)
              - img "arrow" [ref=e216]
            - generic [ref=e217] [cursor=pointer]:
              - generic [ref=e218]: Orchestration (Kubernetes)
              - img "arrow" [ref=e219]
            - generic [ref=e220] [cursor=pointer]:
              - generic [ref=e221]: Network Administration
              - img "arrow" [ref=e222]
            - generic [ref=e223] [cursor=pointer]:
              - generic [ref=e224]: Log Management
              - img "arrow" [ref=e225]
            - generic [ref=e226] [cursor=pointer]:
              - generic [ref=e227]: Performance Monitoring
              - img "arrow" [ref=e228]
          - generic [ref=e229]:
            - button "View All (8)" [ref=e230] [cursor=pointer]
            - button "Book Now" [ref=e231] [cursor=pointer]
      - button "Load More" [ref=e233]
    - generic [ref=e236]:
      - generic [ref=e237]:
        - heading "Not sure what you need?" [level=2] [ref=e238]:
          - text: Not sure what
          - text: you need?
        - paragraph [ref=e239]: Tell us what you're trying to build or fix, and we'll match you with the right expert.
        - button "Find Right Experts" [ref=e240] [cursor=pointer]:
          - generic [ref=e241]: Find Right Experts
      - img "Find Experts" [ref=e244]
    - generic [ref=e246]:
      - generic [ref=e250]:
        - heading "Book Experts" [level=2] [ref=e251]
        - paragraph [ref=e252]: Fulfill tech resource requirement fast.
      - generic [ref=e253]:
        - generic [ref=e254]:
          - img "icon" [ref=e257]
          - generic [ref=e259]:
            - heading "AI Engineers" [level=3] [ref=e260]
            - paragraph [ref=e261]: Gen AI Solutions | Prompt Engineering | Predictive Analytics | Computer Vision | NLP
          - button "Hire Experts" [ref=e263]:
            - generic [ref=e264]: Hire Experts
            - img [ref=e265]
        - generic [ref=e267]:
          - img "icon" [ref=e270]
          - generic [ref=e272]:
            - heading "Backend Developers" [level=3] [ref=e273]
            - paragraph [ref=e274]: Rest API Development | GraphQL API Development | Database Management | Microservices Architecture | Server Integration
          - button "Hire Experts" [ref=e276]:
            - generic [ref=e277]: Hire Experts
            - img [ref=e278]
        - generic [ref=e280]:
          - img "icon" [ref=e283]
          - generic [ref=e285]:
            - heading "Frontend Development" [level=3] [ref=e286]
            - paragraph [ref=e287]: React.js Development | Nxt.js Development | Vue.js Development | Angular Development | PWA (Progressive Web Apps)
          - button "Hire Experts" [ref=e289]:
            - generic [ref=e290]: Hire Experts
            - img [ref=e291]
        - generic [ref=e293]:
          - img "icon" [ref=e296]
          - generic [ref=e298]:
            - heading "UI/UX Designer" [level=3] [ref=e299]
            - paragraph [ref=e300]: Brand Book | Company Deck | Mobile App | Website Design | Landing Page
          - button "Hire Experts" [ref=e302]:
            - generic [ref=e303]: Hire Experts
            - img [ref=e304]
        - generic [ref=e306]:
          - img "icon" [ref=e309]
          - generic [ref=e311]:
            - heading "IT Support" [level=3] [ref=e312]
            - paragraph [ref=e313]: Server Administration | 24/7 Help Desk (L1/L2/L3) | Remote Monitoring (RMM) | Network Administration | Cloud Migration & Support
          - button "Hire Experts" [ref=e315]:
            - generic [ref=e316]: Hire Experts
            - img [ref=e317]
        - generic [ref=e319]:
          - img "icon" [ref=e322]
          - generic [ref=e324]:
            - heading "DevOps" [level=3] [ref=e325]
            - paragraph [ref=e326]: CI/CD Pipeline Management | Infrastructure as Code (IaC) | Containerization (Docker) | Orchestration (Kubernetes) | Network Administration
          - button "Hire Experts" [ref=e328]:
            - generic [ref=e329]: Hire Experts
            - img [ref=e330]
        - generic [ref=e332]:
          - img "icon" [ref=e335]
          - generic [ref=e337]:
            - heading "Content Writing" [level=3] [ref=e338]
            - paragraph [ref=e339]: SEO Blog Writing | Technical Documentation | API Documentation | Whitepapers | Ad & Sales Copywriting
          - button "Hire Experts" [ref=e341]:
            - generic [ref=e342]: Hire Experts
            - img [ref=e343]
        - generic [ref=e345]:
          - img "icon" [ref=e348]
          - generic [ref=e350]:
            - heading "Digital Marketing" [level=3] [ref=e351]
            - paragraph [ref=e352]: Search Engine Optimization (SEO) | Social Media Marketing (SMM) | Influencer Marketing | PPC Advertising (Google/Meta Ads) | Email Marketing Strategy
          - button "Hire Experts" [ref=e354]:
            - generic [ref=e355]: Hire Experts
            - img [ref=e356]
      - button "Load More" [ref=e359]
    - generic [ref=e364] [cursor=pointer]:
      - img [ref=e365]
      - generic [ref=e367]: Click to unmute
    - generic [ref=e369]:
      - heading "Frequently Asked Questions" [level=2] [ref=e371]
      - generic [ref=e372]:
        - generic [ref=e373]:
          - paragraph [ref=e375] [cursor=pointer]: How quickly can I book a resource?
          - paragraph [ref=e377] [cursor=pointer]: What types of resources are available?
          - separator [ref=e378]
          - paragraph [ref=e380] [cursor=pointer]: Can I change my resource requirements after booking?
          - separator [ref=e381]
          - paragraph [ref=e383] [cursor=pointer]: What payment methods do you accept?
          - separator [ref=e384]
          - paragraph [ref=e386] [cursor=pointer]: Is there a minimum booking duration?
        - paragraph [ref=e389]: You can book a resource within minutes. Simply select your requirements, complete the payment, and get connected with your dedicated expert immediately.
  - contentinfo [ref=e390]:
    - generic [ref=e392]:
      - generic [ref=e393]:
        - img "QuickHire" [ref=e395]
        - paragraph [ref=e396]: A faster way to get tech & software work done.
      - generic [ref=e397]:
        - heading "Knowledge Hub" [level=6] [ref=e398]
        - generic [ref=e399]:
          - link "Industry Perspectives" [ref=e400] [cursor=pointer]:
            - /url: undefined/industry-perspectives/
            - paragraph [ref=e401]: Industry Perspectives
          - link "Enterprise" [ref=e402] [cursor=pointer]:
            - /url: undefined/home
            - paragraph [ref=e403]: Enterprise
          - link "About Us" [ref=e404] [cursor=pointer]:
            - /url: /about-us
            - paragraph [ref=e405]: About Us
          - link "FAQs" [ref=e406] [cursor=pointer]:
            - /url: /faq
            - paragraph [ref=e407]: FAQs
      - generic [ref=e408]:
        - heading "Company" [level=6] [ref=e409]
        - generic [ref=e410]:
          - link "How it Works" [ref=e411] [cursor=pointer]:
            - /url: /how-it-works
            - paragraph [ref=e412]: How it Works
          - link "Contact Us" [ref=e413] [cursor=pointer]:
            - /url: /contact-us
            - paragraph [ref=e414]: Contact Us
          - link "Terms & Conditions" [ref=e415] [cursor=pointer]:
            - /url: /terms-and-conditions
            - paragraph [ref=e416]: Terms & Conditions
          - link "Cancellation & Refund Policy" [ref=e417] [cursor=pointer]:
            - /url: /cancellation-and-refund-policy
            - paragraph [ref=e418]: Cancellation & Refund Policy
      - generic [ref=e419]:
        - heading "Follow Us" [level=6] [ref=e420]
        - generic [ref=e421]:
          - link "Instagram" [ref=e422] [cursor=pointer]:
            - /url: https://www.instagram.com/quickhire__services_/
            - img "Instagram" [ref=e424]
          - link "LinkedIn" [ref=e425] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/quickhire-services/?viewAsMember=true
            - img "LinkedIn" [ref=e427]
          - link "Pinterest" [ref=e428] [cursor=pointer]:
            - /url: https://in.pinterest.com/quickhire_services/
            - img "Pinterest" [ref=e430]
          - link "YouTube" [ref=e431] [cursor=pointer]:
            - /url: https://www.youtube.com/@QuickhireServices
            - img "YouTube" [ref=e433]
  - button "Open Next.js Dev Tools" [ref=e439] [cursor=pointer]:
    - img [ref=e440]
  - alert [ref=e443]
```

# Test source

```ts
  25  |       await expect(pageContent).toBeVisible();
  26  |       
  27  |       // Should NOT be redirected to login
  28  |       expect(page.url()).toContain('/book-your-resource');
  29  |     });
  30  | 
  31  |     test('GBF-002: Guest HoursStep loads without infinite loop errors', async ({ page }) => {
  32  |       // Navigate to a service directly - need to check if there's a specific service page
  33  |       // For now, navigate to book-your-resource
  34  |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
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
> 125 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  126 | 
  127 |       // Check that we're not getting 401 responses for essential endpoints
  128 |       const unauthorized = responses.filter(r => 
  129 |         r.status === 401 && 
  130 |         (r.url.includes('/api/') && !r.url.includes('/auth/'))
  131 |       );
  132 | 
  133 |       expect(unauthorized).toHaveLength(0);
  134 |     });
  135 | 
  136 |     test('GBF-006: Guest pending booking data is saved before navigation', async ({ page }) => {
  137 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  138 | 
  139 |       // Simulate making some booking selections
  140 |       await page.evaluate(() => {
  141 |         // Manually set pending booking data (as if guest made selections)
  142 |         const mockBooking = {
  143 |           activeService: { id: '123', name: 'Test Service' },
  144 |           selectedPlan: 'plan-4',
  145 |           selectedDates: ['2024-12-20'],
  146 |           timestamp: Date.now()
  147 |         };
  148 |         localStorage.setItem('_pending_booking', JSON.stringify(mockBooking));
  149 |       });
  150 | 
  151 |       // Verify it was saved
  152 |       const savedData = await page.evaluate(() => {
  153 |         return localStorage.getItem('_pending_booking');
  154 |       });
  155 | 
  156 |       expect(savedData).toBeTruthy();
  157 |       expect(JSON.parse(savedData)).toHaveProperty('activeService');
  158 |     });
  159 |   });
  160 | 
  161 |   test.describe('Redux Guest State Management', () => {
  162 |     test('GBF-007: Redux isAuthenticated is false for guests', async ({ page }) => {
  163 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  164 | 
  165 |       // Access Redux state from localStorage
  166 |       const reduxState = await page.evaluate(() => {
  167 |         const state = localStorage.getItem('persist:root');
  168 |         if (state) {
  169 |           const parsed = JSON.parse(state);
  170 |           if (parsed.auth) {
  171 |             const auth = JSON.parse(parsed.auth);
  172 |             return auth;
  173 |           }
  174 |         }
  175 |         return null;
  176 |       });
  177 | 
  178 |       // For guests, isAuthenticated should be false
  179 |       if (reduxState) {
  180 |         expect(reduxState.isAuthenticated).toBe(false);
  181 |       }
  182 |     });
  183 | 
  184 |     test('GBF-008: Redux state loads on page initialization', async ({ page }) => {
  185 |       // Create some initial state
  186 |       await page.goto('/', { waitUntil: 'networkidle' });
  187 | 
  188 |       await page.evaluate(() => {
  189 |         // Set initial state
  190 |         const initialState = {
  191 |           auth: { isAuthenticated: false, user: null },
  192 |           booking: { activeStep: 0 }
  193 |         };
  194 |         
  195 |         const persist = {
  196 |           auth: JSON.stringify(initialState.auth),
  197 |           booking: JSON.stringify(initialState.booking)
  198 |         };
  199 |         
  200 |         localStorage.setItem('persist:root', JSON.stringify(persist));
  201 |       });
  202 | 
  203 |       // Navigate to booking page
  204 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  205 | 
  206 |       // Verify state is accessible
  207 |       const state = await page.evaluate(() => {
  208 |         return localStorage.getItem('persist:root');
  209 |       });
  210 | 
  211 |       expect(state).toBeTruthy();
  212 |     });
  213 |   });
  214 | 
  215 |   test.describe('No Premature Auth Redirects', () => {
  216 |     test('GBF-009: Guest is NOT redirected to login on booking page', async ({ page }) => {
  217 |       // Set up navigation tracking
  218 |       const urlChanges = [];
  219 |       page.on('framenavigated', () => {
  220 |         urlChanges.push(page.url());
  221 |       });
  222 | 
  223 |       await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
  224 |       
  225 |       // Wait for potential redirects
```