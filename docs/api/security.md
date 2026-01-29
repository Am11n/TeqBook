# API Route Security Documentation

This document describes the security requirements and authentication patterns for all API routes in the TeqBook application.

## Overview

All API routes require authentication unless explicitly documented as public. Authentication is handled via the `authenticateUser()` helper function from `@/lib/api-auth`, which supports both cookie-based sessions and Authorization header tokens.

## Authentication Pattern

All authenticated routes follow this pattern:

```typescript
import { authenticateUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const authResult = await authenticateUser(request);
  
  if (authResult.error || !authResult.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const user = authResult.user;
  // ... rest of handler
}
```

## API Routes Inventory

### Booking Routes

#### `POST /api/bookings/send-notifications`
- **Authentication:** Required
- **Salon Access:** Required (must have access to requested salonId)
- **Rate Limit:** 10 requests per minute per user
- **Description:** Sends booking confirmation emails and schedules reminders
- **Status:** ✅ Secured (Task Group 38)

#### `POST /api/bookings/send-cancellation`
- **Authentication:** Required
- **Salon Access:** Required (must have access to requested salonId)
- **Booking Verification:** Verifies booking belongs to user's salon
- **Rate Limit:** 10 requests per minute per user
- **Description:** Sends cancellation notifications
- **Status:** ✅ Secured (Task Group 38)

### Notification Routes

#### `GET /api/notifications`
- **Authentication:** Required
- **Rate Limit:** None (read-only)
- **Description:** Get notifications for current user
- **Status:** ✅ Secured (Task Group 39)

#### `POST /api/notifications/[id]/read`
- **Authentication:** Required
- **Rate Limit:** None
- **Description:** Mark a single notification as read
- **Status:** ✅ Secured (Task Group 39)

#### `POST /api/notifications/mark-all-read`
- **Authentication:** Required
- **Rate Limit:** None
- **Description:** Mark all notifications as read for current user
- **Status:** ✅ Secured (Task Group 39)

#### `GET /api/notifications/unread-count`
- **Authentication:** Required
- **Rate Limit:** None (read-only)
- **Description:** Get unread notification count for current user
- **Status:** ✅ Secured (Task Group 39)

### Debug Routes

#### `GET /api/debug/notification-test`
- **Authentication:** Not required (but checks auth for testing)
- **Environment:** Development only (blocked in production)
- **Description:** Debug endpoint for testing notifications
- **Status:** ✅ Secured (Task Group 39) - Blocked in production

#### `GET /api/notifications/debug`
- **Authentication:** Not required (but checks auth for testing)
- **Environment:** Development only (blocked in production)
- **Description:** Debug endpoint for notification system diagnostics
- **Status:** ✅ Secured (Task Group 39) - Blocked in production

### Push Notification Routes

#### `POST /api/push/subscribe`
- **Authentication:** Required
- **Rate Limit:** None
- **Description:** Subscribe to push notifications
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

#### `DELETE /api/push/unsubscribe`
- **Authentication:** Required
- **Rate Limit:** None
- **Description:** Unsubscribe from push notifications
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

#### `GET /api/push/preferences`
- **Authentication:** Required
- **Rate Limit:** None (read-only)
- **Description:** Get push notification preferences
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

#### `PUT /api/push/preferences`
- **Authentication:** Required
- **Rate Limit:** None
- **Description:** Update push notification preferences
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

### Integration Routes

#### `GET /api/integrations/google/calendars`
- **Authentication:** Required
- **Salon Access:** Required (must have salon)
- **Description:** List Google calendars for connected account
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

#### `GET /api/integrations/google/callback`
- **Authentication:** Required (OAuth callback)
- **Description:** Handle Google OAuth callback
- **Status:** ✅ Has authentication

#### `POST /api/integrations/google/disconnect`
- **Authentication:** Required
- **Description:** Disconnect Google calendar integration
- **Status:** ✅ Has authentication

#### `GET /api/integrations/outlook/calendars`
- **Authentication:** Required
- **Salon Access:** Required (must have salon)
- **Description:** List Outlook calendars for connected account
- **Status:** ✅ Has authentication (uses `supabase.auth.getUser()`)

#### `GET /api/integrations/outlook/callback`
- **Authentication:** Required (OAuth callback)
- **Description:** Handle Outlook OAuth callback
- **Status:** ✅ Has authentication

#### `POST /api/integrations/outlook/disconnect`
- **Authentication:** Required
- **Description:** Disconnect Outlook calendar integration
- **Status:** ✅ Has authentication

## Rate Limiting

Rate limiting is implemented for endpoints that could be abused:

- **Booking notifications:** 10 requests per minute per user
- **Booking cancellations:** 10 requests per minute per user

Rate limits are enforced using the `rate-limit-service.ts` which uses an Edge Function for server-side rate limiting.

### Rate Limit Headers

When rate limit is exceeded, the response includes:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `Retry-After`: Seconds until rate limit resets
- Status: `429 Too Many Requests`

## Salon Access Verification

For routes that require salon access, use `authenticateAndVerifySalon()`:

```typescript
import { authenticateAndVerifySalon } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { salonId } = body;
  
  const authResult = await authenticateAndVerifySalon(request, salonId);
  
  if (authResult.error || !authResult.user || !authResult.hasAccess) {
    const statusCode = !authResult.user ? 401 : 403;
    return NextResponse.json(
      { error: authResult.error || "Unauthorized" },
      { status: statusCode }
    );
  }
  
  // ... rest of handler
}
```

## Debug Routes in Production

All debug routes are blocked in production using:

```typescript
if (process.env.NODE_ENV === "production") {
  return NextResponse.json(
    { error: "Debug endpoints are not available in production" },
    { status: 403 }
  );
}
```

## Security Best Practices

1. **Always authenticate:** Use `authenticateUser()` for all routes unless explicitly public
2. **Verify salon access:** Use `authenticateAndVerifySalon()` when salon context is required
3. **Rate limit sensitive operations:** Apply rate limiting to endpoints that send emails or perform expensive operations
4. **Block debug routes:** Always check `NODE_ENV` for debug endpoints
5. **Use structured logging:** Use `logError()` and `logInfo()` instead of `console.log()`
6. **Return appropriate status codes:**
   - `401 Unauthorized`: User not authenticated
   - `403 Forbidden`: User authenticated but lacks permission
   - `429 Too Many Requests`: Rate limit exceeded
   - `400 Bad Request`: Invalid input
   - `500 Internal Server Error`: Server error

## Migration Status

- ✅ Task Group 38: Booking notification routes secured
- ✅ Task Group 39: Notification routes secured and debug routes blocked
- ⏳ Other routes: Most have authentication but may need migration to `authenticateUser()` helper

## Future Improvements

1. Migrate all routes to use `authenticateUser()` helper for consistency
2. Add rate limiting to more sensitive endpoints
3. Implement request logging for security monitoring
4. Add API key authentication for service-to-service calls (if needed)
