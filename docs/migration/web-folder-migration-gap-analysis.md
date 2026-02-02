# Analyse: Hva var ikke migrert fra `web/`-mappen (historisk)

**Merk:** `web/` er fjernet (se `docs/migration/web-removed.md`). Dette dokumentet beskriver **historisk** status før fjerning. Tilsvarende innhold ligger nå i `apps/dashboard/`, `apps/public/`, `apps/admin/` og root `docs/` og `scripts/`.

Etter overgangen fra én `web/`-app til monorepo (`apps/public`, `apps/dashboard`, `apps/admin`, `packages/shared`) lå mye viktig innhold i `web/`. Her er en strukturert oversikt over **hva som ble migrert eller erstattet** og hvor det ligger nå.

---

## 1. Dokumentasjon (tidligere `web/docs/`) – **LØST** (root `docs/`)

Root-`docs/` inneholder nå arkitektur, backend, frontend, sikkerhet, testing, migrering, etc. Dokumentasjon fra `web/docs/` er flyttet/konsolidert til root `docs/`.

### 1.1 Arkitektur og beslutninger
| Sti (tidligere `web/docs/`) | Innhold | Viktig for |
|-------------------|---------|------------|
| `architecture/` (10 filer) | overview, layers, diagram, domain-principles, folder-structure, monorepo-blueprint, repository-standards, service-standards, types, feature-flags | Alle utviklere, onboarding |
| `decisions/` (5 ADR-er) | Layered architecture, Supabase, repository pattern, service layer | Arkitektur, nye beslutninger |
| `cursor-rule.md` | Cursor AI / IDE-standarder, krav før implementering | Alle som bruker Cursor |

### 1.2 Backend og database
| Sti | Innhold |
|-----|---------|
| `backend/` (12 filer) | data-model, billing-and-plans, RLS-strategy, RLS-patterns, plan-and-feature-model, reminders, data-integrity-and-triggers, supabase-foundation, etc. |
| `database/` | query-patterns, rls-patterns |

### 1.3 Frontend og utvikling
| Sti | Innhold |
|-----|---------|
| `frontend/` (7 filer) | components, design-tokens, error-handling, forms, i18n, interaction-patterns, ui-system |
| `development/` | type-safety, type-patterns, type-errors-fix-plan, type-errors-resolved |

### 1.4 API og integrasjoner
| Sti | Innhold |
|-----|---------|
| `api/` | README, examples, internal-apis, **openapi.yaml**, security |
| `integrations/` (18 filer) | Stripe (setup, webhooks, testing, troubleshooting), edge-functions-setup, storage-setup |

### 1.5 Sikkerhet, testing og drift
| Sti | Innhold |
|-----|---------|
| `security/` (5 filer) | security-overview, implemented-features, rbac-matrix, sentry-setup-guide, phase3-implementation-status |
| `testing/` (5 filer) | strategy, component-tests, notification-system-test-guide, rate-limiting-test-guide, unit-test-coverage-gaps |
| `troubleshooting/` (11 filer) | email/Resend (mange), calendar-performance, debug-email-sending, how-to-see-server-logs, etc. |

### 1.6 Prosesser og sjekklister
| Sti | Innhold |
|-----|---------|
| `processes/` | release-process |
| `deployment/` | vercel.md |
| `compliance/` | data-lifecycle |
| `performance/` | optimization-guide |
| `marked-checklist/` (14 filer) | SaaS-plans, Supabase-Architecture, ui-cleanup, repo, profile, etc. |
| `onboarding.md` | Komplett onboarding-guide for nye utviklere |
| `docs/README.md` | Indeks over hele dokumentasjonen |
| `coding-style.md`, `supabase-workflow.md` | Konvensjoner og workflow |

**Status:** Dokumentasjon ligger i root `docs/`. `web/` er fjernet.

---

## 2. Scripts (tidligere `web/scripts/`) – **LØST** (root `scripts/`)

| Fil | Formål |
|-----|--------|
| `create-e2e-users.ts` | Opprette brukere for E2E-tester |
| `migrate-local.ts` | Lokal migrering |
| `reset-db.ts` | Nullstille DB |
| `seed.ts` | Seede database |
| `README.md` | Beskrivelse av scriptene |

**Status:** Scripts ligger i root `scripts/` (migrate-local.ts, reset-db.ts, seed.ts, create-e2e-users.ts, etc.). `web/` er fjernet.

---

## 3. Tester (tidligere `web/tests/`) – **LØST** (`apps/dashboard/tests/`, root `tests/e2e/`)

Test-suiten fra `web/` er migrert:

- **E2E (Playwright):** auth, billing-flow, booking-flow, landing, onboarding, public-booking, settings, admin-operations
- **Unit (Vitest):** services (30+ filer), repositories, components, security (RLS, API-auth, etc.)
- **Integration:** billing webhook, query-performance, reminders-cron, repositories, RLS-isolation
- **RLS:** policies, test-utils

**Status:** Unit-tester i `apps/dashboard/tests/` (Vitest), E2E i root `tests/e2e/` (Playwright). Se `docs/ops/testing-plan.md` og `docs/ops/test-status.md`. `web/` er fjernet.

---

## 4. CI/CD – **LØST** (root `.github/workflows/ci.yml`)

- **Root `.github/workflows/ci.yml`**  
  Kjører type-check, lint, test og build for monorepo (apps + packages). `web/` er fjernet.  
  Den reflekterer ikke monorepo (apps + packages).

- **Root `.github/`**  
  Er tom – det finnes ingen workflows i repo-root.

- **`docs/ci-cd-strategy.md`**  
  Beskriver Vercel-prosjekter per app og path-basert deploy (f.eks. `dorny/paths-filter`), men det er ikke en faktisk `deploy.yml` eller tilsvarende workflow i repo.

**Anbefaling:**  
- Legg CI i **root** (f.eks. `.github/workflows/ci.yml`) som type-checker og bygger alle relevante apps og packages.  
- Legg til deploy-workflow som matcher `docs/ci-cd-strategy.md`, eller oppdater dokumentasjonen til å beskrive den faktiske løsningen (f.eks. kun Vercel “Ignored Build Step”).

---

## 5. CONTRIBUTING og prosjektstandarder – **LØST**

- **Root `CONTRIBUTING.md`** – finnes i root.
- **`docs/standards/cursor-rule.md`** – felles prosjektregel i root `docs/`. `web/` er fjernet.

---

## 6. Environment og konfigurasjon – **DELVIS DEKKET**

- **`.env.example`**  
  Root har ikke felles `.env.example`; hver app bruker egen `.env.local` (f.eks. `apps/dashboard/.env.local`). Se root README og `docs/env/env-setup.md`.

- **`docs/environment-variables.md`** (i root)  
  Beskriver variabler per app og Edge Functions. Det er god dokumentasjon, men ingen konkret fil å kopiere.

**Anbefaling:**  
- Opprett en **root `.env.example`** (eller `env.example`) som lister alle variabler som i `docs/environment-variables.md`, så teamet har én mal. Eventuelt per-app `.env.example` under `apps/*/` hvis dere foretrekker det.

---

## 7. Andre filer (tidligere i `web/`) – **LØST**

| Tidligere | Nå |
|--------|--------|
| `web/README.md` | Root README er hovedinngangen. |
| `web/public/sw-push.js` | Kopier til `apps/*/public/` ved behov. |
| `web/public/Favikon.svg` | Kopiert til hver app (`apps/*/public/Favikon.svg`). |
| Sentry-config | Per app (f.eks. `apps/dashboard/`). |
| `playwright.config.ts`, `vitest.config.ts` | Root + `apps/dashboard/`. |
| eslint/prettier | Per app. `web/` er fjernet. |

---

## Oppsummering – prioritert handlingsliste

| Prioritet | Hva | Status |
|-----------|-----|--------|
| Høy | **Dokumentasjon** | Løst: root `docs/`. |
| Høy | **Tester** | Løst: `apps/dashboard/tests/`, root `tests/e2e/`. |
| Høy | **CI/CD** | Løst: root `.github/workflows/ci.yml`. |
| Medium | **Scripts** | Løst: root `scripts/`. |
| Medium | **CONTRIBUTING.md** og **cursor-rule** | Løst: root + `docs/standards/`. |
| Lav | **.env.example** | Per app `.env.local`; se README og `docs/env/`. |
| Lav | **sw-push, Sentry, eslint/prettier** | Per app. `web/` er fjernet. |

`web/` er fjernet. Full migrering er fullført; innhold ligger i `apps/*`, root `docs/`, root `scripts/` og root `tests/`. Se `docs/migration/web-removed.md`.
