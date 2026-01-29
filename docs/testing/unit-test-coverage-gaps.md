# Unit Test Coverage Gaps

**Date:** 2025-01-14  
**Task Group:** 12 - Unit Test Coverage Improvement

## Overview

This document identifies gaps in unit test coverage for services and repositories.

---

## Current Test Coverage

### Services with Tests ✅

1. ✅ `billing-service.ts` - Payment failure handling, subscription management
2. ✅ `bookings-service.ts` - Booking operations
3. ✅ `customers-service.ts` - Customer management
4. ✅ `email-service.ts` - Email notifications
5. ✅ `employees-service.ts` - Employee management
6. ✅ `logger.ts` - Logging utilities
7. ✅ `notification-service.ts` - Notification preferences
8. ✅ `plan-limits-service.ts` - Plan limit enforcement
9. ✅ `rate-limit-service.ts` - Rate limiting
10. ✅ `reminder-service.ts` - Booking reminders
11. ✅ `audit-log-service.ts` - Audit logging

### Services without Tests ❌

1. ❌ `admin-service.ts` - Admin operations (plan updates, salon management)
2. ❌ `auth-service.ts` - Authentication (login, logout, password reset)
3. ❌ `export-service.ts` - Data export functionality
4. ❌ `feature-flags-service.ts` - Feature flag checking
5. ❌ `onboarding-service.ts` - Onboarding flow
6. ❌ `products-service.ts` - Product management
7. ❌ `profiles-service.ts` - User profile management
8. ❌ `reports-service.ts` - Report generation
9. ❌ `salons-service.ts` - Salon management
10. ❌ `search-service.ts` - Search functionality
11. ❌ `services-service.ts` - Service management
12. ❌ `session-service.ts` - Session management
13. ❌ `shifts-service.ts` - Shift management
14. ❌ `storage-service.ts` - File storage
15. ❌ `two-factor-service.ts` - 2FA functionality

---

## Repositories

### Repositories with Tests ✅

1. ✅ `bookings.ts` - Booking repository

### Repositories without Tests ❌

1. ❌ `addons.ts` - Addon management
2. ❌ `admin.ts` - Admin repository
3. ❌ `audit-log.ts` - Audit log repository
4. ❌ `customers.ts` - Customer repository
5. ❌ `email-log.ts` - Email log repository
6. ❌ `employees.ts` - Employee repository
7. ❌ `features.ts` - Feature repository
8. ❌ `opening-hours.ts` - Opening hours repository
9. ❌ `products.ts` - Product repository
10. ❌ `profiles.ts` - Profile repository
11. ❌ `reminders.ts` - Reminder repository
12. ❌ `reports.ts` - Report repository
13. ❌ `salons.ts` - Salon repository
14. ❌ `search.ts` - Search repository
15. ❌ `services.ts` - Service repository
16. ❌ `shifts.ts` - Shift repository

---

## Priority for Testing

### High Priority (Critical Business Logic)

1. **`salons-service.ts`** - Core salon management, language limits
2. **`shifts-service.ts`** - Shift scheduling and management
3. **`products-service.ts`** - Product/inventory management
4. **`services-service.ts`** - Service management
5. **`reports-service.ts`** - Business reporting

### Medium Priority (Important Features)

6. **`profiles-service.ts`** - User profile management
7. **`onboarding-service.ts`** - User onboarding
8. **`feature-flags-service.ts`** - Feature access control
9. **`auth-service.ts`** - Authentication (if not covered by E2E)

### Lower Priority (Supporting Features)

10. **`admin-service.ts`** - Admin operations (may be covered by E2E)
11. **`export-service.ts`** - Data export
12. **`search-service.ts`** - Search functionality
13. **`storage-service.ts`** - File storage
14. **`session-service.ts`** - Session management
15. **`two-factor-service.ts`** - 2FA (if implemented)

---

## Repository Testing Priority

### High Priority

1. **`salons.ts`** - Core salon data access
2. **`employees.ts`** - Employee data access
3. **`services.ts`** - Service data access
4. **`shifts.ts`** - Shift data access
5. **`products.ts`** - Product data access

### Medium Priority

6. **`customers.ts`** - Customer data access
7. **`profiles.ts`** - Profile data access
8. **`reports.ts`** - Report data access

### Lower Priority

9. **`addons.ts`** - Addon data access
10. **`features.ts`** - Feature data access
11. **`reminders.ts`** - Reminder data access
12. **`opening-hours.ts`** - Opening hours data access
13. **`email-log.ts`** - Email log data access
14. **`audit-log.ts`** - Audit log data access
15. **`admin.ts`** - Admin data access
16. **`search.ts`** - Search data access

---

## Test Coverage Estimate

### Current Coverage

- **Services:** ~11/26 (42%)
- **Repositories:** ~1/17 (6%)
- **Overall:** ~12/43 (28%)

### Target Coverage

- **Services:** 26/26 (100%)
- **Repositories:** 17/17 (100%)
- **Overall:** 43/43 (100%)
- **Minimum:** 80% overall coverage

---

## Next Steps

1. ✅ Task 12.1: Identify gaps - **COMPLETED**
2. ⏳ Task 12.2: Add tests for high-priority services
3. ⏳ Task 12.3: Add tests for high-priority repositories
4. ⏳ Task 12.4: Add edge case tests
5. ⏳ Task 12.5: Achieve 80% coverage

---

## Notes

- Some services may be better tested via E2E tests (e.g., `auth-service.ts`, `onboarding-service.ts`)
- Focus on business logic and error handling in unit tests
- Repository tests should verify data transformations and error handling
- Integration tests (Task Group 14) will cover repository + Supabase interactions
