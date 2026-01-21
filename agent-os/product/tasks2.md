# Task Breakdown: Phase 2 (Free-First)

**Source:** `agent-os/product/roadmap.md` - Short-term & Medium-term sections  
**Principle:** Free-first implementation - no new paid services  
**Total Tasks:** 19 roadmap items (Tasks 17-37, excluding WhatsApp and POS)

---

## Overview

This task breakdown covers Phase 2 of the TeqBook roadmap, implementing features that can be built with zero additional recurring costs. All tasks use existing infrastructure (Supabase, Vercel, Resend) or pure code solutions.

**Budget Rules:**
- Default to free-first implementation choices
- No new paid providers or SaaS dependencies
- Use existing email service (Resend free tier)
- Prefer features that improve UX without recurring costs

---

## Skipped Tasks (Paid/Complex)

| Task | Reason | Alternative |
|------|--------|-------------|
| Task 18: WhatsApp Business API | Paid API (~$0.05/message) | Use email + in-app instead |
| Task 30: POS Integration | Complex, potentially expensive | Defer to future funding |

---

## Phase 2A: Short-term (1-3 Months)

### Kommunikasjon og Notifikasjoner

#### Task Group 17: Notification System (Email + In-App + ICS)
**Dependencies:** Existing notification-service.ts, email-service.ts  
**Roadmap Item:** #17 - SMS Integration (replaced with free alternative)  
**Full Details:** See `agent-os/product/task-group-17.md`

- [ ] 17.0 Complete notification system
  - [ ] 17.1 Unified notification service (channel-agnostic)
  - [ ] 17.2 In-App notification center (database + UI)
  - [ ] 17.3 Calendar invite (ICS) generation
  - [ ] 17.5 Notification preferences (enhanced)
  - [ ] 17.6 Notification templates (email + in-app)
  - [ ] 17.7 Tests (4-6 focused tests)

**Acceptance Criteria:**
- In-app notifications displayed in UI with real data
- Booking confirmations include ICS calendar invite
- Notification preferences enforced for all channels
- All tests pass

**Estimated Effort:** 5 days  
**Cost:** $0

---

### Avanserte Funksjoner

#### Task Group 19: Customer Booking History
**Dependencies:** Existing bookings-service.ts, customers-service.ts  
**Roadmap Item:** #19 - Customer Booking History (Business plan feature)

- [ ] 19.0 Complete customer booking history feature
  - [ ] 19.1 Write 4-6 focused tests for booking history
    - Test history query with pagination
    - Test filtering by date range
    - Test filtering by service/employee
    - Test export functionality
  - [ ] 19.2 Create booking history repository functions
    - Location: `web/src/lib/repositories/bookings.ts` (extend)
    - Add `getBookingHistoryForCustomer(customerId, options)`
    - Add `getBookingStatsForCustomer(customerId)`
    - Support pagination, date range, service filter
  - [ ] 19.3 Create booking history service
    - Location: `web/src/lib/services/bookings-service.ts` (extend)
    - Add `getCustomerBookingHistory()` function
    - Add `getCustomerBookingStats()` function
    - Calculate: total bookings, total spent, favorite service, last visit
  - [ ] 19.4 Create customer history page
    - Location: `web/src/app/customers/[id]/history/page.tsx`
    - Show booking history with pagination
    - Show statistics (total visits, spending, trends)
    - Add filtering by date range and service
  - [ ] 19.5 Add export functionality
    - Export to CSV
    - Include all booking details
  - [ ] 19.6 Add plan limit check (Business plan only)
    - Check feature flag before showing history
    - Show upgrade prompt for lower plans
  - [ ] 19.7 Ensure tests pass

**Acceptance Criteria:**
- Customer booking history is viewable with pagination
- Statistics show total visits, spending, trends
- Export to CSV works
- Feature is gated to Business plan
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/repositories/bookings.ts` (extend)
- `web/src/lib/services/bookings-service.ts` (extend)
- `web/src/app/customers/[id]/history/page.tsx` (new)
- `web/tests/unit/services/customer-booking-history.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 20: Advanced Role Permissions
**Dependencies:** Existing RLS policies, profiles table  
**Roadmap Item:** #20 - Advanced Role Permissions (Business plan feature)

- [ ] 20.0 Complete advanced role permissions system
  - [ ] 20.1 Write 4-6 focused tests for permissions
    - Test permission checking
    - Test permission assignment
    - Test role inheritance
    - Test RLS enforcement
  - [ ] 20.2 Design permission system
    - Document permission types: view, create, edit, delete per resource
    - Document role hierarchy: owner > manager > staff
    - Define default permissions per role
  - [ ] 20.3 Create permissions migration
    - Location: `web/supabase/migrations/[timestamp]_create_permissions.sql`
    - Create `permissions` table (role, resource, action, allowed)
    - Create `role_permissions` view for easy querying
    - Add RLS policies
  - [ ] 20.4 Create permissions repository
    - Location: `web/src/lib/repositories/permissions.ts`
    - `getPermissionsForRole(role)` function
    - `checkPermission(userId, resource, action)` function
    - `assignPermission(role, resource, action)` function
  - [ ] 20.5 Create permissions service
    - Location: `web/src/lib/services/permissions-service.ts`
    - `hasPermission()` function for UI checks
    - `requirePermission()` function for service-level checks
    - Integration with existing auth checks
  - [ ] 20.6 Create permission management UI
    - Location: `web/src/app/settings/permissions/page.tsx`
    - Show permission matrix by role
    - Allow editing permissions (owner only)
    - Show inherited vs custom permissions
  - [ ] 20.7 Integrate with existing services
    - Update service functions to check permissions
    - Add permission checks to critical operations
  - [ ] 20.8 Ensure tests pass

**Acceptance Criteria:**
- Granular permissions can be assigned to roles
- Permission checks are enforced in services
- UI shows permission management (Business plan)
- All tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_create_permissions.sql` (new)
- `web/src/lib/repositories/permissions.ts` (new)
- `web/src/lib/services/permissions-service.ts` (new)
- `web/src/app/settings/permissions/page.tsx` (new)
- `web/tests/unit/services/permissions-service.test.ts` (new)

**Estimated Effort:** 2 weeks  
**Cost:** $0

---

### Performance og Skalerbarhet

#### Task Group 21: Performance Monitoring (Sentry Free Tier)
**Dependencies:** Existing Sentry setup  
**Roadmap Item:** #21 - Performance Monitoring

- [ ] 21.0 Enhance performance monitoring within free tier
  - [ ] 21.1 Write 4-6 focused tests for performance tracking
    - Test performance metric collection
    - Test slow query detection
    - Test API response time tracking
  - [ ] 21.2 Audit current Sentry configuration
    - Review existing performance settings
    - Document current sample rates
    - Identify optimization opportunities
  - [ ] 21.3 Add custom performance spans
    - Add spans to critical service functions
    - Track database query times
    - Track external API calls
  - [ ] 21.4 Create performance logging service
    - Location: `web/src/lib/services/performance-service.ts`
    - `trackOperation(name, fn)` wrapper function
    - Log slow operations (>500ms) to console
    - Store performance data in audit log (optional)
  - [ ] 21.5 Add performance dashboard (simple)
    - Location: `web/src/app/admin/performance/page.tsx`
    - Show recent slow operations from logs
    - Link to Sentry for detailed view
  - [ ] 21.6 Ensure tests pass

**Acceptance Criteria:**
- Critical operations have performance tracking
- Slow operations are logged
- Admin can view performance summary
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/performance-service.ts` (new)
- `web/src/app/admin/performance/page.tsx` (new)
- `web/sentry.client.config.ts` (update)
- `web/tests/unit/services/performance-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0 (uses Sentry free tier)

---

#### Task Group 22: Database Query Optimization
**Dependencies:** None  
**Roadmap Item:** #22 - Database Query Optimization

- [ ] 22.0 Complete database query optimization
  - [ ] 22.1 Write 4-6 focused tests for query performance
    - Test query execution time
    - Test index usage
    - Test N+1 query prevention
  - [ ] 22.2 Identify slow queries
    - Enable pg_stat_statements in Supabase
    - Document top 10 slowest queries
    - Analyze query plans with EXPLAIN
  - [ ] 22.3 Add missing indexes
    - Location: `web/supabase/migrations/[timestamp]_add_performance_indexes.sql`
    - Add indexes based on slow query analysis
    - Add composite indexes for common filters
  - [ ] 22.4 Optimize RLS policies
    - Review RLS policies for performance
    - Simplify complex policy conditions
    - Add security_invoker where appropriate
  - [ ] 22.5 Optimize repository queries
    - Review all repository functions
    - Add proper SELECT fields (avoid SELECT *)
    - Add proper JOINs instead of multiple queries
  - [ ] 22.6 Document query patterns
    - Location: `web/docs/database/query-patterns.md`
    - Document optimized query patterns
    - Document indexing strategy
  - [ ] 22.7 Ensure tests pass

**Acceptance Criteria:**
- Slow queries identified and optimized
- Missing indexes added
- RLS policies reviewed for performance
- Query patterns documented
- All tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_add_performance_indexes.sql` (new)
- `web/src/lib/repositories/*.ts` (update as needed)
- `web/docs/database/query-patterns.md` (new)
- `web/tests/integration/query-performance.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 23: Caching Strategy (In-Memory)
**Dependencies:** Task Group 22  
**Roadmap Item:** #23 - Caching Strategy (without Redis)

- [ ] 23.0 Complete in-memory caching strategy
  - [ ] 23.1 Write 4-6 focused tests for caching
    - Test cache hit/miss
    - Test cache invalidation
    - Test TTL expiration
    - Test memory limits
  - [ ] 23.2 Create simple cache service
    - Location: `web/src/lib/services/cache-service.ts`
    - In-memory Map-based cache
    - TTL support
    - Size limits to prevent memory issues
    - `get()`, `set()`, `delete()`, `clear()` functions
  - [ ] 23.3 Add caching to frequently accessed data
    - Cache feature flags (5 min TTL)
    - Cache plan limits (5 min TTL)
    - Cache salon settings (1 min TTL)
  - [ ] 23.4 Add cache invalidation triggers
    - Invalidate on data updates
    - Add cache-busting for critical updates
  - [ ] 23.5 Add cache monitoring
    - Log cache hit/miss ratio
    - Track cache size
  - [ ] 23.6 Ensure tests pass

**Acceptance Criteria:**
- Frequently accessed data is cached
- Cache invalidation works correctly
- No memory leaks
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/cache-service.ts` (new)
- `web/src/lib/services/feature-flags-service.ts` (update)
- `web/src/lib/services/plan-limits-service.ts` (update)
- `web/tests/unit/services/cache-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

### Testing og Kvalitet

#### Task Group 24: Component Tests
**Dependencies:** Existing test setup  
**Roadmap Item:** #24 - Component Tests

- [ ] 24.0 Complete component test coverage
  - [ ] 24.1 Set up React Testing Library (if not present)
    - Verify @testing-library/react is installed
    - Configure test environment for components
    - Add component test utilities
  - [ ] 24.2 Write tests for critical form components
    - Test BookingForm validation and submission
    - Test CustomerForm validation and submission
    - Test ServiceForm validation and submission
  - [ ] 24.3 Write tests for critical display components
    - Test BookingsTable rendering and sorting
    - Test CustomersTable rendering and filtering
    - Test DashboardCards with various data states
  - [ ] 24.4 Write tests for interactive components
    - Test NotificationCenter interactions
    - Test Dialog open/close behavior
    - Test Dropdown selections
  - [ ] 24.5 Write tests for error states
    - Test error boundary fallback rendering
    - Test form error display
    - Test empty state rendering
  - [ ] 24.6 Document component testing patterns
    - Location: `web/docs/testing/component-tests.md`

**Acceptance Criteria:**
- Critical components have tests
- Form validation is tested
- Error states are tested
- Testing patterns documented

**Files to Create/Modify:**
- `web/tests/components/*.test.tsx` (new files)
- `web/docs/testing/component-tests.md` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 25: RLS Policy Tests
**Dependencies:** Existing RLS policies  
**Roadmap Item:** #25 - RLS Policy Tests

- [ ] 25.0 Complete RLS policy test coverage
  - [ ] 25.1 Create RLS test framework
    - Location: `web/tests/rls/rls-test-utils.ts`
    - Helper functions for testing as different users
    - Helper functions for cross-tenant tests
  - [ ] 25.2 Write tests for booking RLS
    - Test user can only see own salon's bookings
    - Test cross-tenant access is blocked
    - Test superadmin access works
  - [ ] 25.3 Write tests for customer RLS
    - Test user can only see own salon's customers
    - Test cross-tenant access is blocked
  - [ ] 25.4 Write tests for employee RLS
    - Test user can only see own salon's employees
    - Test cross-tenant access is blocked
  - [ ] 25.5 Write tests for sensitive data RLS
    - Test audit log access (superadmin only)
    - Test billing data access (owner only)
  - [ ] 25.6 Document RLS patterns
    - Location: `web/docs/database/rls-patterns.md`

**Acceptance Criteria:**
- All critical tables have RLS tests
- Cross-tenant isolation verified
- Superadmin access verified
- RLS patterns documented

**Files to Create/Modify:**
- `web/tests/rls/rls-test-utils.ts` (new)
- `web/tests/rls/*.test.ts` (new files)
- `web/docs/database/rls-patterns.md` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

### Developer Experience

#### Task Group 26: API Documentation
**Dependencies:** Existing Edge Functions  
**Roadmap Item:** #26 - API Documentation

- [ ] 26.0 Complete API documentation
  - [ ] 26.1 Write 4-6 focused tests for API docs accuracy
    - Test documented endpoints exist
    - Test request/response schemas match
  - [ ] 26.2 Create OpenAPI spec for Edge Functions
    - Location: `web/docs/api/openapi.yaml`
    - Document all Edge Function endpoints
    - Include request/response schemas
    - Include authentication requirements
  - [ ] 26.3 Document internal APIs
    - Location: `web/docs/api/internal-apis.md`
    - Document service layer APIs
    - Document repository patterns
  - [ ] 26.4 Add code examples
    - Location: `web/docs/api/examples.md`
    - Example API calls with curl
    - Example TypeScript usage
  - [ ] 26.5 Create API documentation page
    - Location: `web/docs/api/README.md`
    - Overview of all APIs
    - Getting started guide
  - [ ] 26.6 Ensure tests pass

**Acceptance Criteria:**
- All Edge Functions documented
- OpenAPI spec is valid and complete
- Code examples provided
- All tests pass

**Files to Create/Modify:**
- `web/docs/api/openapi.yaml` (new)
- `web/docs/api/internal-apis.md` (new)
- `web/docs/api/examples.md` (new)
- `web/docs/api/README.md` (new)
- `web/tests/docs/api-docs.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 27: Type Safety Improvements
**Dependencies:** None  
**Roadmap Item:** #27 - Type Safety Improvements

- [ ] 27.0 Complete type safety improvements
  - [ ] 27.1 Audit codebase for `any` types
    - Run `grep -r "any" --include="*.ts" --include="*.tsx"`
    - Document all `any` usage
    - Categorize: necessary vs fixable
  - [ ] 27.2 Fix fixable `any` types
    - Replace with proper types
    - Add type definitions where missing
    - Use `unknown` instead of `any` where appropriate
  - [ ] 27.3 Enable stricter TypeScript config
    - Update `tsconfig.json`
    - Enable `noImplicitAny` (if not already)
    - Enable `strictNullChecks` (if not already)
    - Fix resulting errors
  - [ ] 27.4 Add Zod schemas for runtime validation
    - Location: `web/src/lib/validation/*.ts`
    - Add schemas for API inputs
    - Add schemas for form data
    - Integrate with existing validation
  - [ ] 27.5 Document type patterns
    - Location: `web/docs/development/type-patterns.md`
    - Document type definition patterns
    - Document validation patterns

**Acceptance Criteria:**
- No unnecessary `any` types
- Stricter TypeScript config enabled
- Runtime validation with Zod for critical paths
- Type patterns documented

**Files to Create/Modify:**
- `web/tsconfig.json` (update)
- `web/src/lib/validation/*.ts` (update/new)
- `web/docs/development/type-patterns.md` (new)
- Various source files (fix any types)

**Estimated Effort:** 1 week  
**Cost:** $0

---

## Phase 2B: Medium-term (3-6 Months)

### Kalender-integrasjoner

#### Task Group 28: Google Calendar Sync
**Dependencies:** Task Group 17 (ICS knowledge)  
**Roadmap Item:** #28 - Google Calendar Sync

- [ ] 28.0 Complete Google Calendar sync
  - [ ] 28.1 Write 4-6 focused tests for calendar sync
    - Test OAuth flow
    - Test event creation
    - Test event update
    - Test conflict handling
  - [ ] 28.2 Set up Google Calendar API
    - Create Google Cloud project
    - Enable Calendar API
    - Configure OAuth consent screen
    - Store credentials securely
  - [ ] 28.3 Create Google Calendar service
    - Location: `web/src/lib/services/google-calendar-service.ts`
    - OAuth authentication flow
    - Create event from booking
    - Update event on booking change
    - Delete event on booking cancel
  - [ ] 28.4 Create sync settings UI
    - Location: `web/src/app/settings/integrations/page.tsx`
    - Connect/disconnect Google Calendar
    - Select calendar for sync
    - Sync direction settings
  - [ ] 28.5 Handle sync conflicts
    - Detect double-booked times
    - Warn user of conflicts
    - Provide resolution options
  - [ ] 28.6 Ensure tests pass

**Acceptance Criteria:**
- Users can connect Google Calendar
- Bookings sync to Google Calendar
- Updates and cancellations sync
- Conflicts are handled gracefully
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/google-calendar-service.ts` (new)
- `web/src/app/settings/integrations/page.tsx` (new)
- `web/supabase/migrations/[timestamp]_calendar_tokens.sql` (new)
- `web/tests/unit/services/google-calendar-service.test.ts` (new)

**Estimated Effort:** 2 weeks  
**Cost:** $0 (Google Calendar API is free)

---

#### Task Group 29: Outlook Calendar Sync
**Dependencies:** Task Group 28 (similar architecture)  
**Roadmap Item:** #29 - Outlook Calendar Sync

- [ ] 29.0 Complete Outlook Calendar sync
  - [ ] 29.1 Write 4-6 focused tests for Outlook sync
    - Test OAuth flow (Microsoft Graph)
    - Test event creation
    - Test event update
    - Test conflict handling
  - [ ] 29.2 Set up Microsoft Graph API
    - Create Azure AD app registration
    - Configure permissions for Calendar
    - Store credentials securely
  - [ ] 29.3 Create Outlook Calendar service
    - Location: `web/src/lib/services/outlook-calendar-service.ts`
    - Microsoft Graph authentication flow
    - Create event from booking
    - Update event on booking change
    - Delete event on booking cancel
  - [ ] 29.4 Update sync settings UI
    - Add Outlook option to integrations page
    - Connect/disconnect Outlook Calendar
    - Select calendar for sync
  - [ ] 29.5 Handle sync conflicts
    - Detect double-booked times
    - Provide resolution options
  - [ ] 29.6 Ensure tests pass

**Acceptance Criteria:**
- Users can connect Outlook Calendar
- Bookings sync to Outlook Calendar
- Updates and cancellations sync
- Conflicts are handled gracefully
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/outlook-calendar-service.ts` (new)
- `web/src/app/settings/integrations/page.tsx` (update)
- `web/tests/unit/services/outlook-calendar-service.test.ts` (new)

**Estimated Effort:** 2 weeks  
**Cost:** $0 (Microsoft Graph API is free)

---

### Avansert Rapportering

#### Task Group 31: Revenue Forecasting
**Dependencies:** Existing reports-service.ts  
**Roadmap Item:** #31 - Revenue Forecasting

- [ ] 31.0 Complete revenue forecasting feature
  - [ ] 31.1 Write 4-6 focused tests for forecasting
    - Test forecast calculation
    - Test trend analysis
    - Test seasonal adjustment
  - [ ] 31.2 Design forecasting algorithm
    - Document approach (moving average, linear regression)
    - Define forecast horizons (1 week, 1 month)
    - Plan data requirements
  - [ ] 31.3 Create forecasting service
    - Location: `web/src/lib/services/forecasting-service.ts`
    - `forecastRevenue(salonId, horizon)` function
    - `analyzeTrends(salonId, period)` function
    - Use historical booking data
  - [ ] 31.4 Create forecasting UI
    - Location: `web/src/app/reports/forecast/page.tsx`
    - Show forecast chart
    - Show confidence intervals
    - Allow horizon selection
  - [ ] 31.5 Track forecast accuracy
    - Compare forecasts to actual
    - Show accuracy metrics
  - [ ] 31.6 Ensure tests pass

**Acceptance Criteria:**
- Revenue forecasting is available
- Forecasts based on historical data
- Accuracy is tracked
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/forecasting-service.ts` (new)
- `web/src/app/reports/forecast/page.tsx` (new)
- `web/tests/unit/services/forecasting-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 32: Customer Lifetime Value
**Dependencies:** Task Group 19 (customer history)  
**Roadmap Item:** #32 - Customer Lifetime Value

- [ ] 32.0 Complete CLV feature
  - [ ] 32.1 Write 4-6 focused tests for CLV
    - Test CLV calculation
    - Test segment classification
  - [ ] 32.2 Design CLV calculation
    - Document formula (total spent / lifetime)
    - Define customer segments (low, medium, high value)
    - Plan calculation frequency
  - [ ] 32.3 Create CLV service
    - Location: `web/src/lib/services/clv-service.ts`
    - `calculateCLV(customerId)` function
    - `segmentCustomers(salonId)` function
    - `getHighValueCustomers(salonId)` function
  - [ ] 32.4 Add CLV to customer profiles
    - Update customer detail page
    - Show CLV score
    - Show segment badge
  - [ ] 32.5 Create CLV report
    - Location: `web/src/app/reports/clv/page.tsx`
    - Distribution chart by segment
    - Top customers list
  - [ ] 32.6 Ensure tests pass

**Acceptance Criteria:**
- CLV calculated for all customers
- Customers segmented by value
- CLV visible on customer profiles
- CLV report available
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/clv-service.ts` (new)
- `web/src/app/customers/[id]/page.tsx` (update)
- `web/src/app/reports/clv/page.tsx` (new)
- `web/tests/unit/services/clv-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 33: Employee Performance Metrics
**Dependencies:** Existing employees-service.ts  
**Roadmap Item:** #33 - Employee Performance Metrics

- [ ] 33.0 Complete employee performance metrics
  - [ ] 33.1 Write 4-6 focused tests for performance metrics
    - Test booking count calculation
    - Test revenue calculation
    - Test utilization rate
  - [ ] 33.2 Design performance metrics
    - Document metrics: bookings count, revenue, utilization, customer satisfaction
    - Define calculation periods (daily, weekly, monthly)
    - Plan data aggregation
  - [ ] 33.3 Create performance metrics service
    - Location: `web/src/lib/services/employee-metrics-service.ts`
    - `getEmployeeMetrics(employeeId, period)` function
    - `getTeamMetrics(salonId, period)` function
    - `getTopPerformers(salonId, period)` function
  - [ ] 33.4 Create performance dashboard
    - Location: `web/src/app/employees/performance/page.tsx`
    - Show individual performance
    - Show team comparison
    - Show trends over time
  - [ ] 33.5 Add performance to employee profiles
    - Update employee detail page
    - Show key metrics
  - [ ] 33.6 Ensure tests pass

**Acceptance Criteria:**
- Performance metrics calculated for all employees
- Dashboard shows team and individual performance
- Trends visible over time
- All tests pass

**Files to Create/Modify:**
- `web/src/lib/services/employee-metrics-service.ts` (new)
- `web/src/app/employees/performance/page.tsx` (new)
- `web/src/app/employees/[id]/page.tsx` (update if exists)
- `web/tests/unit/services/employee-metrics-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

### Mobile App Forberedelse

#### Task Group 34: Mobile App Planning
**Dependencies:** None  
**Roadmap Item:** #34 - Mobile App Planning

- [ ] 34.0 Complete mobile app planning
  - [ ] 34.1 Research mobile frameworks
    - Compare React Native vs Flutter vs PWA
    - Document pros/cons for TeqBook use case
    - Make framework recommendation
  - [ ] 34.2 Design mobile architecture
    - Document app structure
    - Plan API requirements
    - Plan offline support needs
  - [ ] 34.3 Create mobile API spec
    - Document required endpoints
    - Document authentication flow
    - Document push notification integration
  - [ ] 34.4 Create mobile roadmap document
    - Location: `documentation/mobile-roadmap.md`
    - Phased rollout plan
    - MVP feature set
    - Timeline estimate

**Acceptance Criteria:**
- Framework decision documented
- Architecture designed
- API requirements documented
- Mobile roadmap created

**Files to Create:**
- `documentation/mobile-roadmap.md` (new)
- `documentation/mobile-architecture.md` (new)
- `documentation/mobile-api-spec.md` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

#### Task Group 35: Push Notifications (Web Push)
**Dependencies:** Task Group 17 (notification system)  
**Roadmap Item:** #35 - Push Notifications

- [ ] 35.0 Complete web push notifications
  - [ ] 35.1 Write 4-6 focused tests for push notifications
    - Test subscription flow
    - Test notification sending
    - Test permission handling
  - [ ] 35.2 Create service worker for push
    - Location: `web/public/sw.js`
    - Handle push events
    - Show notifications
    - Handle notification clicks
  - [ ] 35.3 Create push notification service
    - Location: `web/src/lib/services/push-notification-service.ts`
    - Subscribe user to push
    - Store subscription in database
    - Send push via Web Push API
  - [ ] 35.4 Add push subscription UI
    - Add opt-in prompt
    - Add push settings to notification preferences
    - Handle permission denied gracefully
  - [ ] 35.5 Integrate with notification system
    - Add push as channel in unified notification service
    - Send push for booking reminders
  - [ ] 35.6 Ensure tests pass

**Acceptance Criteria:**
- Users can subscribe to push notifications
- Push notifications work on desktop/Android
- PWA-compatible for iOS
- Integrated with notification system
- All tests pass

**Files to Create/Modify:**
- `web/public/sw.js` (new)
- `web/src/lib/services/push-notification-service.ts` (new)
- `web/supabase/migrations/[timestamp]_push_subscriptions.sql` (new)
- `web/src/lib/services/unified-notification-service.ts` (update)
- `web/tests/unit/services/push-notification-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0 (Web Push is free)

---

### Multi-Salon Features

#### Task Group 36: Multi-Salon Owner Dashboard
**Dependencies:** Existing salon system  
**Roadmap Item:** #36 - Multi-Salon Owner Dashboard

- [ ] 36.0 Complete multi-salon dashboard
  - [ ] 36.1 Write 4-6 focused tests for multi-salon
    - Test salon switching
    - Test cross-salon analytics
    - Test data isolation
  - [ ] 36.2 Design multi-salon architecture
    - Document data model changes
    - Plan salon association (many salons per user)
    - Plan permission model
  - [ ] 36.3 Create migration for multi-salon support
    - Location: `web/supabase/migrations/[timestamp]_multi_salon.sql`
    - Allow multiple salon_ids per profile
    - Update RLS policies
  - [ ] 36.4 Create salon switching component
    - Location: `web/src/components/salon-switcher.tsx`
    - Show owned salons in dropdown
    - Persist selected salon
  - [ ] 36.5 Create cross-salon analytics
    - Location: `web/src/app/portfolio/page.tsx`
    - Aggregate metrics across salons
    - Compare salon performance
  - [ ] 36.6 Ensure tests pass

**Acceptance Criteria:**
- Users can own multiple salons
- Salon switching works seamlessly
- Cross-salon analytics available
- Data isolation maintained
- All tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_multi_salon.sql` (new)
- `web/src/components/salon-switcher.tsx` (new)
- `web/src/app/portfolio/page.tsx` (new)
- `web/src/components/salon-provider.tsx` (update)
- `web/tests/unit/components/salon-switcher.test.ts` (new)

**Estimated Effort:** 2 weeks  
**Cost:** $0

---

#### Task Group 37: Shared Staff Templates
**Dependencies:** Task Group 36 (multi-salon)  
**Roadmap Item:** #37 - Shared Staff Templates

- [ ] 37.0 Complete shared staff templates
  - [ ] 37.1 Write 4-6 focused tests for templates
    - Test template creation
    - Test template sharing
    - Test template import
  - [ ] 37.2 Design template system
    - Document template types (staff, services)
    - Plan sharing mechanism
    - Plan import/export format
  - [ ] 37.3 Create templates migration
    - Location: `web/supabase/migrations/[timestamp]_staff_templates.sql`
    - Create `staff_templates` table
    - Create `service_templates` table
    - Add RLS policies
  - [ ] 37.4 Create template service
    - Location: `web/src/lib/services/template-service.ts`
    - `createTemplate(type, data)` function
    - `shareTemplate(templateId, salonIds)` function
    - `importTemplate(templateId)` function
  - [ ] 37.5 Create template management UI
    - Location: `web/src/app/settings/templates/page.tsx`
    - List templates
    - Create/edit templates
    - Share templates
    - Import templates
  - [ ] 37.6 Ensure tests pass

**Acceptance Criteria:**
- Templates can be created for staff/services
- Templates can be shared across salons
- Templates can be imported
- All tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_staff_templates.sql` (new)
- `web/src/lib/services/template-service.ts` (new)
- `web/src/lib/repositories/templates.ts` (new)
- `web/src/app/settings/templates/page.tsx` (new)
- `web/tests/unit/services/template-service.test.ts` (new)

**Estimated Effort:** 1 week  
**Cost:** $0

---

## Execution Order

Recommended implementation sequence based on dependencies and user value:

### Priority 1: Immediate User Value
1. **Task Group 17**: Notification System (Email + In-App + ICS) — Core functionality
2. **Task Group 22**: Database Query Optimization — Performance improvement
3. **Task Group 19**: Customer Booking History — Business value feature

### Priority 2: Code Quality
4. **Task Group 24**: Component Tests — Quality assurance
5. **Task Group 25**: RLS Policy Tests — Security verification
6. **Task Group 27**: Type Safety Improvements — Code quality

### Priority 3: Feature Enhancement
7. **Task Group 20**: Advanced Role Permissions — Business feature
8. **Task Group 23**: Caching Strategy — Performance
9. **Task Group 21**: Performance Monitoring — Observability
10. **Task Group 26**: API Documentation — Developer experience

### Priority 4: Advanced Features
11. **Task Group 28**: Google Calendar Sync — Integration
12. **Task Group 29**: Outlook Calendar Sync — Integration
13. **Task Group 31**: Revenue Forecasting — Analytics
14. **Task Group 32**: Customer Lifetime Value — Analytics
15. **Task Group 33**: Employee Performance Metrics — Analytics

### Priority 5: Future Platform
16. **Task Group 34**: Mobile App Planning — Planning
17. **Task Group 35**: Push Notifications — Infrastructure
18. **Task Group 36**: Multi-Salon Owner Dashboard — Platform
19. **Task Group 37**: Shared Staff Templates — Platform

---

## Acceptance Criteria Summary

- [ ] All notification channels working (email, in-app, ICS)
- [ ] Customer booking history available for Business plan
- [ ] Role permissions system implemented
- [ ] Database performance optimized
- [ ] In-memory caching for frequently accessed data
- [ ] Component and RLS tests in place
- [ ] API documentation complete
- [ ] Type safety improved
- [ ] Calendar sync working (Google + Outlook)
- [ ] Analytics features (forecasting, CLV, employee metrics)
- [ ] Web push notifications working
- [ ] Multi-salon support available
- [ ] Template sharing working
- [ ] All tests passing
- [ ] $0 additional recurring costs

---

## Progress Summary

| Category | Tasks | Status | Tests |
|----------|-------|--------|-------|
| Notifications (17) | 1 | ⏳ Pending | 0/4-6 |
| Advanced Features (19-20) | 2 | ⏳ Pending | 0/8-12 |
| Performance (21-23) | 3 | ⏳ Pending | 0/12-18 |
| Testing & Quality (24-25) | 2 | ⏳ Pending | 0/8-12 |
| Developer Experience (26-27) | 2 | ⏳ Pending | 0/8-12 |
| Calendar Integrations (28-29) | 2 | ⏳ Pending | 0/8-12 |
| Analytics (31-33) | 3 | ⏳ Pending | 0/12-18 |
| Mobile Prep (34-35) | 2 | ⏳ Pending | 0/4-6 |
| Multi-Salon (36-37) | 2 | ⏳ Pending | 0/8-12 |

**Total Tasks:** 19  
**Total Estimated Tests:** ~70-100  
**Total Estimated Effort:** 20-25 weeks  
**Total Recurring Cost:** $0

---

## Notes

- **Free-First:** All tasks use existing infrastructure or free-tier services
- **Testing First:** Write tests before or alongside implementation
- **Incremental Delivery:** Each task group delivers standalone value
- **Documentation:** Update docs as features are implemented
- **Follow TeqBook Standards:** UI → Services → Repositories → Supabase
