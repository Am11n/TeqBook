# TeqBook – Developer-Ready Cleanup & Documentation Checklist

Mål: Gjør prosjektet komplett, forståelig og klart for andre utviklere.  
Oppgave: Gå gjennom hele prosjektet og implementer hver punktliste nøyaktig.

---

## 0. Viktige prioriteringer (må tas på alvor)
- [ ] Stram struktur i frontend.
- [ ] Riktig og oppdatert datamodell.
- [ ] Skikkelig RLS for alle tabeller.
- [ ] Opprett et service-lag i `src/lib/services/` slik at logikk ikke ligger i page-komponenter.

---

## 1. Repo Cleanup
- [ ] Verifiser at alle kildefiler i `src/` er komplette (fjern alle `...`-placeholder og fyll inn manglende kode).
- [ ] Sjekk at ingen build-artefakter ligger i repoet.
- [ ] Bekreft at `.env.local` ikke ligger i Git.
- [ ] Opprett `.env.example` (om den mangler).

---

## 2. Dokumentasjonsstruktur

### a) Arkitektur
- [ ] Opprett `docs/architecture/overview.md`  
  Innhold:
  - [ ] Systemoversikt (Next.js, Supabase, multi-tenant, auth-flow).
  - [ ] User-flow: Onboarding → Dashboard → CRUD → Public booking.
  - [ ] Beskrivelse av hovedmoduler (Bookings, Calendar, Settings, Employees osv.)

- [ ] Opprett `docs/architecture/folder-structure.md`  
  Innhold:
  - [ ] Hva skal ligge i `app/`, `components/`, `lib/`, `supabase/`.
  - [ ] Naming-konvensjoner (komponenter, hooks, repositories).
  - [ ] Filstruktur for fremtidig skalering.

### b) Datamodell & database
- [ ] Opprett `docs/backend/data-model.md`  
  Innhold:
  - [ ] Tabeller: Profiles, Salons, Employees, Services, Shifts, Bookings, Customers.
  - [ ] Felter, datatype, relasjoner, constraints.
  - [ ] RLS-regler per tabell.
  - [ ] Forklaring på multi-tenant strategi (salon_id som base).

### c) i18n
- [ ] Opprett `docs/frontend/i18n.md`  
  Innhold:
  - [ ] Hvordan `LocaleProvider` fungerer.
  - [ ] Struktur på språkfiler.
  - [ ] Regler for å hindre hardkoding av tekst.
  - [ ] Steg for å legge til nytt språk.

### d) Onboarding for utviklere
- [ ] Opprett `docs/onboarding.md`  
  Innhold:
  - [ ] Installasjon (Node, pnpm/npm).
  - [ ] Hvordan starte dev-server.
  - [ ] Hvordan koble Supabase lokalt / i sky.
  - [ ] Strukturert “kom i gang”-guide.

### e) Coding Standards
- [ ] Opprett `docs/coding-style.md`  
  Innhold:
  - [ ] ESLint / Prettier-regler.
  - [ ] TypeScript-strenghet.
  - [ ] Komponentkonvensjoner.
  - [ ] Repository- og service-regler.

---

## 3. Kode & Arkitekturforbedringer
- [ ] Gå gjennom alle repositories i `src/lib/repositories/` og sikre:
  - [ ] Full funksjonell kode uten `...`.
  - [ ] Konsistent return-type.
  - [ ] Konsistent error-håndtering.
- [ ] Opprett `src/lib/services/`
  - [ ] Flytt forretningslogikk fra page-komponenter til service-laget.
  - [ ] Sikre at page-komponenter er “tynne” og kun kaller services.
- [ ] Oppdater `src/lib/types.ts` slik at det speiler Supabase-datamodellen 1:1.

---

## 4. Testing & Kvalitetssikring
- [ ] Opprett `tests/` rotmappe.
- [ ] Legg til:
  - [ ] Repository-tester (mock Supabase).
  - [ ] Minst 1–2 e2e-tests (Playwright eller Cypress).
  - [ ] Scripts i `package.json` for `test`, `lint`, `format`.
- [ ] Lag GitHub Actions workflow:
  - [ ] Installer dependencies.
  - [ ] Kjør lint.
  - [ ] Kjør tester.

---

## 5. Design System & UI-struktur
- [ ] Opprett `docs/frontend/ui-system.md`  
  Innhold:
  - [ ] Regler for `components/ui` (shadcn).
  - [ ] Regler for domenekomponenter i `components/*`.
  - [ ] Farger, spacing, typografi, tokens.
- [ ] Dokumenter alle komponenter i `components/`:
  - [ ] Hensikt.
  - [ ] Hvordan bruke komponenten.
  - [ ] Kodeeksempler.

---

## 6. Supabase / Backend
- [ ] Oppdater `supabase/README.md`  
  Innhold:
  - [ ] Når man kjører SQL-filer.
  - [ ] Forklaring på admin-scripts.
  - [ ] Multi-tenant policy-detaljer.
- [ ] Legg til om nødvendig:
  - [ ] `supabase/migrations/` mappe.
  - [ ] Dokumentasjon på Supabase Sync-prosessen.

---

## 7. Public Booking Flow
- [ ] Opprett `docs/features/public-booking.md`  
  Innhold:
  - [ ] Hvilke API-endpoints som brukes.
  - [ ] Hvilken data som er tilgjengelig uten auth.
  - [ ] Hvordan calendar/time-slots genereres.
  - [ ] UX-regler (mobil først, minimal friksjon).

---

## 8. Overlevering til utviklere
- [ ] Opprett `CONTRIBUTING.md`  
  Innhold:
  - [ ] Branch-strategi.
  - [ ] Pull request-regler.
  - [ ] Code-review krav.
  - [ ] Deployment-instruksjoner.
- [ ] Opprett `docs/architecture/diagram.md`
  - [ ] Lag mermaid-diagram eller tekstbasert systemdiagram.

---
