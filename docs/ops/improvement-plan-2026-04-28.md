# TeqBook forbedringsplan (14 dager)

Dato: 2026-04-28  
Grunnlag: `docs/ops/critical-fixes-master-checklist-2026-04-25.md`, `docs/ops/must-fix-checklist-2026-04-25.md`, `docs/ops/project-analysis-2026-04-25.md`, `docs/operations/CHANGELOG-ops.md`.

## Hva som allerede er gjort (og ikke tas med igjen)

- Public action tokens: purpose-split + TTL + rate limit + prod-secret policy.
- Billing binding-hardening i sentrale edge-funksjoner, inkl. `billing-sync-addon-usage`.
- CI styrket med `migration-integrity`, `edge-functions`, coverage-krav og strengere `build.needs`.
- Notify-RPC hardening i DB og public route-endringer til service-role der implementert.
- **2026-04-29 — Sekundært bevis (OTP) for public booking:** tabell `public_booking_action_proofs`, `POST /api/public-booking/request-proof`, `POST /api/public-booking/action-token` med obligatorisk `proofCode`, bekreftelsesside med OTP-gate, `send-notifications` støtter `confirmationActionToken` for legacy lenker, rate limit `public-booking-request-proof`. Se `CHANGELOG-ops.md` (2026-04-29).

## Gjenstaende kritiske gap (prioritert)

1. ~~**P0:** Sekundaert kunde-bevis i public booking (OTP/magisk lenke) mangler fortsatt.~~ **Lukket i kode (2026-04-29).** Gjenstår: utvide negative/API-tester (se Dag 3-5) og eventuell formell ADR.
2. **P0:** Webhook-recovery mangler manuell/verifisert retry-test for `failed` ledger-scenario.
3. **P0:** `migration-integrity` er oppdatert i kode, men mangler bekreftet groenn kjøring paa ren GitHub-runner.
4. **P1:** Dobbel edge-function struktur er ikke fullt ryddet (`supabase/functions` vs `supabase/supabase/functions`).
5. **P1/P2:** API guard-standardisering for nye `/api/*` routes mangler.
6. **P2:** E2E-kvalitet: flere kritiske journeys trenger sterkere assertions.
7. **P2:** Manifest fullscan-policy (utover PR-diff) er fortsatt uavklart.

---

## 14-dagers plan

### Dag 1-2: Verifiseringssprint paa P0 som allerede er kodet

- [ ] Kjoer `migration-integrity` i GitHub med riktig secrets og dokumenter resultat (screenshot/job URL).
- [ ] Simuler Stripe-webhook duplicate/failed-recovery i testmiljo og dokumenter forventet state-overgang i `stripe_webhook_events`.
- [ ] Oppdater `critical-fixes-master-checklist` med faktisk evidens for de to aapne P0-akseptkriteriene.

**Definition of done**
- `migration-integrity` passerer i GitHub (ikke bare lokalt).
- Webhook retry-scenario er dokumentert med konkret input/output og sluttstatus.

---

### Dag 3-5: Public booking sikkerhetsloft (sekundaert bevis)

- [x] Velg modell: OTP vs magisk lenke (beslutning i ADR/notat). — **OTP valgt og implementert (2026-04-29); formell ADR/notat mangler fortsatt.**
- [x] Implementer valgt flow i `apps/public` token-minting.
- [ ] Legg negative tester: feil kode, utloept token, replay. — **Delvis:** enhetstest for proof-hash finnes; API/route-tester for de tre scenariene mangler.
- [x] Oppdater brukerflyt i confirmation/cancel slik at nytt bevis faktisk kreves.

**Definition of done**
- [x] E-postmatch alene er ikke nok for action-token.
- [ ] Testsuite dekker minst 3 misbruksscenarier. *(Ikke oppfylt ennå.)*

---

### Dag 6-7: Edge-function struktur og deploy-kilde

- [ ] Velg en kanonisk funksjonsmappe.
- [ ] Fjern/erstatt duplikatstruktur (symlink eller sletting + tydelig doc).
- [ ] Oppdater `supabase/config.toml`, CI, og eventuelle scripts for entydig deploy-path.
- [ ] Legg guard i CI som feiler ved ny path-drift.

**Definition of done**
- Eneste sannhetskilde for functions er dokumentert og teknisk enforced.

---

### Dag 8-9: API-auth standardisering (dashboard/admin/public API)

- [ ] Lag felles route-guard helper (auth + tenant scope + superadmin der relevant).
- [ ] Migrer 3-5 kritiske route handlers som referanseimplementasjon.
- [ ] Legg inn arkitektur-sjekk som feiler hvis nye `route.ts` ikke bruker guard eller whitelist.

**Definition of done**
- Nye API-ruter kan ikke merges uten guard-pattern.

---

### Dag 10-11: E2E hardening av kritiske journeys

- [ ] Oppgrader booking/billing/admin E2E med sideeffekt-assertions (ikke bare UI-tilstedevaerelse).
- [ ] Fjern permissive mønstre (`expect(true)`, conditionals som skjuler feil).
- [ ] Merk de sterkeste testene som release-kritiske.

**Definition of done**
- Minst 3 kjerneflyter feiler deterministisk ved reell backend-regresjon.

---

### Dag 12: Migrasjonspolicy (manifest fullscan vs diff-gate)

- [ ] Ta eksplisitt beslutning:
  - enten behold PR-diff-modell (dagens),
  - eller innfoer fullscan med ignorering av legacy.
- [ ] Dokumenter beslutning i ops-dokumentasjon + checklist.

**Definition of done**
- Teamet har en entydig policy som matcher hvordan `db:apply` faktisk brukes.

---

### Dag 13: Observability og driftsalarmer

- [ ] Alarm paa `stripe_webhook_events.processing_status = failed`.
- [ ] Alarm paa uventet spike i public token-minting failures/rate-limit hits.
- [ ] Kort runbook med ansvarlig person og responssteg.

**Definition of done**
- Minst to kritiske alarmer er aktivert og testet.

---

### Dag 14: Go/No-Go review

- [ ] Re-kjor full verifikasjonspakke.
- [ ] Oppdater alle tre ops-dokumenter med endelig status.
- [ ] Beslutning: GO/NO-GO med konkrete aapne risikoer.

**Definition of done**
- Ett samlet statusbilde uten motstridende dokumentasjon.

---

## Maalbare suksesskriterier etter 14 dager

- [ ] Alle aapne P0 fra master-checklist er lukket.
- [ ] Minst 70% av aapne P1 er lukket.
- [ ] Ingen uklarhet om function deploy path.
- [ ] CI + branch protection reflekterer faktisk risikomodell.

