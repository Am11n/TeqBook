# Feature Flags

This document describes the feature flags system in TeqBook, which allows for experiments, beta features, and gradual rollouts independent of subscription plans.

## Table of Contents

- [Overview](#overview)
- [Feature Flags vs. Plan Features](#feature-flags-vs-plan-features)
- [Using Feature Flags](#using-feature-flags)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Best Practices](#best-practices)

---

## Overview

Feature flags in TeqBook are used for:

1. **Experiments**: Test new features with a subset of users
2. **Beta Features**: Gradually roll out new features
3. **A/B Testing**: Compare different implementations
4. **Emergency Toggles**: Quickly disable features if issues arise

Feature flags are **independent** of subscription plans. They can be enabled/disabled per environment (development, staging, production) without code changes.

---

## Feature Flags vs. Plan Features

### Plan Features (Subscription-based)

- Defined in database (`features` and `plan_features` tables)
- Tied to subscription plans (starter, pro, business)
- Managed via `useFeatures` hook
- Examples: `BOOKINGS`, `CALENDAR`, `SHIFTS`, `ADVANCED_REPORTS`

### Feature Flags (Internal toggles)

- Defined in code (`src/lib/config/feature-flags.ts`)
- Independent of subscription plans
- Managed via `isFeatureFlagEnabled()` function
- Examples: `newBookingFlow`, `employeeShiftBeta`, `newDashboardDesign`

---

## Using Feature Flags

### In Components

```typescript
import { isFeatureFlagEnabledWithEnv } from "@/lib/config/feature-flags";

export function MyComponent() {
  const showNewFlow = isFeatureFlagEnabledWithEnv("newBookingFlow");

  if (showNewFlow) {
    return <NewBookingFlow />;
  }

  return <OldBookingFlow />;
}
```

### In Services

```typescript
import { isFeatureFlagEnabledWithEnv } from "@/lib/config/feature-flags";

export async function createBooking(input: CreateBookingInput) {
  if (isFeatureFlagEnabledWithEnv("newBookingFlow")) {
    return await createBookingNewFlow(input);
  }

  return await createBookingOldFlow(input);
}
```

### With Plan Features

Feature flags can be combined with plan features:

```typescript
import { useFeatures } from "@/lib/hooks/use-features";
import { isFeatureFlagEnabledWithEnv } from "@/lib/config/feature-flags";

export function MyComponent() {
  const { hasFeature } = useFeatures();
  const showEnhancedReports = 
    hasFeature("ADVANCED_REPORTS") && 
    isFeatureFlagEnabledWithEnv("enhancedReporting");

  if (showEnhancedReports) {
    return <EnhancedReports />;
  }

  return <StandardReports />;
}
```

---

## Configuration

Feature flags are configured in `src/lib/config/feature-flags.ts`:

```typescript
export const featureFlags = {
  newBookingFlow: {
    enabled: false,
    description: "New booking flow with improved UX",
  },
  // ... more flags
};
```

### Adding a New Feature Flag

1. Add the flag to `featureFlags` object:

```typescript
export const featureFlags = {
  // ... existing flags
  myNewFeature: {
    enabled: false,
    description: "Description of the new feature",
  },
};
```

2. Use the flag in your code:

```typescript
import { isFeatureFlagEnabledWithEnv } from "@/lib/config/feature-flags";

if (isFeatureFlagEnabledWithEnv("myNewFeature")) {
  // Feature code
}
```

3. Enable the flag when ready:

```typescript
myNewFeature: {
  enabled: true, // Enable the feature
  description: "Description of the new feature",
},
```

---

## Environment Variables

Feature flags can be overridden via environment variables for per-environment control:

### Format

```
NEXT_PUBLIC_FEATURE_FLAG_<FLAG_NAME>=true
```

### Examples

```bash
# .env.local (development)
NEXT_PUBLIC_FEATURE_FLAG_NEW_BOOKING_FLOW=true
NEXT_PUBLIC_FEATURE_FLAG_EMPLOYEE_SHIFT_BETA=true

# .env.production (production)
NEXT_PUBLIC_FEATURE_FLAG_NEW_BOOKING_FLOW=false
```

### Priority

1. Environment variables (highest priority)
2. Code configuration (default)

---

## Best Practices

### 1. Use Descriptive Names

```typescript
// ❌ Bad
flag1: { enabled: false }

// ✅ Good
newBookingFlow: { enabled: false }
```

### 2. Document Feature Flags

Always include a description:

```typescript
newBookingFlow: {
  enabled: false,
  description: "New booking flow with improved UX and validation",
},
```

### 3. Remove Dead Code

Once a feature flag is fully rolled out and no longer needed:

1. Remove the feature flag check from code
2. Remove the flag from `featureFlags` object
3. Clean up any feature-flag-specific code paths

### 4. Test Both Paths

When using feature flags, test both enabled and disabled states:

```typescript
describe("MyComponent", () => {
  it("works with feature flag enabled", () => {
    // Mock feature flag as enabled
    // Test new flow
  });

  it("works with feature flag disabled", () => {
    // Mock feature flag as disabled
    // Test old flow
  });
});
```

### 5. Gradual Rollout

For production features, use a gradual rollout:

1. Enable for internal team (development)
2. Enable for beta users (staging)
3. Enable for 10% of users (production)
4. Enable for 50% of users (production)
5. Enable for 100% of users (production)
6. Remove feature flag once stable

### 6. Monitor Performance

Track metrics for features behind flags:

- Error rates
- Performance impact
- User engagement
- Conversion rates

---

## Current Feature Flags

| Flag | Status | Description |
|------|-------|-------------|
| `newBookingFlow` | Disabled | New booking flow with improved UX |
| `employeeShiftBeta` | Disabled | Beta version of employee shift management |
| `newDashboardDesign` | Disabled | New dashboard design with improved layout |
| `enhancedReporting` | Disabled | Enhanced reporting features |
| `realtimeNotifications` | Disabled | Real-time notifications via WebSocket |
| `advancedInventory` | Disabled | Advanced inventory management features |

---

## References

- [Feature Flags Config](../../src/lib/config/feature-flags.ts)
- [Plan and Feature Model](../backend/plan-and-feature-model.md)
- [Service Standards](./service-standards.md)

