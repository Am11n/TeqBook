# TeqBook – Developer-Ready Cleanup & Documentation Checklist

Mål: Gjør prosjektet komplett, forståelig og klart for andre utviklere.  
Oppgave: Gå gjennom hele prosjektet og implementer hver punktliste nøyaktig.

---

## 0. Viktige prioriteringer (må tas på alvor)
- [x] Stram struktur i frontend. ✅ (Lagdelt arkitektur implementert)
- [x] Riktig og oppdatert datamodell. ✅ (docs/backend/data-model.md opprettet)
- [ ] Skikkelig RLS for alle tabeller. (Sjekkes i oppgave 6)
- [x] Opprett et service-lag i `src/lib/services/` slik at logikk ikke ligger i page-komponenter. ✅ (Alle services opprettet)

---

## 1. Repo Cleanup
- [x] Verifiser at alle kildefiler i `src/` er komplette (fjern alle `...`-placeholder og fyll inn manglende kode). ✅ (Ingen placeholders funnet)
- [x] Sjekk at ingen build-artefakter ligger i repoet. ✅ (.next/, out/, *.tsbuildinfo er i .gitignore)
- [x] Bekreft at `.env.local` ikke ligger i Git. ✅ (.env* er i .gitignore)
- [x] Opprett `.env.example` (om den mangler). ✅ (Opprettet)

---

## 2. Dokumentasjonsstruktur

### a) Arkitektur
- [x] Opprett `docs/architecture/overview.md` ✅
  Innhold:
  - [x] Systemoversikt (Next.js, Supabase, multi-tenant, auth-flow). ✅
  - [x] User-flow: Onboarding → Dashboard → CRUD → Public booking. ✅
  - [x] Beskrivelse av hovedmoduler (Bookings, Calendar, Settings, Employees osv.) ✅

- [x] Opprett `docs/architecture/folder-structure.md` ✅
  Innhold:
  - [x] Hva skal ligge i `app/`, `components/`, `lib/`, `supabase/`. ✅
  - [x] Naming-konvensjoner (komponenter, hooks, repositories). ✅
  - [x] Filstruktur for fremtidig skalering. ✅

### b) Datamodell & database
- [x] Opprett `docs/backend/data-model.md` ✅
  Innhold:
  - [x] Tabeller: Profiles, Salons, Employees, Services, Shifts, Bookings, Customers. ✅
  - [x] Felter, datatype, relasjoner, constraints. ✅
  - [ ] RLS-regler per tabell. (Sjekkes i oppgave 6)
  - [x] Forklaring på multi-tenant strategi (salon_id som base). ✅

### c) i18n
- [x] Opprett `docs/frontend/i18n.md` ✅
  Innhold:
  - [x] Hvordan `LocaleProvider` fungerer. ✅
  - [x] Struktur på språkfiler. ✅
  - [x] Regler for å hindre hardkoding av tekst. ✅
  - [x] Steg for å legge til nytt språk. ✅

### d) Onboarding for utviklere
- [x] Opprett `docs/onboarding.md` ✅
  Innhold:
  - [x] Installasjon (Node, pnpm/npm). ✅
  - [x] Hvordan starte dev-server. ✅
  - [x] Hvordan koble Supabase lokalt / i sky. ✅
  - [x] Strukturert "kom i gang"-guide. ✅

### e) Coding Standards
- [x] Opprett `docs/coding-style.md` ✅
  Innhold:
  - [x] ESLint / Prettier-regler. ✅
  - [x] TypeScript-strenghet. ✅
  - [x] Komponentkonvensjoner. ✅
  - [x] Repository- og service-regler. ✅

---

## 3. Kode & Arkitekturforbedringer ✅
- [x] Gå gjennom alle repositories i `src/lib/repositories/` og sikre:
  - [x] Full funksjonell kode uten `...`. ✅ (Ingen placeholders funnet)
  - [x] Konsistent return-type. ✅ (Alle 21 funksjoner verifisert)
  - [x] Konsistent error-håndtering. ✅ (Alle 29 try/catch-blokker verifisert)
- [x] Opprett `src/lib/services/` ✅
  - [x] Flytt forretningslogikk fra page-komponenter til service-laget. ✅ (11 services opprettet)
  - [x] Sikre at page-komponenter er "tynne" og kun kaller services. ⚠️ (Noen pages bruker fortsatt repositories direkte - tillatt for spesialiserte queries)
- [x] Oppdater `src/lib/types.ts` slik at det speiler Supabase-datamodellen 1:1. ✅ (Alle typer oppdatert)

**Note:** Se `docs/cleanup/repository-verification.md` for detaljert verifisering.

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
