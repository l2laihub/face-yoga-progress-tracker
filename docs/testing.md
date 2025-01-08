# Testing Guide

This project uses Vitest for testing. Here's how to run the tests:

## Running Tests

1. Run all tests once:
   ```bash
   npm test
   ```

2. Run tests in watch mode (tests re-run when files change):
   ```bash
   npm run test:watch
   ```

3. Run tests with coverage report:
   ```bash
   npm run test:coverage
   ```

4. Run tests with UI interface:
   ```bash
   npm run test:ui
   ```

## Test Files Location

Tests are organized in `__tests__` directories next to the components they test:

- `src/components/scheduling/__tests__/`
  - `ScheduleForm.test.tsx` - Tests for the schedule creation/editing form
  - `ScheduleManager.test.tsx` - Tests for the schedule list and management
  - `ReminderPreferences.test.tsx` - Tests for notification preferences

- `supabase/functions/process-reminders/__tests__/`
  - `email.test.ts` - Tests for email notification service
  - `fcm.test.ts` - Tests for push notification service
  - `integration.test.ts` - End-to-end tests for the notification system

## What's Being Tested

### Frontend Components
1. ScheduleForm
   - Form field validation
   - Schedule creation
   - Schedule updates
   - Error handling
   - Form submission

2. ReminderPreferences
   - Preference loading
   - Toggle reminders
   - Change notification method
   - Set quiet hours
   - Validation
   - Error handling

3. ScheduleManager
   - Schedule list display
   - Schedule grouping by day
   - Schedule deletion
   - Schedule activation/deactivation
   - Loading states
   - Error states

### Backend Services
1. Email Service
   - Email sending
   - Email template generation
   - Error handling
   - Configuration validation

2. Push Notifications
   - FCM integration
   - Notification sending
   - Token management
   - Error handling

3. Integration Tests
   - Complete notification flow
   - Schedule processing
   - User preferences
   - Error recovery

## Debugging Tests

1. Use the UI interface for better visualization:
   ```bash
   npm run test:ui
   ```
   This opens a web interface where you can:
   - See test results in real-time
   - Filter tests
   - View test coverage
   - Debug failing tests

2. Use console.log in tests:
   ```typescript
   it('should do something', () => {
     console.log('Current state:', result);
     expect(result).toBe(expected);
   });
   ```

3. Use screen.debug() for component testing:
   ```typescript
   import { screen } from '@testing-library/react';

   it('renders correctly', () => {
     render(<MyComponent />);
     screen.debug(); // Prints the current DOM state
   });
   ```

4. Use breakpoints:
   - Add `debugger;` statement in your test
   - Run tests in watch mode: `npm run test:watch`
   - Open DevTools in your browser

## Common Issues and Solutions

1. Test fails with "Unable to find element":
   - Check if the element exists in the rendered component
   - Use screen.debug() to see the current DOM
   - Verify your queries (getByText, getByRole, etc.)

2. Mock function not called:
   - Verify mock setup in beforeEach
   - Check if the mock is properly imported
   - Use mockImplementation for complex mocks

3. Async test fails:
   - Wrap assertions in waitFor
   - Check if all promises are being awaited
   - Verify async mock implementations

## Adding New Tests

When adding new features:
1. Create test file in `__tests__` directory
2. Import necessary testing utilities
3. Mock dependencies
4. Write test cases for:
   - Happy path
   - Error cases
   - Edge cases
   - User interactions

Example structure:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle normal case', () => {
    // Test
  });

  it('should handle error case', () => {
    // Test
  });

  it('should handle edge case', () => {
    // Test
  });
});
