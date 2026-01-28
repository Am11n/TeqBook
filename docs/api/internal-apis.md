# Internal APIs

Task Group 26: API Documentation

This document describes the internal TypeScript APIs used within TeqBook.

## Architecture Overview

TeqBook follows a layered architecture:

```
┌─────────────────────────────────────────────────────┐
│                    Components                        │
│              (React UI Components)                   │
├─────────────────────────────────────────────────────┤
│                     Hooks                            │
│              (useBookings, useAuth, etc.)           │
├─────────────────────────────────────────────────────┤
│                   Services                           │
│         (Business Logic & Orchestration)            │
├─────────────────────────────────────────────────────┤
│                 Repositories                         │
│           (Data Access - Supabase)                  │
├─────────────────────────────────────────────────────┤
│                   Supabase                           │
│          (Database, Auth, Storage)                  │
└─────────────────────────────────────────────────────┘
```

## Repositories

Repositories handle direct database access via Supabase.

### Location
`web/src/lib/repositories/`

### Pattern

```typescript
// repositories/bookings.ts
import { supabase } from "@/lib/supabase-client";

export async function getBookingsForSalon(
  salonId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Booking[] | null; error: string | null }> {
  const query = supabase
    .from("bookings")
    .select("id, start_time, end_time, status, ...")
    .eq("salon_id", salonId)
    .order("start_time", { ascending: false });

  if (options?.limit) {
    query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
  }

  const { data, error } = await query;
  return { data, error: error?.message || null };
}
```

### Available Repositories

| Repository | Description | Key Functions |
|------------|-------------|---------------|
| `bookings.ts` | Booking CRUD | `getBookingsForSalon`, `createBooking`, `updateBookingStatus` |
| `customers.ts` | Customer management | `getCustomersForSalon`, `createCustomer`, `searchCustomers` |
| `employees.ts` | Employee management | `getEmployeesForCurrentSalon`, `createEmployee` |
| `services.ts` | Service catalog | `getServicesForSalon`, `createService` |
| `shifts.ts` | Employee shifts | `getShiftsForEmployee`, `createShift` |
| `salons.ts` | Salon settings | `getSalonById`, `updateSalon` |
| `profiles.ts` | User profiles | `getProfileForUser`, `updateProfile` |
| `notifications.ts` | In-app notifications | `getNotifications`, `markAsRead` |
| `products.ts` | Inventory | `getProductsForSalon`, `updateStock` |

### Best Practices

1. **Explicit column selection** - Never use `SELECT *`
2. **Return pattern** - Always return `{ data, error }` tuple
3. **Pagination** - Use `.range()` for paginated queries
4. **Error handling** - Map Supabase errors to user-friendly messages

## Services

Services contain business logic and orchestrate repository calls.

### Location
`web/src/lib/services/`

### Pattern

```typescript
// services/bookings-service.ts
import * as bookingsRepo from "@/lib/repositories/bookings";
import * as customersRepo from "@/lib/repositories/customers";
import { hasPermission } from "@/lib/services/permissions-service";

export async function createBookingWithCustomer(
  salonId: string,
  bookingData: CreateBookingInput,
  customerData: CustomerInput
): Promise<{ data: Booking | null; error: string | null }> {
  // 1. Check permissions
  // 2. Validate input
  // 3. Find or create customer
  // 4. Create booking
  // 5. Send notifications
  // 6. Return result
}
```

### Available Services

| Service | Description | Key Functions |
|---------|-------------|---------------|
| `cache-service.ts` | In-memory caching | `cacheGet`, `cacheSet`, `cacheGetOrSet` |
| `feature-flags-service.ts` | Feature access | `hasFeature`, `getFeaturesForSalon` |
| `permissions-service.ts` | Role permissions | `hasPermission`, `canView`, `canEdit` |
| `plan-limits-service.ts` | Plan limits | `canAddEmployee`, `getEffectiveLimit` |
| `performance-service.ts` | Performance tracking | `trackOperation`, `getPerformanceStats` |
| `notification-service.ts` | Unified notifications | `sendNotification`, `createReminder` |
| `in-app-notification-service.ts` | In-app notifications | `createInAppNotification`, `markAsRead` |
| `customer-history-service.ts` | Customer history | `getCustomerHistory`, `exportToCSV` |

### Best Practices

1. **Single responsibility** - One service per domain
2. **Dependency injection** - Accept repositories as parameters for testing
3. **Permission checks** - Verify permissions before operations
4. **Error aggregation** - Collect and return all errors

## Hooks

React hooks for accessing services in components.

### Location
`web/src/lib/hooks/`

### Pattern

```typescript
// hooks/useBookings.ts
import { useState, useEffect } from "react";
import * as bookingsService from "@/lib/services/bookings-service";

export function useBookings(salonId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await bookingsService.getBookings(salonId);
      setBookings(data || []);
      setError(error);
      setLoading(false);
    }
    fetch();
  }, [salonId]);

  return { bookings, loading, error, refetch };
}
```

### Available Hooks

| Hook | Description |
|------|-------------|
| `useAuth` | Authentication state |
| `useBookings` | Booking operations |
| `useCustomers` | Customer operations |
| `useEmployees` | Employee operations |
| `useServices` | Service catalog |
| `useShifts` | Shift management |
| `usePermissions` | Permission checks |
| `useNotifications` | Notification state |

## Type Definitions

### Location
- `web/src/lib/types.ts` - Core domain types
- `web/src/lib/types/domain.ts` - Extended domain types

### Key Types

```typescript
// Core types
type PlanType = "starter" | "pro" | "business";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
type UserRole = "owner" | "manager" | "staff" | "superadmin";

// Domain entities
interface Booking {
  id: string;
  salon_id: string;
  customer_id: string;
  employee_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  // ...
}

interface Customer {
  id: string;
  salon_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  // ...
}
```

## Utilities

### Location
`web/src/lib/utils/`

### Key Utilities

| Utility | Description |
|---------|-------------|
| `access-control.ts` | Role-based access helpers |
| `booking-utils.ts` | Booking formatting and validation |
| `date-utils.ts` | Date formatting and manipulation |
| `validation.ts` | Input validation helpers |

## Supabase Client

### Location
`web/src/lib/supabase-client.ts`

### Usage

```typescript
import { supabase } from "@/lib/supabase-client";

// Query
const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("salon_id", salonId);

// Auth
const { data: { user } } = await supabase.auth.getUser();

// RPC
const { data, error } = await supabase.rpc("function_name", { param: value });
```

## Error Handling

All internal APIs follow a consistent error handling pattern:

```typescript
type Result<T> = {
  data: T | null;
  error: string | null;
};

// Usage
const { data, error } = await someFunction();
if (error) {
  // Handle error
  return;
}
// Use data
```

## Testing

### Unit Tests
Located in `tests/unit/services/` and `tests/unit/repositories/`

```typescript
import { describe, it, expect, vi } from "vitest";
import { getBookings } from "@/lib/services/bookings-service";

describe("bookings-service", () => {
  it("should return bookings for salon", async () => {
    // ...
  });
});
```

### Integration Tests
Located in `tests/integration/`

These tests use actual Supabase connection for end-to-end verification.
