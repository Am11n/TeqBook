# Observability Strategy

## Overview

Each app in the monorepo should have clear observability to know where problems occur.

## Logging

### App Context

All loggers should include `app` context:
- `app: "public"` - Public app logs
- `app: "dashboard"` - Dashboard app logs
- `app: "admin"` - Admin app logs

### Edge Functions

Edge functions should include `fn` context:
- `fn: "process-reminders"` - Reminders edge function
- `fn: "get-public-booking-data"` - Public booking data edge function
- `fn: "send-booking-reminder"` - Send reminder edge function

### Example Usage

```typescript
// In apps/public
logInfo("Booking created", { app: "public", bookingId, salonId });

// In apps/dashboard
logInfo("Booking created", { app: "dashboard", bookingId, salonId });

// In edge functions
console.log(`[${fn}] Processing reminder`, { fn: "process-reminders", reminderId });
```

## Sentry Configuration

### Option 1: Separate Projects (Recommended)

Each app has its own Sentry project:
- Public App: `SENTRY_DSN_PUBLIC`
- Dashboard App: `SENTRY_DSN_DASHBOARD`
- Admin App: `SENTRY_DSN_ADMIN`

### Option 2: Tags (Simpler)

Single Sentry project with tags:
- Tag: `app:public`, `app:dashboard`, `app:admin`
- Tag: `env:production`, `env:staging`

### Configuration

Update `sentry.client.config.ts` and `sentry.edge.config.ts` to include app context:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tags: {
    app: process.env.NEXT_PUBLIC_APP_NAME || "unknown",
  },
});
```

## Structured Logging

All logs should follow this structure:

```typescript
{
  timestamp: "2026-01-26T10:00:00Z",
  level: "info" | "warn" | "error",
  message: "Booking created",
  correlationId: "uuid",
  app: "dashboard",
  context: {
    bookingId: "...",
    salonId: "...",
  }
}
```

## Edge Function Logging

Edge functions should log with `fn` context:

```typescript
console.log(`[${fn}] Starting execution`, { fn: "process-reminders", timestamp });
console.error(`[${fn}] Error:`, { fn: "process-reminders", error: error.message });
```

## Benefits

- Always know which app has the problem
- Filter logs by app in Sentry
- Track errors per app
- Monitor performance per app
