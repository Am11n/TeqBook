# Billing: Stripe Webhook Handler

This Edge Function handles Stripe webhook events for subscription lifecycle management.

## Usage

Configure this as a webhook endpoint in your Stripe Dashboard:
- URL: `https://<your-project>.supabase.co/functions/v1/billing-webhook`
- Events to listen for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

## Webhook Signature Verification

The function verifies the webhook signature using the `stripe-signature` header to ensure the request is from Stripe.

## Supported Events

- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription updated (plan change, etc.)
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

## Environment Variables

- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

## Status

✅ **Fully implemented** - Verifies webhook signatures and updates salon records in database.

## Setup

1. Get your webhook signing secret from Stripe Dashboard → Webhooks
2. Set `STRIPE_WEBHOOK_SECRET` in Supabase Edge Functions environment variables
3. Configure webhook URL in Stripe Dashboard

