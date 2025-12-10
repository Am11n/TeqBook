# TeqBook – Testing Guide

Dette dokumentet beskriver teststrukturen i TeqBook.

---

## Teststruktur

```
tests/
├── unit/              # Unit tests
│   ├── repositories/  # Repository tests (mock Supabase)
│   └── services/      # Service tests (mock repositories)
├── e2e/              # End-to-end tests (Playwright)
└── setup.ts          # Test setup file
```

---

## Unit Tests

### Repository Tests

Test repositories med mocked Supabase-klient:

```typescript
import { describe, it, expect, vi } from "vitest";
import { getBookingsForCurrentSalon } from "@/lib/repositories/bookings";
import { supabase } from "@/lib/supabase-client";

vi.mock("@/lib/supabase-client");

describe("Bookings Repository", () => {
  it("should return bookings", async () => {
    // Mock Supabase response
    // Test repository function
  });
});
```

### Service Tests

Test services med mocked repositories:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createBooking } from "@/lib/services/bookings-service";
import * as bookingsRepo from "@/lib/repositories/bookings";

vi.mock("@/lib/repositories/bookings");

describe("Bookings Service", () => {
  it("should validate input", async () => {
    // Test validation logic
  });
});
```

---

## E2E Tests

E2E-tester bruker Playwright for å teste hele brukerflyten:

```typescript
import { test, expect } from "@playwright/test";

test("should complete booking flow", async ({ page }) => {
  await page.goto("/book/example-salon");
  // Test user interactions
});
```

---

## Kjøre tester

### Unit tests

```bash
# Kjør alle unit tests
npm run test

# Kjør med UI
npm run test:ui

# Kjør med coverage
npm run test:coverage
```

### E2E tests

```bash
# Kjør alle E2E tests
npm run test:e2e

# Kjør med UI
npm run test:e2e:ui
```

---

## Best Practices

1. **Mock dependencies** - Mock Supabase i repository-tester, mock repositories i service-tester
2. **Test edge cases** - Test error-håndtering, validering, boundary conditions
3. **Keep tests simple** - En test skal teste én ting
4. **Use descriptive names** - Test-navn skal beskrive hva som testes

---

## Relaterte dokumenter

- `docs/coding-style.md` - Kodestandarder
- `docs/architecture/service-standards.md` - Service-standarder
- `docs/architecture/repository-standards.md` - Repository-standarder

