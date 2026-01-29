# TeqBook API Documentation

Task Group 26: API Documentation

Welcome to the TeqBook API documentation. This guide covers both external APIs (Edge Functions, API Routes) and internal TypeScript APIs.

## Quick Start

### Authentication

All API endpoints require authentication via Supabase JWT token:

```typescript
const response = await fetch("/api/notifications", {
  headers: {
    Authorization: `Bearer ${supabaseSession.access_token}`,
  },
});
```

### Base URLs

| Type | Base URL |
|------|----------|
| Edge Functions | `https://{project-ref}.supabase.co/functions/v1/` |
| API Routes | `/api/` |
| Supabase Direct | `https://{project-ref}.supabase.co/rest/v1/` |

## Documentation Structure

### [OpenAPI Specification](./openapi.yaml)
Machine-readable API specification in OpenAPI 3.1 format.
- All Edge Function endpoints
- All Next.js API routes
- Request/response schemas
- Authentication requirements

### [Internal APIs](./internal-apis.md)
TypeScript API documentation for internal use.
- Repository layer patterns
- Service layer functions
- React hooks
- Type definitions

### [Code Examples](./examples.md)
Practical code examples for common operations.
- Authentication examples
- Billing API examples
- Notification API examples
- Service usage examples

## API Categories

### Billing APIs (Edge Functions)

Stripe billing and subscription management.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/billing-create-customer` | POST | Create Stripe customer |
| `/billing-create-subscription` | POST | Create subscription |
| `/billing-update-plan` | POST | Change subscription plan |
| `/billing-cancel-subscription` | POST | Cancel subscription |
| `/billing-update-payment-method` | POST | Update payment method |
| `/billing-webhook` | POST | Stripe webhook handler |

### Notification APIs (API Routes)

In-app notification management.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Get user notifications |
| `/api/notifications/{id}/read` | POST | Mark as read |
| `/api/notifications/mark-all-read` | POST | Mark all as read |
| `/api/notifications/unread-count` | GET | Get unread count |

### Booking APIs (API Routes)

Booking notification endpoints.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings/send-notifications` | POST | Send booking notification |
| `/api/bookings/send-cancellation` | POST | Send cancellation notice |

## Rate Limiting

All endpoints are rate limited. Check response headers:

```
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2026-01-22T12:00:00Z
```

Rate limits by endpoint type:
- **Billing**: 10 requests/minute
- **Notifications**: 60 requests/minute
- **General**: 100 requests/minute

## Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error type",
  "details": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Internal Services

For internal TypeScript usage, see [Internal APIs](./internal-apis.md).

Key services:
- **cache-service** - In-memory caching
- **permissions-service** - Role-based permissions
- **feature-flags-service** - Feature access control
- **performance-service** - Performance monitoring

## Testing

API documentation tests are located in `tests/docs/api-docs.test.ts`.

Run tests:
```bash
npm run test tests/docs
```

## Support

For questions about the API:
1. Check the [examples](./examples.md) for common use cases
2. Review the [OpenAPI spec](./openapi.yaml) for detailed schemas
3. Contact support for additional help
