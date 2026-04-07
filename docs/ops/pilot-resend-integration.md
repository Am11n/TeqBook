# Pilot production: email (Resend) setup

TeqBook uses **two separate email paths**. Both must work for a complete experience.

| Path | Where it runs | Purpose |
|------|----------------|---------|
| **Transactional** | `apps/dashboard` and **`apps/public`** (separate Vercel projects) | **Public:** booking confirmation after online booking (`/api/bookings/send-notifications`). **Dashboard:** staff flows, reschedule to customer, waitlist, settings test email |
| **Auth** | Supabase (hosted) | Password reset, signup confirmation, magic links |

If booking confirmation from the **public** site fails, check **`RESEND_API_KEY` / `EMAIL_*` on the public app** (not only dashboard). If “mail does not work” on pilot prod, often the key is missing on one Vercel project, or **`EMAIL_FROM` is not on a verified Resend domain**.

## 1) Resend (provider)

1. Open [Resend](https://resend.com) → **Domains** → add and verify your domain (e.g. `teqbook.com` DNS records).
2. **API keys** → create a key with permission to send.
3. **SMTP** (for Supabase only): note SMTP host/user; create an SMTP password if Supabase will send via Resend SMTP.

### New API key (pilot → production, rotation)

1. In Resend → **API Keys** → **Create API key**. Use a clear name (e.g. `teqbook-pilot-transactional` or `teqbook-prod-transactional`). Prefer a dedicated key per environment when you later split staging vs prod.
2. **Do not** commit the key. Put it only in `.env.pilot` (or 1Password) and sync into each app’s `.env.local` (see [`.env.pilot.example`](../../.env.pilot.example)).
3. Update **`RESEND_API_KEY`** in:
   - `apps/public/.env.local` and `apps/dashboard/.env.local` (local)
   - **Both** Vercel projects (Public + Dashboard), then **redeploy** both.
4. Send a test: dashboard **Settings** → test email, and/or a public booking with your own address. Confirm in Resend **Logs** and in Supabase `email_log`.
5. When the new key works, **revoke** the old API key in Resend so leaked or shared keys cannot be reused.

`RESEND_API_KEY` is only for the Next.js apps (HTTP API). **Supabase Auth SMTP** uses Resend’s **SMTP password**, not this API key — rotate that separately in Supabase if needed.

Recommended sender alignment:

- Use the same domain for `EMAIL_FROM` and for Supabase SMTP sender (e.g. `no-reply@teqbook.com`).

## 2) Local dashboard (`pnpm dev` in `apps/dashboard`)

Next only loads **`apps/dashboard/.env.local`**. A root `.env.pilot` with `RESEND_API_KEY` does nothing until those variables exist in the dashboard app’s `.env.local`. Without `RESEND_API_KEY` there, development **simulates** sends (log says “simulating email send”) and nothing reaches Resend.

Sync from repo root (example):

```bash
grep -E '^(RESEND_API_KEY|EMAIL_[A-Z_]+)=' .env.pilot >> apps/dashboard/.env.local
```

Restart the dev server after editing each app’s `.env.local`.

## 3) Dashboard + public on Vercel (or other host)

Set **production** (and preview, if you test there) environment variables on **both** projects:

- **Dashboard** Vercel project: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` (and optional `EMAIL_REPLY_TO`, `EMAIL_UNSUBSCRIBE`).
- **Public** Vercel project: the **same** Resend variables so `apps/public/src/app/api/bookings/send-notifications/route.ts` can send booking confirmations.

Without `RESEND_API_KEY`, dashboard **production** throws when sending (`apps/dashboard/src/lib/services/email/core.ts`). Public **development** simulates email when the key is missing (same pattern as dashboard dev).

`EMAIL_FROM` must be on a **verified** Resend domain.

Redeploy both projects after changing env vars.

Reference template: [`.env.pilot.example`](../../.env.pilot.example).

## 4) Supabase Auth SMTP (password reset, etc.)

In **Supabase Dashboard** → **Project** → **Authentication** → **SMTP**:

- Enable custom SMTP.
- Use Resend’s SMTP settings (commonly host `smtp.resend.com`, port `465`, TLS, username `resend`, password = Resend SMTP password).
- Set sender name and from address consistent with your domain.

This does **not** use `RESEND_API_KEY` in the Next app; it is configured only in Supabase.

## 5) Verify transactional email

1. In dashboard: **Settings** → send a **test notification** email (uses `POST /api/settings/send-test-notification`).
2. In Supabase **SQL Editor**:

```sql
SELECT id, recipient_email, subject, email_type, status, error_message, created_at
FROM email_log
ORDER BY created_at DESC
LIMIT 20;
```

- `failed` → read `error_message` (often unverified domain or invalid API key).
- `sent` → Resend accepted the message; check spam if inbox is empty.

If `error_message` is **«The teqbook.com domain is not verified»** (or similar), Resend has not finished verifying the sender domain. `EMAIL_FROM` must use an address on a domain that shows **Verified** in [Resend → Domains](https://resend.com/domains). After DNS changes at the registrar (e.g. missing MX on `send.teqbook.com`), click verify in Resend and wait for propagation; until then, no confirmation mail will leave Resend.

## 6) More troubleshooting

See [docs/troubleshooting/email-not-sending.md](../troubleshooting/email-not-sending.md).
