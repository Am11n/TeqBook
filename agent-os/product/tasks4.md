# Task Breakdown: Phase 4 (Security Hardening - Critical Fixes)

**Source:** Security audit review (2026-01-23)  
**Goal:** Fix critical security vulnerabilities before production  
**Total Tasks:** 3 task groups covering critical security issues

---

## Overview

This task breakdown addresses critical security vulnerabilities identified during code review. All tasks are focused on hardening the application for production deployment with zero additional recurring costs.

**Priority Order:**
1. CRITICAL: SSR authentication (flash of unauth content, middleware doesn't protect routes)
2. CRITICAL: API endpoint accepts full objects instead of IDs (data manipulation risk)
3. CRITICAL: Reminders scheduled but never sent (no cron job configured)

**Execution Order:** Tasks should be implemented in priority order. All tasks block production deployment.

---

## Progress Summary

| Category | Tasks | Status | Tests |
|----------|-------|--------|-------|
| SSR Authentication (45) | 1 | ✅ Complete | 10/10 |
| API Security (46) | 1 | ✅ Complete | 6/6 |
| Reminders Cron (47) | 1 | ✅ Complete | 4/4 |

**Total Tasks:** 3 (3 complete, 0 pending)

---

## Acceptance Criteria Summary

- [x] All routes protected by middleware (no flash of unauth content)
- [x] API endpoints only accept IDs, not full objects
- [x] Reminders sent automatically via cron every 5 minutes
- [x] All security tests passing

---

## Task List

### Authentication & Route Protection

#### Task Group 45: Implement Supabase SSR with Cookie-based Sessions
**Dependencies:** None  
**Priority:** CRITICAL  
**Risk:** Users can see "flash of unauth content", middleware doesn't protect routes, client-side auth can be bypassed

- [x] 45.0 Complete Supabase SSR migration
  - [x] 45.1 Install @supabase/ssr package
    - Run `npm install @supabase/ssr`
    - Update package.json dependencies
  - [x] 45.2 Create server-side Supabase client
    - Location: `web/src/lib/supabase/server.ts`
    - Use `createServerClient` from `@supabase/ssr`
    - Handle cookies via Next.js Request/Response
    - Export `createClient()` function for server components and API routes
  - [x] 45.3 Create client-side Supabase client
    - Location: `web/src/lib/supabase/client.ts`
    - Use `createBrowserClient` from `@supabase/ssr`
    - Export `createClient()` function for client components
  - [x] 45.4 Update supabase-client.ts
    - Location: `web/src/lib/supabase-client.ts`
    - Keep as fallback or deprecate
    - Update exports to use new SSR clients
  - [x] 45.5 Update API routes to use server client
    - Update all routes in `web/src/app/api/**/route.ts`
    - Replace `supabase` import with `createClient` from `@/lib/supabase/server`
    - Pass `request` and `response` to createClient
  - [x] 45.6 Update api-auth.ts to use SSR
    - Location: `web/src/lib/api-auth.ts`
    - Update `authenticateUser()` to use server client
    - Ensure cookie-based auth works correctly
  - [x] 45.7 Add route protection to middleware
    - Location: `web/src/middleware.ts`
    - Add route protection for `/dashboard/**`, `/admin/**`, `/settings/**`
    - Use SSR client to check authentication
    - Redirect to `/login` if not authenticated
    - Keep existing CSP logic for `/book/*`
  - [x] 45.8 Update middleware config matcher
    - Add routes: `/dashboard/:path*`, `/admin/:path*`, `/settings/:path*`
    - Keep existing `/book/:path*` matcher
  - [x] 45.9 Write 8-10 focused tests for SSR auth
    - Test middleware redirects unauthenticated users
    - Test middleware allows authenticated users
    - Test API routes work with SSR client
    - Test cookie-based session persistence
    - Test server components can access user
  - [x] 45.10 Remove client-side redirect from dashboard-shell
    - Location: `web/src/components/layout/dashboard-shell.tsx`
    - Remove `useEffect` redirect logic (lines 64-79)
    - Rely on middleware for protection
    - Keep loading states and error handling
  - [x] 45.11 Ensure SSR auth tests pass
    - Run ONLY the 8-10 tests written in 45.9
    - Verify middleware protection works
    - Verify no flash of unauth content

**Acceptance Criteria:**
- [x] Middleware protects all dashboard/admin/settings routes
- [x] No flash of unauth content (server-side redirect)
- [x] API routes use SSR client correctly
- [x] Cookie-based sessions work across page navigation
- [x] All SSR auth tests pass

**Files to Create:**
- `web/src/lib/supabase/server.ts`
- `web/src/lib/supabase/client.ts`
- `web/tests/unit/security/ssr-auth.test.ts`

**Files to Modify:**
- `web/src/middleware.ts`
- `web/src/lib/supabase-client.ts`
- `web/src/lib/api-auth.ts`
- `web/src/components/layout/dashboard-shell.tsx`
- All API routes in `web/src/app/api/**/route.ts`
- `web/package.json` (add @supabase/ssr dependency)

---

### API Security

#### Task Group 46: Fix send-notifications API to Accept Only IDs
**Dependencies:** Task Group 45 (for SSR client usage)  
**Priority:** CRITICAL  
**Risk:** Client can manipulate booking data before sending, email spoofing possible

- [x] 46.0 Complete API security hardening
  - [x] 46.1 Write 4-6 focused tests for API security
    - Test endpoint rejects requests without bookingId
    - Test endpoint fetches booking from database
    - Test endpoint verifies booking belongs to user's salon
    - Test endpoint rejects if booking doesn't exist
    - Test endpoint rejects if customer email doesn't match
  - [x] 46.2 Create getBookingById repository function
    - Location: `web/src/lib/repositories/bookings.ts`
    - Add `getBookingById(bookingId: string, salonId: string)` function
    - Include related data (customer, employee, service, salon)
    - Verify booking.salon_id matches salonId
    - Return null if booking not found or wrong salon
  - [x] 46.3 Update send-notifications route
    - Location: `web/src/app/api/bookings/send-notifications/route.ts`
    - Change request body to: `{ bookingId: string, customerEmail: string, salonId: string, language?: string }`
    - Remove `booking` object from request body
    - Fetch booking using `getBookingById(bookingId, salonId)`
    - Verify booking exists and belongs to salon
    - Verify customer email matches booking's customer email
    - Verify booking status is "confirmed" or "pending"
    - Use fetched booking data for email sending
  - [x] 46.4 Update send-cancellation route (if needed)
    - Location: `web/src/app/api/bookings/send-cancellation/route.ts`
    - Review if it also accepts full objects
    - Apply same pattern if needed
  - [x] 46.5 Update frontend calls to send-notifications
    - Find all places that call `/api/bookings/send-notifications`
    - Update to send only `bookingId` instead of full booking object
    - Verify frontend still works correctly
  - [x] 46.6 Ensure API security tests pass
    - Run ONLY the 4-6 tests written in 46.1
    - Verify endpoint only accepts IDs
    - Verify data is fetched from database

**Acceptance Criteria:**
- [x] Endpoint only accepts bookingId, not full booking object
- [x] Booking is fetched from database server-side
- [x] Booking ownership verified (salon_id match)
- [x] Customer email verified (matches booking's customer)
- [x] All API security tests pass

**Files to Modify:**
- `web/src/app/api/bookings/send-notifications/route.ts`
- `web/src/lib/repositories/bookings.ts`
- Frontend components calling send-notifications API

**Files to Create:**
- `web/tests/unit/security/api-endpoint-security.test.ts`

---

### Reminders System

#### Task Group 47: Implement Reminders Cron Job
**Dependencies:** None  
**Priority:** CRITICAL  
**Risk:** Reminders are scheduled but never sent, customers don't receive booking reminders

- [x] 47.0 Complete reminders cron job setup
  - [x] 47.1 Verify Edge Function exists and works
    - Location: `web/supabase/functions/process-reminders/index.ts`
    - Test Edge Function manually via curl
    - Verify it processes reminders correctly
    - Verify it sends emails via email service
  - [x] 47.2 Create cron job migration
    - Location: `web/supabase/migrations/20260124000001_setup_reminders_cron.sql`
    - Use `cron.schedule()` to call Edge Function every 5 minutes
    - Use `net.http_post()` to call Edge Function
    - Pass service role key for authentication
    - Handle errors gracefully
  - [x] 47.3 Add cron job configuration
    - Schedule: `*/5 * * * *` (every 5 minutes)
    - Function URL: `${SUPABASE_URL}/functions/v1/process-reminders`
    - Body: `{"limit": 100}`
    - Headers: Authorization with service role key
  - [x] 47.4 Add monitoring/logging
    - Log cron job execution in Edge Function
    - Track processed count, errors count
    - Add error alerting if cron fails repeatedly
  - [x] 47.5 Write 2-4 focused tests for cron setup
    - Test cron job is scheduled
    - Test cron job calls Edge Function
    - Test reminders are processed (integration test)
  - [x] 47.6 Document cron job setup
    - Add to `web/docs/backend/reminders.md` or similar
    - Document how to verify cron is running
    - Document how to manually trigger if needed
  - [x] 47.7 Ensure reminders cron tests pass
    - Run ONLY the 2-4 tests written in 47.5
    - Verify cron job is configured
    - Verify reminders are sent automatically

**Acceptance Criteria:**
- [x] Cron job scheduled to run every 5 minutes
- [x] Edge Function is called automatically
- [x] Reminders are processed and emails sent
- [x] Monitoring/logging in place
- [x] All cron tests pass

**Files to Create:**
- `web/supabase/migrations/20260124000001_setup_reminders_cron.sql`
- `web/tests/integration/reminders-cron.test.ts`
- `web/docs/backend/reminders.md` (or update existing)

**Files to Verify:**
- `web/supabase/functions/process-reminders/index.ts` (should already exist)

---

## Implementation Notes

### Task 45 (SSR Auth) - Critical Path
- This is the most complex task and blocks proper route protection
- Requires careful migration of all Supabase client usage
- Test thoroughly in development before deploying
- Consider keeping old client as fallback during migration

### Task 46 (API Security) - Quick Win
- Relatively straightforward change
- Main risk is breaking frontend if not all call sites updated
- Search codebase for all calls to send-notifications endpoint

### Task 47 (Reminders Cron) - Infrastructure
- Requires Supabase cron extension enabled
- May need to verify pg_cron extension is available
- Test cron execution in staging before production

---

## Testing Strategy

- **SSR Auth:** Test middleware protection, cookie persistence, API route auth
- **API Security:** Test endpoint rejects invalid data, fetches from DB, verifies ownership
- **Reminders Cron:** Test cron scheduling, Edge Function execution, email sending

---

## Success Criteria

- ✅ All routes protected by middleware (no flash of unauth content)
- ✅ API endpoints only accept IDs, not full objects
- ✅ Reminders sent automatically via cron every 5 minutes
- ✅ All security tests passing
- ✅ No client-side auth bypass possible

## ✅ Phase 4 Complete

All critical security vulnerabilities have been addressed:
- ✅ SSR authentication with cookie-based sessions implemented
- ✅ API endpoints hardened to accept only IDs
- ✅ Reminders cron job configured and documented

**Status:** Ready for production deployment
