# TeqBook Mobile API Specification

## Overview

This document specifies the API requirements for TeqBook's mobile (PWA) application. The mobile app uses the same Supabase backend as the web application.

---

## Authentication

### Auth Flow

The mobile app uses Supabase Auth with the same flow as web:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Session is automatically persisted in localStorage
// Token refresh is handled automatically by Supabase client
```

### Session Management

| Aspect | Configuration |
|--------|---------------|
| Token Storage | `localStorage` (encrypted) |
| Session Duration | 30 days |
| Refresh Token | Automatic |
| Biometric Lock | Optional (Phase 2) |

### Logout

```typescript
// Clear all local data on logout
await supabase.auth.signOut();
await clearIndexedDB();
localStorage.clear();
```

---

## Core Endpoints

### Bookings

#### Get Today's Bookings
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select(`
    id,
    start_time,
    end_time,
    status,
    customer:customers(id, full_name, phone),
    employee:employees(id, full_name),
    service:services(id, name, duration_minutes, price_cents)
  `)
  .eq('salon_id', salonId)
  .gte('start_time', todayStart)
  .lt('start_time', todayEnd)
  .order('start_time', { ascending: true });
```

#### Get Upcoming Bookings (Paginated)
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select(`
    id,
    start_time,
    end_time,
    status,
    customer:customers(id, full_name),
    employee:employees(id, full_name),
    service:services(id, name)
  `)
  .eq('salon_id', salonId)
  .gte('start_time', new Date().toISOString())
  .eq('status', 'confirmed')
  .order('start_time', { ascending: true })
  .range(offset, offset + limit - 1);
```

#### Update Booking Status
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'completed' })
  .eq('id', bookingId)
  .select();
```

#### Create Booking (Simplified Mobile Flow)
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    salon_id: salonId,
    customer_id: customerId,
    employee_id: employeeId,
    service_id: serviceId,
    start_time: startTime,
    end_time: endTime,
    status: 'confirmed'
  })
  .select();
```

---

### Customers

#### Search Customers
```typescript
const { data, error } = await supabase
  .from('customers')
  .select('id, full_name, phone, email')
  .eq('salon_id', salonId)
  .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
  .order('full_name', { ascending: true })
  .limit(20);
```

#### Get Customer Details
```typescript
const { data, error } = await supabase
  .from('customers')
  .select(`
    id,
    full_name,
    phone,
    email,
    notes,
    created_at,
    bookings:bookings(
      id,
      start_time,
      status,
      service:services(name)
    )
  `)
  .eq('id', customerId)
  .single();
```

---

### Schedule

#### Get Employee Schedule
```typescript
const { data, error } = await supabase
  .from('shifts')
  .select('*')
  .eq('employee_id', employeeId)
  .order('weekday', { ascending: true });
```

#### Get Available Slots
```typescript
// Use existing availability service
import { getAvailableSlots } from '@/lib/services/availability-service';

const slots = await getAvailableSlots({
  salonId,
  serviceId,
  employeeId,
  date: selectedDate
});
```

---

### Real-time Updates

#### Subscribe to Booking Changes
```typescript
const subscription = supabase
  .channel('mobile-bookings')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `salon_id=eq.${salonId}`
    },
    (payload) => {
      // Update local state
      handleBookingChange(payload);
    }
  )
  .subscribe();
```

---

## Push Notification Endpoints

### Subscribe to Push Notifications
```
POST /api/push/subscribe
```

**Request:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcR...",
      "auth": "tBHI..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "uuid"
}
```

### Unsubscribe from Push
```
DELETE /api/push/unsubscribe
```

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### Update Notification Preferences
```
PUT /api/push/preferences
```

**Request:**
```json
{
  "new_booking": true,
  "booking_reminder": true,
  "booking_cancelled": true,
  "daily_summary": false,
  "reminder_hours_before": 24
}
```

---

## Offline Sync Endpoints

### Sync Pending Actions
```
POST /api/sync
```

**Request:**
```json
{
  "actions": [
    {
      "id": "local-uuid-1",
      "type": "update",
      "entity": "bookings",
      "entityId": "booking-uuid",
      "payload": { "status": "completed" },
      "timestamp": "2026-01-22T10:30:00Z"
    }
  ],
  "lastSyncTimestamp": "2026-01-22T09:00:00Z"
}
```

**Response:**
```json
{
  "processed": [
    { "localId": "local-uuid-1", "serverId": "booking-uuid", "status": "success" }
  ],
  "conflicts": [],
  "serverChanges": [
    {
      "entity": "bookings",
      "id": "other-booking-uuid",
      "action": "update",
      "data": { "status": "cancelled" },
      "timestamp": "2026-01-22T10:00:00Z"
    }
  ],
  "syncTimestamp": "2026-01-22T10:30:00Z"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking time",
    "details": {
      "field": "start_time",
      "reason": "Time slot is not available"
    }
  }
}
```

### Error Codes
| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | User not authenticated |
| `AUTH_EXPIRED` | Session expired |
| `VALIDATION_ERROR` | Invalid input |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Data conflict (offline sync) |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

### Offline Error Handling
```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (!navigator.onLine) {
    // Queue for later sync
    await queueOfflineAction(action);
    showToast('Saved offline, will sync when connected');
  } else {
    showError(error.message);
  }
}
```

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| Auth endpoints | 10 req/min |
| Read endpoints | 100 req/min |
| Write endpoints | 30 req/min |
| Push subscribe | 5 req/min |
| Sync endpoint | 10 req/min |

---

## Caching Strategy

### Response Headers
```
Cache-Control: private, max-age=60
ETag: "abc123"
```

### Recommended Client Caching
| Data Type | Cache Duration | Strategy |
|-----------|----------------|----------|
| User profile | 5 minutes | Stale-while-revalidate |
| Salon info | 1 hour | Cache first |
| Services list | 1 hour | Cache first |
| Employees list | 30 minutes | Cache first |
| Bookings | 1 minute | Network first |
| Customers | 5 minutes | Stale-while-revalidate |

---

## Data Payload Optimization

### Minimal Booking Response (for lists)
```typescript
interface BookingListItem {
  id: string;
  start_time: string;
  status: string;
  customer_name: string;
  service_name: string;
}
```

### Full Booking Response (for details)
```typescript
interface BookingDetail {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  customer: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  employee: {
    id: string;
    full_name: string;
  };
  service: {
    id: string;
    name: string;
    duration_minutes: number;
    price_cents: number;
  };
  created_at: string;
  updated_at: string;
}
```

---

## Testing

### Test Endpoints
Development environment provides test endpoints:

```
GET /api/test/push - Send test push notification
GET /api/test/offline - Simulate offline response
POST /api/test/conflict - Simulate sync conflict
```

### Mock Data
```typescript
// Enable mock mode for offline testing
if (process.env.NEXT_PUBLIC_MOCK_API === 'true') {
  enableMockResponses();
}
```
