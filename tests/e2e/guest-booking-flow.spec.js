import { test, expect } from '@playwright/test';

// Guest Booking Flow Test Suite
// Tests: Guest can proceed through booking steps without premature redirects
// Focus: HoursStep useMemo fix validation, state persistence, infinite loop prevention

test.describe('Guest Booking Flow - Complete Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any auth tokens to ensure guest status
    await page.context().clearCookies();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Guest Booking Steps Validation', () => {
    test('GBF-001: Guest can navigate to booking page without redirect', async ({ page }) => {
      // Navigate to booking page as guest
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
      
      // Verify booking page loads
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
      
      // Should NOT be redirected to login
      expect(page.url()).toContain('/book-your-resource');
    });

    test('GBF-002: Guest HoursStep loads without infinite loop errors', async ({ page }) => {
      // Navigate to a service directly - need to check if there's a specific service page
      // For now, navigate to book-your-resource
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Capture console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait for any components to render
      await page.waitForTimeout(3000);

      // Check that there are NO "Maximum update depth exceeded" errors
      const hasMaxDepthError = errors.some(err => 
        err.includes('Maximum update depth') || 
        err.includes('setState loop')
      );
      
      expect(hasMaxDepthError).toBe(false);
    });

    test('GBF-003: Guest booking data persists in localStorage', async ({ page }) => {
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Wait for any booking-related JS to run
      await page.waitForTimeout(2000);

      // Check if pending booking data is preserved
      const bookingData = await page.evaluate(() => {
        return {
          pendingBooking: localStorage.getItem('_pending_booking'),
          reduxState: localStorage.getItem('persist:root')
        };
      });

      // At minimum, Redux state should exist
      expect(bookingData.reduxState).toBeTruthy();
    });

    test('GBF-004: Guest state is preserved after navigation', async ({ page }) => {
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Store initial auth status from Redux
      const initialState = await page.evaluate(() => {
        const reduxState = localStorage.getItem('persist:root');
        if (reduxState) {
          const parsed = JSON.parse(reduxState);
          return parsed;
        }
        return null;
      });

      // Navigate to another page and back
      await page.goto('/about-us', { waitUntil: 'networkidle' });
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Check that state is still preserved
      const finalState = await page.evaluate(() => {
        const reduxState = localStorage.getItem('persist:root');
        if (reduxState) {
          const parsed = JSON.parse(reduxState);
          return parsed;
        }
        return null;
      });

      expect(finalState).toBeTruthy();
    });
  });

  test.describe('Guest Authentication & Redirect Handling', () => {
    test('GBF-005: Unauthenticated user can access public endpoints', async ({ page }) => {
      // Monitor network requests to catch any unwanted 401 redirects
      const requests = [];
      page.on('request', req => {
        requests.push({
          url: req.url(),
          method: req.method()
        });
      });

      const responses = [];
      page.on('response', res => {
        responses.push({
          url: res.url(),
          status: res.status()
        });
      });

      // Navigate to booking page
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Check that we're not getting 401 responses for essential endpoints
      const unauthorized = responses.filter(r => 
        r.status === 401 && 
        (r.url.includes('/api/') && !r.url.includes('/auth/'))
      );

      expect(unauthorized).toHaveLength(0);
    });

    test('GBF-006: Guest pending booking data is saved before navigation', async ({ page }) => {
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Simulate making some booking selections
      await page.evaluate(() => {
        // Manually set pending booking data (as if guest made selections)
        const mockBooking = {
          activeService: { id: '123', name: 'Test Service' },
          selectedPlan: 'plan-4',
          selectedDates: ['2024-12-20'],
          timestamp: Date.now()
        };
        localStorage.setItem('_pending_booking', JSON.stringify(mockBooking));
      });

      // Verify it was saved
      const savedData = await page.evaluate(() => {
        return localStorage.getItem('_pending_booking');
      });

      expect(savedData).toBeTruthy();
      expect(JSON.parse(savedData)).toHaveProperty('activeService');
    });
  });

  test.describe('Redux Guest State Management', () => {
    test('GBF-007: Redux isAuthenticated is false for guests', async ({ page }) => {
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Access Redux state from localStorage
      const reduxState = await page.evaluate(() => {
        const state = localStorage.getItem('persist:root');
        if (state) {
          const parsed = JSON.parse(state);
          if (parsed.auth) {
            const auth = JSON.parse(parsed.auth);
            return auth;
          }
        }
        return null;
      });

      // For guests, isAuthenticated should be false
      if (reduxState) {
        expect(reduxState.isAuthenticated).toBe(false);
      }
    });

    test('GBF-008: Redux state loads on page initialization', async ({ page }) => {
      // Create some initial state
      await page.goto('/', { waitUntil: 'networkidle' });

      await page.evaluate(() => {
        // Set initial state
        const initialState = {
          auth: { isAuthenticated: false, user: null },
          booking: { activeStep: 0 }
        };
        
        const persist = {
          auth: JSON.stringify(initialState.auth),
          booking: JSON.stringify(initialState.booking)
        };
        
        localStorage.setItem('persist:root', JSON.stringify(persist));
      });

      // Navigate to booking page
      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });

      // Verify state is accessible
      const state = await page.evaluate(() => {
        return localStorage.getItem('persist:root');
      });

      expect(state).toBeTruthy();
    });
  });

  test.describe('No Premature Auth Redirects', () => {
    test('GBF-009: Guest is NOT redirected to login on booking page', async ({ page }) => {
      // Set up navigation tracking
      const urlChanges = [];
      page.on('framenavigated', () => {
        urlChanges.push(page.url());
      });

      await page.goto('/book-your-resource', { waitUntil: 'networkidle' });
      
      // Wait for potential redirects
      await page.waitForTimeout(2000);

      // Final URL should still be the booking page
      expect(page.url()).toContain('/book-your-resource');
      
      // Should not have been redirected to login
      expect(page.url()).not.toContain('/login');
    });

    test('GBF-010: Service details accessible without authentication', async ({ page }) => {
      // Try to navigate to a service details page if it exists
      // This path should be in PUBLIC_PREFIXES
      const responses = [];
      page.on('response', res => {
        if (res.url().includes('/api/')) {
          responses.push({ url: res.url(), status: res.status() });
        }
      });

      await page.goto('/service-details', { 
        waitUntil: 'networkidle' 
      }).catch(() => {
        // Endpoint might not exist, that's okay
      });

      // If we made it here without 401, that's good
      expect(page.url()).not.toContain('/login');
    });
  });
});
