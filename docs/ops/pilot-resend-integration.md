# Pilot production: email (Resend) setup

TeqBook uses **two separate email paths**. Both must work for a complete experience.

| Path | Where it runs | Purpose |
|------|----------------|---------|
| **Transactional** | `apps/dashboard` (e.g. Vercel) | Booking confirmations, reschedule links, waitlist, test email in settings |
| **Auth** | Supabase (hosted) | Password reset, signup confirmation, magic links |

If “mail does not work” on pilot prod, usually **`RESEND_API_KEY` is missing on the dashboard deployment** or **`EMAIL_FROM` is not on a verified Resend domain**.

## 1) Resend (provider)

1. Open [Resend](https://resend.com) → **Domains** → add and verify your domain (e.g. `teqbook.com` DNS records).
2. **API keys** → create a key with permission to send.
3. **SMTP** (for Supabase only): note SMTP host/user; create an SMTP password if Supabase will send via Resend SMTP.

Recommended sender alignment:

- Use the same domain for `EMAIL_FROM` and for Supabase SMTP sender (e.g. `no-reply@teqbook.com`).

## 2) Local dashboard (`pnpm dev` in `apps/dashboard`)

Next only loads **`apps/dashboard/.env.local`**. A root `.env.pilot` with `RESEND_API_KEY` does nothing until those variables exist in the dashboard app’s `.env.local`. Without `RESEND_API_KEY` there, development **simulates** sends (log says “simulating email send”) and nothing reaches Resend.

Sync from repo root (example):

```bash
grep -E '^(RESEND_API_KEY|EMAIL_[A-Z_]+)=' .env.pilot >> apps/dashboard/.env.local
```

Restart the dev server after editing `.env.local`.

## 3) Dashboard app (Vercel or other host)

Set **production** (and preview, if you test there) environment variables on the **dashboard** project:

- `RESEND_API_KEY` — required; without it, production throws when sending (see `apps/dashboard/src/lib/services/email/core.ts`).
- `EMAIL_FROM` — must be an address on a **verified** Resend domain.
- `EMAIL_FROM_NAME` — display name (e.g. `TeqBook`).

Optional: `EMAIL_REPLY_TO`, `EMAIL_UNSUBSCRIBE`.

Redeploy after changing env vars.

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

## 6) More troubleshooting

See [docs/troubleshooting/email-not-sending.md](../troubleshooting/email-not-sending.md).
