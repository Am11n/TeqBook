# Billing: Create Stripe Subscription

This Edge Function creates a Stripe subscription for a salon.

## Usage

```bash
POST /functions/v1/billing-create-subscription
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "salon_id": "uuid",
  "customer_id": "cus_xxx",
  "plan": "starter" | "pro" | "business"
}
```

## Response

```json
{
  "success": true,
  "subscription_id": "sub_xxx",
  "plan": "starter",
  "current_period_end": "2024-01-01T00:00:00Z"
}
```

## Environment Variables

- `STRIPE_SECRET_KEY` - Stripe secret key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

## Status

✅ **Fully implemented** - Creates actual Stripe subscriptions and updates salon records.

## Setup

1. Set environment variables in Supabase Edge Functions secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_STARTER` (optional, defaults to placeholder)
   - `STRIPE_PRICE_PRO` (optional, defaults to placeholder)
   - `STRIPE_PRICE_BUSINESS` (optional, defaults to placeholder)
2. Deploy the function: `supabase functions deploy billing-create-subscription`

## Plan Price IDs

Set `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, and `STRIPE_PRICE_BUSINESS` in Supabase Edge Functions secrets with your actual Stripe price IDs (from Stripe Dashboard → Products).

