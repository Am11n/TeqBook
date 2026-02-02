# TeqBook Documentation

Dette er hoveddokumentasjonen for TeqBook-monorepoet (`apps/*` + `packages/*`).

---

## 📁 Hvordan finne frem

### Plattform / lag
- **Arkitektur** → `docs/architecture/`  
  Systemoversikt, lagdelt arkitektur, monorepo-blueprint, repository- og service-standarder, typer.
- **Backend & database** → `docs/backend/`, `docs/database/`  
  Datamodell, Supabase foundation, RLS-strategi, triggers, planer/limits, reminders.
- **Frontend** → `docs/frontend/`  
  Komponenter og UI-system, forms, design tokens, i18n, interaksjonsmønstre.
- **Integrasjoner** → `docs/integrations/` (+ `docs/integrations/stripe/`)  
  Stripe, edge functions, storage, test- og feilsøkingsguider.
- **Sikkerhet & compliance** → `docs/security/`, `docs/compliance/`  
  Security overview, RBAC-matrise, Sentry, GDPR/data-lifecycle.
- **Testing & kvalitet** → `docs/testing/`, `docs/web-folder-migration-gap-analysis.md`, `docs/testing-plan.md`  
  Teststrategi, komponent-/unit-/rate-limit-/notifikasjonstester, status for migrert testdekning.
- **Ytelse & drift** → `docs/performance/`, `docs/observability.md`, `docs/troubleshooting/`  
  Performance-guide, observability, e‑post/Resend, leveranse, kalender-ytelse, logging.

### Tverrgående dokumenter
- **Onboarding** → `docs/onboarding.md`
- **Kodestandarder** → `docs/coding-style.md`, `CONTRIBUTING.md`, `docs/cursor-rule.md`
- **CI/CD & deploy** → `docs/ci-cd-strategy.md`, `docs/deployment/vercel.md`, `docs/env-setup.md`, `docs/environment-variables.md`
- **Migrering & monorepo** →  
  - `docs/migration-status.md`, `docs/migration-final-status.md`, `docs/migration-complete-summary.md`  
  - `docs/migration/web-removed.md` – **web/ er fjernet**; docs som nevner `web/` er legacy, tilsvarende kode er i `apps/*`.  
  - `docs/web-folder-migration-gap-analysis.md` (historisk: hva som ble flyttet ut av `web/`)  
  - `docs/architecture/monorepo-blueprint.md`
- **Beslutninger & prosesser** →  
  - ADR-er: `docs/decisions/`  
  - Prosesser: `docs/processes/release-process.md`
- **Planer & sjekklister** →  
  - `docs/marked-checklist/` (formelle sjekklister)  
  - `docs/unmarked-checklist/` (idé-/plan-dokumenter)

---

## 🚀 Quick Start (monorepo)

- **Ny utvikler?**  
  - Les: [`onboarding.md`](./onboarding.md)  
  - Se også: root-`README.md` for hurtigkommandoer for `apps/public`, `apps/dashboard`, `apps/admin`.
- **Environment-variabler?**  
  - Oversikt: [`environment-variables.md`](./environment-variables.md)  
  - Praktisk oppsett per app: [`env-setup.md`](./env-setup.md)
- **Sette opp Stripe & billing?**  
  - [Stripe setup](./integrations/stripe/setup.md)  
  - [Billing & plans](./backend/billing-and-plans.md)  
  - [Plan & feature model](./backend/plan-and-feature-model.md)
- **Deploy & CI/CD?**  
  - [CI/CD-strategi](./ci-cd-strategy.md)  
  - [Vercel deploy](./deployment/vercel.md)
- **Supabase & database?**  
  - [Supabase foundation](./backend/supabase-foundation.md)  
  - [Data model](./backend/data-model.md)  
  - [RLS-strategi](./backend/rls-strategy.md) + [`database/rls-patterns.md`](./database/rls-patterns.md)
- **Database-scripts fra rot?**  
  - Fra repo-rot: `pnpm run seed`, `pnpm run migrate:local`, `pnpm run reset:db`, `pnpm run create:e2e-users`  
  - Beskrivelse: [`scripts/README.md`](../scripts/README.md)

---

## 📚 Mest sentrale dokumenter

- **Onboarding & arbeidsflyt**
  - [`onboarding.md`](./onboarding.md)
  - [`CONTRIBUTING.md`](../CONTRIBUTING.md)
  - [`docs/cursor-rule.md`](./cursor-rule.md)

- **Arkitektur**
  - [`architecture/overview.md`](./architecture/overview.md)
  - [`architecture/diagram.md`](./architecture/diagram.md)
  - [`architecture/layers.md`](./architecture/layers.md)
  - [`architecture/folder-structure.md`](./architecture/folder-structure.md)

- **Sikkerhet & data**
  - [`security/security-overview.md`](./security/security-overview.md)
  - [`security/rbac-matrix.md`](./security/rbac-matrix.md)
  - [`compliance/data-lifecycle.md`](./compliance/data-lifecycle.md)

- **Planer, billing & features**
  - [`backend/plan-and-feature-model.md`](./backend/plan-and-feature-model.md)
  - [`backend/billing-and-plans.md`](./backend/billing-and-plans.md)

---

## 🔗 Eksterne Ressurser

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

# TeqBook Documentation

Dette er hoveddokumentasjonen for TeqBook-prosjektet.

---

## 📁 Struktur

### `/architecture/`
Arkitektur-dokumentasjon:
- Systemoversikt og designprinsipper
- Folder-struktur og organisering
- Repository og service-standards
- Type-definisjoner

### `/backend/`
Backend-dokumentasjon:
- Data model og database-struktur
- Supabase foundation og setup

### `/frontend/`
Frontend-dokumentasjon:
- Komponenter og UI-system
- Design tokens
- i18n (internasjonalisering)

### `/integrations/`
Dokumentasjon for eksterne integrasjoner:
- **Stripe** - Billing og betalingsintegrasjon
- **Edge Functions** - Supabase Edge Functions setup

### `/deployment/`
Deployment-guider:
- Vercel deployment og migrering

### `/security/`
Sikkerhetsdokumentasjon:
- Security overview og best practices
- Authentication og authorization
- Data protection og compliance

### `/features/`
Feature-spesifikk dokumentasjon:
- Public booking funksjonalitet

### `/decisions/`
Arkitektur-beslutninger (ADR - Architecture Decision Records)

### `/processes/`
Prosesser og workflows:
- Release-prosess

### `/marked-checklist/` og `/unmarked-checklist/`
Sjekklister og implementeringsplaner

---

## 🚀 Quick Start

- **Ny utvikler?** Start med [onboarding.md](./onboarding.md)
- **Sette opp Stripe?** Se [integrations/stripe/setup.md](./integrations/stripe/setup.md)
- **Deploye til produksjon?** Se [deployment/vercel.md](./deployment/vercel.md)
- **Koding-standarder?** Se [coding-style.md](./coding-style.md)

---

## 📚 Viktige Dokumenter

- [Onboarding Guide](./onboarding.md) - Komplett onboarding-guide
- [Coding Style](./coding-style.md) - Koding-standarder og best practices
- [Architecture Overview](./architecture/overview.md) - Systemarkitektur
- [Security Overview](./security/security-overview.md) - Sikkerhetsarkitektur og best practices
- [Implementation Plan](../unmarked-checklist/new-implementation-plan.md) - Feature roadmap

---

## 🔗 Eksterne Ressurser

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

