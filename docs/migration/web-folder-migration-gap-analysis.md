# Analyse: Hva er ikke migrert fra `web/`-mappen

Etter overgangen fra én `web/`-app til monorepo (`apps/public`, `apps/dashboard`, `apps/admin`, `packages/shared`) ligger mye viktig innhold fortsatt kun i `web/`. Her er en strukturert oversikt over **hva som ikke er migrert** og hvor viktig det er.

---

## 1. Dokumentasjon (`web/docs/`) – **IKKE MIGRERT** (høy prioritet)

Root-`docs/` inneholder i dag bare **migreringsdokumenter** (testing-plan, migration summaries, ci-cd-strategy, route-migration-guide, etc.). Hele den opprinnelige dokumentasjonsmappen fra `web/docs/` er **ikke** flyttet eller kopiert til root.

### 1.1 Arkitektur og beslutninger
| Sti i `web/docs/` | Innhold | Viktig for |
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

**Anbefaling:** Flytt eller konsolidér `web/docs/` til root `docs/` (f.eks. `docs/architecture/`, `docs/backend/`, …), og oppdater eventuelle referanser til `web/` og til den nye app-strukturen. Behold én dokumentasjonsplass i monorepo.

---

## 2. Scripts (`web/scripts/`) – **IKKE MIGRERT** (medium prioritet)

| Fil | Formål |
|-----|--------|
| `create-e2e-users.ts` | Opprette brukere for E2E-tester |
| `migrate-local.ts` | Lokal migrering |
| `reset-db.ts` | Nullstille DB |
| `seed.ts` | Seede database |
| `README.md` | Beskrivelse av scriptene |

Disse er knyttet til **én** app (den gamle web-appen). I monorepo bør de enten:
- flyttes til root (f.eks. `scripts/`) og tilpasses til å jobbe mot riktig app/DB, eller  
- dupliseres/tilpasses per app der det er behov.

Uten migrering har nye utviklere og CI ikke en felles, dokumentert måte å kjøre seed/reset/e2e-setup på for monorepo.

---

## 3. Tester (`web/tests/`) – **IKKE MIGRERT** (høy prioritet)

Hele test-suiten ligger kun i `web/`:

- **E2E (Playwright):** auth, billing-flow, booking-flow, landing, onboarding, public-booking, settings, admin-operations
- **Unit (Vitest):** services (30+ filer), repositories, components, security (RLS, API-auth, etc.)
- **Integration:** billing webhook, query-performance, reminders-cron, repositories, RLS-isolation
- **RLS:** policies, test-utils

`apps/public`, `apps/dashboard` og `apps/admin` har **ikke** tilsvarende test-setup eller testfiler. Kun `web/package.json` har `vitest` og `playwright`.

**Konsekvens:**  
- Nye endringer i apps testes ikke automatisk med eksisterende E2E/unit/integration-tester.  
- Ved eventuell fjerning av `web/` forsvinner også all testdekning som er beskrevet her.

**Anbefaling:**  
- Beslutt om `web/` skal beholdes som “legacy” test-kodebase inntil tester er migrert.  
- Planlegg migrering av tester: enten til root (én Playwright/Vitest-setup som tester alle apps) eller per-app (e.g. `apps/public/tests/`), og flytt/juster testfiler og config (playwright.config.ts, vitest.config.ts) deretter.

---

## 4. CI/CD – **DELVIS / FORELDET** (høy prioritet)

- **`web/.github/workflows/ci.yml`**  
  Kjører type-check, lint og build **kun for `web/`** (working-directory: `./web`, cache: `web/package-lock.json`).  
  Den reflekterer ikke monorepo (apps + packages).

- **Root `.github/`**  
  Er tom – det finnes ingen workflows i repo-root.

- **`docs/ci-cd-strategy.md`**  
  Beskriver Vercel-prosjekter per app og path-basert deploy (f.eks. `dorny/paths-filter`), men det er ikke en faktisk `deploy.yml` eller tilsvarende workflow i repo.

**Anbefaling:**  
- Legg CI i **root** (f.eks. `.github/workflows/ci.yml`) som type-checker og bygger alle relevante apps og packages.  
- Legg til deploy-workflow som matcher `docs/ci-cd-strategy.md`, eller oppdater dokumentasjonen til å beskrive den faktiske løsningen (f.eks. kun Vercel “Ignored Build Step”).

---

## 5. CONTRIBUTING og prosjektstandarder – **IKKE MIGRERT** (medium prioritet)

- **`web/CONTRIBUTING.md`**  
  Beskriver arkitektur (lagdelt, services vs repositories), datatilgang, branch-strategi og bidragsprosess.  
  Finnes **ikke** i root; nye bidragsytere som ser på monorepo fra root får ikke denne guiden.

- **`web/docs/cursor-rule.md`**  
  Sentral for Cursor/IDE: krav om å reviewe før implementering, konvensjoner, kvalitet.  
  Ligger bare i `web/docs/` og er ikke synlig som felles prosjektregel i root.

**Anbefaling:**  
- Kopier eller flytt `CONTRIBUTING.md` til **root** og oppdater den til monorepo (apps, packages, hvor kode skal ligge).  
- Flytt `cursor-rule.md` til root (f.eks. `docs/cursor-rule.md` eller `.cursorrules`) slik at den gjelder hele repo.

---

## 6. Environment og konfigurasjon – **DELVIS DEKKET**

- **`.env.example`**  
  Finnes kun i `web/`. Root har **ikke** en felles `.env.example` for monorepo.

- **`docs/environment-variables.md`** (i root)  
  Beskriver variabler per app og Edge Functions. Det er god dokumentasjon, men ingen konkret fil å kopiere.

**Anbefaling:**  
- Opprett en **root `.env.example`** (eller `env.example`) som lister alle variabler som i `docs/environment-variables.md`, så teamet har én mal. Eventuelt per-app `.env.example` under `apps/*/` hvis dere foretrekker det.

---

## 7. Andre filer i `web/` som kan være relevante

| Element | Status |
|--------|--------|
| `web/README.md` | Standard Next.js readme; lite TeqBook-spesifikt. Root README bør være hovedinngangen for monorepo. |
| `web/public/sw-push.js` | Service worker for push – sjekk om den brukes av noen av appene; i så fall kopier/refaktorer til riktig app. |
| `web/public/Favikon.svg` | Er kopiert til apps (nevnt i testing-plan). Kan stå i web til dere fjerner web. |
| Sentry-config (`sentry.*.config.ts`) | I web; sjekk at hver app som skal ha Sentry har tilsvarende config. |
| `playwright.config.ts`, `vitest.config.ts` | Kun i web; må med eller erstattes når tester migreres. |
| `eslint.config.mjs`, `components.json`, `.prettierrc` | I web; root/apps har sannsynligvis egne – verifiser at standarder er like eller dokumentert. |

---

## Oppsummering – prioritert handlingsliste

| Prioritet | Hva | Handling |
|-----------|-----|----------|
| Høy | **Dokumentasjon** `web/docs/` | Flytt/konsolidér til root `docs/` og oppdater referanser og stier. |
| Høy | **Tester** `web/tests/` | Beslut migreringsstrategi (root vs per-app), flytt config og tester, så CI kjører dem. |
| Høy | **CI/CD** | Root-basert CI som bygger alle apps/packages; implementer eller dokumenter deploy (Vercel/paths-filter). |
| Medium | **Scripts** `web/scripts/` | Flytt til root `scripts/` eller tilpass og plasser der det passer for monorepo. |
| Medium | **CONTRIBUTING.md** og **cursor-rule.md** | Flytt til root og oppdater for monorepo. |
| Lav | **.env.example** | Opprett root (eller per-app) .env.example i tråd med `docs/environment-variables.md`. |
| Lav | **sw-push.js, Sentry, eslint/prettier** | Verifiser at alle apper som trenger dem har tilsvarende oppsett. |

Når dette er tatt, har dere full migrering av det viktige fra `web/` inn i monorepo, og kan på sikt fjerne eller arkivere `web/`-mappen trygt.
