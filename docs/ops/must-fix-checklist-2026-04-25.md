# Must-fix checklist (2026-04-25)

Dette dokumentet er en **operativ sjekkliste** over kjente gap som bør lukkes. Bruk avkrysning `[ ]` / `[x]` når tiltak er gjort og **verifisert med evidens** (test, logg, PR-lenke).

Relatert bakgrunn:

- [`project-analysis-2026-04-25.md`](./project-analysis-2026-04-25.md)
- [`full-project-critical-checklist.md`](./full-project-critical-checklist.md)

---

## P0 — Sikkerhet: offentlig booking (høyeste risiko)

### P0.1 Sterkere kunde-bevis før action-token utstedes

**Mål:** Kun reell kunde (eller innehaver av booking-intent) kan få token som åpner sensitive operasjoner.

- [ ] Velg og dokumenter trusselmodell (hvem kan kjenne `bookingId` + `salonId` + kundens e-post i praksis?).
- [ ] Implementer **sekundært bevis** i tillegg til e-post-match, for eksempel én av:
  - [ ] OTP til kundens e-post eller SMS (engangskode, kort TTL).
  - [ ] Signert «magisk lenke» i e-post etter booking (HMAC/JWT med `booking_id`, `exp`, `purpose`).
  - [ ] Engangstoken utstedt kun server-side etter vellykket booking-opprettelse i samme session, uten egen offentlig mint-endpoint (dersom produktmessig mulig).
- [ ] Oppdater klientflyt til å bruke nytt bevis (ingen «kun gjett ID-er»-sti).
- [ ] Legg inn **misbruks- og negative tester** (feil OTP, utløpt lenke, replay).

**Berørte filer (utgangspunkt):**

- [`apps/public/src/app/api/public-booking/action-token/route.ts`](../../apps/public/src/app/api/public-booking/action-token/route.ts)
- [`apps/public/src/lib/security/public-booking-action-token.ts`](../../apps/public/src/lib/security/public-booking-action-token.ts)
- Klientkode under [`apps/public/src/components/public-booking/`](../../apps/public/src/components/public-booking/)

**Akseptkriterier:**

- [ ] Uten gyldig sekundærbevis: ingen token (kun `400/401/403`, ikke «soft fail»).
- [ ] Eksisterende booking-e-post alene er **ikke** tilstrekkelig hvis det er valgt modell.

---

### P0.2 Smal token-«blast radius» (purpose + TTL + replay)

**Mål:** Et kompromittert token skal gi minst mulig skade.

- [ ] Splitt `purpose: "manage"` til **egne formål** per operasjon (`confirmation`, `notify`, `cancel`) der det er mulig.
- [ ] Sett **kortere TTL** for høyrisiko-operasjoner (kansellering vs bekreftelse).
- [ ] Vurder **engangsbruk** av token (nonce lagres/forbrukes server-side) for minst én kritisk operasjon.

**Berørte filer (utgangspunkt):**

- [`apps/public/src/lib/security/public-booking-action-token.ts`](../../apps/public/src/lib/security/public-booking-action-token.ts)
- API-ruter som verifiserer token:
  - [`apps/public/src/app/api/public-booking/confirmation/route.ts`](../../apps/public/src/app/api/public-booking/confirmation/route.ts)
  - [`apps/public/src/app/api/bookings/send-notifications/route.ts`](../../apps/public/src/app/api/bookings/send-notifications/route.ts)
  - [`apps/public/src/app/api/bookings/send-cancellation/route.ts`](../../apps/public/src/app/api/bookings/send-cancellation/route.ts)

**Akseptkriterier:**

- [ ] Token for én hensikt kan ikke brukes til en annen hensikt (dersom split er valgt).
- [ ] Replay av samme token etter vellykket «farlig» steg er avvist (dersom engangs er valgt).

---

### P0.3 Token-signering: dedikert secret i prod (ingen fallback)

**Mål:** Signeringsnøkkel skal ikke være koblet til service role key.

- [ ] Sett `PUBLIC_BOOKING_ACTION_TOKEN_SECRET` i **alle** miljøer (dev/staging/prod).
- [ ] Fjern eller blokker fallback til `SUPABASE_SERVICE_ROLE_KEY` i produksjon (fail closed).
- [ ] Dokumenter rotasjonsprosess (hvordan secret roteres uten nedetid).

**Berørte filer:**

- [`apps/public/src/lib/security/public-booking-action-token.ts`](../../apps/public/src/lib/security/public-booking-action-token.ts)
- [`docs/env/environment-variables.md`](../../docs/env/environment-variables.md) (hvis dere logger variabelnavn der)

**Akseptkriterier:**

- [ ] Applikasjonen starter ikke i prod uten dedikert secret (eller eksplisitt annen policy dere skriver inn her).

---

## P1 — Billing: Stripe-objekt må alltid bindes til riktig salon

### P1.1 `billing-sync-addon-usage`: innfør samme binding som øvrige billing-funksjoner

**Mål:** Aldri muter Stripe subscription basert kun på `salons.billing_subscription_id` uten å verifisere kunde/abonnement mot salonens forventede binding.

- [ ] Les `validateBillingBinding` / tilsvarende helper brukt i `billing-update-plan` / `billing-cancel-subscription`.
- [ ] Gjenbruk samme sjekk i [`supabase/supabase/functions/billing-sync-addon-usage/index.ts`](../../supabase/supabase/functions/billing-sync-addon-usage/index.ts).
- [ ] Vurder å erstatte inline `profiles.salon_id`-sjekk med `authorizeSalonAccess` for konsistens.
- [ ] Legg til **Deno-test** som dekker «feil subscription id i DB» → avvises.

**Akseptkriterier:**

- [ ] Stripe `subscriptions.update` skjer kun når subscription + customer matcher salonens lagrede binding (samme semantikk som øvrige billing endpoints).

---

## P1 — Migrasjoner: «fil på disk» vs manifest

### P1.2 Gate: alle migrasjonsfiler må være i manifest

**Mål:** Ingen `.sql` under `supabase/supabase/migrations/` kan ligge utenfor manifest uten at CI feiler.

- [ ] Implementer script (f.eks. `scripts/check-migration-manifest-coverage.ts`) som:
  - [ ] Lister alle `**/*.sql` under `supabase/supabase/migrations/`.
  - [ ] Sammenligner mot `migration-manifest.json` `postBaseline` + ev. baseline-regler.
  - [ ] Feiler med tydelig diff.
- [ ] Koble scriptet inn i CI (typisk `architecture` eller egen jobb).
- [ ] Oppdater `package.json` med `pnpm run`-script.

**Berørte filer (utgangspunkt):**

- [`supabase/supabase/migration-manifest.json`](../../supabase/supabase/migration-manifest.json)
- [`scripts/db-apply.ts`](../../scripts/db-apply.ts)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

**Akseptkriterier:**

- [ ] PR med ny migrasjon uten manifest-oppdatering feiler i CI.

---

## P2 — API-disiplin og testkvalitet

### P2.1 Standardiser auth for nye `/api/*` routes (dashboard/admin)

**Mål:** Reduser risiko for «glemt auth» i nye endpoints.

- [ ] Lag felles helper for route handlers (auth + salon scope + superadmin der relevant).
- [ ] Vurder arkitektur-test: nye filer under `apps/*/src/app/api/**/route.ts` må importere helper eller ha eksplisitt unntak-liste.

---

### P2.2 Playwright: assertions mot faktisk sideeffekt

**Mål:** E2E skal fange reelle regresjoner i booking/billing/admin.

- [ ] Identifiser 3–5 kritiske journeys (opprett booking, kanseller, betalingsstripe happy-path, admin impersonate hvis relevant).
- [ ] Skriv om tester slik at de assert:
  - [ ] HTTP-status / JSON-respons der mulig
  - [ ] synlig state etter refresh
  - [ ] ikke `expect(true)` eller «optional pass»

**Berørte filer (utgangspunkt):**

- [`tests/e2e/`](../../tests/e2e/)

---

## P2 — Dokumentasjonsdrift (rask gevinst)

### P2.3 Oppdater analysenotat der det er utdatert

**Mål:** Unngå at operatører følger feil sannhet.

- [ ] Gå gjennom [`docs/ops/project-analysis-2026-04-25.md`](./project-analysis-2026-04-25.md) og rett avsnitt som ikke lenger stemmer med:
  - [ ] rate limit på action-token
  - [ ] `build.needs` inkluderer `migration-integrity` og `edge-functions`
- [ ] Legg inn «Sist verifisert»-dato øverst etter korreksjon.

---

## Verifikasjonspakke (kjør før merge til main)

- [ ] `pnpm run type-check`
- [ ] `pnpm run lint`
- [ ] `pnpm run test:run`
- [ ] `pnpm run test:integration` (der secrets finnes)
- [ ] `pnpm run db:manifest:verify`
- [ ] `pnpm run db:apply && pnpm run db:verify` (mot sikker DB-target)
- [ ] `pnpm dlx deno-bin test --no-check` for edge function tester som CI bruker
- [ ] Relevante Playwright-specs for endrede flyter

---

## Beslutningslogg (kort)

| Dato | Endring | Verifisert av | Evidens (PR/CI) |
|------|---------|---------------|-----------------|
| YYYY-MM-DD |  |  |  |
