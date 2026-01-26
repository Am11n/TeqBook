# Environment Variables Documentation

## Overview

This document describes all environment variables required for each app in the TeqBook monorepo.

## Shared Variables

These variables are used across multiple apps:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)

## App-Specific Variables

### Public App (`apps/public`)

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `RESEND_API_KEY` - Only if public app sends emails (usually not needed)
- `EMAIL_FROM` - Email sender address
- `EMAIL_FROM_NAME` - Email sender name

**Security Notes:**
- No session cookies needed (public app)
- No Stripe keys needed
- Minimal secrets required

### Dashboard App (`apps/dashboard`)

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `RESEND_API_KEY` - For sending booking confirmations and reminders
- `EMAIL_FROM` - Email sender address
- `EMAIL_FROM_NAME` - Email sender name
- `STRIPE_SECRET_KEY` - For subscription management
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For Stripe checkout
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhook verification

**Optional:**
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side error tracking

**Security Notes:**
- Normal session lifetime
- Standard security headers
- Stripe keys must be kept secret

### Admin App (`apps/admin`)

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `ADMIN_SECRET_KEY` - For future IP allowlist or additional security
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side error tracking

**Security Notes:**
- Shorter session lifetime (configurable)
- Stricter CSP headers
- Harder rate limits
- Future: IP allowlist support

## Edge Functions

Edge functions have their own environment variables set in Supabase Dashboard:

**Required:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NEVER expose to client)
- `RESEND_API_KEY` - For sending emails from edge functions

**Optional:**
- `EMAIL_FROM` - Email sender address
- `EMAIL_FROM_NAME` - Email sender name

**Critical:** Service role key should NEVER be in Next.js app runtime. Only use in edge functions.

## Vercel Configuration

Each app should be configured as a separate Vercel project:

1. **Public App:**
   - Root Directory: `apps/public`
   - Environment variables: See Public App section above

2. **Dashboard App:**
   - Root Directory: `apps/dashboard`
   - Environment variables: See Dashboard App section above

3. **Admin App:**
   - Root Directory: `apps/admin`
   - Environment variables: See Admin App section above

## Local Development

Copy `.env.example` to `.env.local` in each app directory:

```bash
cp apps/public/.env.example apps/public/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Then fill in the values from your Supabase project settings.
