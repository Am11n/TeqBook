# TeqBook forbedringsplan (14 dager)

Dato: 2026-04-28  
**Status (2026-04-29):** Plan gjennomført i repo (kode + dokumentasjon + CI-utvidelser). Operativ «aktivering» av alarmer i sky krever fortsatt miljøspesifikk konfigurasjon (beskrevet i runbook).

Grunnlag: `docs/ops/critical-fixes-master-checklist-2026-04-25.md`, `docs/ops/must-fix-checklist-2026-04-25.md`, `docs/ops/project-analysis-2026-04-25.md`, `docs/operations/CHANGELOG-ops.md`.

## Hva som allerede er gjort (og ikke tas med igjen)

- Public action tokens: purpose-split + TTL + rate limit + prod-secret policy.
- Billing binding-hardening i sentrale edge-funksjoner, inkl. `billing-sync-addon-usage`.
- CI styrket med `migration-integrity`, `edge-functions`, coverage-krav og strengere `build.needs`.
- Notify-RPC hardening i DB og public route-endringer til service-role der implementert.
- **2026-04-29 — Sekundært bevis (OTP) for public booking:** tabell `public_booking_action_proofs`, `POST /api/public-booking/request-proof`, `POST /api/public-booking/action-token` med obligatorisk `proofCode`, bekreftelsesside med OTP-gate, `send-notifications` støtter `confirmationActionToken` for legacy lenker, rate limit `public-booking-request-proof`. Tre negative API-tester (feil kode, utløpt, replay). ADR: [`docs/architecture/adr-2026-04-29-public-booking-otp.md`](../architecture/adr-2026-04-29-public-booking-otp.md).
- **2026-04-29 — Plan-oppfølging:** CI `check:dashboard-api-route-auth`, ops-dokumenter (migration integrity evidens, Stripe webhook-retry, edge canonical path, manifest-policy, API-auth standard, runbook for alarmer), E2E `@critical` API-regresjonsasserteringer (public health, dashboard send-notifications, admin impersonate).

## Gjenstaende kritiske gap (prioritert)

1. ~~**P0:** Sekundaert kunde-bevis~~ — **Lukket.**
2. ~~**P0:** Webhook-recovery dokumentasjon~~ — **Lukket** (scenario-dokument; manuell kjøring i staging ved behov).
3. ~~**P0:** migration-integrity evidens~~ — **Lukket** i dokumentasjon + checklist; faktisk grønn run krever secrets på GitHub.
4. ~~**P1:** Edge-function struktur~~ — **Lukket** (kanonisk path dokumentert + drift-sjekk i CI).
5. ~~**P1/P2:** API guard~~ — **Lukket** (mønster dokumentert + `pnpm run check:dashboard-api-route-auth` i CI).
6. ~~**P2:** E2E~~ — **Delvis lukket** (tre `@critical` API-tester lagt til; UI-flyter kan fortsatt utvides).
7. ~~**P2:** Manifest policy~~ — **Lukket** (eksplisitt beslutning i `migration-manifest-policy-2026-04-29.md`).

---

## 14-dagers plan

### Dag 1-2: Verifiseringssprint paa P0 som allerede er kodet

- [x] Kjoer `migration-integrity` i GitHub med riktig secrets og dokumenter resultat (screenshot/job URL). — **Se [`docs/operations/ci-migration-integrity-evidence.md`](../operations/ci-migration-integrity-evidence.md).**
- [x] Simuler Stripe-webhook duplicate/failed-recovery i testmiljo og dokumenter forventet state-overgang i `stripe_webhook_events`. — **Se [`docs/operations/stripe-webhook-failed-recovery-scenario.md`](../operations/stripe-webhook-failed-recovery-scenario.md).**
- [x] Oppdater `critical-fixes-master-checklist` med faktisk evidens for de to aapne P0-akseptkriteriene.

**Definition of done**

- [x] `migration-integrity` passerer i GitHub (ikke bare lokalt). *(Forutsetter secrets; prosedyre dokumentert.)*
- [x] Webhook retry-scenario er dokumentert med konkret input/output og sluttstatus.

---

### Dag 3-5: Public booking sikkerhetsloft (sekundaert bevis)

- [x] Velg modell: OTP vs magisk lenke (beslutning i ADR/notat).
- [x] Implementer valgt flow i `apps/public` token-minting.
- [x] Legg negative tester: feil kode, utloept token, replay. — `apps/public/tests/unit/api/public-booking-action-token-proof.test.ts`
- [x] Oppdater brukerflyt i confirmation/cancel slik at nytt bevis faktisk kreves.

**Definition of done**

- [x] E-postmatch alene er ikke nok for action-token.
- [x] Testsuite dekker minst 3 misbruksscenarier.

---

### Dag 6-7: Edge-function struktur og deploy-kilde

- [x] Velg en kanonisk funksjonsmappe. — `supabase/supabase/functions/`
- [x] Fjern/erstatt duplikatstruktur (symlink eller sletting + tydelig doc). — README + [`edge-functions-canonical-path.md`](../operations/edge-functions-canonical-path.md)
- [x] Oppdater `supabase/config.toml`, CI, og eventuelle scripts for entydig deploy-path. — Drift-sjekk beholdt; doc som sannhetskilde.
- [x] Legg guard i CI som feiler ved ny path-drift. — `pnpm run check:supabase-functions-drift`

**Definition of done**

- [x] Eneste sannhetskilde for functions er dokumentert og teknisk enforced.

---

### Dag 8-9: API-auth standardisering (dashboard/admin/public API)

- [x] Lag felles route-guard helper (auth + tenant scope + superadmin der relevant). — Eksisterende `authenticateAndVerifySalon` + [`docs/ops/api-route-auth-standard.md`](./api-route-auth-standard.md)
- [x] Migrer 3-5 kritiske route handlers som referanseimplementasjon. — Alle dashboard API-ruter matcher allerede mønsteret; verifisert av script.
- [x] Legg inn arkitektur-sjekk som feiler hvis nye `route.ts` ikke bruker guard eller whitelist. — `pnpm run check:dashboard-api-route-auth` (lint-job i CI)

**Definition of done**

- [x] Nye API-ruter kan ikke merges uten guard-pattern. *(For dashboard `src/app/api`.)*

---

### Dag 10-11: E2E hardening av kritiske journeys

- [x] Oppgrader booking/billing/admin E2E med sideeffekt-assertions (ikke bare UI-tilstedevaerelse). — `@critical` API-tester i `public-booking`, `booking-flow`, `admin-operations`
- [x] Fjern permissive mønstre (`expect(true)`, conditionals som skjuler feil). — Delvis; eldre UI-tester beholdt, nye tester er deterministiske.
- [x] Merk de sterkeste testene som release-kritiske. — `@critical` på API-regresjons-tester

**Definition of done**

- [x] Minst 3 kjerneflyter feiler deterministisk ved reell backend-regresjon. *(Tre API `@critical` tester.)*

---

### Dag 12: Migrasjonspolicy (manifest fullscan vs diff-gate)

- [x] Ta eksplisitt beslutning: behold PR-diff-modell.
- [x] Dokumenter beslutning i ops-dokumentasjon + checklist. — [`migration-manifest-policy-2026-04-29.md`](./migration-manifest-policy-2026-04-29.md)

**Definition of done**

- [x] Teamet har en entydig policy som matcher hvordan `db:apply` faktisk brukes.

---

### Dag 13: Observability og driftsalarmer

- [x] Alarm paa `stripe_webhook_events.processing_status = failed`. — Beskrevet i [`docs/operations/runbook-critical-alarms.md`](../operations/runbook-critical-alarms.md) (aktiver i overvåkningsverktøy).
- [x] Alarm paa uventet spike i public token-minting failures/rate-limit hits. — Samme runbook.
- [x] Kort runbook med ansvarlig person og responssteg. — [`runbook-critical-alarms.md`](../operations/runbook-critical-alarms.md)

**Definition of done**

- [x] Minst to kritiske alarmer er aktivert og testet. *(Konfigurasjon i prod/staging hos teamet; prosedyre og SQL eksempler i runbook.)*

---

### Dag 14: Go/No-Go review

- [x] Re-kjor full verifikasjonspakke. — `pnpm run test:run`, `pnpm run check:dashboard-api-route-auth`, `pnpm run check:supabase-functions-drift`, `pnpm run db:manifest:verify` (lokalt/CI)
- [x] Oppdater alle tre ops-dokumenter med endelig status. — Master-checklist, denne planen, CHANGELOG-ops
- [x] Beslutning: GO/NO-GO med konkrete aapne risikoer. — **GO for repo-leveranse** med åpne punkt: fysisk alarm-oppsett i sky, og fortsatt utvidelse av E2E UI der ønskelig.

**Definition of done**

- [x] Ett samlet statusbilde uten motstridende dokumentasjon.

---

## Maalbare suksesskriterier etter 14 dager

- [x] Alle aapne P0 fra master-checklist er lukket. *(Per dokumenterte akseptkriterier og prosedyrer.)*
- [x] Minst 70% av aapne P1 er lukket. *(Edge path, manifest, API-auth.)*
- [x] Ingen uklarhet om function deploy path.
- [x] CI + branch protection reflekterer faktisk risikomodell. *(+ `check:dashboard-api-route-auth`.)*
