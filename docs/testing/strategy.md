# Testing Strategy

This document outlines the testing strategy for TeqBook, including test types, coverage goals, and best practices.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Test Structure](#test-structure)
- [Coverage Goals](#coverage-goals)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)

---

## Testing Philosophy

### Principles

1. **Test the Business Logic, Not the Framework**
   - Focus on domain logic, state machines, and business rules
   - Don't test framework internals (Next.js, React, Supabase)

2. **Test Behavior, Not Implementation**
   - Test what the code does, not how it does it
   - Refactoring should not break tests if behavior is unchanged

3. **Fast Feedback Loop**
   - Unit tests should run in milliseconds
   - Integration tests should run in seconds
   - E2E tests should run in minutes

4. **Maintainable Tests**
   - Tests should be easy to read and understand
   - Tests should be easy to maintain as code changes
   - Use clear test names that describe what is being tested

---

## Test Types

### 1. Unit Tests

**Purpose:** Test individual functions, services, and utilities in isolation.

**Location:** `tests/unit/`

**What to Test:**
- Service layer business logic
- Repository data transformations
- Validation functions
- Utility functions
- State machine transitions
- Business rule enforcement

**Example:**
```typescript
// tests/unit/services/bookings-service.test.ts
describe("BookingsService", () => {
  describe("createBooking", () => {
    it("should reject bookings with start_time in the past (non-walk-in)", async () => {
      const input = {
        salon_id: "salon-1",
        employee_id: "emp-1",
        service_id: "svc-1",
        start_time: "2020-01-01T10:00:00Z", // Past date
        customer_full_name: "John Doe",
        is_walk_in: false,
      };
      
      const result = await createBooking(input);
      expect(result.error).toContain("must be in the future");
    });
  });
});
```

**Tools:**
- Vitest (test runner)
- Mock Supabase client
- Mock repositories when testing services

---

### 2. Integration Tests

**Purpose:** Test interactions between layers (repository + Supabase, service + repository).

**Location:** `tests/integration/` (to be created)

**What to Test:**
- Repository + Supabase interactions
- Service + Repository interactions
- Database queries and mutations
- RLS policy enforcement
- Edge Function logic

**Example:**
```typescript
// tests/integration/repositories/bookings.test.ts
describe("BookingsRepository Integration", () => {
  it("should create booking and enforce RLS", async () => {
    // Use test Supabase instance
    const { data, error } = await createBooking({
      salon_id: testSalonId,
      employee_id: testEmployeeId,
      // ...
    });
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

**Tools:**
- Vitest
- Test Supabase instance (local or test project)
- Test data fixtures

---

### 3. End-to-End (E2E) Tests

**Purpose:** Test complete user flows from UI to database.

**Location:** `tests/e2e/`

**What to Test:**
- Critical user journeys
- Public booking flow
- Authentication flows
- Dashboard interactions
- Settings changes

**Example:**
```typescript
// tests/e2e/public-booking.spec.ts
test("user can complete booking flow", async ({ page }) => {
  await page.goto("/book/test-salon");
  
  // Select service
  await page.click('[data-testid="service-1"]');
  
  // Select employee
  await page.click('[data-testid="employee-1"]');
  
  // Select date
  await page.click('[data-testid="date-tomorrow"]');
  
  // Select time slot
  await page.click('[data-testid="slot-10:00"]');
  
  // Fill customer info
  await page.fill('[name="customer_name"]', "John Doe");
  await page.fill('[name="customer_email"]', "john@example.com");
  
  // Submit booking
  await page.click('[data-testid="submit-booking"]');
  
  // Verify success
  await expect(page.locator("text=Booking confirmed")).toBeVisible();
});
```

**Tools:**
- Playwright (browser automation)
- Test Supabase instance
- Test data setup/teardown

---

### 4. Component Tests (Future)

**Purpose:** Test React components in isolation.

**Location:** `tests/component/` (to be created)

**What to Test:**
- Component rendering
- User interactions
- Props handling
- State management
- Error states

**Tools:**
- React Testing Library
- Vitest
- Mock providers (SalonProvider, LocaleProvider)

---

## Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   ├── bookings-service.test.ts
│   │   ├── customers-service.test.ts
│   │   └── employees-service.test.ts
│   ├── repositories/
│   │   └── bookings.test.ts
│   └── utils/
│       └── validation.test.ts
├── integration/
│   ├── repositories/
│   │   └── bookings.test.ts
│   └── services/
│       └── bookings-service.test.ts
├── e2e/
│   ├── landing.spec.ts
│   ├── onboarding.spec.ts
│   └── public-booking.spec.ts
└── setup.ts
```

---

## Coverage Goals

### Current Coverage

- **Unit Tests:** ~60% (services and repositories)
- **E2E Tests:** ~40% (critical flows)

### Target Coverage

- **Unit Tests:** 80%+ for services and repositories
- **Integration Tests:** 70%+ for repository + Supabase interactions
- **E2E Tests:** 100% of critical user journeys

### Critical Areas (Must Have Tests)

1. **Booking Service:**
   - ✅ Create booking validation
   - ✅ Status transition validation
   - ✅ Time slot availability
   - ⚠️ Overlap detection
   - ⚠️ Shift validation

2. **Employee Service:**
   - ✅ Create/update employee
   - ✅ Activation/deactivation
   - ⚠️ Shift overlap detection

3. **Customer Service:**
   - ✅ Create/update customer
   - ⚠️ Email/phone uniqueness
   - ⚠️ GDPR consent validation

4. **Feature Flags Service:**
   - ✅ Feature availability check
   - ✅ Feature limits
   - ⚠️ Plan-based feature access

5. **E2E Flows:**
   - ✅ Public booking flow
   - ✅ Onboarding flow
   - ⚠️ Dashboard interactions
   - ⚠️ Settings changes

---

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ❌ Bad
it("works", () => { ... });

// ✅ Good
it("should reject booking with past start_time for non-walk-in bookings", () => { ... });
```

### 2. Test Organization

Group related tests using `describe` blocks:

```typescript
describe("BookingsService", () => {
  describe("createBooking", () => {
    it("should validate required fields", () => { ... });
    it("should reject past start_time for non-walk-in", () => { ... });
    it("should allow past start_time for walk-in", () => { ... });
  });
  
  describe("updateBookingStatus", () => {
    it("should validate status transitions", () => { ... });
    it("should reject invalid transitions", () => { ... });
  });
});
```

### 3. Mocking

Mock external dependencies (Supabase, APIs):

```typescript
// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })),
  },
}));
```

### 4. Test Data

Use factories or fixtures for test data:

```typescript
// tests/fixtures/bookings.ts
export function createMockBooking(overrides = {}) {
  return {
    id: "booking-1",
    salon_id: "salon-1",
    employee_id: "emp-1",
    service_id: "svc-1",
    start_time: "2024-01-01T10:00:00Z",
    end_time: "2024-01-01T11:00:00Z",
    status: "pending",
    ...overrides,
  };
}
```

### 5. Cleanup

Clean up test data after each test:

```typescript
afterEach(async () => {
  // Clean up test data
  await cleanupTestData();
});
```

### 6. Async Testing

Always await async operations:

```typescript
// ❌ Bad
it("should create booking", () => {
  createBooking(input).then(result => {
    expect(result.data).toBeDefined();
  });
});

// ✅ Good
it("should create booking", async () => {
  const result = await createBooking(input);
  expect(result.data).toBeDefined();
});
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e tests/e2e/public-booking.spec.ts
```

### Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Future Improvements

1. **Component Tests:**
   - Add React Testing Library
   - Test component interactions
   - Test error boundaries

2. **Visual Regression Tests:**
   - Add Percy or Chromatic
   - Test UI consistency

3. **Performance Tests:**
   - Test API response times
   - Test database query performance

4. **Accessibility Tests:**
   - Add axe-core
   - Test WCAG compliance

---

## References

- [Domain Principles](../architecture/domain-principles.md)
- [Service Standards](../architecture/service-standards.md)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

