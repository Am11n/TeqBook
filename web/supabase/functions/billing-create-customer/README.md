# Billing: Create Stripe Customer

This Edge Function creates a Stripe customer for a salon.

## Usage

```bash
POST /functions/v1/billing-create-customer
Authorization: Bearer <supabase_token>
Content-Type: application/json

{
  "salon_id": "uuid",
  "email": "salon@example.com",
  "name": "Salon Name"
}
```

## Response

```json
{
  "success": true,
  "customer_id": "cus_xxx",
  "message": "Customer created"
}
```

## Environment Variables

- `STRIPE_SECRET_KEY` - Stripe secret key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

## Status

✅ **Fully implemented** - Creates actual Stripe customers and updates salon records.

## Setup

1. Set `STRIPE_SECRET_KEY` in Supabase Edge Functions secrets
2. Deploy the function: `supabase functions deploy billing-create-customer`

