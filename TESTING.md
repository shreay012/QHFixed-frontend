# Testing Guide

This project now includes comprehensive testing setup using Jest for unit/component testing and Playwright for end-to-end testing.

## Setup

All testing dependencies have been installed and configured.

## Running Tests

### Unit Tests (Jest)
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

## Test Structure

```
__tests__/           # Unit tests
├── SectionHeader.test.jsx

tests/e2e/           # E2E tests
├── homepage.spec.js
```

## Writing Tests

### Unit Tests
Use React Testing Library for component testing:

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests
Use Playwright for browser automation:

```js
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## QA Best Practices

Based on the senior QA skill, follow these practices:

1. **Test Coverage**: Aim for >80% code coverage
2. **Test Types**: Unit, Integration, E2E
3. **CI/CD**: Run tests on every commit
4. **Accessibility**: Include a11y testing
5. **Performance**: Monitor bundle size and load times

## Next Steps

- Add more unit tests for components
- Create integration tests for API calls
- Add accessibility testing
- Set up CI/CD pipeline with test automation