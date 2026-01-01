# Jest Testing Guide

This guide covers testing setup, utilities, and best practices for the React 19 Base project.

## Table of Contents

- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Path Aliases](#path-aliases)
- [Test Utilities](#test-utilities)
- [Custom Matchers](#custom-matchers)
- [Mock Helpers](#mock-helpers)
- [Test Factories](#test-factories)
- [Testing Async Operations](#testing-async-operations)
- [Testing User Interactions](#testing-user-interactions)
- [Testing Timers](#testing-timers)
- [Mocking API Calls (MSW)](#mocking-api-calls-msw)
- [Coverage Thresholds](#coverage-thresholds)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test ChangePasswordForm.test.tsx

# Run tests matching pattern
yarn test --testNamePattern="displays validation"
```

## Test Structure

### File Structure

All test files should follow this structure:

```typescript
// 1. Imports (grouped)
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@tests/test-utils';
import { createMockUser } from '@tests/utils/test-factories';

import { ComponentName } from '../ComponentName';

// 2. Mocks (top level, before describe)
jest.mock('@features/auth/hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

// 3. Test Suite
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests...
});
```

### Test Naming Convention

**Format**: `should [expected behavior] when [condition]`

```typescript
it('should render all form fields', () => {});
it('should display validation error when email is invalid', () => {});
it('should call mutate with correct data when form is submitted', () => {});
it('should show loading state when isPending is true', () => {});
```

### AAA Pattern (Arrange, Act, Assert)

All tests should follow the AAA pattern with clear comments:

```typescript
it('should display error message when submission fails', async () => {
  // Arrange
  const mockMutate = jest.fn((_data: unknown, options?: { onError?: (error: { message: string }) => void }) => {
    options?.onError?.({ message: 'Error message' });
  });
  const { useLogin } = await import('@features/auth/hooks/useLogin');
  jest.mocked(useLogin).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as ReturnType<typeof useLogin>);

  // Act
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /login/i }));

  // Assert
  await waitFor(() => {
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });
});
```

### Test Categories

Organize tests by category:

1. **Rendering**: Test component renders correctly
2. **User Interactions**: Test user interactions
3. **Validation**: Test form validation
4. **API Integration**: Test API calls
5. **Loading/Error States**: Test different states
6. **Accessibility**: Test a11y attributes

## Custom Matchers

Custom matchers are automatically registered in `setup-jest.ts`. They provide better assertions for common test scenarios.

### `toBeWithinRange`

Check if a number is within a specified range [floor, ceiling]:

```typescript
expect(15).toBeWithinRange(10, 20); // passes
expect(25).toBeWithinRange(10, 20); // fails
```

### `toHaveBeenCalledWithMatch`

Check if a mock function was called with matching arguments. Supports partial object matching:

```typescript
const mockFn = jest.fn();

mockFn({ name: 'John', age: 30, id: 1 });

// Partial object match
expect(mockFn).toHaveBeenCalledWithMatch({ name: 'John' }); // passes

// Exact value match
expect(mockFn).toHaveBeenCalledWithMatch('test'); // fails
```

## Test Utilities

### Path Aliases

All test utilities can be imported using the `@tests/*` path alias:

```typescript
import { renderWithProviders } from '@tests/test-utils';
import { createMockUser } from '@tests/utils/test-factories';
import { mockMatchMedia } from '@tests/utils/test-helpers';
```

### Rendering Components

The test utilities provide several rendering functions for different scenarios:

#### `renderWithProviders` (Recommended)

Renders component with both QueryClient and Router providers. This is the most common use case:

```typescript
import { renderWithProviders } from '@tests/test-utils';

// Basic usage
const { getByText } = renderWithProviders(<MyComponent />);

// With custom options
const { getByText } = renderWithProviders(<MyComponent />, {
  queryClient: customQueryClient,
  initialEntries: ['/custom-route'],
});
```

#### `renderWithQueryClient`

Renders component with only QueryClient provider (no router):

```typescript
import { renderWithQueryClient } from '@tests/test-utils';

const { getByText } = renderWithQueryClient(<MyComponent />, {
  queryClient: customQueryClient, // optional
});
```

#### `renderWithRouter`

Renders component with only Router provider (no QueryClient):

```typescript
import { renderWithRouter } from '@tests/test-utils';

const { getByText } = renderWithRouter(<MyComponent />, {
  initialEntries: ['/custom-route'], // optional
});
```

#### `renderHookWithQueryClient`

Renders hook with QueryClient provider. Use this for testing hooks that use React Query:

```typescript
import { renderHookWithQueryClient } from '@tests/test-utils';

const { result } = renderHookWithQueryClient(() => useCustomHook());
```

#### Creating Custom QueryClient and Router

```typescript
import { createTestQueryClient, createTestRouter } from '@tests/test-utils';

// Create custom QueryClient
const queryClient = createTestQueryClient({
  queries: { retry: true },
});

// Create custom Router
const router = createTestRouter(['/home', '/about']);
```

### Mock Patterns

#### Mocking Hooks

Always mock hooks at the top level (before `describe`):

```typescript
// Top level mock
jest.mock('@features/auth/hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

// In test - use await import() and jest.mocked()
const { useLogin } = await import('@features/auth/hooks/useLogin');
jest.mocked(useLogin).mockReturnValue({
  mutate: mockMutate,
  isPending: false,
} as ReturnType<typeof useLogin>);
```

**❌ Avoid:**

- Using `require()` instead of `await import()`
- Using `as any` for type casting
- Mocking inside tests (except for dynamic mocks)

**✅ Prefer:**

- Using `await import()` for dynamic mocks
- Using `ReturnType<typeof hook>` for type safety
- Mocking at top level when possible

#### Type-Safe Mock Functions

Use proper types for mutation options:

```typescript
// ❌ Bad
const mockMutate = jest.fn((_data: unknown, options: unknown) => {
  (options as any).onError({ message: 'Error' });
});

// ✅ Good
const mockMutate = jest.fn((_data: unknown, options?: { onError?: (error: { message: string }) => void }) => {
  options?.onError?.({ message: 'Error' });
});
```

### Mock Helpers

All mock helpers are available from `@tests/utils/test-helpers` and `@tests/utils/test-mock-helpers`:

```typescript
import {
  mockMatchMedia,
  mockIntersectionObserver,
  mockResizeObserver,
  mockLocalStorage,
  mockSessionStorage,
  flushPromises,
  waitForCondition,
  createMockFn,
} from '@tests/utils/test-helpers';

// Mock matchMedia for responsive tests
mockMatchMedia(true); // mobile view
mockMatchMedia(false); // desktop view

// Mock IntersectionObserver for lazy loading
mockIntersectionObserver();

// Mock ResizeObserver
mockResizeObserver();

// Mock localStorage
const storage = mockLocalStorage();
storage.setItem('key', 'value');

// Mock sessionStorage
const sessionStorage = mockSessionStorage();
sessionStorage.setItem('key', 'value');

// Flush pending promises
await flushPromises();

// Wait for condition
await waitForCondition(() => someCondition === true, 5000, 100);

// Create type-safe mock function
const mockFn = createMockFn<() => void>();

// From test-mock-helpers.ts
import {
  createMockMutationResult,
  createMockMutateWithSuccess,
  createMockMutateWithError,
  createMockApiResponse,
  createMockApiError,
  createMockMutate,
} from '@tests/utils/test-mock-helpers';

// Create mock mutation result
const mockMutation = createMockMutationResult({
  mutate: jest.fn(),
  isPending: false,
});

// Create mock mutate with success callback
const mockMutate = createMockMutateWithSuccess({ id: 1, name: 'Success' });

// Create mock mutate with error callback
const mockMutateError = createMockMutateWithError(new Error('Failed'));

// Create mock API response
const apiResponse = createMockApiResponse({ data: 'test' }, true);

// Create mock API error
const apiError = createMockApiError('Not found', 404);
```

### Test Factories

```typescript
import { createMockUser, createMockUsers, randomEmail } from '@tests/utils/test-factories';

// Create single mock user
const user = createMockUser({ name: 'John Doe' });

// Create multiple mock users
const users = createMockUsers(5);

// Generate random data
const email = randomEmail();
```

## Testing Async Operations

```typescript
import { waitFor, screen } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<MyComponent />);

  // Wait for element to appear
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

## Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('handles user input', async () => {
  const user = userEvent.setup();
  render(<Form />);

  // Type into input
  await user.type(screen.getByLabelText('Email'), 'test@example.com');

  // Click button
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  // Check result
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Testing Timers

```typescript
it('handles delayed actions', async () => {
  jest.useFakeTimers();

  render(<ComponentWithTimer />);

  // Fast-forward time
  jest.advanceTimersByTime(3000);

  await waitFor(() => {
    expect(screen.getByText('Timer complete')).toBeInTheDocument();
  });

  jest.useRealTimers();
});
```

## Mocking API Calls (MSW)

MSW (Mock Service Worker) is configured in `src/tests/mocks/` directory. The server is automatically started in `setup-jest.ts`.

### Adding New Handlers

Add new request handlers in `src/tests/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: '1', name: 'John' }]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '2', ...body }, { status: 201 });
  }),
];
```

### Using MSW in Tests

The MSW server is automatically reset between tests. You can also manually reset or override handlers:

```typescript
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

it('handles API error', async () => {
  // Override handler for this test
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  renderWithProviders(<MyComponent />);
  // ... test error handling
});

// Handler is automatically reset after test
```

### Current Handlers

- `GET /api/users` - Returns list of mock users
- `POST /auth/login` - Mock login endpoint
  - Valid credentials: `test@test.com` / `password123`

## Coverage Thresholds

Current thresholds (can be adjusted in `jest.config.mjs`):

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Avoid testing implementation details** - Don't test internal state or private methods
4. **Keep tests independent** - Each test should be able to run in isolation
5. **Use descriptive test names** - Follow format: `should [expected behavior] when [condition]`
6. **Follow AAA pattern** - Always structure tests with Arrange, Act, Assert comments
7. **Mock external dependencies** - Use MSW for API calls, mock third-party libraries
8. **Test accessibility** - Check for proper ARIA attributes and keyboard navigation
9. **Clean up after tests** - Use `beforeEach` to clear mocks with `jest.clearAllMocks()`
10. **Type safety** - Avoid `as any`, use proper types like `ReturnType<typeof hook>`
11. **Consistent mock patterns** - Mock hooks at top level, use `await import()` for dynamic mocks
12. **Use shared utilities** - Always use `renderWithProviders`, `renderHookWithQueryClient` from test-utils

## Common Patterns

### Testing Forms

```typescript
it('should display validation error when email is empty', async () => {
  // Arrange
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />, { initialEntries: ['/auth/login'] });

  // Act
  await user.click(screen.getByRole('button', { name: /login/i }));

  // Assert
  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHookWithQueryClient } from '@tests/test-utils';

it('should call API on mutate', async () => {
  // Arrange
  const mockApi = jest.fn().mockResolvedValue({ success: true });
  jest.mock('@features/api', () => ({ api: { call: mockApi } }));

  // Act
  const { result } = renderHookWithQueryClient(() => useCustomHook());
  result.current.mutate({ data: 'test' });

  // Assert
  await waitFor(() => {
    expect(mockApi).toHaveBeenCalledWith({ data: 'test' });
  });
});
```

### Testing Loading States

```typescript
it('should show loading state when isPending is true', () => {
  // Arrange
  const { useHook } = await import('@features/hooks/useHook');
  jest.mocked(useHook).mockReturnValue({
    mutate: jest.fn(),
    isPending: true,
  } as ReturnType<typeof useHook>);

  // Act
  renderWithProviders(<DataComponent />);

  // Assert
  expect(screen.getByRole('button')).toBeDisabled();
});
```

### Testing Error States

```typescript
it('should display error message when submission fails', async () => {
  // Arrange
  const mockMutate = jest.fn((_data: unknown, options?: { onError?: (error: { message: string }) => void }) => {
    options?.onError?.({ message: 'Failed to load' });
  });
  const { useHook } = await import('@features/hooks/useHook');
  jest.mocked(useHook).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as ReturnType<typeof useHook>);

  // Act
  const user = userEvent.setup();
  renderWithProviders(<DataComponent />);
  await user.click(screen.getByRole('button'));

  // Assert
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Test is flaky

- Add `await waitFor()` for async operations
- Use `jest.useFakeTimers()` for time-dependent code
- Check for race conditions in async code

### Test fails in CI but passes locally

- Check for timezone differences
- Ensure deterministic test data
- Verify environment variables are set

### Mock is not working

- Ensure mock is defined before component import
- Check mock path matches actual import
- Use `jest.clearAllMocks()` in `afterEach`
- For MSW: Check that handlers are properly exported and server is started

### Path alias not resolving

- Ensure `@tests/*` is configured in both `tsconfig.json` and `jest.config.mjs`
- Restart your IDE/editor after adding new path aliases
- Check that the import path matches exactly (case-sensitive)

### Custom matchers not available

- Ensure `registerCustomMatchers()` is called in `setup-jest.ts`
- Check that `custom-matchers.ts` is properly exported
- Restart Jest if matchers were just added
