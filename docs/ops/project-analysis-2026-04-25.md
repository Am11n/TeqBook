# TeqBook prosjektanalyse (2026-04-25)

**Sist verifisert (innhold/CI-paritet):** 2026-04-25 (oppdatert etter purpose-split for action tokens, prod-secret-policy, manifest-diff-gate i CI).

Dette dokumentet er et **datert helhetsbilde** av repoet slik det fremstår i kode og CI per 2026-04-25, med en **lukkelogg** for tiltak som ble implementert samme dag. Målet er å peke på **hva som fungerer bra**, **hva som bør forbedres**, og **hvilke tiltak som gir mest risikoreduksjon per krone**.

Relatert operativ sjekkliste: [`full-project-critical-checklist.md`](./full-project-critical-checklist.md).

---

## 1) Arkitektur og produktflate (kort)

Monorepo med tynne app-skall og delte pakker:

| App | Rolle |
|-----|--------|
| `apps/public` | Offentlig booking, markedsføring, offentlige API-ruter |
| `apps/dashboard` | Salongeier/staff: drift, bookinger, kalender, innstillinger |
| `apps/admin` | Superadmin: drift, onboarding, systemkontroller |
| `supabase/supabase` | Migrasjoner, verifikasjonsskript, Edge Functions |

**Sterke sider (observerbar i repo):**

- Tydelig pakkeinndeling og import-regler (se `.cursor/rules/cursorrules.mdc`).
- Offentlig booking har **signerte action tokens** og server-side verifisering i flere ruter.
- CI blokkerer på typecheck, lint, format, sikkerhetsskanning, tester, integrasjon, migrasjonsintegritet, edge-function-tester, coverage (dashboard + public/admin med minimum), arkitektur-guards, og **build avhenger av alle disse** (se `.github/workflows/ci.yml`).

---

## 2) Sikkerhet og tillitsgrenser (viktigste funn)

### 2.1 Offentlig booking: action tokens

**Nåværende tilstand (etter lukking 2026-04-25):**

- `POST /api/public-booking/action-token` krever `bookingId`, `salonId` og `customerEmail`.
- Utstedelse avvises hvis booking mangler kunde-e-post i DB, eller hvis oppgitt e-post ikke matcher den autoritative e-posten på bookingens kunde.
- **Rate limiting** er innført på samme mønster som øvrige public API-ruter (`checkRateLimit` / `incrementRateLimit`), med egen policy `public-booking-action-token` i `packages/shared-core/src/rate-limit/policy.ts`.
- **Purpose-split:** `POST /api/public-booking/action-token` tar `purposes: ["confirmation"|"notify"|"cancel"]` (unike) og returnerer `tokens` per formål. Verifiseringsruter tillater **kun** matchende enkelt-formål. TTL per formål: bekreftelse 30 min, varsling 15 min, kansellering 10 min. Kansellering fra bekreftelsessiden minter et eget `cancel`-token rett før `send-cancellation`.
- **Prod-secret:** I produksjon (`NODE_ENV`/`VERCEL_ENV` production) kreves `PUBLIC_BOOKING_ACTION_TOKEN_SECRET`; ingen fallback til service role. Lokalt/test kan fortsatt bruke `SUPABASE_SERVICE_ROLE_KEY` hvis dedikert secret mangler. Se `docs/env/environment-variables.md`.
- Se `apps/public/src/app/api/public-booking/action-token/route.ts`.

**Gjenstående forbedringsbehov (fortsatt reelt):**

1. **Eierskap er fortsatt “kjenner e-post”**  
   Alle som kjenner booking-ID, salon-ID og kundens e-post kan be om token. Det er bedre enn åpen tilgang og nå begrenset av rate limit, men ikke på nivå med OTP, magisk lenke-signatur, eller engangskode til innboks/SMS.

2. **Nonce er ikke engangs**  
   `nonce` genereres, men det finnes ingen persistert “brukt nonce”/replay-cache i verifiseringen. Token er dermed **gjeldig og gjenbrukbar innenfor TTL** hvis den avlyttes.  
   Se `apps/public/src/lib/security/public-booking-action-token.ts`.

**Anbefalte tiltak (prioritert, gjenstående):**

- P0/P1: Innfør **OTP eller signert e-postlenke** (kortlivet) før token utstedes (e-post alene som bevis er fortsatt begrenset; se must-fix P0.1).
- P2: Vurder **engangsbruk** av token (nonce store med TTL) for høyrisiko-operasjoner.

---

### 2.2 Dashboard og Admin: side-ruting vs API

**Nåværende tilstand:**

- `apps/dashboard/middleware.ts` og `apps/admin/middleware.ts` håndhever auth for **pages**, men ekskluderer `/api/*` fra samme middleware-blokk.

**Forbedringsbehov (uendret):**

- API-sikkerhet er **distribuert per route**. Det fungerer når disiplinen holdes, men skalerer dårlig: én glemt auth-sjekk i en ny route blir et hull.

**Anbefalte tiltak:**

- P2: Standardiser **felles helper** for route handlers (auth + salon scope + superadmin) og arkitektur-test som feiler ved nye `/api`-filer uten guard.
- P2: Vurder en **minimal** middleware-sjekk for `/api/*` (f.eks. session presence der det er forventet), der det er teknisk forsvarlig.

---

### 2.3 Billing (Edge Functions)

**Nåværende tilstand (etter lukking 2026-04-25):**

- Delt helper `validateBillingBinding` (`supabase/supabase/functions/_shared/billing-binding.ts`) brukes for å sikre at Stripe `customer` / `subscription` som muteres matcher salonens lagrede `billing_customer_id` / `billing_subscription_id` der det er relevant.
- Berørte funksjoner inkluderer blant annet `billing-create-subscription`, `billing-update-plan`, `billing-cancel-subscription`, `billing-update-payment-method`.
- `billing-sync-addon-usage` er **alignet** med `authorizeSalonAccess` (samme tenant-modell som øvrige billing-flyter) og validerer Stripe-subscriptionens customer mot `salons.billing_customer_id` før `subscriptions.update`.

**Gjenstående forbedringsbehov:**

- P2: Gjør authz-mønsteret **homogent** på tvers av alle edge-funksjoner (rate limit, idempotency-nøkler, logging) for redusert drift.

---

## 3) Data, migrasjoner og miljø-paritet

### 3.1 Manifest og checksum

`pnpm run db:manifest:verify` (`scripts/db-manifest.ts`) verifiserer at manifest + checksums stemmer for **filene som er listet** i `supabase/supabase/migration-manifest.json`.

**Viktig presisering (kilde til sannhet):**

- `db:apply` er **manifest-styrt** (baseline + `postBaseline`). Katalogen `supabase/supabase/migrations/` inneholder også historisk/legacy SQL som **ikke** nødvendigvis skal inn i manifest-modellen uten eksplisitt beslutning.
- En “fail hvis *enhver* `.sql` i `migrations/` mangler i manifest”-gate er derfor **ikke** riktig modell for dette repoet slik det står i dag; risikoen håndteres ved at **nye** endringer som skal deployes via `db:apply` må inn i manifest + checksum-lock.
- **PR-diff-gate (2026-04-25):** `pnpm run db:migrations:manifest-coverage` (`scripts/check-migration-manifest-coverage.ts`) kjøres i **lint**-jobben på `pull_request` og feiler hvis en endret migrasjonsfil under `supabase/supabase/migrations/` ikke er listet i `postBaseline`.

### 3.2 `db:apply` og CI

- `scripts/db-apply.ts` kjører `baseline` + `postBaseline` fra manifest, med integritetssjekk mot checksum-fil.
- CI-jobb **`migration-integrity`** kjører `db:manifest:verify` og deretter `db:apply && db:verify` når `SUPABASE_DB_URL` er satt som secret (se `.github/workflows/ci.yml`).

---

## 4) CI, tester og release-kvalitet

### 4.1 Hva CI faktisk blokkerer i dag

Fra `.github/workflows/ci.yml`:

- Typecheck, lint, format, **security-scan** (`pnpm audit --prod --audit-level=high`), unit tests, integrasjonstester.
- **`migration-integrity`**: `db:manifest:verify` + blokkerende `db:apply && db:verify` (krever `SUPABASE_DB_URL` + pilot-ref env som i workflow).
- **`edge-functions`**: `pnpm dlx deno-bin test --no-check` på alle `*.test.ts` under `supabase/supabase/functions` (portabel `find`, feiler hvis ingen tester finnes).
- Coverage (dashboard) + utvidet coverage (public/admin) med **minimum 40 %** på linjer/statements/functions/branches.
- Arkitektur-guards.
- **`build` avhenger av alle jobber over** (inkl. `security-scan`, `migration-integrity`, `edge-functions`, `coverage-extended`), slik at merge som krever grønn `build` også impliserer disse portene.

**Gjenstående forbedringsbehov:**

1. **Branch protection** i GitHub må fortsatt konfigureres til å kreve de samme jobbene som “required checks” (repo-innstilling utenfor workflow-filen).
2. **E2E “business journey”-kvalitet** — assertions bør løpende strammes inn der det er business-kritisk.

---

## 5) Drift, observabilitet og operasjonell modenhet

**Forbedringsbehov (generelt, basert på typisk gap i slike repoer):**

- P2: Sikre at kritiske feil (booking, betaling, webhooks, e-post/SMS) har **SLO/alarmer** og runbooks med eier (ikke “TBD”).
- P2: Standardiser **korrelasjons-ID** gjennom public API → backend → logger (mye er allerede på plass via shared headers; verifiser konsistens i alle nye ruter).

---

## 6) Prioritert forbedrings-backlog (P0–P3)

### P0 (blokkerende før bred produksjon hvis trusselmodellen krever det)

- [ ] Styrket **kunde-bevis** før utstedelse av booking action tokens (OTP / magisk lenke / engangskode), ikke bare e-post-match + rate limit.

### P1 (bør gjøres før skala og før aggressiv markedsføring av public booking)

- [x] Rate limit på `action-token` endepunktet (`public-booking-action-token` policy + route).
- [ ] Juster `manage`-token: smalere purpose og/eller kortere TTL per operasjon.
- [x] Align `billing-sync-addon-usage` med samme binding/authz-mønster som øvrige billing-funksjoner.
- [x] CI: blokkerende `migration-integrity` + `edge-functions` (se workflow).
- [ ] Branch protection: krev `migration-integrity` + `edge-functions` + `security-scan` som merge-gates i GitHub (utenfor repo-fil).

### P2 (kvalitet, kostnad, vedlikehold)

- [ ] Fjern fallback til service role key for token-signering i prod; egen secret rotation.
- [ ] Replay-beskyttelse for action tokens der det gir mening (nonce store / engangsbruk).
- [ ] API-route guard standardisering + arkitektur-test for nye routes.
- [ ] Stramme E2E assertions på kjernereiser.

### P3 (langsiktig)

- [ ] Reduser duplisering/risk mellom `supabase/functions` og `supabase/supabase/functions` hvis begge vedlikeholdes (drift og deploy-forvirring).

---

## 7) Konklusjon

TeqBook fremstår som et **modent monorepo** med god struktur, aktiv CI, og flere riktige sikkerhetsgrep (tokens, migrasjonsjobber, edge function tester, billing-binding).

Etter lukkingene 2026-04-25 er de største **gjenværende** forbedringene konsentrasjon og “siste mile” innen:

1. offentlig bookings tillitsmodell utover e-post-bevis (OTP / magisk lenke / replay),
2. GitHub branch protection som speiler CI-jobber eksplisitt,
3. homogen drift på tvers av alle edge-funksjoner (observabilitet, rate limits der det mangler).

---

## 8) Lukkelogg (2026-04-25) — implementert og dokumentert her

| Område | Endring | Filer / notater |
|--------|---------|-----------------|
| Public action-token ownership | Obligatorisk `customerEmail`; avvis hvis booking mangler kunde-e-post eller mismatch | `apps/public/src/app/api/public-booking/action-token/route.ts` |
| Public action-token abuse | Rate limit policy + sjekk/increment i route | `packages/shared-core/src/rate-limit/policy.ts` (`public-booking-action-token`), `apps/public/src/app/api/public-booking/action-token/route.ts` |
| Billing Stripe ↔ salon binding | Delt `validateBillingBinding` + bruk i mutasjoner | `supabase/supabase/functions/_shared/billing-binding.ts`, `billing-create-subscription`, `billing-update-plan`, `billing-cancel-subscription`, `billing-update-payment-method` |
| Billing sync addon | `authorizeSalonAccess` + Stripe customer-binding etter `subscriptions.retrieve` | `supabase/supabase/functions/billing-sync-addon-usage/index.ts` |
| Edge function tester | Deno-tester for binding-logikk | `supabase/supabase/functions/_shared/billing-binding.test.ts` |
| CI migrasjoner | `migration-integrity` jobb (manifest + apply + verify med secrets) | `.github/workflows/ci.yml` |
| CI edge | `edge-functions` jobb; bruker `find` for portabilitet | `.github/workflows/ci.yml` |
| CI build gate | `build.needs` inkluderer alle blokkerende jobber inkl. `security-scan`, `migration-integrity`, `edge-functions`, `coverage-extended` | `.github/workflows/ci.yml` |

Operativ changelog (kort, uten hemmeligheter): se [`docs/operations/CHANGELOG-ops.md`](../operations/CHANGELOG-ops.md) under **2026-04-25**.

---

## 9) Neste dokumentasjonssteg (valgfritt)

Ved nye funn: oppdater denne analysen med ny dato-seksjon, eller lenk til oppdatert analyse-fil, slik at `full-project-critical-checklist.md` forblir operativ sannhet og dette dokumentet forblir historisk snapshot + lukkelogg.
