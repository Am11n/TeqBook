# Billing: Update Subscription Plan

This Edge Function updates a Stripe subscription plan for a salon.

## Usage

```bash
POST /functions/v1/billing-update-plan
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "salon_id": "uuid",
  "subscription_id": "sub_xxx",
  "new_plan": "starter" | "pro" | "business"
}
```

## Response

```json
{
  "success": true,
  "plan": "pro",
  "message": "Plan updated"
}
```

## Environment Variables

- `STRIPE_SECRET_KEY` - Stripe secret key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

## Status

✅ **Fully implemented** - Updates Stripe subscriptions and prorates charges.

## Setup

1. Set environment variables in Supabase Edge Functions secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`
2. Deploy the function: `supabase functions deploy billing-update-plan`

