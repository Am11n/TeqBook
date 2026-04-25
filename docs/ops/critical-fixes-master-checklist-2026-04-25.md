# Kritiske punkter som må fikses — master checklist (2026-04-25)

Dette dokumentet er en **konsolidert, evidensbasert** liste over det som fortsatt utgjør reell risiko i TeqBook, etter gjennomgang av apper, API-ruter, Supabase (SQL + Edge Functions), og CI.

**Viktig om «allerede fikset»:** Flere tidligere funn er nå lukket i kode (se [`docs/operations/CHANGELOG-ops.md`](../operations/CHANGELOG-ops.md) under `2026-04-25`, og tidligere notater [`must-fix-checklist-2026-04-25.md`](./must-fix-checklist-2026-04-25.md)). **2026-04-25 (senere batch):** master-listen under er oppdatert med `[x]` der endring er implementert i repo; manuelle verifikasjoner (staging, Stripe-retry) står fortsatt som `[ ]` der det er relevant.

---

## 0) Executive summary (topp 6)

| # | Tema | Hvorfor kritisk | Hovedfiler / bevis |
|---|------|-----------------|---------------------|
| 1 | **RPC `notify_salon_staff_*` hardening** *(2026-04-25)* | Booking↔salon-sjekk + kaller må være `service_role` eller salon-profil; verifikasjon i `00_schema_and_security.sql`. | [`20260425120000_harden_notify_salon_staff_rpc.sql`](../../supabase/supabase/migrations/20260425120000_harden_notify_salon_staff_rpc.sql) |
| 2 | **Public notify-RPC via service role** *(2026-04-25)* | `getAdminClient().rpc` i public routes + dashboard `notify-staff`. | [`send-notifications/route.ts`](../../apps/public/src/app/api/bookings/send-notifications/route.ts), [`notify-staff.ts`](../../apps/dashboard/src/app/api/bookings/_shared/notify-staff.ts) |
| 3 | **Stripe `billing-webhook` duplikat/idempotens** *(2026-04-25)* | Duplikat leser `processing_status`; `failed` resettes og prosesseres på nytt. | [`billing-webhook/index.ts`](../../supabase/supabase/functions/billing-webhook/index.ts) |
| 4 | **`syncSubscriptionProjection` + binding** *(2026-04-25)* | `validateBillingBinding` + subscription-id samsvar mot salon-rad før oppdatering. | Samme fil |
| 5 | **Incomplete subscription uten `salon_id`** *(2026-04-25)* | Skip DB-write når `metadata.salon_id` mangler. | Samme fil |
| 6 | **CI `migration-integrity` vs `.env.local`-kontrakt** *(adressert i kode 2026-04-25)* | `TEQBOOK_DB_USE_PROCESS_ENV=1`, `TEQBOOK_ENV_TARGET` + `NEXT_PUBLIC_SUPABASE_URL` i workflow; `getTargetFromEnv()` aksepterer også `TEQBOOK_SUPABASE_TARGET`. Verifiser fortsatt grønn kjøring på GitHub-runner. | [`scripts/lib/db-env.ts`](../../scripts/lib/db-env.ts), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) |

---

## P0 — Må lukkes (sikkerhet / økonomi / dataintegritet)

### P0.1 Harden `notify_salon_staff_new_booking` og `notify_salon_staff_booking_cancelled` (DB)

**Problem:** Funksjonene er `SECURITY DEFINER` og er eksponert mot `authenticated` uten å validere at `p_booking_id` faktisk tilhører `p_salon_id`.

**Bevis (grant + definer):**

- [`supabase/supabase/migrations/20260123000009_update_notify_salon_staff_timezone.sql`](../../supabase/supabase/migrations/20260123000009_update_notify_salon_staff_timezone.sql)
- [`supabase/supabase/migrations/20260123000010_update_notify_salon_staff_cancelled_timezone.sql`](../../supabase/supabase/migrations/20260123000010_update_notify_salon_staff_cancelled_timezone.sql)

**Sjekkliste:**

- [x] Legg inn hard validering i funksjonen: `SELECT 1 FROM bookings WHERE id = p_booking_id AND salon_id = p_salon_id` (evt. også status-krav).
- [x] Vurder å **fjerne `GRANT EXECUTE ... TO authenticated`** hvis RPC kun skal kalles server-side. *(Beholdt `authenticated` for dashboard JWT; mitigert med `auth.role() = service_role` **eller** salon-profil med rolle owner/manager/staff.)*
- [x] Hvis dere beholder `authenticated`, dokumenter eksplisitt threat model + mitigering (rate limits er ikke nok alene). *(Kommentar + kode i migrasjon `20260425120000_harden_notify_salon_staff_rpc.sql`.)*
- [x] Legg til SQL-test/verify-assert eller utvid `supabase/supabase/verification/*.sql` med policy som fanger regresjon.

**Akseptkriterier:**

- [x] Direkte RPC-kall med mismatch `booking_id`/`salon_id` gir **hard feil** (ingen inserts).
- [x] Kun forventede roller kan execute (typisk `service_role` + evt. låst server-rolle).

---

### P0.2 Public routes: kall notify-RPC med service role (ikke bruker-cookie client)

**Problem:** Public handlers bruker `createClientForRouteHandler(...).rpc("notify_salon_staff_...")` mens DB-grants peker mot `authenticated`.

**Bevis:**

- [`apps/public/src/app/api/bookings/send-notifications/route.ts`](../../apps/public/src/app/api/bookings/send-notifications/route.ts)
- [`apps/public/src/app/api/bookings/send-cancellation/route.ts`](../../apps/public/src/app/api/bookings/send-cancellation/route.ts)

**Sjekkliste:**

- [x] Etter action-token + autoritative booking reads: kall `getAdminClient().rpc(...)` (service role) i stedet for bruker-scope client — align med resten av handleren som allerede bruker admin-klient.
- [x] Verifiser i staging at in-app staff notification faktisk fungerer for anonym public booking. *(Manuelt verifisert av bruker 2026-04-25.)*
- [x] Legg integrasjonstest (eller scriptet verifikasjon) som forventer `notifiedCount > 0` når booking finnes. *(Public unit-test oppdatert: `bookings-send-notifications-rate-limit.test.ts` assert `inApp.success=true` og `inApp.sent=1`.)*

**Akseptkriterier:**

- [x] Ingen avhengighet av at anonym besøkende har `authenticated` JWT.
- [x] RPC kan strammes inn (P0.1) uten å ødelegge produktflyt.

---

### P0.3 Stripe webhook: idempotens + retry må være korrekt

**Problem A — duplikat-håndtering:** Ved `23505` returneres `200` uten å lese status på eksisterende rad.

**Bevis:** [`supabase/supabase/functions/billing-webhook/index.ts`](../../supabase/supabase/functions/billing-webhook/index.ts) (insert + `duplicateEvent` gren).

**Sjekkliste:**

- [x] Ved duplicate: `select` eksisterende rad; hvis `failed` eller «stuck processing», **re-run** prosessering eller returner **5xx** for å tvinge Stripe-retry (velg én strategi og dokumenter den). *(Implementert: `processed` → 200; `processing` → 200 duplicate_inflight; `failed` → reset til `processing` og kjør handler på nytt.)*
- [x] Sikre at «processed» duplicate fortsatt returnerer `200`.

**Problem B — projection integrity:** `syncSubscriptionProjection` oppdaterer `salons` basert på `metadata.salon_id` uten customer-binding.

**Bevis:** samme fil (`syncSubscriptionProjection`).

**Sjekkliste:**

- [x] Hent salon-rad (`billing_customer_id`, `billing_subscription_id`) og krev konsistens mot Stripe `subscription.customer` og `subscription.id` før `update`.
- [x] Ved mismatch: logg + metric + **ikke** oppdater (fail safe).

**Problem C — incomplete path uten `salonId` guard:** `.eq("id", salonId)` når `metadata.salon_id` mangler.

**Bevis:** `case "customer.subscription.created"` / `updated` i samme fil.

**Sjekkliste:**

- [x] `if (!salonId) break;` før alle writes.

**Akseptkriterier:**

- [ ] Simulert Stripe retry etter `failed` ledger rad ender i konsistent sluttstate (enten recovered eller eksplisitt dead-letter med alarm).

---

### P0.4 CI: `migration-integrity` må matche `scripts/lib/db-env.ts` kontrakt

**Problem:**

- `ensureRootEnvLoaded()` krever `.env.local` i repo-root.
- `getTargetFromEnv()` leser `TEQBOOK_ENV_TARGET`, ikke `TEQBOOK_SUPABASE_TARGET`.
- `getProjectRefFromEnvUrl()` krever `NEXT_PUBLIC_SUPABASE_URL` i `.env.local`.

**Bevis:**

- [`scripts/lib/db-env.ts`](../../scripts/lib/db-env.ts)
- [`scripts/db-apply.ts`](../../scripts/db-apply.ts) (kaller `ensureRootEnvLoaded()`)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (`migration-integrity` env)

**Sjekkliste:**

- [x] Enten:
  - [ ] **A:** Generer `.env.local` i workflow fra secrets (kun nødvendige nøkler), **eller**
  - [x] **B:** Endre `db:apply`/`db-verify` til å støtte ren CI-modus uten `.env.local` (eksplisitt `DOTENV_CONFIG_PATH` / `process.env` først). *(Se `TEQBOOK_DB_USE_PROCESS_ENV=1` i `scripts/lib/db-env.ts` + workflow.)*
- [x] Align variabelnavn: sett `TEQBOOK_ENV_TARGET=pilot-production` (eller staging) i workflow.
- [x] Sett `NEXT_PUBLIC_SUPABASE_URL` (secret) i migration job hvis ref-preflight skal fungere.
- [ ] Verifiser at jobben faktisk kjører grønt på en ren runner (ikke bare lokalt).

**Akseptkriterier:**

- [ ] `migration-integrity` er grønn på GitHub uten hemmelige filer committet til git.

---

## P1 — Høy prioritet (sikker drift / skalerbarhet)

### P1.1 Dupliserte Edge Function-trær (`supabase/functions` vs `supabase/supabase/functions`)

**Problem:** Samme funksjonsnavn finnes i flere mapper → deploy/CI kan applied feil versjon.

**Bevis (eksempel på duplikat):**

- [`supabase/supabase/functions/sms-status-webhook/index.ts`](../../supabase/supabase/functions/sms-status-webhook/index.ts)
- [`supabase/functions/sms-status-webhook/index.ts`](../../supabase/functions/sms-status-webhook/index.ts)

**Sjekkliste:**

- [x] Velg **én kanonisk path** og gjør den eneste deploy-kilden. *(Kanon: `supabase/supabase/functions`; speilet tre `supabase/functions/…` synket innhold med canonical.)*
- [ ] Slett/symlink/redirect dokumentasjon + `supabase/config.toml` entries til å peke konsistent.
- [x] Legg inn CI-sjekk som feiler hvis duplikat mapper divergerer (hash compare eller forbid duplicate). (`pnpm run check:supabase-functions-drift`, CI `edge-functions`.)

---

### P1.2 Cron / service-role edge functions uten defense-in-depth

**Eksempel:** `process-reminders` bruker service role uten tydelig `CRON_SECRET` / signert kall.

**Bevis:** [`supabase/supabase/functions/process-reminders/index.ts`](../../supabase/supabase/functions/process-reminders/index.ts)

**Sjekkliste:**

- [x] Krev `Authorization: Bearer <CRON_SECRET>` (eller Supabase JWT policy + verify) før kjøring. *(Når `TEQBOOK_CRON_SECRET` er satt, kreves `Authorization: Bearer …`; ellers warn-only for bakoverkompatibilitet.)*
- [x] Dokumenter `verify_jwt` innstillinger i [`supabase/config.toml`](../../supabase/config.toml) per funksjon.
- [x] Gjenta for andre «service role cron» funksjoner (`process-waitlist-expiry`, osv.).

---

### P1.3 `whatsapp-send` er ikke produksjonsklar (misbruk / feilkonfigurasjon)

**Bevis:** [`supabase/supabase/functions/whatsapp-send/index.ts`](../../supabase/supabase/functions/whatsapp-send/index.ts) (`TODO`, fritt `to/message`, `fetch(whatsappApiUrl)`)

**Sjekkliste:**

- [x] Enten disable endpoint i prod, eller:
  - [x] Krev `salon_id` + `authorizeSalonAccess`
  - [x] Bind `to` til tillatte mottakere (booking/customer/staff policy). *(Nå kreves `booking_id`; `to` må matche bookingens kunde/ansatt-telefon for valgt `salon_id`.)*
  - [x] Fjern generisk `fetch` til vilkårlig URL hvis `whatsappApiUrl` kan misbrukes (SSRF). *(HTTPS + allowlist for Twilio/Meta.)*

---

### P1.4 Offentlig booking: token i GET query (`confirmation`)

**Bevis:** [`apps/public/src/app/api/public-booking/confirmation/route.ts`](../../apps/public/src/app/api/public-booking/confirmation/route.ts) (`actionToken` fra `searchParams`)

**Sjekkliste:**

- [x] Bytt til POST-body eller kortlivet server-side session etter mint. *(POST er primær fra `page-client`; GET beholdt for bakoverkompatibilitet.)*
- [x] Trim logging + fjern sensitive felter i confirmation payload hvis ikke nødvendig. *(DB-feil til klient returneres ikke lenger som rå `PostgrestError.message`.)*

---

### P1.5 Migrasjonsmanifest dekker ikke «alt på disk» (kun manifest-styrt apply)

**Bevis:**

- [`scripts/check-migration-manifest-coverage.ts`](../../scripts/check-migration-manifest-coverage.ts) (kun **git diff** vs base)
- [`scripts/db-apply.ts`](../../scripts/db-apply.ts) (apply kun manifest-listen)

**Sjekkliste:**

- [ ] Vurder nattlig/scheduled job som verifiserer «alle migrationsfiler er i manifest» (full scan), ikke bare PR-diff. *(Bevisst ikke implementert: full scan kolliderer med legacy-filer på disk; PR-diff-gate er aktiv.)*
- [x] Dokumenter at `supabase db push` ikke må brukes parallelt uten å oppdatere manifest (hvis det er policy). *(Notert her + i `must-fix-checklist`.)*

---

## P2 — Viktig (kvalitet, konsistens, operatør-opplevelse)

### P2.1 `billing-list-invoices` avviker fra standard `authorizeSalonAccess` (superadmin/støtte)

**Bevis:** [`supabase/supabase/functions/billing-list-invoices/index.ts`](../../supabase/supabase/functions/billing-list-invoices/index.ts)

**Sjekkliste:**

- [x] Bytt til `authorizeSalonAccess` for konsistent policy.

---

### P2.2 `invoice.payment_action_required` oppdaterer alle saloner med samme `billing_customer_id`

**Bevis:** [`supabase/supabase/functions/billing-webhook/index.ts`](../../supabase/supabase/functions/billing-webhook/index.ts) (`case "invoice.payment_action_required"`)

**Sjekkliste:**

- [x] Oppdater via primærnøkkel etter `select` som garanterer én rad (eller dokumenter invariant «aldri del customer_id»). *(Ambiguous `count>1` → ingen update + logg.)*

---

### P2.3 Rate limit identifikator (`x-forwarded-for` første hop)

**Bevis:** flere public routes — samme mønster som i [`apps/public/src/app/api/public-booking/action-token/route.ts`](../../apps/public/src/app/api/public-booking/action-token/route.ts)

**Sjekkliste:**

- [x] Bruk plattformens trusted IP-header der det finnes (Vercel), eller normaliser i edge middleware. *(Helper `getTrustedClientIp` brukt i action-token; vurder å gjenbruke i andre public routes etter behov.)*

---

### P2.4 Feilmeldinger til klient lekker `error.message` (info disclosure)

**Bevis:** mange `catch` returnerer `error.message` i JSON (søk etter `error.message` i `apps/public/src/app/api`).

**Sjekkliste:**

- [x] Logg detaljert server-side; returner generisk feilkode til klient. *(Sweep fullført for `apps/public/src/app/api`; ingen `error.message`-retur gjenstår der.)*

---

## Verifikasjonspakke (kjør etter endringer)

- [x] `pnpm run type-check`
- [ ] `pnpm run lint` *(feiler pga eksisterende lint-gates/warnings i repo, ikke nye TS-feil)*
- [x] `pnpm run test:run`
- [ ] `pnpm run test:integration` (der secrets finnes) *(Kjørt; feiler pga eksisterende baseline-regresjoner/tidsouts i dashboard integration suite, ikke av nye P0/P1-endringer.)*
- [x] `pnpm dlx deno-bin test --no-check` for alle `supabase/supabase/functions/**/*.test.ts`
- [x] `pnpm run db:manifest:verify`
- [ ] `pnpm run db:apply && pnpm run db:verify` mot sikker DB-target (etter CI-fix) *(`db:apply` kjørte OK; `db:verify` feilet på eksisterende data-kvalitet: `orphan bookings found (1)` i `02_data_quality.sql`).*
- [x] Manuell: anonym public booking → staff in-app notification faktisk dukker opp *(Manuelt verifisert av bruker 2026-04-25.)*
- [ ] Manuell: simuler Stripe webhook retry etter `failed` rad (etter webhook-fix)

---

## Relaterte dokumenter

- [`must-fix-checklist-2026-04-25.md`](./must-fix-checklist-2026-04-25.md) (detaljert arbeidsliste; delvis overlapp)
- [`project-analysis-2026-04-25.md`](./project-analysis-2026-04-25.md) (bakgrunn/analyse)
- [`full-project-critical-checklist.md`](./full-project-critical-checklist.md) (historikk + lengre logg)
