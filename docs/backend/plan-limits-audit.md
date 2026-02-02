# Plan Limits Enforcement Audit

**Date:** 2025-01-14  
**Task Group:** 11 - Plan Limits Enforcement Verification

## Overview

This document audits all plan limit checks in the codebase to ensure consistent enforcement and identify any gaps.

---

## Plan Limits Configuration

### Plan Types and Limits

| Plan | Employees | Languages |
|------|-----------|-----------|
| Starter | 2 | 2 |
| Pro | 5 | 5 |
| Business | Unlimited | Unlimited |

### Addons

- `extra_staff`: Adds additional employee slots
- `extra_languages`: Adds additional language slots

---

## Current Implementation

### 1. Plan Limits Service (`plan-limits-service.ts`)

**Functions:**
- ✅ `getPlanLimits(plan)` - Returns base limits for a plan
- ✅ `getEffectiveLimit(salonId, plan, limitType)` - Returns limit including addons
- ✅ `canAddEmployee(salonId, plan)` - Checks if salon can add more employees
- ✅ `canAddLanguage(salonId, plan, currentLanguages)` - Checks if salon can add more languages

**Status:** ✅ Fully implemented

---

### 2. Employee Limit Enforcement

**Location:** `apps/dashboard/src/lib/services/employees-service.ts`

**Implementation:**
- ✅ `createEmployee()` checks `canAddEmployee()` before creating
- ✅ Returns `limitReached: true` when limit is exceeded
- ✅ Error message includes current count and limit

**Status:** ✅ Fully enforced

**Edge Cases:**
- ⚠️ No check when updating employee (should be fine, update doesn't add new employees)
- ⚠️ No check when reactivating inactive employees (could bypass limit)

---

### 3. Language Limit Enforcement

**Location:** `apps/dashboard/src/lib/services/salons-service.ts`

**Implementation:**
- ✅ `updateSalonSettings()` checks `canAddLanguage()` when updating `supported_languages`
- ✅ Returns `limitReached: true` when limit is exceeded
- ✅ Error message includes current count and limit
- ✅ Allows saving same number of languages (e.g., 5/5) - Fixed in recent update

**Status:** ✅ Fully enforced

**Edge Cases:**
- ✅ Fixed: Previously blocked saving 5/5 languages, now allows it

---

### 4. Feature Limits

**Location:** `apps/dashboard/src/lib/services/feature-flags-service.ts`

**Implementation:**
- ✅ `getFeatureLimit(salonId, featureKey)` - Returns limit for a specific feature
- ✅ `hasFeatureAccess(salonId, featureKey)` - Checks if salon has access to feature

**Status:** ✅ Implemented, but not actively enforced in all places

**Gaps:**
- ⚠️ Feature limits are not checked when creating resources (e.g., products, services)
- ⚠️ No UI warnings for feature limits

---

## UI Implementation

### Current State

1. **Settings → General (`settings/general/page.tsx`)**
   - ✅ Shows error message when language limit is reached
   - ⚠️ Has TODO comment for upgrade modal
   - ⚠️ No warning before reaching limit

2. **Employees Page (`employees/page.tsx`)**
   - ⚠️ No limit warning shown before creating employee
   - ⚠️ Only shows error after attempting to create when limit is reached

3. **No Limit Indicators**
   - ⚠️ No visual indicators showing current usage vs limit
   - ⚠️ No warnings when approaching limit (e.g., 4/5 employees)

---

## Identified Gaps

### 1. Missing Limit Checks

- ⚠️ **Reactivating inactive employees** - Could bypass limit if employee is deactivated and reactivated
- ⚠️ **Feature limits** - Not enforced when creating products, services, etc.

### 2. Missing UI Components

- ⚠️ **Limit warning component** - No reusable component for showing limit warnings
- ⚠️ **Upgrade prompt component** - No component for prompting upgrades
- ⚠️ **Limit indicators** - No visual indicators on relevant pages

### 3. Edge Cases

- ⚠️ **Employee reactivation** - Should check limit when reactivating inactive employees
- ⚠️ **Language updates** - Fixed: Now allows saving same number of languages

---

## Recommendations

### Priority 1: Fix Edge Cases

1. **Add limit check when reactivating employees**
   - Update `updateEmployee()` to check limit when setting `is_active: true`

2. **Enforce feature limits**
   - Add limit checks when creating products, services, etc.

### Priority 2: Add UI Components

1. **Create `LimitWarning` component**
   - Show warning when approaching limit (e.g., 4/5 employees)
   - Show error when limit reached
   - Include upgrade prompt

2. **Add limit indicators to pages**
   - Employees page: Show "X/5 employees"
   - Settings page: Show "X/5 languages"

3. **Add upgrade modal**
   - Show when limit is reached
   - Allow upgrading plan directly

---

## Test Coverage

### Current Tests

- ✅ Unit tests for `plan-limits-service.ts` (created in Task 11.1)
- ✅ Tests cover:
  - Plan limit retrieval
  - Effective limit calculation (with addons)
  - Employee limit checking
  - Language limit checking
  - Edge cases (unlimited plans, errors)

### Missing Tests

- ⚠️ Integration tests for limit enforcement in services
- ⚠️ UI tests for limit warnings
- ⚠️ Tests for edge cases (reactivation, etc.)

---

## Next Steps

1. ✅ Task 11.1: Write 6-8 focused tests for plan limits - **COMPLETED**
2. ✅ Task 11.2: Audit all plan limit checks - **COMPLETED**
3. ⏳ Task 11.3: Fix any edge cases in limit enforcement
4. ⏳ Task 11.4: Add comprehensive tests for all limits
5. ⏳ Task 11.5: Update UI to show limit warnings
6. ⏳ Task 11.6: Ensure plan limit tests pass

---

## Conclusion

Plan limits are **mostly enforced** but there are some gaps:

- ✅ Employee limits: Enforced on creation
- ✅ Language limits: Enforced on update (recently fixed)
- ⚠️ Feature limits: Not actively enforced
- ⚠️ UI warnings: Missing proactive warnings and indicators

**Overall Status:** 70% complete - Core enforcement works, but UI and edge cases need work.
