# Drift- og database-changelog (kort, datert)

**Formål:** Et lett sted å appende **kort** hva som ble gjort samme dag (migrasjoner, `db push`, repair, RLS, pilot/staging). Full kontekst og læringsnotater: [`pilot-supabase-migrasjon-retrospektiv.md`](./pilot-supabase-migrasjon-retrospektiv.md).

**Format per oppføring:**

```text
## YYYY-MM-DD
- [miljø] Kort handling (kommando eller PR). Valgfritt: lenke til migrasjonsfil(er).
```

---

## 2026-04-25

- [kode/db+dashboard] Varsler til staff (`notify_salon_staff_*`): `metadata` inkluderer nå `customer_name`, `service_name`, `start_time`, `timezone` + `event_type` slik at dashboard kan vise tittel/tekst på valgt språk. Dashboard: fikset `{placeholder}`-interpolasjon i `renderNotificationTemplate`, delt `intlLocaleTag`, og re-render i `NotificationCenter` via `getLocalizedInAppNotificationCopy`. Migrasjon: `20260425234500_notify_staff_notification_i18n_metadata.sql`.
- [kode/db] Fikset weekday-regresjon i `get_schedule_segments`: `p_date` ble tidligere timezone-shiftet ved DOW-beregning, som kunne gjøre mandag→søndag i positive tidssoner (f.eks. Europe/Oslo). SHIFTS-path bruker nå `v_dow_pg` (0=Sun..6=Sat), opening-hours fallback bruker `v_dow_oh` (0=Mon..6=Sun). Migrasjon: `20260425213000_fix_schedule_segments_weekday_mapping.sql` (applied til pilot med `db:apply`).
- [kode/db] Hardening av `notify_salon_staff_new_booking` / `notify_salon_staff_booking_cancelled`: booking må tilhøre `p_salon_id`; kaller må være `service_role` eller salon-profil (owner/manager/staff). Migrasjon: `20260425120000_harden_notify_salon_staff_rpc.sql`; verifikasjon i `supabase/supabase/verification/00_schema_and_security.sql`.
- [kode/public+dashboard] Staff-varsler: RPC kalles med `getAdminClient().rpc` (service role) fra public `send-notifications` / `send-cancellation` og dashboard `notify-staff.ts`.
- [kode/edge] `billing-webhook`: duplicate ledger leser status (`processed`/`processing`/`failed`); `failed` resettes og prosesseres på nytt; `syncSubscriptionProjection` validerer Stripe customer + subscription mot salon; incomplete subscription uten `salon_id` skriver ikke; `invoice.payment_action_required` oppdaterer én salon-rad. `billing-list-invoices` bruker `authorizeSalonAccess`. `process-reminders` / `process-waitlist-expiry`: valgfri `TEQBOOK_CRON_SECRET` bearer-krav (`_shared/cron-secret.ts`). `whatsapp-send`: `WHATSAPP_SEND_ENABLED`, `salon_id` + `authorizeSalonAccess`, HTTPS allowlist for `WHATSAPP_API_URL`.
- [kode/public] Bekreftelsesdetaljer: `POST /api/public-booking/confirmation` med JSON body (GET beholdt); mindre info-lekkasje ved DB-feil.
- [ci/scripts] `migration-integrity`: `TEQBOOK_DB_USE_PROCESS_ENV=1`, `TEQBOOK_ENV_TARGET`, `NEXT_PUBLIC_SUPABASE_URL` i workflow; `db-env` støtter `TEQBOOK_SUPABASE_TARGET`-alias. `pnpm run check:supabase-functions-drift` + synk av `supabase/functions/{rate-limit-check,sms-status-webhook}` med canonical kopier.
- [docs] `docs/env/environment-variables.md` + `docs/ops/critical-fixes-master-checklist-2026-04-25.md` oppdatert.
- [kode/public+edge] Oppfølgingshardening: generiske 500-feil i flere public API-ruter (`send-notifications`, `send-cancellation`, `waitlist/claim`, `booking/reschedule`), `whatsapp-send` krever nå `booking_id` og tillater kun mottakernummer som matcher bookingens kunde/ansatt i riktig `salon_id`; `supabase/config.toml` dokumenterer `verify_jwt=false` + `TEQBOOK_CRON_SECRET`-modell også for `process-reminders`.
- [test/db] Oppfølging verifikasjon: `pnpm run type-check`, `pnpm run test:run`, `pnpm dlx deno-bin test --no-check`, `pnpm run db:manifest:verify` grønt. `pnpm run test:integration` feiler på eksisterende dashboard integration-baseline (query-performance + timeouts). `pnpm run db:apply` grønt, `pnpm run db:verify` feiler på eksisterende data-kvalitet (`orphan bookings found (1)` i `02_data_quality.sql`).
- [kode/public] Action tokens: fjernet `manage`; mint krever `purposes` og returnerer `tokens` per `confirmation` / `notify` / `cancel` med egne TTL (30m / 15m / 10m); verifiseringsruter tillater kun matchende purpose; fortsatt obligatorisk `customerEmail` med mismatch-avvisning og rate limit `public-booking-action-token`. Kansellering fra bekreftelsessiden minter `cancel`-token før `send-cancellation`. Bekreftelses-API returnerer `customers.email` for mint. Prod krever `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` (ingen fallback til service role). Filer: `action-token/route.ts`, `public-booking-action-token.ts`, `confirmation/route.ts`, `send-notifications/route.ts`, `send-cancellation/route.ts`, `bookings/create.ts`, `publicBookingHandlers.ts`, `confirmation/page-client.tsx`, `apps/public/tests/setup.ts`, `packages/shared-core/src/rate-limit/policy.ts`.
- [kode/edge] Billing: innført delt Stripe/salon-binding (`validateBillingBinding`) i relevante billing edge-funksjoner; alignet `billing-sync-addon-usage` med `authorizeSalonAccess` + customer-binding mot Stripe-subscription. Filer: `supabase/supabase/functions/_shared/billing-binding.ts`, `billing-*` edge functions, `billing-sync-addon-usage/index.ts`.
- [test/edge] Deno-tester for binding-helper (`_shared/billing-binding.test.ts`).
- [ci] Utvidet `build.needs` til å inkludere `security-scan`, `migration-integrity`, `edge-functions`, `coverage-extended`; edge-test-steg bruker `find` for portabilitet. Fil: `.github/workflows/ci.yml`.
- [docs] Fullført og lukket dokumentasjon i `docs/ops/project-analysis-2026-04-25.md` (inkl. lukkelogg).
- [ci/scripts] `pnpm run db:migrations:manifest-coverage` + lint-steg på pull_request (endrede `migrations/*.sql` må være i `migration-manifest.json`). Filer: `scripts/check-migration-manifest-coverage.ts`, `.github/workflows/ci.yml`, `package.json`.
- [docs] `docs/env/environment-variables.md`: `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` + rotasjon; `docs/ops/must-fix-checklist-2026-04-25.md` oppdatert med status og beslutningslogg.

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
