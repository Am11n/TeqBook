# Supabase Environment Matrix (2-Project Setup)

This matrix prevents accidental staging/pilot mixing.

## Canonical Mapping

| Logical environment | Supabase project | Notes |
|---|---|---|
| `staging` | Existing Supabase project used for development/staging validation | Resettable, fixture data allowed |
| `pilot-production` | `teqbook-pilot` | Live pilot data, no demo fixtures |

## Required Root Env Fields

Keep these in `.env.staging` and `.env.pilot`:

- `TEQBOOK_ENV_TARGET` (`staging` or `pilot-production`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (must be `https://teqbook.com` in production-facing environments)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `TEQBOOK_STAGING_PROJECT_REF`
- `TEQBOOK_PILOT_PROJECT_REF`

## Preflight Checklist (Before Any DB Command)

1. Target environment is written in command note.
2. `.env.local` was copied from correct source:
   - `cp .env.staging .env.local`
   - `cp .env.pilot .env.local`
3. Active project ref in URL matches expected environment.
4. If any mismatch exists, stop immediately.

## Ownership and Rotation

| Secret / Access | Owner | Backup owner | Rotation cadence | Last rotated | Notes |
|---|---|---|---|---|---|
| Staging service role key | TBD | TBD | TBD | TBD | Server-only |
| Pilot service role key | TBD | TBD | TBD | TBD | Server-only |
| Staging DB password / URL | TBD | TBD | TBD | TBD | Required for psql apply/verify |
| Pilot DB password / URL | TBD | TBD | TBD | TBD | Required for psql apply/verify |
| Supabase org admin access | TBD | TBD | TBD | TBD | Least privilege |

## Revocation Procedure

1. Revoke compromised credential in Supabase dashboard immediately.
2. Generate replacement secret.
3. Update `.env.staging` or `.env.pilot` source file.
4. Re-copy to `.env.local`.
5. Re-run preflight check before next command.
6. Log change in decision log with timestamp and owner.

## Auth URL Drift Check (Before Pilot Onboarding Windows)

Run this check in Supabase dashboard for the pilot project (`mdqnburqfzvzhvsicdyo`) before onboarding customers:

1. Open **Auth -> URL Configuration**.
2. Confirm **Site URL** is exactly `https://teqbook.com`.
3. Confirm **Additional Redirect URLs** include:
   - `https://teqbook.com/login`
   - `https://teqbook.com/login?confirmed=1`
   - `https://teqbook.com/reset-password`
   - `https://www.teqbook.com/login` (optional safety)
   - `https://www.teqbook.com/reset-password` (optional safety)
4. Ensure `http://localhost:3000` is not enabled for pilot production redirects.
5. Run two live checks from `https://teqbook.com`:
   - New signup confirmation email lands on `/login?confirmed=1`.
   - Forgot-password email lands on `/reset-password` and can complete to `/login?reset=1`.

