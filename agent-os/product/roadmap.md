# TeqBook – Product Roadmap

**Last Updated:** 2025-01-XX  
**Current Version:** 2.0  
**Status:** Production Ready (with improvements needed)

---

## Roadmap Overview

This roadmap is organized by timeframes and prioritized by:
1. **Production readiness** (security, stability, compliance)
2. **Critical gaps** (notifications, testing, monitoring)
3. **User value** (features that directly improve user experience)
4. **Technical debt** (code quality, architecture improvements)

---

## 🚀 Next Iteration (0-4 Weeks)

**Goal:** Production hardening, critical security improvements, and notification system

**Priority:** 🔴 Critical for production scale

### Security & Production Hardening

1. [ ] **Server-Side Rate Limiting** — Implement server-side rate limiting in Edge Functions for login and API endpoints to prevent brute force attacks `M`
   - Create Edge Function for rate limiting
   - Integrate with login endpoint
   - Add rate limiting to critical API endpoints
   - Add tests for rate limiting behavior

2. [ ] **API Rate Limiting** — Add rate limiting to all Edge Functions and API endpoints to prevent abuse `M`
   - Create rate limiting middleware for Edge Functions
   - Apply to all public-facing endpoints
   - Configure limits per endpoint type
   - Add monitoring and alerts

3. [ ] **Security Audit Log Table** — Create `security_audit_log` table and log all sensitive operations (logins, plan changes, deletions) `S`
   - Create database table with proper indexes
   - Add audit logging service
   - Integrate with existing services (auth, billing, admin)
   - Add query interface for audit logs

4. [ ] **RLS Policy Audit & Verification** — Audit all RLS policies, verify multi-tenant isolation, and add tests `S`
   - Review all RLS policies in codebase
   - Create test suite for RLS isolation
   - Verify no cross-tenant data leakage possible
   - Document RLS policy patterns

5. [ ] **Comprehensive Logging** — Add structured logging to all critical operations (bookings, payments, auth, admin actions) `M`
   - Audit current logging coverage
   - Add logging to missing critical paths
   - Ensure consistent log format
   - Add correlation IDs for request tracking

### Notifications System

6. [ ] **Email Notification Service** — Integrate email provider (SendGrid/Postmark) and implement email sending service `L`
   - Choose and integrate email provider
   - Create email service with templates
   - Implement booking confirmation emails
   - Implement booking reminder emails
   - Add email delivery status tracking

7. [ ] **Notification Preferences Enforcement** — Make notification preferences functional and enforce them in notification service `S`
   - Connect notification preferences to notification service
   - Add preference checks before sending
   - Update UI to reflect actual preferences
   - Add tests for preference enforcement

8. [ ] **Booking Reminder System** — Implement automated booking reminders (24h and 2h before appointment) `M`
   - Create reminder scheduling service
   - Integrate with booking system
   - Add reminder templates
   - Handle timezone conversions
   - Add tests for reminder logic

### Billing Improvements

9. [ ] **Webhook Signature Verification Testing** — Thoroughly test and verify Stripe webhook signature verification `S`
   - Add tests for webhook signature verification
   - Test invalid signature rejection
   - Test webhook replay attacks
   - Document webhook security

10. [ ] **Payment Failure Handling** — Improve payment failure handling with retry logic, grace period, and notifications `M`
    - Implement retry logic for failed payments
    - Add grace period before access restriction
    - Send email notifications for payment failures
    - Update UI to show payment status
    - Add tests for failure scenarios

11. [ ] **Plan Limits Enforcement Verification** — Verify and fix plan limits enforcement across all features `M`
    - Audit all plan limit checks
    - Fix any edge cases
    - Add comprehensive tests
    - Update UI to show limit warnings

### Testing Improvements

12. [ ] **Unit Test Coverage Improvement** — Increase unit test coverage from 60% to 80% for services and repositories `L`
    - Identify gaps in current coverage
    - Add tests for all service functions
    - Add tests for all repository functions
    - Add tests for edge cases and error handling

13. [ ] **E2E Test Coverage for Critical Flows** — Achieve 100% coverage for critical user journeys (booking, onboarding, billing) `M`
    - Add E2E tests for booking flow
    - Add E2E tests for billing flows
    - Add E2E tests for admin operations
    - Add E2E tests for settings changes

14. [ ] **Integration Tests for Repositories** — Add integration tests for repository + Supabase interactions `M`
    - Set up test Supabase instance
    - Add tests for all repository functions
    - Test RLS policies in integration tests
    - Add cleanup procedures

### Monitoring & Observability

15. [ ] **Audit Trail Table** — Create `audit_log` table for comprehensive audit trail of all sensitive operations `M`
    - Design audit log schema
    - Create database table with indexes
    - Add audit logging service
    - Integrate with existing services
    - Add query interface for audit logs

16. [ ] **Error Tracking Improvements** — Improve Sentry error tracking coverage and add performance monitoring `S`
    - Audit current error tracking
    - Add error boundaries to missing areas
    - Configure Sentry performance monitoring
    - Add custom error contexts
    - Set up error alerting

---

## 📅 Short-term (1-3 Months)

**Goal:** Feature completeness, advanced functionality, and scalability improvements

### Advanced Features

17. [ ] **SMS Notification Integration** — Integrate SMS provider (Twilio) for booking reminders and notifications `M`
    - Choose and integrate SMS provider
    - Create SMS service
    - Implement SMS templates
    - Add SMS delivery status tracking
    - Integrate with notification preferences

18. [ ] **WhatsApp Business API Integration** — Integrate WhatsApp Business API for customer communication `L`
    - Set up WhatsApp Business API
    - Create WhatsApp service
    - Implement message templates
    - Add two-way messaging support
    - Integrate with booking system

19. [ ] **Customer Booking History** — Implement comprehensive customer booking history view (Business plan feature) `M`
    - Create booking history query
    - Add customer history page
    - Add filtering and search
    - Add statistics and trends
    - Add export functionality

20. [ ] **Advanced Role Permissions** — Implement granular role permissions system (Business plan feature) `L`
    - Design permission system
    - Create permissions table
    - Update RBAC to use permissions
    - Add permission management UI
    - Add tests for permission system

### Performance & Scalability

21. [ ] **Performance Monitoring** — Add performance monitoring (Sentry Performance or custom) to identify bottlenecks `M`
    - Set up performance monitoring
    - Add performance tracking to critical paths
    - Create performance dashboards
    - Set up performance alerts
    - Document performance targets

22. [ ] **Database Query Optimization** — Optimize slow queries, add missing indexes, and improve RLS query performance `M`
    - Identify slow queries
    - Add database indexes
    - Optimize RLS policies
    - Add query performance monitoring
    - Document query patterns

23. [ ] **Caching Strategy** — Implement caching for frequently accessed data (features, plans, salon settings) `M`
    - Design caching strategy
    - Implement cache layer
    - Add cache invalidation logic
    - Add cache monitoring
    - Document caching patterns

### Testing & Quality

24. [ ] **Component Tests** — Add React Testing Library and test critical UI components `M`
    - Set up React Testing Library
    - Add component tests for critical components
    - Test user interactions
    - Test error states
    - Add visual regression tests (optional)

25. [ ] **RLS Policy Tests** — Add comprehensive tests for RLS policies to ensure multi-tenant isolation `S`
    - Create RLS test framework
    - Add tests for all RLS policies
    - Test cross-tenant access prevention
    - Test superadmin access
    - Document RLS test patterns

### Developer Experience

26. [ ] **API Documentation** — Create OpenAPI/Swagger documentation for all Edge Functions and API endpoints `M`
    - Document all Edge Functions
    - Create OpenAPI spec
    - Add API documentation site
    - Add code examples
    - Add authentication documentation

27. [ ] **Type Safety Improvements** — Improve type safety across codebase, eliminate any types, add stricter checks `M`
    - Audit for `any` types
    - Add stricter TypeScript config
    - Improve type definitions
    - Add runtime type validation
    - Document type patterns

---

## 🔮 Medium-term (3-6 Months)

**Goal:** Advanced features, integrations, and platform expansion

### Integrations

28. [ ] **Google Calendar Sync** — Integrate Google Calendar for two-way sync of bookings `L`
    - Set up Google Calendar API
    - Implement sync service
    - Add sync settings UI
    - Handle conflicts and errors
    - Add tests for sync logic

29. [ ] **Outlook Calendar Sync** — Integrate Outlook Calendar for two-way sync of bookings `L`
    - Set up Microsoft Graph API
    - Implement sync service
    - Add sync settings UI
    - Handle conflicts and errors
    - Add tests for sync logic

30. [ ] **POS Integration** — Integrate with POS systems for payment processing (optional, if needed) `XL`
    - Research POS integration options
    - Design integration architecture
    - Implement POS connector
    - Add payment reconciliation
    - Add tests for POS integration

### Advanced Reporting

31. [ ] **Revenue Forecasting** — Implement revenue forecasting based on historical data and trends `M`
    - Design forecasting algorithm
    - Implement forecasting service
    - Add forecasting UI
    - Add forecast accuracy tracking
    - Add tests for forecasting logic

32. [ ] **Customer Lifetime Value** — Calculate and display customer lifetime value metrics `M`
    - Design CLV calculation
    - Implement CLV service
    - Add CLV to customer profiles
    - Add CLV reports
    - Add tests for CLV calculations

33. [ ] **Employee Performance Metrics** — Add employee performance tracking (bookings, revenue, customer satisfaction) `M`
    - Design performance metrics
    - Implement metrics calculation
    - Add performance dashboard
    - Add performance reports
    - Add tests for metrics calculations

### Mobile App

34. [ ] **Mobile App Planning** — Research and plan native mobile apps (iOS and Android) `M`
    - Research mobile app frameworks
    - Design mobile app architecture
    - Create mobile app roadmap
    - Plan API requirements
    - Document mobile app strategy

35. [ ] **Push Notifications** — Implement push notification infrastructure for future mobile apps `M`
    - Set up push notification service
    - Design notification system
    - Implement notification delivery
    - Add notification preferences
    - Add tests for push notifications

### Multi-Salon Features

36. [ ] **Multi-Salon Owner Dashboard** — Create cross-salon dashboard for owners with multiple salons `L`
    - Design multi-salon dashboard
    - Implement salon switching
    - Add cross-salon analytics
    - Add shared templates
    - Add tests for multi-salon features

37. [ ] **Shared Staff Templates** — Allow sharing staff/service templates across salons `M`
    - Design template system
    - Implement template sharing
    - Add template management UI
    - Add template import/export
    - Add tests for template system

---

## 📊 Roadmap Summary

### Next Iteration (0-4 Weeks)
- **Total Tasks:** 16
- **Estimated Effort:** ~12-14 weeks (with parallel work)
- **Focus:** Production hardening, security, notifications, testing

### Short-term (1-3 Months)
- **Total Tasks:** 11
- **Estimated Effort:** ~10-12 weeks
- **Focus:** Advanced features, performance, quality

### Medium-term (3-6 Months)
- **Total Tasks:** 10
- **Estimated Effort:** ~15-20 weeks
- **Focus:** Integrations, mobile, advanced features

### Total Roadmap
- **Total Tasks:** 37
- **Estimated Total Effort:** ~37-46 weeks (9-11 months)

---

## Effort Scale

- `XS`: 1 day
- `S`: 2-3 days
- `M`: 1 week
- `L`: 2 weeks
- `XL`: 3+ weeks

---

## Priority Legend

- 🔴 **Critical** — Must fix before production scale
- 🟡 **High** — Should fix soon
- 🟢 **Medium** — Nice to have
- 🔵 **Low** — Future consideration

---

## Notes

- **Next Iteration Focus:** The next 4 weeks should focus on production hardening, security improvements, and the notification system. These are critical for scaling.
- **Parallel Work:** Many tasks can be worked on in parallel (e.g., server-side rate limiting and API rate limiting can be done together).
- **Testing First:** Always write tests before or alongside implementation.
- **Incremental Delivery:** Break large tasks into smaller, deliverable increments.
- **Documentation:** Update documentation as you implement features.

---

## Next Steps

1. ✅ Review and approve roadmap
2. ✅ Run `create-tasks.md` to convert "Next Iteration" tasks to detailed task breakdown
3. ✅ Run `implement-tasks.md` to start implementing tasks one by one
4. ✅ Update roadmap as tasks are completed
5. ✅ Reassess priorities monthly

