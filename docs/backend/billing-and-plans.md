# Billing and Plans Integration

This document describes how TeqBook's subscription plans are integrated with the billing system (Stripe) and how plan changes are handled.

> Innholdet gjelder monorepoet (apps + packages). Stier refererer til `apps/dashboard/`, `apps/public/`, `supabase/` osv.

## Table of Contents

- [Overview](#overview)
- [Plan Model](#plan-model)
- [Stripe Integration](#stripe-integration)
- [Plan Updates](#plan-updates)
- [Feature Management](#feature-management)
- [Best Practices](#best-practices)

---

## Overview

TeqBook uses a subscription-based SaaS model with three plans:

- **Starter** ($25/month) - Basic features for small salons
- **Pro** ($50/month) - Advanced features for growing salons
- **Business** ($75/month) - Full feature set for larger salons

Plans are managed through Stripe subscriptions, and features are determined by the salon's current plan.

---

## Plan Model

### Database Structure

```sql
-- Salon plan (enum)
CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'business');

-- Salon table
ALTER TABLE salons ADD COLUMN plan plan_type DEFAULT 'starter';
ALTER TABLE salons ADD COLUMN billing_customer_id TEXT;
ALTER TABLE salons ADD COLUMN billing_subscription_id TEXT;
```

### Plan Features

Features are mapped to plans via the `plan_features` table:

```sql
-- Features table
CREATE TABLE features (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- Plan features junction table
CREATE TABLE plan_features (
  plan_type plan_type NOT NULL,
  feature_id UUID REFERENCES features(id),
  limit_value NUMERIC,
  PRIMARY KEY (plan_type, feature_id)
);
```

### Feature Mapping

| Plan | Features |
|------|----------|
| **Starter** | BOOKINGS, CALENDAR, MULTILINGUAL (2 languages), WHATSAPP |
| **Pro** | All Starter features + SHIFTS, ADVANCED_REPORTS, EMAIL_NOTIFICATIONS, SMS_NOTIFICATIONS, INVENTORY, BRANDING, MULTILINGUAL (5 languages) |
| **Business** | All Pro features + ROLES_ACCESS, EXPORTS, CUSTOMER_HISTORY, MULTILINGUAL (unlimited) |

---

## Stripe Integration

### Stripe Products and Prices

Each plan has a corresponding Stripe Product and Price:

| Plan | Stripe Price ID (Environment Variable) |
|------|--------------------------------------|
| Starter | `STRIPE_PRICE_STARTER` |
| Pro | `STRIPE_PRICE_PRO` |
| Business | `STRIPE_PRICE_BUSINESS` |

### Customer Creation

When a salon subscribes:

1. Create or retrieve Stripe Customer:
   ```typescript
   const customer = await stripe.customers.create({
     email: user.email,
     metadata: { salon_id: salon.id },
   });
   ```

2. Store customer ID in salon:
   ```typescript
   await updateSalon(salon.id, {
     billing_customer_id: customer.id,
   });
   ```

### Subscription Creation

When creating a subscription:

1. Create Stripe Subscription:
   ```typescript
   const subscription = await stripe.subscriptions.create({
     customer: salon.billing_customer_id,
     items: [{ price: priceId }],
     metadata: { salon_id: salon.id },
   });
   ```

2. Store subscription ID in salon:
   ```typescript
   await updateSalon(salon.id, {
     billing_subscription_id: subscription.id,
   });
   ```

3. Update salon plan:
   ```typescript
   await updateSalon(salon.id, {
     plan: planType, // 'starter', 'pro', or 'business'
   });
   ```

---

## Plan Updates

### Changing Plans

Plans can be changed via the billing settings page (`/settings/billing`).

#### Process

1. **User selects new plan** in UI
2. **Check current subscription status**:
   - If subscription is `incomplete` or `incomplete_expired`, show error
   - Cannot update incomplete subscriptions
3. **Update Stripe subscription**:
   ```typescript
   await stripe.subscriptions.update(subscriptionId, {
     items: [{ id: subscriptionItemId, price: newPriceId }],
     proration_behavior: 'always_invoice', // Prorate charges
   });
   ```
4. **Update salon plan** in database:
   ```typescript
   await updateSalon(salon.id, {
     plan: newPlanType,
   });
   ```

#### Edge Function

Plan updates are handled by the `billing-update-plan` Edge Function:

```typescript
// supabase/functions/billing-update-plan/index.ts
serve(async (req) => {
  // 1. Validate request
  // 2. Retrieve current subscription
  // 3. Check subscription status (prevent updates to incomplete subscriptions)
  // 4. Update Stripe subscription
  // 5. Update salon plan in database
  // 6. Return success/error
});
```

### Webhook Handling

Stripe webhooks update subscription status:

```typescript
// supabase/functions/stripe-webhook/index.ts
serve(async (req) => {
  const event = stripe.webhooks.constructEvent(...);

  switch (event.type) {
    case 'customer.subscription.updated':
      // Update salon plan if subscription changed
      break;
    case 'customer.subscription.deleted':
      // Handle cancellation
      break;
    case 'invoice.payment_failed':
      // Handle payment failure
      break;
  }
});
```

---

## Feature Management

### Feature Checking

Features are checked via the `feature-flags-service`:

```typescript
import * as featureFlagsService from "@/lib/services/feature-flags-service";

// Check if salon has a feature
const { hasFeature } = await featureFlagsService.hasFeature(
  salonId,
  "ADVANCED_REPORTS"
);

// Get all features for salon
const { features } = await featureFlagsService.getFeaturesForSalon(salonId);

// Get feature limit
const { limit } = await featureFlagsService.getFeatureLimit(
  salonId,
  "MULTILINGUAL"
);
```

### Frontend Hook

Use the `useFeatures` hook in React components:

```typescript
import { useFeatures } from "@/lib/hooks/use-features";

function MyComponent() {
  const { hasFeature, features, loading } = useFeatures();

  if (!hasFeature("ADVANCED_REPORTS")) {
    return <UpgradePrompt />;
  }

  return <AdvancedReports />;
}
```

### Service Layer Enforcement

Services should enforce feature checks:

```typescript
export async function generateAdvancedReport(salonId: string) {
  // Check feature availability
  const { hasFeature } = await featureFlagsService.hasFeature(
    salonId,
    "ADVANCED_REPORTS"
  );

  if (!hasFeature) {
    return {
      data: null,
      error: "Advanced reports are not available on your plan",
    };
  }

  // Proceed with report generation
  // ...
}
```

---

## Best Practices

### 1. Always Check Features via Service

❌ **Don't** hardcode plan checks:

```typescript
// Bad
if (salon.plan === "business") {
  // Show feature
}
```

✅ **Do** use feature flags service:

```typescript
// Good
const { hasFeature } = await featureFlagsService.hasFeature(
  salonId,
  "ADVANCED_REPORTS"
);
if (hasFeature) {
  // Show feature
}
```

### 2. Handle Incomplete Subscriptions

Always check subscription status before allowing plan changes:

```typescript
if (subscription.status === "incomplete" || 
    subscription.status === "incomplete_expired") {
  return {
    error: "Cannot update incomplete subscription",
  };
}
```

### 3. Prorate Charges

When changing plans mid-cycle, prorate charges:

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: subscriptionItemId, price: newPriceId }],
  proration_behavior: 'always_invoice',
});
```

### 4. Update Plan Immediately

After successful subscription update, update salon plan immediately:

```typescript
// Update Stripe subscription
await stripe.subscriptions.update(...);

// Update salon plan
await updateSalon(salonId, { plan: newPlanType });

// Refresh salon data in UI
await refreshSalon();
```

### 5. Handle Webhook Events

Listen for important Stripe events:

- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed
- `invoice.payment_succeeded` - Payment succeeded

---

## Environment Variables

Required Stripe environment variables:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## References

- [Plan and Feature Model](./plan-and-feature-model.md)
- [Feature Flags Service](../../src/lib/services/feature-flags-service.ts)
- [Stripe Integration Guide](../integrations/stripe/integration-guide.md)
- [Incomplete Subscription Handling](../integrations/stripe/incomplete-subscription-handling.md)


