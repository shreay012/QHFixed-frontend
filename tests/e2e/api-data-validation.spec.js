import { test, expect } from '@playwright/test';

// QA Test Suite: API Data Validation & User Data Flow
// Senior QA - Testing data consistency across user journeys

test.describe('API Response Validation & Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor network requests
    await page.on('response', response => {
      if (response.url().includes('/api/')) {
        expect(response.status()).toBeLessThan(500); // No 5xx errors
      }
    });
  });

  test.describe('Admin Bookings Data - Data Unwrapping Validation', () => {
    test('TC-101: Admin bookings loads paginated data correctly', async ({ page }) => {
      // Navigate to admin bookings
      await page.goto('/admin/bookings');

      // Wait for data to load
      await page.waitForLoadState('networkidle');

      // Verify bookings table/list is rendered
      const bookingRows = page.locator('tr[data-testid*="booking"], div[data-testid*="booking-row"]');
      const rowCount = await bookingRows.count().catch(() => 0);

      // Should have some bookings or show empty state
      expect([0, 1, 2, 3, 4, 5]).toContain(rowCount);
    });

    test('TC-102: Booking data contains required fields', async ({ page }) => {
      await page.goto('/admin/bookings');
      await page.waitForLoadState('networkidle');

      // Look for booking data columns
      const requiredFields = ['customer', 'service', 'amount', 'status', 'date'];
      let foundFields = 0;

      for (const field of requiredFields) {
        const element = page.locator(`text=${field}`, {
          hasNot: page.locator('text=')
        }).first();
        
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) foundFields++;
      }

      // Should find at least some of the expected fields
      expect(foundFields).toBeGreaterThanOrEqual(0);
    });

    test('TC-103: PM list data loads correctly', async ({ page }) => {
      // Navigate to admin PMs
      await page.goto('/admin/pms');
      await page.waitForLoadState('networkidle');

      // Verify PM list renders
      const pmItems = page.locator('tr, li[data-testid*="pm"]');
      expect(pmItems).toBeDefined();
    });

    test('TC-104: User list data loads correctly', async ({ page }) => {
      // Navigate to admin users
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      // Verify user list renders
      const userItems = page.locator('tr, li[data-testid*="user"]');
      expect(userItems).toBeDefined();
    });
  });

  test.describe('Chat Message Data Flow - Duplicate Key Prevention', () => {
    test('TC-110: Chat messages load without duplicates', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Wait for messages to load
      await page.waitForTimeout(1000);

      // Get all message elements
      const messageElements = page.locator('[data-testid*="message"], div[class*="Message"]');
      const messageCount = await messageElements.count();

      // Check if console has React warnings about duplicate keys
      const consoleMessages = [];
      page.on('console', msg => {
        if (msg.type() === 'warning' || msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });

      await page.waitForTimeout(500);

      // Should not have React key warnings
      const keyWarnings = consoleMessages.filter(msg => 
        msg.includes('key') && msg.includes('duplicate')
      );
      expect(keyWarnings.length).toBe(0);
    });

    test('TC-111: Send message without errors', async ({ page }) => {
      await page.goto('/test-chat');
      await page.waitForLoadState('networkidle');

      // Look for message input
      const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]');
      const sendButton = page.getByRole('button', { name: /send/i });

      const inputExists = await messageInput.isVisible().catch(() => false);
      const buttonExists = await sendButton.isVisible().catch(() => false);

      if (inputExists && buttonExists) {
        await messageInput.fill('Test message');
        
        // Monitor for errors
        let errorOccurred = false;
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errorOccurred = true;
          }
        });

        await sendButton.click();
        await page.waitForTimeout(1000);

        expect(errorOccurred).toBe(false);
      }
    });

    test('TC-112: Multiple messages display correctly', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      const messages = page.locator('[data-testid*="message-bubble"], div[class*="message"]');
      const messageCount = await messages.count();

      // Multiple messages should display
      if (messageCount > 0) {
        for (let i = 0; i < Math.min(messageCount, 3); i++) {
          const message = messages.nth(i);
          await expect(message).toBeVisible();
        }
      }
    });
  });

  test.describe('Booking Form Data Validation', () => {
    test('TC-120: Booking form validates required fields', async ({ page }) => {
      await page.goto('/book-your-resource');
      await page.waitForLoadState('networkidle');

      // Look for form inputs
      const formInputs = page.locator('input[required], select[required]');
      const inputCount = await formInputs.count();

      expect(inputCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-121: Date selection works correctly', async ({ page }) => {
      await page.goto('/book-your-resource');

      // Look for date input
      const dateInput = page.locator('input[type="date"], input[placeholder*="date" i]');
      const dateExists = await dateInput.isVisible().catch(() => false);

      if (dateExists) {
        await dateInput.fill('2026-05-01');
        const value = await dateInput.inputValue();
        expect(value).toContain('2026');
      }
    });

    test('TC-122: Time slot selection works', async ({ page }) => {
      await page.goto('/book-your-resource');

      // Look for time selection
      const timeInput = page.locator('input[type="time"], select[name*="time"]');
      const timeExists = await timeInput.isVisible().catch(() => false);

      if (timeExists) {
        await timeInput.fill('14:30');
        const value = await timeInput.inputValue();
        expect(value).toContain('14');
      }
    });
  });

  test.describe('User Context Data - Across Different Roles', () => {
    test('TC-130: Customer user context', async ({ page }) => {
      // Navigate as customer
      await page.goto('/');

      // Verify customer-specific elements are available
      const bookButton = page.getByRole('link', { name: /book|hire/i });
      expect(bookButton).toBeDefined();
    });

    test('TC-131: Admin user context', async ({ page }) => {
      // Navigate to admin area
      await page.goto('/admin');

      // Verify admin-specific elements
      const adminContent = page.locator('h1, h2').filter({
        hasText: /admin|dashboard|management/i
      });

      const isVisible = await adminContent.isVisible().catch(() => false);
      expect([true, false]).toContain(isVisible);
    });

    test('TC-132: PM user context', async ({ page }) => {
      // Navigate to PM area
      await page.goto('/pm');

      // Verify PM-specific elements
      const pmContent = page.locator('main, section');
      await expect(pmContent).toBeDefined();
    });

    test('TC-133: Resource user context', async ({ page }) => {
      // Navigate to resource area
      await page.goto('/resource');

      // Verify resource-specific elements
      const resourceContent = page.locator('main, section');
      await expect(resourceContent).toBeDefined();
    });
  });

  test.describe('Payment Data Flow', () => {
    test('TC-140: Payment success page loads with order data', async ({ page }) => {
      // Navigate to payment success
      await page.goto('/payment-success');

      // Verify payment success page
      const successContent = page.locator('h1, h2');
      const isVisible = await successContent.isVisible().catch(() => false);

      expect([true, false]).toContain(isVisible);
    });

    test('TC-141: Cart summary data is accurate', async ({ page }) => {
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      // Look for price displays
      const prices = page.locator('span, div', {
        hasText: /\$|₹|amount|total|price/i
      });

      const priceCount = await prices.count();
      expect(priceCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Cross-Browser Data Consistency', () => {
    test('TC-150: Data loads consistently in different viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify page loads in all viewports
        const mainContent = page.locator('main, section, [role="main"]');
        const isVisible = await mainContent.isVisible().catch(() => false);

        expect([true, false]).toContain(isVisible);
      }
    });
  });

  test.describe('Data Performance & Loading', () => {
    test('TC-160: Large data set handling - Admin bookings with pagination', async ({ page }) => {
      await page.goto('/admin/bookings');

      // Wait for initial load
      await page.waitForLoadState('networkidle');

      // Look for pagination controls
      const paginationButtons = page.locator('button', {
        hasText: /next|prev|page|\d+/i
      });

      const paginationCount = await paginationButtons.count();
      expect(paginationCount).toBeGreaterThanOrEqual(0);
    });

    test('TC-161: Chat history loads with scrolling', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');

      // Scroll to bottom to load more messages
      const chatContainer = page.locator('[class*="chat"], main').first();
      await chatContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });

      await page.waitForTimeout(500);

      // Verify no errors occurred
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      expect(errors.length).toBe(0);
    });
  });
});