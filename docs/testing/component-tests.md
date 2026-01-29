# Component Testing Guide

Task Group 24: Component Tests

## Overview

This guide documents the patterns and best practices for testing React components in TeqBook. We use Vitest with React Testing Library for component testing.

## Setup

Component testing is configured in `vitest.config.ts` with:
- **Environment:** jsdom for DOM simulation
- **JSX Transform:** esbuild with automatic JSX
- **Setup File:** `tests/setup.ts` for global mocks

## Test File Location

Place component tests in `tests/components/` with the naming convention:
- `ComponentName.test.tsx`

## Test Utilities

Import utilities from `tests/components/test-utils.tsx`:

```typescript
import {
  render,
  screen,
  fireEvent,
  mockBooking,
  mockEmployee,
  mockService,
  mockBookingsTableTranslations,
} from "./test-utils";
```

### Mock Data Factories

Use factory functions for consistent test data:

```typescript
// Create a booking with defaults
const booking = mockBooking();

// Override specific fields
const customBooking = mockBooking({
  status: "cancelled",
  is_walk_in: true,
});
```

Available factories:
- `mockEmployee(overrides)` - Employee data
- `mockService(overrides)` - Service data
- `mockCustomer(overrides)` - Customer data
- `mockBooking(overrides)` - Full booking with relations
- `mockShift(overrides)` - Employee shift data
- `mockProduct(overrides)` - Product/inventory data

### Mock Translation Factories

For components that accept translation props:

```typescript
const translations = mockBookingsTableTranslations();
const serviceTranslations = mockServiceFormTranslations();
const employeeTranslations = mockEmployeeFormTranslations();
```

## Testing Patterns

### 1. Rendering Tests

Test that components render correctly:

```typescript
describe("Rendering", () => {
  it("should render table headers", () => {
    render(<BookingsTable {...defaultProps} bookings={[]} />);
    
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
  });
});
```

### 2. Form Component Tests

For form components, mock the custom hook:

```typescript
vi.mock("@/lib/hooks/services/useCreateService", () => ({
  useCreateService: vi.fn(() => ({
    name: "",
    setName: vi.fn(),
    saving: false,
    error: null,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  })),
}));
```

Then test interactions:

```typescript
it("should call setName when input changes", () => {
  const setName = vi.fn();
  vi.mocked(useCreateService).mockReturnValue({
    ...defaultMockValues,
    setName,
  });

  render(<CreateServiceForm {...defaultProps} />);
  
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: "Haircut" },
  });
  
  expect(setName).toHaveBeenCalledWith("Haircut");
});
```

### 3. Conditional Rendering Tests

Test components show/hide elements based on state:

```typescript
it("should NOT show cancel button for completed bookings", () => {
  const booking = mockBooking({ status: "completed" });
  render(<BookingsTable {...defaultProps} bookings={[booking]} />);

  expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
});
```

### 4. Loading States

Test loading indicators:

```typescript
it("should disable submit button when saving", () => {
  vi.mocked(useCreateService).mockReturnValue({
    ...defaultMockValues,
    saving: true,
  });

  render(<CreateServiceForm {...defaultProps} />);
  
  expect(screen.getByRole("button")).toBeDisabled();
});
```

### 5. Error States

Test error message display:

```typescript
it("should display error message", () => {
  vi.mocked(useCreateService).mockReturnValue({
    ...defaultMockValues,
    error: "Failed to create service",
  });

  render(<CreateServiceForm {...defaultProps} />);
  
  expect(screen.getByText("Failed to create service")).toBeInTheDocument();
});
```

### 6. Accessibility

Test accessibility attributes:

```typescript
it("should have aria-live on error message", () => {
  vi.mocked(useCreateEmployee).mockReturnValue({
    ...defaultMockValues,
    error: "Error message",
  });

  render(<CreateEmployeeForm {...defaultProps} />);
  
  const errorElement = screen.getByText("Error message");
  expect(errorElement).toHaveAttribute("aria-live", "polite");
});
```

## Query Priority

Follow Testing Library's recommended query priority:

1. **Accessible queries** (prefer these):
   - `getByRole` - Best for accessibility
   - `getByLabelText` - For form elements
   - `getByText` - For static text

2. **Semantic queries**:
   - `getByAltText` - For images
   - `getByTitle` - For tooltips

3. **Test IDs** (last resort):
   - `getByTestId` - Only when other queries won't work

### Examples

```typescript
// Good - uses role
screen.getByRole("button", { name: "Submit" });

// Good - uses label
screen.getByLabelText(/email/i);

// OK - uses text when element has unique text
screen.getByText("Confirmed");

// Avoid - uses test ID
screen.getByTestId("submit-button");
```

## Handling Duplicate Text

When the same text appears multiple times, be more specific:

```typescript
// Bad - "New Service" appears in title and button
screen.getByText("New Service"); // Throws error

// Good - target specific element by role
screen.getByRole("heading", { name: "New Service" });
screen.getByRole("button", { name: "New Service" });
```

## Running Tests

```bash
# Run all component tests
npm run test tests/components

# Run specific test file
npm run test tests/components/BookingsTable.test.tsx

# Run with verbose output
npm run test tests/components -- --reporter=verbose

# Run in watch mode
npm run test tests/components -- --watch
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use realistic mock data** - Factory functions help with this
3. **Keep tests focused** - One concept per test
4. **Clean up between tests** - Use `beforeEach` with `vi.clearAllMocks()`
5. **Test edge cases** - Empty states, error states, loading states
6. **Test accessibility** - Verify ARIA attributes and keyboard navigation
7. **Mock hooks, not internals** - Mock the custom hook, not internal state

## Troubleshooting

### Tests show "0 test"

Make sure `vitest.config.ts` has the esbuild JSX configuration:

```typescript
esbuild: {
  jsx: "automatic",
  jsxImportSource: "react",
},
```

### "Maximum call stack size exceeded" error

This is a known tinypool issue that doesn't affect test results. Tests still pass despite this error showing at the end.

### Can't find element

Use `screen.debug()` to see current DOM state:

```typescript
it("debugging test", () => {
  render(<MyComponent />);
  screen.debug(); // Prints DOM to console
});
```
