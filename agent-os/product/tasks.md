# Task Breakdown: Next Iteration (0-4 Weeks)

**Source:** `agent-os/product/roadmap.md` - "Next Iteration" section  
**Goal:** Production hardening, critical security improvements, and notification system  
**Total Tasks:** 16 roadmap items broken down into concrete implementation tasks

---

## Overview

This task breakdown converts the 16 "Next Iteration" roadmap items into concrete, actionable tasks following TeqBook's layered architecture (UI → Services → Repositories → Supabase).

**Execution Order:** Tasks should be implemented in dependency order, with security and infrastructure tasks prioritized.

---

## Task List

### Infrastructure & Security Layer

#### Task Group 1: Server-Side Rate Limiting
**Dependencies:** None  
**Roadmap Item:** #1 - Server-Side Rate Limiting

- [x] 1.0 Complete server-side rate limiting infrastructure
  - [x] 1.1 Write 4-6 focused tests for rate limiting behavior
    - Test rate limit enforcement (5 attempts per 15 minutes)
    - Test rate limit reset after timeout
    - Test rate limit per IP/email
    - Test rate limit bypass prevention
  - [x] 1.2 Create rate limiting Edge Function (`rate-limit-check`)
    - Location: `web/supabase/functions/rate-limit-check/`
    - Use database table for rate limit tracking
    - Implement sliding window algorithm
    - Return rate limit status and remaining attempts
  - [x] 1.3 Create rate limiting service (`rate-limit-service.ts`)
    - Location: `web/src/lib/services/rate-limit-service.ts`
    - Add `checkRateLimit()` function
    - Add `incrementRateLimit()` function
    - Add `resetRateLimit()` function
    - Integrate with Edge Function
  - [x] 1.4 Integrate rate limiting with login endpoint
    - Update `web/src/app/(auth)/login/page.tsx`
    - Call rate limit check before authentication
    - Show rate limit status to user
    - Block login attempts when rate limit exceeded
  - [x] 1.5 Add rate limiting to critical API endpoints
    - Update public booking page
    - Add rate limiting middleware pattern
  - [x] 1.6 Ensure rate limiting tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify rate limiting works correctly
    - Verify rate limit resets properly

**Acceptance Criteria:**
- Rate limiting prevents brute force attacks
- Rate limit status is visible to users
- Rate limits reset after timeout period
- All rate limiting tests pass

**Files to Create/Modify:**
- `web/supabase/functions/rate-limit-check/index.ts`
- `web/src/lib/services/rate-limit-service.ts`
- `web/src/app/(auth)/login/page.tsx`
- `web/tests/unit/services/rate-limit-service.test.ts`

---

#### Task Group 2: API Rate Limiting
**Dependencies:** Task Group 1 (can be done in parallel)  
**Roadmap Item:** #2 - API Rate Limiting

- [x] 2.0 Complete API rate limiting for Edge Functions
  - [x] 2.1 Write 4-6 focused tests for API rate limiting
    - Test rate limit per endpoint
    - Test rate limit per IP/user
    - Test rate limit configuration
    - Test rate limit error responses
  - [x] 2.2 Create rate limiting middleware for Edge Functions
    - Location: `web/supabase/functions/_shared/rate-limit.ts`
    - Reusable middleware function
    - Configurable limits per endpoint type
    - Return rate limit headers
  - [x] 2.3 Apply rate limiting to all Edge Functions
    - Update `billing-create-customer`
    - Update `billing-create-subscription`
    - Update `billing-update-plan`
    - Update `billing-cancel-subscription`
    - Update `billing-update-payment-method`
    - Add rate limiting to `whatsapp-send`
    - Note: `billing-webhook` excluded (comes from Stripe, not users)
  - [x] 2.4 Add rate limit monitoring and alerts
    - Log rate limit hits to console
    - Add rate limit violation logging
    - Update database on rate limit violations
    - Ready for Sentry integration (can be added later)
  - [x] 2.5 Ensure API rate limiting tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify rate limiting works on all endpoints

**Acceptance Criteria:**
- All Edge Functions have rate limiting
- Rate limits are configurable per endpoint
- Rate limit violations are logged and monitored
- All API rate limiting tests pass

**Files to Create/Modify:**
- `web/supabase/functions/_shared/rate-limit.ts`
- `web/supabase/functions/billing-create-customer/index.ts`
- `web/supabase/functions/billing-create-subscription/index.ts`
- `web/supabase/functions/billing-update-plan/index.ts`
- `web/supabase/functions/billing-webhook/index.ts`
- `web/tests/unit/services/api-rate-limit.test.ts`

---

#### Task Group 3: Security Audit Log Table
**Dependencies:** None  
**Roadmap Item:** #3 - Security Audit Log Table

- [ ] 3.0 Complete security audit logging system
  - [ ] 3.1 Write 4-6 focused tests for audit logging
    - Test audit log creation
    - Test audit log querying
    - Test audit log filtering
    - Test audit log retention
  - [ ] 3.2 Create `security_audit_log` table migration
    - Location: `web/supabase/migrations/[timestamp]_create_security_audit_log.sql`
    - Fields: `id`, `user_id`, `salon_id`, `action`, `resource_type`, `resource_id`, `metadata`, `ip_address`, `user_agent`, `created_at`
    - Add indexes: `user_id`, `salon_id`, `action`, `created_at`
    - Add RLS policies (superadmin only access)
  - [ ] 3.3 Create audit logging repository
    - Location: `web/src/lib/repositories/audit-log.ts`
    - Add `createAuditLog()` function
    - Add `getAuditLogsForSalon()` function
    - Add `getAuditLogsForUser()` function
  - [ ] 3.4 Create audit logging service
    - Location: `web/src/lib/services/audit-log-service.ts`
    - Add `logSecurityEvent()` function
    - Add `logAuthEvent()` function
    - Add `logBillingEvent()` function
    - Add `logAdminEvent()` function
  - [ ] 3.5 Integrate audit logging with existing services
    - Update `auth-service.ts` to log login attempts
    - Update `billing-service.ts` to log plan changes
    - Update `admin-service.ts` to log admin actions
    - Update services to log deletions
  - [ ] 3.6 Create audit log query interface (Admin)
    - Location: `web/src/app/admin/audit-logs/page.tsx`
    - Add audit log table view
    - Add filtering by user, action, date
    - Add export functionality
  - [ ] 3.7 Ensure audit logging tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify audit logs are created correctly
    - Verify audit logs are queryable

**Acceptance Criteria:**
- All sensitive operations are logged
- Audit logs are queryable and filterable
- RLS policies prevent unauthorized access
- All audit logging tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_create_security_audit_log.sql`
- `web/src/lib/repositories/audit-log.ts`
- `web/src/lib/services/audit-log-service.ts`
- `web/src/lib/services/auth-service.ts`
- `web/src/lib/services/billing-service.ts`
- `web/src/lib/services/admin-service.ts`
- `web/src/app/admin/audit-logs/page.tsx`
- `web/tests/unit/services/audit-log-service.test.ts`

---

#### Task Group 4: RLS Policy Audit & Verification
**Dependencies:** None  
**Roadmap Item:** #4 - RLS Policy Audit & Verification

- [ ] 4.0 Complete RLS policy audit and verification
  - [ ] 4.1 Write 6-8 focused tests for RLS isolation
    - Test cross-tenant data access prevention
    - Test superadmin access to all data
    - Test user can only access own salon data
    - Test RLS policies on all tenant tables
  - [ ] 4.2 Audit all RLS policies in codebase
    - Review RLS policies for: `bookings`, `customers`, `employees`, `services`, `shifts`, `products`, `salons`, `profiles`
    - Document existing policies
    - Identify any gaps or issues
  - [ ] 4.3 Create RLS test framework
    - Location: `web/tests/integration/rls/`
    - Create test utilities for RLS testing
    - Create test fixtures for multi-tenant scenarios
  - [ ] 4.4 Write integration tests for RLS policies
    - Test each tenant table's RLS policies
    - Test cross-tenant access prevention
    - Test superadmin access
    - Test role-based access within salon
  - [ ] 4.5 Fix any RLS policy issues found
    - Update policies if needed
    - Add missing policies
    - Verify policies work correctly
  - [ ] 4.6 Document RLS policy patterns
    - Location: `web/docs/backend/rls-patterns.md`
    - Document common RLS patterns
    - Document best practices
    - Document testing approach
  - [ ] 4.7 Ensure RLS tests pass
    - Run ONLY the 6-8 tests written in 4.1 and 4.4
    - Verify no cross-tenant data leakage
    - Verify RLS policies work correctly

**Acceptance Criteria:**
- All RLS policies are documented and tested
- No cross-tenant data leakage possible
- Superadmin access works correctly
- All RLS tests pass

**Files to Create/Modify:**
- `web/tests/integration/rls/rls-test-utils.ts`
- `web/tests/integration/rls/bookings-rls.test.ts`
- `web/tests/integration/rls/customers-rls.test.ts`
- `web/tests/integration/rls/employees-rls.test.ts`
- `web/docs/backend/rls-patterns.md`

---

#### Task Group 5: Comprehensive Logging
**Dependencies:** Task Group 3 (audit logging)  
**Roadmap Item:** #5 - Comprehensive Logging

- [ ] 5.0 Complete comprehensive logging coverage
  - [ ] 5.1 Write 4-6 focused tests for logging
    - Test log creation with correlation IDs
    - Test log levels (debug, info, warn, error, security)
    - Test log format consistency
    - Test Sentry integration
  - [ ] 5.2 Audit current logging coverage
    - Review all services for logging
    - Identify missing logging in critical paths
    - Document logging gaps
  - [ ] 5.3 Add correlation ID system
    - Update logger service to generate correlation IDs
    - Add correlation ID to request context
    - Add correlation ID to all log entries
  - [ ] 5.4 Add logging to missing critical paths
    - Add logging to booking creation/updates
    - Add logging to payment processing
    - Add logging to admin operations
    - Add logging to authentication flows
  - [ ] 5.5 Ensure consistent log format
    - Standardize log message format
    - Ensure all logs include: timestamp, level, correlation ID, context
    - Update existing logs to match format
  - [ ] 5.6 Ensure logging tests pass
    - Run ONLY the 4-6 tests written in 5.1
    - Verify logs are created correctly
    - Verify correlation IDs work

**Acceptance Criteria:**
- All critical operations are logged
- Logs include correlation IDs
- Log format is consistent
- All logging tests pass

**Files to Create/Modify:**
- `web/src/lib/services/logger.ts`
- `web/src/lib/services/bookings-service.ts`
- `web/src/lib/services/billing-service.ts`
- `web/src/lib/services/admin-service.ts`
- `web/src/lib/services/auth-service.ts`
- `web/tests/unit/services/logger.test.ts`

---

### Notifications System

#### Task Group 6: Email Notification Service
**Dependencies:** None  
**Roadmap Item:** #6 - Email Notification Service

- [ ] 6.0 Complete email notification service
  - [ ] 6.1 Write 4-6 focused tests for email service
    - Test email sending
    - Test email template rendering
    - Test email delivery status
    - Test email error handling
  - [ ] 6.2 Choose and integrate email provider
    - Research SendGrid vs Postmark
    - Set up email provider account
    - Add email provider SDK
    - Configure environment variables
  - [ ] 6.3 Create email service
    - Location: `web/src/lib/services/email-service.ts`
    - Add `sendEmail()` function
    - Add `sendBookingConfirmation()` function
    - Add `sendBookingReminder()` function
    - Add `sendPaymentFailure()` function
  - [ ] 6.4 Create email templates
    - Location: `web/src/lib/templates/email/`
    - Create booking confirmation template
    - Create booking reminder template
    - Create payment failure template
    - Support i18n in templates
  - [ ] 6.5 Integrate email service with booking system
    - Update booking creation to send confirmation
    - Update booking reminders to send emails
    - Add email sending to booking updates
  - [ ] 6.6 Add email delivery status tracking
    - Create `email_log` table
    - Track email delivery status
    - Add retry logic for failed emails
  - [ ] 6.7 Ensure email service tests pass
    - Run ONLY the 4-6 tests written in 6.1
    - Verify emails are sent correctly
    - Verify templates render correctly

**Acceptance Criteria:**
- Emails are sent for booking confirmations
- Emails are sent for booking reminders
- Email templates support i18n
- Email delivery status is tracked
- All email service tests pass

**Files to Create/Modify:**
- `web/src/lib/services/email-service.ts`
- `web/src/lib/templates/email/booking-confirmation.tsx`
- `web/src/lib/templates/email/booking-reminder.tsx`
- `web/src/lib/templates/email/payment-failure.tsx`
- `web/supabase/migrations/[timestamp]_create_email_log.sql`
- `web/src/lib/repositories/email-log.ts`
- `web/src/lib/services/bookings-service.ts`
- `web/tests/unit/services/email-service.test.ts`

---

#### Task Group 7: Notification Preferences Enforcement
**Dependencies:** Task Group 6 (email service)  
**Roadmap Item:** #7 - Notification Preferences Enforcement

- [ ] 7.0 Complete notification preferences enforcement
  - [ ] 7.1 Write 4-6 focused tests for preference enforcement
    - Test preference checks before sending
    - Test preference updates
    - Test default preferences
    - Test preference inheritance
  - [ ] 7.2 Update notification service to check preferences
    - Location: `web/src/lib/services/notification-service.ts`
    - Add `shouldSendNotification()` function
    - Check preferences before sending emails
    - Check preferences before sending SMS (future)
  - [ ] 7.3 Update notification preferences repository
    - Location: `web/src/lib/repositories/notification-preferences.ts`
    - Add `getPreferencesForSalon()` function
    - Add `updatePreferences()` function
    - Add `getDefaultPreferences()` function
  - [ ] 7.4 Integrate preferences with email service
    - Update email service to check preferences
    - Respect user preferences for email types
    - Add preference checks to all notification sends
  - [ ] 7.5 Update notification preferences UI
    - Location: `web/src/app/settings/notifications/page.tsx`
    - Make preferences functional (currently UI only)
    - Add preference toggles
    - Show preference status
  - [ ] 7.6 Ensure preference enforcement tests pass
    - Run ONLY the 4-6 tests written in 7.1
    - Verify preferences are enforced
    - Verify preferences can be updated

**Acceptance Criteria:**
- Notification preferences are checked before sending
- Preferences can be updated in UI
- Default preferences are applied
- All preference enforcement tests pass

**Files to Create/Modify:**
- `web/src/lib/services/notification-service.ts`
- `web/src/lib/repositories/notification-preferences.ts`
- `web/src/lib/services/email-service.ts`
- `web/src/app/settings/notifications/page.tsx`
- `web/tests/unit/services/notification-service.test.ts`

---

#### Task Group 8: Booking Reminder System
**Dependencies:** Task Group 6 (email service), Task Group 7 (preferences)  
**Roadmap Item:** #8 - Booking Reminder System

- [ ] 8.0 Complete booking reminder system
  - [ ] 8.1 Write 4-6 focused tests for reminder system
    - Test reminder scheduling
    - Test reminder sending (24h and 2h before)
    - Test timezone handling
    - Test reminder cancellation
  - [ ] 8.2 Create reminder scheduling service
    - Location: `web/src/lib/services/reminder-service.ts`
    - Add `scheduleReminder()` function
    - Add `cancelReminder()` function
    - Add `processReminders()` function
  - [ ] 8.3 Create reminder repository
    - Location: `web/src/lib/repositories/reminders.ts`
    - Add `createReminder()` function
    - Add `getRemindersToSend()` function
    - Add `markReminderSent()` function
  - [ ] 8.4 Create `reminders` table migration
    - Location: `web/supabase/migrations/[timestamp]_create_reminders.sql`
    - Fields: `id`, `booking_id`, `reminder_type`, `scheduled_at`, `sent_at`, `status`
    - Add indexes: `booking_id`, `scheduled_at`, `status`
  - [ ] 8.5 Integrate reminders with booking system
    - Update booking creation to schedule reminders
    - Update booking cancellation to cancel reminders
    - Update booking updates to reschedule reminders
  - [ ] 8.6 Create reminder processing Edge Function
    - Location: `web/supabase/functions/process-reminders/index.ts`
    - Cron job to process reminders
    - Send reminders via email service
    - Update reminder status
  - [ ] 8.7 Handle timezone conversions
    - Add timezone handling to reminder service
    - Use salon timezone for reminder scheduling
    - Handle daylight saving time
  - [ ] 8.8 Ensure reminder system tests pass
    - Run ONLY the 4-6 tests written in 8.1
    - Verify reminders are scheduled correctly
    - Verify reminders are sent on time

**Acceptance Criteria:**
- Reminders are scheduled when bookings are created
- Reminders are sent 24h and 2h before appointment
- Timezone conversions work correctly
- Reminders are cancelled when bookings are cancelled
- All reminder system tests pass

**Files to Create/Modify:**
- `web/src/lib/services/reminder-service.ts`
- `web/src/lib/repositories/reminders.ts`
- `web/supabase/migrations/[timestamp]_create_reminders.sql`
- `web/src/lib/services/bookings-service.ts`
- `web/supabase/functions/process-reminders/index.ts`
- `web/tests/unit/services/reminder-service.test.ts`

---

### Billing Improvements

#### Task Group 9: Webhook Signature Verification Testing
**Dependencies:** None  
**Roadmap Item:** #9 - Webhook Signature Verification Testing

- [ ] 9.0 Complete webhook signature verification testing
  - [ ] 9.1 Write 6-8 focused tests for webhook verification
    - Test valid signature acceptance
    - Test invalid signature rejection
    - Test webhook replay attack prevention
    - Test missing signature handling
  - [ ] 9.2 Review current webhook implementation
    - Location: `web/supabase/functions/billing-webhook/index.ts`
    - Verify signature verification is implemented
    - Document current implementation
  - [ ] 9.3 Add comprehensive webhook tests
    - Test all webhook event types
    - Test signature verification for each event
    - Test error handling
  - [ ] 9.4 Test webhook replay attacks
    - Verify webhook cannot be replayed
    - Add timestamp validation
    - Add nonce validation if needed
  - [ ] 9.5 Document webhook security
    - Location: `web/docs/integrations/stripe/webhook-security.md`
    - Document signature verification
    - Document security best practices
    - Document testing approach
  - [ ] 9.6 Ensure webhook tests pass
    - Run ONLY the 6-8 tests written in 9.1
    - Verify signature verification works
    - Verify replay attacks are prevented

**Acceptance Criteria:**
- Webhook signature verification is tested
- Invalid signatures are rejected
- Replay attacks are prevented
- All webhook tests pass

**Files to Create/Modify:**
- `web/supabase/functions/billing-webhook/index.ts`
- `web/tests/integration/billing/webhook-verification.test.ts`
- `web/docs/integrations/stripe/webhook-security.md`

---

#### Task Group 10: Payment Failure Handling
**Dependencies:** Task Group 6 (email service)  
**Roadmap Item:** #10 - Payment Failure Handling

- [ ] 10.0 Complete payment failure handling improvements
  - [ ] 10.1 Write 4-6 focused tests for payment failure handling
    - Test retry logic
    - Test grace period
    - Test email notifications
    - Test access restriction
  - [ ] 10.2 Implement retry logic for failed payments
    - Location: `web/src/lib/services/billing-service.ts`
    - Add `retryFailedPayment()` function
    - Add retry scheduling
    - Add max retry attempts
  - [ ] 10.3 Add grace period before access restriction
    - Update billing service to check grace period
    - Add grace period configuration
    - Add grace period warnings
  - [ ] 10.4 Send email notifications for payment failures
    - Integrate with email service
    - Send payment failure email
    - Send payment retry email
    - Send access restriction warning email
  - [ ] 10.5 Update UI to show payment status
    - Location: `web/src/app/settings/billing/page.tsx`
    - Show payment status
    - Show grace period countdown
    - Show retry attempts
  - [ ] 10.6 Ensure payment failure tests pass
    - Run ONLY the 4-6 tests written in 10.1
    - Verify retry logic works
    - Verify grace period works
    - Verify emails are sent

**Acceptance Criteria:**
- Failed payments are retried automatically
- Grace period prevents immediate access restriction
- Payment failure emails are sent
- UI shows payment status clearly
- All payment failure tests pass

**Files to Create/Modify:**
- `web/src/lib/services/billing-service.ts`
- `web/src/lib/services/email-service.ts`
- `web/src/app/settings/billing/page.tsx`
- `web/tests/unit/services/billing-service.test.ts`

---

#### Task Group 11: Plan Limits Enforcement Verification
**Dependencies:** None  
**Roadmap Item:** #11 - Plan Limits Enforcement Verification

- [ ] 11.0 Complete plan limits enforcement verification
  - [ ] 11.1 Write 6-8 focused tests for plan limits
    - Test employee limit enforcement
    - Test language limit enforcement
    - Test feature limit enforcement
    - Test limit warnings
  - [ ] 11.2 Audit all plan limit checks
    - Review `plan-limits-service.ts`
    - Review all services that check limits
    - Document all limit checks
    - Identify any gaps
  - [ ] 11.3 Fix any edge cases in limit enforcement
    - Fix limit checks that may have edge cases
    - Add limit checks where missing
    - Ensure limits are enforced consistently
  - [ ] 11.4 Add comprehensive tests for all limits
    - Test each plan's limits
    - Test limit enforcement at creation
    - Test limit enforcement at update
    - Test limit warnings
  - [ ] 11.5 Update UI to show limit warnings
    - Location: `web/src/components/limit-warning.tsx`
    - Show limit warnings when approaching limits
    - Show upgrade prompts when limits reached
    - Add limit indicators to relevant pages
  - [ ] 11.6 Ensure plan limit tests pass
    - Run ONLY the 6-8 tests written in 11.1
    - Verify all limits are enforced
    - Verify limit warnings work

**Acceptance Criteria:**
- All plan limits are enforced consistently
- Limit warnings are shown to users
- Upgrade prompts appear when limits are reached
- All plan limit tests pass

**Files to Create/Modify:**
- `web/src/lib/services/plan-limits-service.ts`
- `web/src/lib/services/employees-service.ts`
- `web/src/lib/services/salons-service.ts`
- `web/src/components/limit-warning.tsx`
- `web/tests/unit/services/plan-limits-service.test.ts`

---

### Testing Improvements

#### Task Group 12: Unit Test Coverage Improvement
**Dependencies:** None (can be done in parallel)  
**Roadmap Item:** #12 - Unit Test Coverage Improvement

- [ ] 12.0 Complete unit test coverage improvement
  - [ ] 12.1 Identify gaps in current coverage
    - Review existing test files
    - Identify services without tests
    - Identify repository functions without tests
    - Document coverage gaps
  - [ ] 12.2 Add tests for all service functions
    - Add tests for `shifts-service.ts`
    - Add tests for `products-service.ts`
    - Add tests for `reports-service.ts`
    - Add tests for `salons-service.ts`
    - Add tests for `profiles-service.ts`
  - [ ] 12.3 Add tests for all repository functions
    - Add tests for `shifts.ts` repository
    - Add tests for `products.ts` repository
    - Add tests for `reports.ts` repository
    - Add tests for `salons.ts` repository
  - [ ] 12.4 Add tests for edge cases and error handling
    - Test error scenarios
    - Test boundary conditions
    - Test validation failures
  - [ ] 12.5 Achieve 80% unit test coverage
    - Run coverage report
    - Fill remaining gaps
    - Verify 80% coverage achieved

**Acceptance Criteria:**
- All service functions have tests
- All repository functions have tests
- Edge cases are tested
- 80% unit test coverage achieved

**Files to Create/Modify:**
- `web/tests/unit/services/shifts-service.test.ts`
- `web/tests/unit/services/products-service.test.ts`
- `web/tests/unit/services/reports-service.test.ts`
- `web/tests/unit/services/salons-service.test.ts`
- `web/tests/unit/repositories/shifts.test.ts`
- `web/tests/unit/repositories/products.test.ts`
- `web/tests/unit/repositories/reports.test.ts`

---

#### Task Group 13: E2E Test Coverage for Critical Flows
**Dependencies:** None (can be done in parallel)  
**Roadmap Item:** #13 - E2E Test Coverage for Critical Flows

- [ ] 13.0 Complete E2E test coverage for critical flows
  - [ ] 13.1 Identify critical user journeys
    - Booking flow (public booking)
    - Onboarding flow
    - Billing flows (subscription, plan change)
    - Admin operations
    - Settings changes
  - [ ] 13.2 Add E2E tests for booking flow
    - Location: `web/tests/e2e/booking-flow.spec.ts`
    - Test service selection
    - Test employee selection
    - Test time slot selection
    - Test booking confirmation
  - [ ] 13.3 Add E2E tests for billing flows
    - Location: `web/tests/e2e/billing-flow.spec.ts`
    - Test subscription creation
    - Test plan upgrade
    - Test plan downgrade
    - Test payment failure handling
  - [ ] 13.4 Add E2E tests for admin operations
    - Location: `web/tests/e2e/admin-operations.spec.ts`
    - Test salon management
    - Test user management
    - Test plan changes
  - [ ] 13.5 Add E2E tests for settings changes
    - Location: `web/tests/e2e/settings-changes.spec.ts`
    - Test general settings updates
    - Test notification preferences
    - Test security settings (2FA)
  - [ ] 13.6 Achieve 100% coverage for critical flows
    - Run E2E test suite
    - Verify all critical flows are tested
    - Fix any failing tests

**Acceptance Criteria:**
- All critical user journeys have E2E tests
- E2E tests cover happy paths and error cases
- 100% coverage for critical flows achieved
- All E2E tests pass

**Files to Create/Modify:**
- `web/tests/e2e/booking-flow.spec.ts`
- `web/tests/e2e/billing-flow.spec.ts`
- `web/tests/e2e/admin-operations.spec.ts`
- `web/tests/e2e/settings-changes.spec.ts`

---

#### Task Group 14: Integration Tests for Repositories
**Dependencies:** Task Group 4 (RLS tests)  
**Roadmap Item:** #14 - Integration Tests for Repositories

- [ ] 14.0 Complete integration tests for repositories
  - [ ] 14.1 Set up test Supabase instance
    - Configure test environment
    - Set up test database
    - Create test data fixtures
  - [ ] 14.2 Write 6-8 focused integration tests
    - Test repository + Supabase interactions
    - Test RLS policies in integration tests
    - Test error handling
    - Test data transformations
  - [ ] 14.3 Add integration tests for all repositories
    - Test `bookings.ts` repository
    - Test `customers.ts` repository
    - Test `employees.ts` repository
    - Test `services.ts` repository
    - Test `shifts.ts` repository
  - [ ] 14.4 Add cleanup procedures
    - Clean up test data after each test
    - Reset test database state
    - Handle test isolation
  - [ ] 14.5 Ensure integration tests pass
    - Run ONLY the 6-8 tests written in 14.2
    - Verify repositories work with Supabase
    - Verify RLS policies work in integration tests

**Acceptance Criteria:**
- All repositories have integration tests
- RLS policies are tested in integration tests
- Test data is cleaned up properly
- All integration tests pass

**Files to Create/Modify:**
- `web/tests/integration/repositories/bookings.test.ts`
- `web/tests/integration/repositories/customers.test.ts`
- `web/tests/integration/repositories/employees.test.ts`
- `web/tests/integration/repositories/services.test.ts`
- `web/tests/integration/repositories/shifts.test.ts`
- `web/tests/integration/setup.ts`

---

### Monitoring & Observability

#### Task Group 15: Audit Trail Table
**Dependencies:** Task Group 3 (security audit log)  
**Roadmap Item:** #15 - Audit Trail Table

- [ ] 15.0 Complete audit trail table
  - [ ] 15.1 Write 4-6 focused tests for audit trail
    - Test audit log creation
    - Test audit log querying
    - Test audit log filtering
    - Test audit log retention
  - [ ] 15.2 Create `audit_log` table migration
    - Location: `web/supabase/migrations/[timestamp]_create_audit_log.sql`
    - Fields: `id`, `user_id`, `salon_id`, `action`, `resource_type`, `resource_id`, `metadata`, `ip_address`, `user_agent`, `created_at`
    - Add indexes: `user_id`, `salon_id`, `action`, `resource_type`, `created_at`
    - Add RLS policies (superadmin only access)
  - [ ] 15.3 Create audit trail repository
    - Location: `web/src/lib/repositories/audit-trail.ts`
    - Add `createAuditLog()` function
    - Add `getAuditLogsForSalon()` function
    - Add `getAuditLogsForResource()` function
  - [ ] 15.4 Create audit trail service
    - Location: `web/src/lib/services/audit-trail-service.ts`
    - Add `logAction()` function
    - Add comprehensive logging for all operations
  - [ ] 15.5 Integrate audit trail with all services
    - Update all services to log to audit trail
    - Log all CRUD operations
    - Log all sensitive operations
  - [ ] 15.6 Create audit trail query interface
    - Location: `web/src/app/admin/audit-trail/page.tsx`
    - Add audit trail table view
    - Add filtering and search
    - Add export functionality
  - [ ] 15.7 Ensure audit trail tests pass
    - Run ONLY the 4-6 tests written in 15.1
    - Verify audit logs are created correctly
    - Verify audit logs are queryable

**Acceptance Criteria:**
- All operations are logged to audit trail
- Audit trail is queryable and filterable
- RLS policies prevent unauthorized access
- All audit trail tests pass

**Files to Create/Modify:**
- `web/supabase/migrations/[timestamp]_create_audit_log.sql`
- `web/src/lib/repositories/audit-trail.ts`
- `web/src/lib/services/audit-trail-service.ts`
- `web/src/app/admin/audit-trail/page.tsx`
- `web/tests/unit/services/audit-trail-service.test.ts`

---

#### Task Group 16: Error Tracking Improvements
**Dependencies:** Task Group 5 (comprehensive logging)  
**Roadmap Item:** #16 - Error Tracking Improvements

- [ ] 16.0 Complete error tracking improvements
  - [ ] 16.1 Write 4-6 focused tests for error tracking
    - Test error boundary behavior
    - Test Sentry error reporting
    - Test error context
    - Test error alerting
  - [ ] 16.2 Audit current error tracking
    - Review Sentry configuration
    - Identify missing error boundaries
    - Document error tracking gaps
  - [ ] 16.3 Add error boundaries to missing areas
    - Add error boundaries to admin pages
    - Add error boundaries to settings pages
    - Add error boundaries to booking pages
  - [ ] 16.4 Configure Sentry performance monitoring
    - Enable Sentry performance monitoring
    - Add performance tracking to critical paths
    - Set up performance alerts
  - [ ] 16.5 Add custom error contexts
    - Add user context to errors
    - Add salon context to errors
    - Add request context to errors
  - [ ] 16.6 Set up error alerting
    - Configure Sentry alerts
    - Set up email notifications for critical errors
    - Set up Slack notifications (optional)
  - [ ] 16.7 Ensure error tracking tests pass
    - Run ONLY the 4-6 tests written in 16.1
    - Verify errors are tracked correctly
    - Verify error alerts work

**Acceptance Criteria:**
- All critical areas have error boundaries
- Sentry performance monitoring is enabled
- Error contexts are comprehensive
- Error alerts are configured
- All error tracking tests pass

**Files to Create/Modify:**
- `web/src/components/error-boundary.tsx`
- `web/src/app/admin/**/error-boundary.tsx`
- `web/src/app/settings/**/error-boundary.tsx`
- `web/sentry.client.config.ts`
- `web/sentry.server.config.ts`
- `web/tests/unit/services/error-tracking.test.ts`

---

## Execution Order

Recommended implementation sequence (considering dependencies):

1. **Week 1:** Infrastructure & Security (Tasks 1-5)
   - Task Group 1: Server-Side Rate Limiting
   - Task Group 2: API Rate Limiting (parallel)
   - Task Group 3: Security Audit Log Table
   - Task Group 4: RLS Policy Audit & Verification
   - Task Group 5: Comprehensive Logging

2. **Week 2:** Notifications System (Tasks 6-8)
   - Task Group 6: Email Notification Service
   - Task Group 7: Notification Preferences Enforcement
   - Task Group 8: Booking Reminder System

3. **Week 3:** Billing & Testing (Tasks 9-14)
   - Task Group 9: Webhook Signature Verification Testing
   - Task Group 10: Payment Failure Handling
   - Task Group 11: Plan Limits Enforcement Verification
   - Task Group 12: Unit Test Coverage Improvement (parallel)
   - Task Group 13: E2E Test Coverage (parallel)
   - Task Group 14: Integration Tests (parallel)

4. **Week 4:** Monitoring & Finalization (Tasks 15-16)
   - Task Group 15: Audit Trail Table
   - Task Group 16: Error Tracking Improvements

---

## Notes

- **Parallel Work:** Many tasks can be worked on in parallel (e.g., rate limiting tasks, testing tasks)
- **Testing First:** Always write tests before or alongside implementation
- **Incremental Delivery:** Break large tasks into smaller, deliverable increments
- **Documentation:** Update documentation as you implement features
- **Follow TeqBook Standards:** UI → Services → Repositories → Supabase (no direct Supabase in UI)

---

## Acceptance Criteria Summary

- All security improvements are implemented and tested
- Notification system is fully functional
- Billing improvements are tested and verified
- Test coverage meets targets (80% unit, 100% critical E2E)
- All monitoring and observability features are in place
- All tasks follow TeqBook architecture standards

