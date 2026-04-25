# TeqBook prosjektanalyse (2026-04-25)

Dette dokumentet er et **datert helhetsbilde** av repoet slik det fremstår i kode og CI per 2026-04-25. Målet er å peke på **hva som fungerer bra**, **hva som bør forbedres**, og **hvilke tiltak som gir mest risikoreduksjon per krone**.

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
- CI har vokst til å inkludere **migrasjonsintegritet**, **edge function tester**, og **coverage-gates** for public/admin (se `.github/workflows/ci.yml`).

---

## 2) Sikkerhet og tillitsgrenser (viktigste funn)

### 2.1 Offentlig booking: action tokens

**Nåværende tilstand (positivt):**

- `POST /api/public-booking/action-token` krever `bookingId`, `salonId` og `customerEmail`, og avviser ved mismatch mot bookingens kunde-e-post i databasen.
- Se `apps/public/src/app/api/public-booking/action-token/route.ts`.

**Forbedringsbehov (fortsatt reelt):**

1. **Eierskap er kun “kjenner e-post”**  
   Alle som kjenner booking-ID, salon-ID og kundens e-post kan be om token. Det er bedre enn åpen tilgang, men ikke på nivå med OTP, magisk lenke-signatur, eller engangskode til innboks/SMS.

2. **Ingen rate limiting på token-utstedelse**  
   Nedstrøms `send-notifications` / `send-cancellation` har rate limit-mønstre; token-endepunktet bør ha tilsvarende beskyttelse for å hindre enumerasjon og belastning.

3. **`manage` er et bredt formål**  
   Samme token aksepteres i flere sensitive ruter (`confirmation`, `notify`, `cancel`). Det øker skadeomfanget ved lekkasje/intercept.

4. **Nonce er ikke engangs**  
   `nonce` genereres, men det finnes ingen persistert “brukt nonce”/replay-cache i verifiseringen. Token er dermed **gjeldig og gjenbrukbar innenfor TTL** hvis den avlyttes.
   Se `apps/public/src/lib/security/public-booking-action-token.ts`.

5. **Hemmelighetskobling**  
   Token-signering faller tilbake til `SUPABASE_SERVICE_ROLE_KEY` hvis `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` mangler. Det kobler token-integritet til en svært sensitiv hemmelighet og bør unngås i produksjon.

**Anbefalte tiltak (prioritert):**

- P0/P1: Innfør **OTP eller signert e-postlenke** (kortlivet) før token utstedes, eller begrens token til **smalere purpose** per operasjon.
- P1: **Rate limit** på `action-token` (samme policy-mønster som øvrige public routes).
- P1: Vurder **purpose-split** (`confirmation` vs `notify` vs `cancel`) og kortere TTL per risiko.
- P2: Dedikert `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` i alle miljøer; fjern fallback i prod.
- P2: Vurder **engangsbruk** av token (nonce store med TTL) for høyrisiko-operasjoner.

---

### 2.2 Dashboard og Admin: side-ruting vs API

**Nåværende tilstand:**

- `apps/dashboard/middleware.ts` og `apps/admin/middleware.ts` håndhever auth for **pages**, men ekskluderer `/api/*` fra samme middleware-blokk.

**Forbedringsbehov:**

- API-sikkerhet er **distribuert per route**. Det fungerer når disiplinen holdes, men skalerer dårlig: én glemt auth-sjekk i en ny route blir et hull.

**Anbefalte tiltak:**

- P2: Standardiser **felles helper** for route handlers (auth + salon scope + superadmin) og arkitektur-test som feiler ved nye `/api`-filer uten guard.
- P2: Vurder en **minimal** middleware-sjekk for `/api/*` (f.eks. session presence der det er forventet), der det er teknisk forsvarlig.

---

### 2.3 Billing (Edge Functions)

**Nåværende tilstand (positivt):**

- Flere billing-mutasjoner bruker delt `authorizeSalonAccess` og Stripe/DB-binding validering via `validateBillingBinding` (se f.eks. `billing-update-plan` og `billing-cancel-subscription`).

**Forbedringsbehov (inkonsistens):**

- `billing-sync-addon-usage` bruker en **annen** auth-modell (`profiles.salon_id`) og muterer Stripe-subscription basert på `salons.billing_subscription_id` uten den samme eksplisitte binding-sjekken som øvrige billing-flyter.
  Se `supabase/supabase/functions/billing-sync-addon-usage/index.ts`.

**Risiko:**

- Hvis `billing_subscription_id` er feil eller stale, kan funksjonen oppdatere feil Stripe-abonnement relativt til intensjonen (lav sannsynlighet, men høy konsekvens).

**Anbefalte tiltak:**

- P1: Gjenbruk `authorizeSalonAccess` + `validateBillingBinding` her også (eller tilsvarende Stripe customer/subscription cross-check).
- P2: Gjør authz-mønsteret **homogent** på tvers av alle billing-funksjoner for å redusere drift.

---

## 3) Data, migrasjoner og miljø-paritet

### 3.1 Manifest og checksum

`pnpm run db:manifest:verify` (`scripts/db-manifest.ts`) verifiserer at manifest + checksums stemmer for **filene som er listet**.

**Forbedringsbehov:**

- Verifikasjonen beviser ikke automatisk at **alle** `.sql`-filer under `supabase/supabase/migrations/` er med i manifest. En ny fil kan ligge urørt til noen oppdaterer manifest og låser checksums.

### 3.2 `db:apply`

`scripts/db-apply.ts` kjører kun `baseline` + `postBaseline` fra manifest, med integritetssjekk mot checksum-fil.

**Anbefalte tiltak:**

- P1: CI eller script: **fail hvis det finnes migrasjonsfiler på disk som ikke er i manifest** (komplement til dagens checksum-verify).
- P2: Dokumenter eksplisitt “source of truth” for deploy (kun manifest-styrt apply vs Supabase CLI push), slik at team ikke divergerer i prosess.

---

## 4) CI, tester og release-kvalitet

### 4.1 Hva CI faktisk blokkerer i dag

Fra `.github/workflows/ci.yml`:

- Typecheck, lint, format, tester, integrasjon, coverage, arkitektur-guards.
- `migration-integrity` kjører `db:manifest:verify` og `db:apply && db:verify` (krever `SUPABASE_DB_URL` secret).
- `edge-functions` kjører `deno test` på `**/*.test.ts` under `supabase/supabase/functions` og feiler hvis ingen tester finnes.

**Forbedringsbehov:**

1. **`build` avhenger ikke av `migration-integrity` eller `edge-functions`**  
   PR kan i teorien bygge og kjøre E2E selv om migrasjon/edge-jobb feiler, med mindre GitHub branch protection krever disse jobbene eksplisitt.

2. **E2E “business journey”-kvalitet**  
   Selv når E2E kjører, er testenes styrke avhengig av assertions (svake assertions gir falsk trygghet). Dette bør løpende strammes inn der det er business-kritisk.

**Anbefalte tiltak:**

- P1: Sett `migration-integrity` og `edge-functions` som **required checks** i GitHub branch protection (repo-innstilling, ikke bare workflow).
- P1: Vurder å legge disse inn i `build.needs` hvis dere vil at merge alltid impliserer grønn migrasjon + edge tests.
- P2: Stram inn Playwright-spesifikasjoner på booking/billing/admin til å assert **servereffekt** (status, DB-rad, API-respons), ikke bare UI-tekst.

---

## 5) Drift, observabilitet og operasjonell modenhet

**Forbedringsbehov (generelt, basert på typisk gap i slike repoer):**

- P2: Sikre at kritiske feil (booking, betaling, webhooks, e-post/SMS) har **SLO/alarmer** og runbooks med eier (ikke “TBD”).
- P2: Standardiser **korrelasjons-ID** gjennom public API → backend → logger (mye er allerede på plass via shared headers; verifiser konsistens i alle nye ruter).

---

## 6) Prioritert forbedrings-backlog (P0–P3)

### P0 (blokkerende før bred produksjon hvis trusselmodellen krever det)

- [ ] Styrket **kunde-bevis** før utstedelse av booking action tokens (OTP / magisk lenke / engangskode), ikke bare e-post-match.

### P1 (bør gjøres før skala og før aggressiv markedsføring av public booking)

- [ ] Rate limit på `action-token` endepunktet.
- [ ] Juster `manage`-token: smalere purpose og/eller kortere TTL per operasjon.
- [ ] Align `billing-sync-addon-usage` med samme binding/authz-mønster som øvrige billing-funksjoner.
- [ ] Manifest “full coverage” gate: alle migrasjonsfiler må være representert.
- [ ] Branch protection: krev `migration-integrity` + `edge-functions` som merge-gates.

### P2 (kvalitet, kostnad, vedlikehold)

- [ ] Fjern fallback til service role key for token-signering i prod; egen secret rotation.
- [ ] Replay-beskyttelse for action tokens der det gir mening (nonce store / engangsbruk).
- [ ] API-route guard standardisering + arkitektur-test for nye routes.
- [ ] Stramme E2E assertions på kjernereiser.

### P3 (langsiktig)

- [ ] Reduser duplisering/risk mellom `supabase/functions` og `supabase/supabase/functions` hvis begge vedlikeholdes (drift og deploy-forvirring).

---

## 7) Konklusjon

TeqBook fremstår som et **modent monorepo** med god struktur, aktiv CI, og flere riktige sikkerhetsgrep (tokens, migrasjonsjobber, edge function tester).

De største gjenstående forbedringene er **konsistens og “siste mile”** innen:

1. offentlig bookings tillitsmodell (token minting og replay),
2. homogen billing-sikkerhet på alle Stripe-berørende funksjoner,
3. migrasjonsmanifest vs filsystem-dekning,
4. CI/branch protection slik at kritiske jobber alltid er merge-blokkerende.

---

## 8) Neste dokumentasjonssteg (valgfritt)

Hvis dere gjør endringer basert på denne analysen, bør det logges kort i `docs/operations/CHANGELOG-ops.md` i tråd med prosjektets daglige ops-regel (uten hemmeligheter).
