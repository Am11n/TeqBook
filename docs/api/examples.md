# API Examples

Task Group 26: API Documentation

This document provides code examples for using the TeqBook APIs.

## Authentication

### Getting a JWT Token

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// Get JWT token
const token = data.session?.access_token;
```

### Using the Token

```typescript
// Include in Authorization header
const response = await fetch("/api/notifications", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Billing API Examples

### Create Stripe Customer

```bash
# cURL
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/billing-create-customer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salon_id": "uuid-here",
    "email": "salon@example.com",
    "name": "My Salon"
  }'
```

```typescript
// TypeScript
async function createStripeCustomer(salonId: string, email: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/billing-create-customer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salon_id: salonId,
        email,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
```

### Create Subscription

```bash
# cURL
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/billing-create-subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salon_id": "uuid-here",
    "customer_id": "cus_xxx",
    "plan": "pro"
  }'
```

```typescript
// TypeScript
async function createSubscription(
  salonId: string,
  customerId: string,
  plan: "starter" | "pro" | "business"
) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/billing-create-subscription`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salon_id: salonId,
        customer_id: customerId,
        plan,
      }),
    }
  );

  const result = await response.json();
  
  // Use client_secret for Stripe payment confirmation
  if (result.client_secret) {
    // Initialize Stripe.js and confirm payment
  }
  
  return result;
}
```

### Cancel Subscription

```typescript
async function cancelSubscription(salonId: string, immediate = false) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/billing-cancel-subscription`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salon_id: salonId,
        immediate, // false = cancel at period end
      }),
    }
  );

  return response.json();
}
```

## Notification API Examples

### Get Notifications

```bash
# cURL
curl -X GET "/api/notifications?limit=10&unreadOnly=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```typescript
// TypeScript
async function getNotifications(options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.unreadOnly) params.set("unreadOnly", "true");

  const response = await fetch(`/api/notifications?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { notifications, unreadCount } = await response.json();
  return { notifications, unreadCount };
}
```

### Mark Notification as Read

```typescript
async function markNotificationAsRead(notificationId: string) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
}
```

### Mark All as Read

```typescript
async function markAllNotificationsAsRead() {
  const response = await fetch("/api/notifications/mark-all-read", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { count } = await response.json();
  console.log(`Marked ${count} notifications as read`);
}
```

## Internal Service Examples

### Using the Cache Service

```typescript
import {
  cacheGet,
  cacheSet,
  cacheGetOrSet,
  CacheKeys,
  CacheTTL,
} from "@/lib/services/cache-service";

// Simple get/set
cacheSet("myKey", { data: "value" }, CacheTTL.MEDIUM);
const cached = cacheGet<{ data: string }>("myKey");

// Get or set pattern (recommended)
const salonFeatures = await cacheGetOrSet(
  CacheKeys.salonFeatures(salonId),
  async () => {
    // Expensive operation - only called if not cached
    return await fetchFeaturesFromDB(salonId);
  },
  CacheTTL.MEDIUM // 5 minutes
);
```

### Using the Permissions Service

```typescript
import {
  hasPermissionSync,
  canView,
  canEdit,
  canDelete,
} from "@/lib/services/permissions-service";

// Check specific permission
const canEditBookings = hasPermissionSync(userRole, "bookings", "edit");

// Use helper functions
if (canDelete(userRole, "customers")) {
  // Show delete button
}

// In a service function
import { requirePermission } from "@/lib/services/permissions-service";

async function deleteCustomer(salonId: string, customerId: string, userRole: string) {
  // Throws error if not allowed
  await requirePermission(salonId, userRole, "customers", "delete");
  
  // Proceed with deletion
  return await customersRepo.deleteCustomer(customerId);
}
```

### Using the usePermissions Hook

```tsx
import { usePermissions } from "@/lib/hooks/usePermissions";

function BookingActions({ booking, userRole }) {
  const { can, canEdit, canDelete, isOwner } = usePermissions(userRole);

  return (
    <div>
      {canEdit("bookings") && (
        <Button onClick={() => editBooking(booking.id)}>Edit</Button>
      )}
      {canDelete("bookings") && (
        <Button onClick={() => cancelBooking(booking.id)}>Cancel</Button>
      )}
      {isOwner && (
        <Button onClick={() => viewAuditLog(booking.id)}>Audit Log</Button>
      )}
    </div>
  );
}
```

### Using Performance Tracking

```typescript
import {
  trackOperation,
  createTimer,
  getPerformanceStats,
} from "@/lib/services/performance-service";

// Track async operation
const result = await trackOperation(
  "fetchBookings",
  "database",
  async () => {
    return await bookingsRepo.getBookingsForSalon(salonId);
  },
  { salonId } // Optional metadata
);

// Manual timer
const timer = createTimer("complexOperation", "service");
// ... do work ...
const duration = timer.end({ itemCount: 100 });

// Get stats
const stats = getPerformanceStats();
console.log(`Hit ratio: ${stats.hitRatio}, Slow ops: ${stats.slowOperations}`);
```

### Using Feature Flags

```typescript
import { hasFeature, getFeaturesForSalon } from "@/lib/services/feature-flags-service";

// Check single feature
const { hasFeature: hasInventory } = await hasFeature(salonId, "INVENTORY");
if (hasInventory) {
  // Show inventory management
}

// Get all features
const { features } = await getFeaturesForSalon(salonId);
// features: ["BASIC_BOOKING", "EMAIL_REMINDERS", ...]
```

## Repository Examples

### Creating a Booking

```typescript
import * as bookingsRepo from "@/lib/repositories/bookings";

const { data: booking, error } = await bookingsRepo.createBooking({
  salon_id: salonId,
  customer_id: customerId,
  employee_id: employeeId,
  service_id: serviceId,
  start_time: startTime.toISOString(),
  end_time: endTime.toISOString(),
  status: "pending",
});

if (error) {
  console.error("Failed to create booking:", error);
  return;
}

console.log("Created booking:", booking.id);
```

### Paginated Query

```typescript
import * as customersRepo from "@/lib/repositories/customers";

async function loadCustomers(page: number, pageSize: number) {
  const { data, error, total } = await customersRepo.getCustomersForSalon(
    salonId,
    {
      page,
      pageSize,
      search: searchQuery,
    }
  );

  return {
    customers: data || [],
    totalPages: Math.ceil((total || 0) / pageSize),
    error,
  };
}
```

## Error Handling

### Standard Error Pattern

```typescript
// All functions return { data, error } tuple
const { data, error } = await someOperation();

if (error) {
  // Log for debugging
  console.error("Operation failed:", error);
  
  // Show user-friendly message
  toast.error("Something went wrong. Please try again.");
  
  return null;
}

// Use data safely
return data;
```

### API Response Handling

```typescript
async function callApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const { error, details } = await response.json();
    throw new Error(details || error || "Request failed");
  }

  return response.json();
}
```

## Rate Limiting

### Checking Rate Limit Headers

```typescript
async function callWithRateLimitCheck(url: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Check rate limit headers
  const remaining = response.headers.get("X-RateLimit-Remaining");
  const resetAt = response.headers.get("X-RateLimit-Reset");

  if (response.status === 429) {
    const resetDate = new Date(resetAt!);
    console.log(`Rate limited. Try again at ${resetDate.toLocaleString()}`);
    return null;
  }

  console.log(`${remaining} requests remaining`);
  return response.json();
}
```
