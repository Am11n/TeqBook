# TeqBook – “Best-in-class SaaS” Upgrade Plan (AI Agent Checklist)

Denne fila er en implementeringsplan med sjekkbokser. Fokus: kvalitet, drift, sikkerhet, skalerbarhet og produkt-maskineri.  
Ikke legg til nye features som ikke står her.

## Mål
- [ ] Gjøre TeqBook robust nok for ekte produksjon i skala.
- [ ] Eliminere kjente risikopunkter (migrations, hooks, arkitekturbrudd).
- [ ] Innføre harde gates (CI + lint + tests) som stopper regresjoner.
- [ ] Implementere minimum “top SaaS” fundamentals: server-side rate limiting, audit logs, plan enforcement, i18n coverage, observability.

## Regler
- [ ] Ikke “eslint-disable” for å få grønt. Fiks mønsteret.
- [ ] UI skal ikke importere Supabase-klient direkte.
- [ ] All DB-endring skal skje via migrasjon.
- [ ] Alle kritiske handlinger skal kunne audites.
- [ ] Alle betalte features skal håndheves server-side, ikke bare i UI.

---

# PHASE 0 – Baseline Hygiene (same day)

## 0.1 Repo hygiene
- [ ] Fjern `.DS_Store` fra repo og legg til i `.gitignore`.
- [ ] Fjern root `package-lock.json` hvis root ikke har `package.json`.
- [ ] Sørg for én lockfil policy (typisk `web/package-lock.json`).
- [ ] Legg til `.editorconfig`.
- [ ] Legg til `.nvmrc` eller `engines.node` i `web/package.json`.

Akseptanse
- [ ] `git status` er clean etter install og build.
- [ ] Ingen junk-filer reintroduceres.

---

# PHASE 1 – Hard Gates (CI + Standard Enforcement)

## 1.1 GitHub Actions CI
- [ ] Opprett `.github/workflows/ci.yml`.
- [ ] CI skal kjøre på `pull_request` og `push` til main.
- [ ] Steg:
  - [ ] Install deps
  - [ ] Typecheck
  - [ ] ESLint
  - [ ] Unit tests
  - [ ] Playwright smoke (minst login + public booking)
  - [ ] i18n coverage check (fra fase 4)

Akseptanse
- [ ] En PR kan ikke merges hvis typecheck/lint/test feiler.

## 1.2 PR quality gates
- [ ] Legg til `PULL_REQUEST_TEMPLATE.md` med:
  - [ ] “No eslint-disable for hooks”
  - [ ] “No Supabase import in UI”
  - [ ] “Schema changes are migrations”
  - [ ] “Touched forms use Field wrapper”
  - [ ] “Added/updated tests for changed behavior”

Akseptanse
- [ ] Alle PR-er følger template og sjekkliste.

---

# PHASE 2 – Architecture Boundaries (Stop UI → Supabase Imports)

## 2.1 Identifiser og fjern UI-import
- [ ] Finn alle imports av:
  - [ ] `@/lib/supabase-client`
  - [ ] `@supabase/supabase-js`
  i `web/src/app/**` og `web/src/components/**`.
- [ ] Refactor slik at UI kaller service-laget i `web/src/lib/services/**`.

Kjente steder (må fikses)
- [ ] `web/src/components/salon-provider.tsx` (har arkitekturbrudd)
- [ ] `web/src/app/(auth)/login-2fa/page-client.tsx` (har arkitekturbrudd)

## 2.2 Auth/session service API
- [ ] Opprett eller oppdater `web/src/lib/services/auth.service.ts` med:
  - [ ] `getCurrentUser()`
  - [ ] `getSession()`
  - [ ] `subscribeToAuthChanges(callback): unsubscribe`
  - [ ] `signOut()`

## 2.3 ESLint enforcement
- [ ] Stram inn `no-restricted-imports`:
  - [ ] Forby supabase-client imports i UI-lag
  - [ ] Tillat kun i `web/src/lib/services/**` og `web/src/lib/repositories/**`
- [ ] Fjern eksisterende `eslint-disable-next-line no-restricted-imports` for Supabase i UI.

Akseptanse
- [ ] `grep "@/lib/supabase-client" web/src` gir ingen treff i `app/` eller `components/`.
- [ ] ESLint blokkerer regressjoner.

---

# PHASE 3 – React Hooks Reliability (Remove eslint-disable by fixing patterns)

## 3.1 Fjern `react-hooks/exhaustive-deps` disables
- [ ] Finn alle `eslint-disable-next-line react-hooks/exhaustive-deps`.
- [ ] For hver forekomst:
  - [ ] Gjør funksjoner stabile med `useCallback`, eller
  - [ ] Flytt funksjonen inn i `useEffect`, eller
  - [ ] Deriver stabile values før effect.
- [ ] Ingen nye disables tillates.

Spesifikke fokusfiler
- [ ] `web/src/app/dashboard/page.tsx`
- [ ] `web/src/app/employees/page.tsx`
- [ ] `web/src/components/command-palette.tsx`
- [ ] `web/src/components/admin-command-palette.tsx`
- [ ] `web/src/components/public-booking-page.tsx`

## 3.2 Async fetch hygiene
- [ ] For async effects:
  - [ ] Bruk `AbortController` eller `isMounted` ref pattern
  - [ ] Håndter race conditions
  - [ ] Unngå setState etter unmount

## 3.3 Revider “set-state-in-effect” regelen
- [ ] Hvis `react-hooks/set-state-in-effect` tvinger dårlig praksis:
  - [ ] Juster eller fjern den i ESLint config
  - [ ] Dokumenter anbefalt pattern i `web/docs/frontend/hooks.md`

Akseptanse
- [ ] 0 forekomster av `react-hooks/exhaustive-deps` disable i `web/src`.
- [ ] Færre hooks-disables totalt.
- [ ] Ingen flaky UI-oppdateringer ved navigasjon.

---

# PHASE 4 – Forms: Standard + Enforcement (Stop spacing regressions)

## 4.1 Mandatory Field wrapper
- [ ] Sikre at `web/src/components/form/Field.tsx` er standard for alle labeled inputs.
- [ ] Default layout:
  - [ ] `flex flex-col gap-2`
  - [ ] Form container bruker `space-y-6`

## 4.2 ESLint guardrails
- [ ] Forby direkte `<label>` i feature code:
  - [ ] Tillat i `web/src/components/form/**` og `web/src/components/ui/**`
- [ ] Forby direkte `Input` import utenfor form/ui-lag dersom dere har dette problemet.

## 4.3 Docs + examples
- [ ] Lag `web/docs/frontend/forms.md` med:
  - [ ] spacing tokens
  - [ ] korrekt Field-bruk
  - [ ] vanlige feil og hvordan de stoppes av lint

Akseptanse
- [ ] Du kan ikke lage labeled input uten Field.
- [ ] Form spacing er konsistent.

---

# PHASE 5 – SQL & Migrations Safety (Deterministic, No Accidents)

## 5.1 Folder split
- [ ] Flytt til:
  - [ ] `web/supabase/migrations/` (kun deterministiske migrasjoner)
  - [ ] `web/supabase/seeds/` (valgfritt)
  - [ ] `web/supabase/admin/` (engangs scripts, aldri auto-kjørt)

## 5.2 Fix migrate-local
- [ ] Oppdater `web/scripts/migrate-local.ts`:
  - [ ] Kjør kun `supabase/migrations/**/*.sql`
  - [ ] Valider filnavnformat (dato/sekvens)
  - [ ] Logg rekkefølge og resultat uten “støy”

## 5.3 Supabase workflow docs
- [ ] Lag `web/docs/supabase-workflow.md`:
  - [ ] hvordan lage migrasjon
  - [ ] hvordan kjøre lokalt
  - [ ] hvordan deploye
  - [ ] forbud mot dashboard-edits uten migrasjon

Akseptanse
- [ ] Admin scripts kjøres aldri via migration-run.
- [ ] Migrasjoner kjører deterministisk hver gang.

---

# PHASE 6 – i18n Coverage Enforcement (Stop missing keys)

## 6.1 i18n check script
- [ ] Lag `web/scripts/check-i18n.ts` som:
  - [ ] Leser alle namespaces per locale
  - [ ] Feiler hvis keys mangler i noen locale
  - [ ] Rapporterer nøyaktig hva som mangler

## 6.2 CI integration
- [ ] Kjør `check-i18n` i CI

## 6.3 Locale normalization
- [ ] Lag `web/src/i18n/normalizeLocale.ts`
- [ ] Erstatt ad hoc mapping i pages med `normalizeLocale()`

Akseptanse
- [ ] CI feiler ved manglende keys.
- [ ] Locale mapping er konsistent.

---

# PHASE 7 – “Real” Rate Limiting (Server-side, Not localStorage)

## 7.1 Identify endpoints to protect
- [ ] Login
- [ ] 2FA verify
- [ ] Password reset
- [ ] Public booking submit
- [ ] Any webhook/edge function endpoints

## 7.2 Implement server-side rate limiting
Velg én:
- [ ] Supabase Edge Function + KV/DB table counters
- [ ] Vercel Edge Middleware + KV
- [ ] Redis/KV service (Upstash) integration

Minimum krav
- [ ] Per-IP throttling
- [ ] Per-identifier throttling (email/phone) for auth
- [ ] Cooldown/lockout policy ved brute force
- [ ] Log rate-limit events (for security review)

Akseptanse
- [ ] Rate limit kan ikke bypasses ved å cleare localStorage.
- [ ] Dokumentert policy for thresholds.

---

# PHASE 8 – Audit Logs (The “enterprise” differentiator)

## 8.1 Data model
- [ ] Lag `audit_logs` table:
  - [ ] `id`
  - [ ] `created_at`
  - [ ] `actor_user_id`
  - [ ] `salon_id`
  - [ ] `action` (enum/string)
  - [ ] `entity_type`
  - [ ] `entity_id`
  - [ ] `metadata` (jsonb)
  - [ ] `ip` (optional)
  - [ ] `user_agent` (optional)

## 8.2 Write audit events for critical actions
- [ ] Auth events (login success/fail, 2FA enable/disable)
- [ ] Role changes
- [ ] Booking create/update/cancel
- [ ] Billing changes (plan change, subscription status change)
- [ ] Salon settings updates

## 8.3 Access control
- [ ] RLS: Kun salon admins/owners kan se logs for egen salon.
- [ ] Provide service method `auditLogService.write(...)`

Akseptanse
- [ ] Kritiske actions produserer audit entry.
- [ ] Logs er tenant-isolert.

---

# PHASE 9 – Plan Enforcement (Server-side)

## 9.1 Define plan limits
- [ ] Maks antall ansatte
- [ ] Maks antall tjenester
- [ ] Rapporter / eksport features
- [ ] WhatsApp notifications
- [ ] Calendar integrations

## 9.2 Enforce in DB/service layer
- [ ] Ikke baser dette på UI-gjemming.
- [ ] Håndhev via:
  - [ ] RPC checks, eller
  - [ ] database constraints, eller
  - [ ] service checks før write

Akseptanse
- [ ] Users kan ikke omgå limits via direkte API calls.
- [ ] Forsøk logges (audit).

---

# PHASE 10 – Observability (Stop silent failures)

## 10.1 Error reporting
- [ ] Aktiver Sentry (eller tilsvarende) konsekvent:
  - [ ] frontend
  - [ ] edge functions (hvis støttet)
- [ ] Standard `logError()` wrapper

## 10.2 Metrics and health
- [ ] Minimal health endpoint / status check
- [ ] Track:
  - [ ] auth errors
  - [ ] booking failures
  - [ ] payment webhook failures

Akseptanse
- [ ] Kritiske feil fanges og kan spores.

---

# PHASE 11 – Refactor Large Files (Maintainability)

## 11.1 Landing page decomposition
- [ ] Split `web/src/app/landing/page.tsx` into:
  - [ ] `web/src/components/landing/Hero.tsx`
  - [ ] `Features.tsx`
  - [ ] `Testimonials.tsx`
  - [ ] `Pricing.tsx`
  - [ ] `FAQ.tsx`
  - [ ] `CTA.tsx`
  - [ ] `content.ts` for static data

## 11.2 Other big pages
- [ ] Split `bookings/page.tsx`, `shifts/page.tsx` similarly

Akseptanse
- [ ] No page file > 400 lines without documented reason.

---

# Final Verification (Mandatory)
- [ ] `lint` passes
- [ ] `typecheck` passes
- [ ] unit tests pass
- [ ] Playwright smoke passes:
  - [ ] landing
  - [ ] public booking
  - [ ] login + 2FA
  - [ ] profile update

Manual QA
- [ ] Profile page matches scope (only avatar + first/last name editable)
- [ ] Forms spacing consistent everywhere
- [ ] No Supabase import in UI
- [ ] Migrations safe and deterministic
- [ ] Rate limiting works server-side
- [ ] Audit logs exist and are tenant-isolated
- [ ] Plan limits enforced server-side

Definition of Done
- [ ] TeqBook passes CI gates.
- [ ] Critical security and product fundamentals are implemented.
- [ ] The codebase is harder to break by accident (human or AI).
