# Drift- og database-changelog (kort, datert)

**Formål:** Et lett sted å appende **kort** hva som ble gjort samme dag (migrasjoner, `db push`, repair, RLS, pilot/staging). Full kontekst og læringsnotater: [`pilot-supabase-migrasjon-retrospektiv.md`](./pilot-supabase-migrasjon-retrospektiv.md).

**Format per oppføring:**

```text
## YYYY-MM-DD
- [miljø] Kort handling (kommando eller PR). Valgfritt: lenke til migrasjonsfil(er).
```

---

## 2026-04-25

- [kode/public] Strammet `POST /api/public-booking/action-token`: obligatorisk `customerEmail`, mismatch mot bookingens kunde-e-post gir avvisning; lagt inn rate limit policy `public-booking-action-token` og bruk i route. Filer: `apps/public/src/app/api/public-booking/action-token/route.ts`, `packages/shared-core/src/rate-limit/policy.ts`.
- [kode/edge] Billing: innført delt Stripe/salon-binding (`validateBillingBinding`) i relevante billing edge-funksjoner; alignet `billing-sync-addon-usage` med `authorizeSalonAccess` + customer-binding mot Stripe-subscription. Filer: `supabase/supabase/functions/_shared/billing-binding.ts`, `billing-*` edge functions, `billing-sync-addon-usage/index.ts`.
- [test/edge] Deno-tester for binding-helper (`_shared/billing-binding.test.ts`).
- [ci] Utvidet `build.needs` til å inkludere `security-scan`, `migration-integrity`, `edge-functions`, `coverage-extended`; edge-test-steg bruker `find` for portabilitet. Fil: `.github/workflows/ci.yml`.
- [docs] Fullført og lukket dokumentasjon i `docs/ops/project-analysis-2026-04-25.md` (inkl. lukkelogg).

## 2026-04-24

- [kode/edge] Hardnet `sms-status-webhook` med ekte Twilio-signaturverifisering (HMAC med `TWILIO_AUTH_TOKEN`) + optional canonical URL (`TWILIO_STATUS_WEBHOOK_URL`) og replay-vern (timestamp-skjevhet + status-regresjonssperre). Filer: `supabase/supabase/functions/sms-status-webhook/index.ts` og speilet `supabase/functions/sms-status-webhook/index.ts`.
- [test] La til webhook-sikkerhetstester (`index.test.ts`) som verifiserer spoofed-signature reject og gyldig signatur-aksept.
- [docs] Oppdatert env-/integrasjonsdokumentasjon fra gammel `TWILIO_STATUS_WEBHOOK_TOKEN`-modell til faktisk signaturmodell.

## 2026-04-22

- [remote] `supabase db push`: opprettet `user-assets` storage-bucket + avatar-policies for `INSERT/SELECT/DELETE` på `storage.objects` (sti `avatars/{userId}/{filename}`). Fikser profilbilde-opplasting som feilet med «Bucket not found». Migrasjon: `20260422092000_create_user_assets_bucket.sql`.

## 2026-04-07

- [remote] `supabase db push`: `GRANT SELECT` på `booking_reschedule_proposals` / `booking_reschedule_activity` til `authenticated` (+ `service_role` ALL). Fikser PostgREST **403** ved lesing fra dashboard (tabell hadde RLS men manglet tabellrettigheter). Migrasjon: `20260407105000_booking_reschedule_table_grants.sql`.

## 2026-04-06

- [remote] `supabase db push`: `pgcrypto` sikret (`20260406140400`); `create_booking_reschedule_proposal` / `respond_booking_reschedule_proposal` bruker `extensions.gen_random_bytes` og `extensions.digest` slik at `SET search_path = public` ikke skjuler pgcrypto (`20260406140401`, `20260406140402`). Fikser «function gen_random_bytes(integer) does not exist» ved «Send til kunde».
- [remote] `supabase db push`: `bookings.updated_at` + trigger; `booking_reschedule_proposals` / `booking_reschedule_activity` + RLS; RPC-er `create_booking_reschedule_proposal`, `activate_booking_reschedule_proposal`, `respond_booking_reschedule_proposal`, `expire_stale_booking_reschedule_proposals`, `direct_reschedule_booking_atomic`; pg_cron `expire-booking-reschedule-proposals` (minutely). Migrasjoner: `20260406140000`–`20260406140300`, `20260406140200`–`20260406140207`.
- [remote] `supabase db push`: `GRANT SELECT ON public.salons TO anon` + RLS policy «Anon can read public salons» (`is_public = true`). Fikser public booking som feilet med «permission denied for table salons» etter `20260317162000_pilot_access_recovery` (kun `authenticated` hadde SELECT/RLS). Migrasjon: `20260406140500_salons_anon_public_select.sql`.
- [remote] `supabase db push`: `GRANT SELECT ON public.profiles TO anon` slik at RLS-uttrykk som refererer til `profiles` kan evalueres for `anon` (ellers «permission denied for table profiles»). Direkte lesing av rader stoppes fortsatt av RLS på `profiles`. Migrasjon: `20260406140600_anon_select_profiles_for_rls.sql`.

## 2026-03-29

- [pilot / dokumentasjon] Skrev `docs/operations/pilot-supabase-migrasjon-retrospektiv.md` (full retrospektiv på pilot-`db push`, CLI-feil, idempotens, legacy-filer, sjekklister). Etablerte denne changelog-filen for daglige notater.
- [pilot] Tidligere i økt: migrasjonsfiks for venteliste (020–022), stripe constraint, waitlist RLS drops, booking `update_booking_atomic` split (015–017), RPC product grants (`29140101`), m.m.; `supabase db push` fullførte kjede mot lenket prosjekt da nett var tilgjengelig. Verifiser på nytt med `supabase migration list` / `db push` ved timeout/503.
- [oppfølging] Manuell smoke-test av apper mot pilot + `pnpm run db:verify` når DB er tilgjengelig.
- [pilot] Fikset *Remote migration versions not found* ved å omdøpe `20260301000001`→`018`, `00002`→`019`, `00003`→`030`, `20260313000001`→`010`; `migration repair --status reverted` på gamle nøkler; `db push --include-all` én gang. Vanlig `db push` gir nå *up to date* uten spøkelsesrader.
