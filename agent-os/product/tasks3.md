# Task Breakdown: Phase 3 (Security Hardening)

**Source:** Security audit review  
**Goal:** Production-ready security hardening before launch  
**Total Tasks:** 7 task groups covering critical security vulnerabilities

---

## Overview

This task breakdown addresses security vulnerabilities identified during code review. All tasks are focused on hardening the application for production deployment with zero additional recurring costs.

**Priority Order:**
1. CRITICAL: Unauthenticated API routes (email spam risk)
2. CRITICAL: Booking conflict prevention (race condition)
3. HIGH: RLS UPDATE policies missing WITH CHECK
4. HIGH: Supabase client fail-hard in production
5. MEDIUM: CSP hardening
6. LOW: Repository hygiene

**Execution Order:** Tasks should be implemented in priority order. Critical tasks block production deployment.

---

## Progress Summary

| Category | Tasks | Status | Tests |
|----------|-------|--------|-------|
| API Security (38-39) | 2 | ⏳ Pending | 0/8-10 |
| Database Security (40-42) | 3 | ⏳ Pending | 0/12-15 |
| Infrastructure (43-44) | 2 | ⏳ Pending | 0/4-6 |

**Total Tasks:** 7 (0 complete, 7 pending)

---

## Acceptance Criteria Summary

- [ ] All API routes require authentication
- [ ] Booking conflicts prevented at database level
- [ ] RLS UPDATE policies have WITH CHECK clauses
- [ ] salon_id immutable on all tenant tables
- [ ] Supabase client fails hard in production
- [ ] CSP hardened for production
- [ ] No .bak files in repository
- [ ] All security tests passing

---

## Task List

### API Security Layer

#### Task Group 38: Authenticate Booking Notification Routes
**Dependencies:** None  
**Priority:** CRITICAL  
**Risk:** Email spam attacks via unauthenticated endpoints

- [ ] 38.0 Complete authentication for notification API routes
  - [ ] 38.1 Write 4-6 focused tests for API authentication
    - Test unauthenticated request returns 401
    - Test authenticated request with wrong salon returns 403
    - Test authenticated request with correct salon succeeds
    - Test rate limiting on endpoints
  - [ ] 38.2 Add authentication to send-notifications route
    - Location: `web/src/app/api/bookings/send-notifications/route.ts`
    - Import and use `createClient` from `@/lib/supabase-server`
    - Verify user is authenticated via `supabase.auth.getUser()`
    - Verify user has access to the requested salonId
    - Return 401 for unauthenticated, 403 for unauthorized
  - [ ] 38.3 Add authentication to send-cancellation route
    - Location: `web/src/app/api/bookings/send-cancellation/route.ts`
    - Same authentication pattern as 38.2
    - Verify booking belongs to user's salon
  - [ ] 38.4 Add rate limiting to both endpoints
    - Use existing rate-limit-service.ts
    - Limit: 10 requests per minute per user
    - Return 429 when rate limit exceeded
  - [ ] 38.5 Ensure API authentication tests pass
    - Run ONLY the 4-6 tests written in 38.1
    - Verify authentication works correctly

**Acceptance Criteria:**
- Unauthenticated requests return 401
- Requests to wrong salon return 403
- Rate limiting prevents abuse
- All API authentication tests pass

**Files to Modify:**
- `web/src/app/api/bookings/send-notifications/route.ts`
- `web/src/app/api/bookings/send-cancellation/route.ts`

**Files to Create:**
- `web/tests/unit/security/api-auth.test.ts`

---

#### Task Group 39: Audit All API Routes for Authentication
**Dependencies:** Task Group 38  
**Priority:** HIGH  
**Risk:** Other unauthenticated endpoints may exist

- [ ] 39.0 Complete audit of all API routes
  - [ ] 39.1 Inventory all API routes
    - List all files in `web/src/app/api/`
    - Document which routes require auth vs public
    - Identify any other unauthenticated routes
  - [ ] 39.2 Add authentication to notification routes
    - `api/notifications/route.ts` - verify auth
    - `api/notifications/[id]/read/route.ts` - verify auth
    - `api/notifications/mark-all-read/route.ts` - verify auth
    - `api/notifications/unread-count/route.ts` - verify auth
  - [ ] 39.3 Review debug routes
    - `api/debug/notification-test/route.ts` - should be dev-only
    - `api/notifications/debug/route.ts` - should be dev-only
    - Add NODE_ENV check to block in production
  - [ ] 39.4 Document API route security requirements
    - Create `web/docs/api/security.md`
    - Document auth requirements per route
    - Document rate limits per route

**Acceptance Criteria:**
- All API routes audited for authentication
- Debug routes blocked in production
- API security documentation created

**Files to Modify:**
- `web/src/app/api/notifications/route.ts`
- `web/src/app/api/notifications/[id]/read/route.ts`
- `web/src/app/api/notifications/mark-all-read/route.ts`
- `web/src/app/api/notifications/unread-count/route.ts`
- `web/src/app/api/debug/notification-test/route.ts`
- `web/src/app/api/notifications/debug/route.ts`

**Files to Create:**
- `web/docs/api/security.md`

---

### Database Security Layer

#### Task Group 40: Booking Conflict Prevention
**Dependencies:** None  
**Priority:** CRITICAL  
**Risk:** Double-booking same employee at same time (race condition)

- [ ] 40.0 Complete booking conflict prevention
  - [ ] 40.1 Write 4-6 focused tests for conflict prevention
    - Test overlapping booking is rejected
    - Test adjacent booking is allowed
    - Test cancelled booking slot can be reused
    - Test concurrent booking attempts (race condition)
  - [ ] 40.2 Create atomic booking RPC function
    - Location: `web/supabase/migrations/20260123000001_booking_conflict_prevention.sql`
    - Create `create_booking_atomic()` function
    - Use `SELECT ... FOR UPDATE` to lock rows
    - Check for overlapping bookings atomically
    - Return booking_id on success, raise exception on conflict
  - [ ] 40.3 Update booking repository to use RPC
    - Location: `web/src/lib/repositories/bookings.ts`
    - Replace direct INSERT with RPC call
    - Handle conflict exception gracefully
    - Return user-friendly error message
  - [ ] 40.4 Update booking service error handling
    - Location: `web/src/lib/services/bookings-service.ts`
    - Catch conflict errors from repository
    - Return structured error response
  - [ ] 40.5 Update UI to show conflict errors
    - Location: `web/src/app/bookings/new/page.tsx` (or similar)
    - Display "Time slot no longer available" message
    - Offer to refresh available slots
  - [ ] 40.6 Ensure booking conflict tests pass

**Acceptance Criteria:**
- Overlapping bookings rejected at database level
- Race conditions handled atomically
- User sees friendly error message
- All conflict prevention tests pass

**Files to Create:**
- `web/supabase/migrations/20260123000001_booking_conflict_prevention.sql`
- `web/tests/unit/security/booking-conflicts.test.ts`

**Files to Modify:**
- `web/src/lib/repositories/bookings.ts`
- `web/src/lib/services/bookings-service.ts`

---

#### Task Group 41: RLS UPDATE WITH CHECK Policies
**Dependencies:** None  
**Priority:** HIGH  
**Risk:** Tenant escape by changing salon_id on existing rows

- [ ] 41.0 Complete RLS UPDATE policy hardening
  - [ ] 41.1 Write 4-6 focused tests for RLS
    - Test UPDATE with same salon_id succeeds
    - Test UPDATE attempting to change salon_id fails
    - Test UPDATE by unauthorized user fails
  - [ ] 41.2 Create migration for WITH CHECK policies
    - Location: `web/supabase/migrations/20260123000002_rls_with_check.sql`
    - Add WITH CHECK to all UPDATE policies on:
      - `bookings`
      - `customers`
      - `employees`
      - `services`
      - `shifts`
      - `salons`
      - `products`
      - `booking_products`
      - `opening_hours`
      - `salon_addons`
  - [ ] 41.3 Create salon_id immutability trigger
    - Create `prevent_salon_id_change()` function
    - Apply trigger to all tenant tables
    - Raise exception if OLD.salon_id != NEW.salon_id
  - [ ] 41.4 Test RLS policies manually
    - Use Supabase SQL editor
    - Attempt to change salon_id via UPDATE
    - Verify exception is raised
  - [ ] 41.5 Ensure RLS tests pass

**Acceptance Criteria:**
- All UPDATE policies have WITH CHECK
- salon_id cannot be changed after INSERT
- All RLS tests pass

**Files to Create:**
- `web/supabase/migrations/20260123000002_rls_with_check.sql`
- `web/tests/unit/security/rls-policies.test.ts`

---

#### Task Group 42: Role-Based Access Control Enhancement
**Dependencies:** Task Group 41  
**Priority:** MEDIUM  
**Risk:** Staff can access more than intended via direct Supabase client

- [ ] 42.0 Complete RBAC enhancement
  - [ ] 42.1 Document current role permissions
    - List what each role (owner/manager/staff) should access
    - Identify gaps between UI restrictions and DB access
  - [ ] 42.2 Add role checks to critical RLS policies
    - Update bookings DELETE policy to require owner/manager
    - Update customers DELETE policy to require owner/manager
    - Update services UPDATE/DELETE to require owner/manager
  - [ ] 42.3 Create role-checking helper function
    - Create `user_has_role(role_name)` SQL function
    - Return true if user's profile has matching role
  - [ ] 42.4 Document RBAC matrix
    - Create `web/docs/security/rbac-matrix.md`
    - Document what each role can do per table/action

**Acceptance Criteria:**
- Critical operations restricted by role
- RBAC matrix documented
- Staff cannot delete bookings/customers

**Files to Create:**
- `web/supabase/migrations/20260123000003_rbac_policies.sql`
- `web/docs/security/rbac-matrix.md`

---

### Infrastructure Layer

#### Task Group 43: Supabase Client Production Hardening
**Dependencies:** None  
**Priority:** HIGH  
**Risk:** Silent failures in production if env vars missing

- [ ] 43.0 Complete Supabase client hardening
  - [ ] 43.1 Write 2-3 focused tests for client initialization
    - Test that missing env throws in production
    - Test that fallback works in test environment
  - [ ] 43.2 Update supabase-client.ts
    - Location: `web/src/lib/supabase-client.ts`
    - Fail hard if `NODE_ENV === 'production'` and env vars missing
    - Only use fallback when `NODE_ENV === 'test'` or `VITEST` is set
    - Add clear error message for missing credentials
  - [ ] 43.3 Ensure client tests pass

**Acceptance Criteria:**
- Production build fails if Supabase credentials missing
- Test environment continues to work with fallback
- Clear error message identifies the problem

**Files to Modify:**
- `web/src/lib/supabase-client.ts`

**Files to Create:**
- `web/tests/unit/security/supabase-client.test.ts`

---

#### Task Group 44: CSP and Repository Hygiene
**Dependencies:** None  
**Priority:** LOW  
**Risk:** XSS attacks via unsafe CSP, repo clutter

- [ ] 44.0 Complete CSP hardening and cleanup
  - [ ] 44.1 Create environment-specific CSP
    - Location: `web/src/middleware.ts`
    - Keep `unsafe-inline` and `unsafe-eval` in development
    - Remove `unsafe-eval` in production (keep `unsafe-inline` for Tailwind)
    - Document CSP decisions
  - [ ] 44.2 Update next.config.ts CSP
    - Location: `web/next.config.ts`
    - Match CSP settings with middleware
    - Add comments explaining each directive
  - [ ] 44.3 Delete .bak files
    - Delete `web/.env.local.bak`
    - Delete all `web/src/i18n/*.bak` files (10 files)
  - [ ] 44.4 Update .gitignore
    - Location: `web/.gitignore`
    - Add `*.bak`, `*.tmp`, `*.orig` patterns
  - [ ] 44.5 Verify no .bak files remain

**Acceptance Criteria:**
- CSP stricter in production than development
- No .bak files in repository
- .gitignore prevents future .bak commits

**Files to Modify:**
- `web/src/middleware.ts`
- `web/next.config.ts`
- `web/.gitignore`

**Files to Delete:**
- `web/.env.local.bak`
- `web/src/i18n/hi.ts.bak`
- `web/src/i18n/ur.ts.bak`
- `web/src/i18n/dar.ts.bak`
- `web/src/i18n/fa.ts.bak`
- `web/src/i18n/tl.ts.bak`
- `web/src/i18n/zh.ts.bak`
- `web/src/i18n/vi.ts.bak`
- `web/src/i18n/pl.ts.bak`
- `web/src/i18n/tr.ts.bak`
- `web/src/i18n/ti.ts.bak`

---

## Execution Order

```
Phase 3A: Critical Security (Week 1)
├── Task 38: API Route Authentication (CRITICAL)
├── Task 40: Booking Conflict Prevention (CRITICAL)
└── Task 43: Supabase Client Hardening (HIGH)

Phase 3B: Database Security (Week 2)
├── Task 41: RLS WITH CHECK Policies (HIGH)
├── Task 39: API Route Audit (HIGH)
└── Task 42: RBAC Enhancement (MEDIUM)

Phase 3C: Cleanup (Week 2-3)
└── Task 44: CSP and Repository Hygiene (LOW)
```

---

## Migration Execution Order

All migrations are additive and safe to run on existing data:

1. `20260123000001_booking_conflict_prevention.sql` - Atomic booking RPC
2. `20260123000002_rls_with_check.sql` - UPDATE policies + triggers
3. `20260123000003_rbac_policies.sql` - Role-based restrictions

---

## Test Requirements

| Task Group | Test File | Expected Tests |
|------------|-----------|----------------|
| 38 | `tests/unit/security/api-auth.test.ts` | 4-6 |
| 40 | `tests/unit/security/booking-conflicts.test.ts` | 4-6 |
| 41 | `tests/unit/security/rls-policies.test.ts` | 4-6 |
| 43 | `tests/unit/security/supabase-client.test.ts` | 2-3 |

**Total Estimated Tests:** 14-21

---

## Notes

- **Production Blocker:** Task Groups 38 and 40 must be completed before production deployment
- **Testing First:** Write tests before implementation where possible
- **Incremental Delivery:** Each task group can be deployed independently
- **Zero Cost:** All security improvements use existing infrastructure
- **Backward Compatible:** All migrations are additive, no breaking changes
