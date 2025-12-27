# TeqBook – Full Repo Audit Fix Plan (AI Agent Checklist)

Følg denne fila som arbeidsordre. Kryss av punkt for punkt. Ikke hopp rundt.

## Mål
- [ ] Rydde repoet og redusere teknisk gjeld.
- [ ] Stoppe UI-regresjoner (label/input spacing) med standard + håndheving.
- [ ] Stramme arkitekturgrense: UI skal ikke importere Supabase direkte.
- [ ] Fjerne `eslint-disable` ved å fikse hook-mønstre.
- [ ] Gjøre SQL-migrering trygg og deterministisk.
- [ ] Splitte store filer så de blir vedlikeholdbare.

## Ikke gjør
- [ ] Ikke legg til nye features.
- [ ] Ikke endre database uten migrasjon.
- [ ] Ikke bytt UI-bibliotek.
- [ ] Ikke bryt public booking eller auth flow.

---

## 1) Repo hygiene (må gjøres først)

### Root-støy
- [ ] Slett root `package-lock.json` hvis root ikke har `package.json`.
- [ ] Slett `.DS_Store` fra repoet.
- [ ] Legg `.DS_Store` i `.gitignore`.

### Standard ignore
- [ ] Oppdater `.gitignore` til minimum å ignorere:
  - [ ] `.DS_Store`
  - [ ] `node_modules/`
  - [ ] `.next/`
  - [ ] `dist/`
  - [ ] `out/`
  - [ ] `.env*` (unntak: `.env.example`)
  - [ ] `.vercel/`
  - [ ] `coverage/`

### Verifisering
- [ ] `git status` skal ikke vise junk-filer.
- [ ] Installer deps fra riktig mappe (typisk `web/`) og bekreft at build fortsatt fungerer.

Akseptanse
- [ ] Ingen `.DS_Store` i repo.
- [ ] Kun relevant lockfil brukes (typisk i `web/`).

---

## 2) UI form-standard (label/input spacing som aldri glipper igjen)

### Standard regler
- [ ] Alle redigerbare felt (label + input) må bruke `Field` wrapper:
  - [ ] `web/src/components/form/Field.tsx`
- [ ] Default layout skal alltid være stacked:
  - [ ] label over input
  - [ ] label → input: `gap-2`
  - [ ] field → field: `space-y-6` i form-container

### Håndheving i ESLint
- [ ] Forby direkte `<label>` i app-kode:
  - [ ] Tillat kun i `web/src/components/form/**` og `web/src/components/ui/**`
- [ ] Forby direkte supabase-/Input-import i pages der det gir mening:
  - [ ] Bruk `no-restricted-imports` for `Input` utenfor form/ui-mapper
- [ ] Hvis unntak må gjøres:
  - [ ] Krev kommentar `// ui-exception: <reason>`

### Dokumentasjon
- [ ] Lag/oppdater doc:
  - [ ] `web/docs/frontend/forms.md`
  - [ ] Inkluder “Correct” og “Incorrect” eksempler
  - [ ] Inkluder spacing tokens som må brukes

Akseptanse
- [ ] Du kan ikke lage en ny labeled input i `web/src/app/**` uten `Field`.
- [ ] Lint feiler hvis noen prøver.

---

## 3) My Profile – scope og layout (slim page)

### Scope (kun personlig info)
- [ ] My Profile skal kun:
  - [ ] Endre avatar
  - [ ] Endre fornavn
  - [ ] Endre etternavn
- [ ] My Profile skal kun vise (readonly):
  - [ ] e-post
  - [ ] rolle i salong
  - [ ] salongnavn
  - [ ] salongtype
- [ ] Ikke security/settings/danger zone på denne siden.

### Layout (kun 2 cards vertikalt)
- [ ] Kort 1: Profile (editable)
- [ ] Kort 2: Workspace (readonly)
- [ ] Cards ligger vertikalt:
  - [ ] spacing mellom cards: `space-y-8` eller mer
- [ ] Alle inputs bruker `Field`.

Fil(er) å sjekke
- [ ] `web/src/app/profile/page.tsx`

Akseptanse
- [ ] Siden har kun to cards.
- [ ] Ingen security/danger zone finnes her.

---

## 4) Arkitektur: fjern Supabase-import fra UI-laget

### Funn (må bort)
- [ ] `web/src/components/salon-provider.tsx`
- [ ] `web/src/app/(auth)/login-2fa/page-client.tsx`

### Tiltak
- [ ] Flytt Supabase auth wiring til service-lag:
  - [ ] Lag `web/src/lib/services/auth.service.ts` (eller bruk eksisterende)
  - [ ] Eksponer:
    - [ ] `subscribeToAuthChanges(callback): unsubscribe`
    - [ ] `getCurrentUser()`
    - [ ] `getSession()` (hvis nødvendig)
- [ ] Oppdater UI-komponentene til å kalle service, ikke supabase direkte.
- [ ] Fjern evt `eslint-disable` som tillater supabase import i UI.

Akseptanse
- [ ] `grep "@/lib/supabase-client"` gir kun treff i:
  - [ ] `web/src/lib/services/**`
  - [ ] `web/src/lib/repositories/**`
- [ ] Ingen treff i `web/src/app/**` eller `web/src/components/**`.

---

## 5) Fjern `eslint-disable` ved å fikse hooks (ikke skjul bugs)

### Dashboard (bug-risiko)
- [ ] `web/src/app/dashboard/page.tsx`
  - [ ] Fjern `react-hooks/exhaustive-deps` disable.
  - [ ] Effekt som bruker `user?.email` må depend’e på `user?.email` (eller derived value).
  - [ ] Unngå stale state.

### Employees
- [ ] `web/src/app/employees/page.tsx`
  - [ ] Gjør `loadEmployees` stabil:
    - [ ] `useCallback` + riktige deps, eller
    - [ ] flytt funksjonen inn i `useEffect`
  - [ ] Fjern disable.

### Andre kjente steder å gjennomgå
- [ ] `web/src/components/command-palette.tsx`
- [ ] `web/src/components/admin-command-palette.tsx`
- [ ] `web/src/components/public-booking-page.tsx`

Akseptanse
- [ ] Antall `eslint-disable-next-line react-hooks/*` går ned.
- [ ] Ingen `exhaustive-deps` disable i `web/src/` etter endring.

---

## 6) SQL/Migrations: gjør det trygt og deterministisk

### Problem
- [ ] `web/scripts/migrate-local.ts` kjører alt under `supabase/**/*.sql` (risiko).

### Tiltak
- [ ] Splitt mapper:
  - [ ] `web/supabase/migrations/` (kun deterministiske migrasjoner)
  - [ ] `web/supabase/seeds/` (valgfritt)
  - [ ] `web/supabase/admin/` (engangs-scripts, aldri auto-kjørt)
- [ ] Oppdater `web/scripts/migrate-local.ts`:
  - [ ] Kjør kun `supabase/migrations/**/*.sql`
  - [ ] Valider filnavnformat (dato/sekvens) før kjøring
  - [ ] Logg nøyaktig hvilke filer som kjøres
- [ ] Dokumenter workflow:
  - [ ] `web/docs/supabase-workflow.md`

Akseptanse
- [ ] Admin scripts kan ikke kjøres ved et uhell via migrate.
- [ ] Migrasjoner kjører alltid i samme rekkefølge.

---

## 7) Splitt store filer (vedlikeholdbarhet)

### Landing
- [ ] `web/src/app/landing/page.tsx`
  - [ ] Flytt seksjoner til `web/src/components/landing/**`
  - [ ] Flytt statiske data til `constants.ts` / `content.ts`

### Bookings/Shifts
- [ ] `web/src/app/bookings/page.tsx`
- [ ] `web/src/app/shifts/page.tsx`
  - [ ] Del opp i:
    - [ ] `components/`
    - [ ] `hooks/`
    - [ ] `lib/`

### Dashboard shell
- [ ] `web/src/components/layout/dashboard-shell.tsx`
  - [ ] Splitt ut menydata, user menu, actions i egne komponenter

Akseptanse
- [ ] Ingen `page.tsx` bør være > 400 linjer uten grunn.
- [ ] Endringer blir enklere å teste og review’e.

---

## 8) i18n: konsistent locale-normalisering

### Problem
- [ ] Ad hoc locale mapping finnes i auth/2FA flow (nested ternaries).

### Tiltak
- [ ] Lag funksjon:
  - [ ] `web/src/i18n/normalizeLocale.ts`
  - [ ] `normalizeLocale(locale: string): AppLocale`
- [ ] Bytt ut all ad hoc mapping med denne.

Akseptanse
- [ ] Ingen locale-normalisering skrevet direkte i pages.

---

## 9) Logging og “debug-støy”
- [ ] Fjern `console.log` i produksjonskode.
- [ ] Bytt `console.error` til en enkel `logError()` wrapper der det gir mening.
- [ ] Sjekk spesielt:
  - [ ] `web/src/app/test-billing/page.tsx` (ikke la debug-sider lekke til prod)

Akseptanse
- [ ] `grep "console.log" web/src` gir 0 treff (eller kun test/ dev-only filer som ikke bygges).

---

## 10) Final verification (må gjøres til slutt)
- [ ] Kjør lint
- [ ] Kjør typecheck
- [ ] Kjør unit tests
- [ ] Kjør e2e (minimum: landing + public booking + login + 2FA)

Manuell sjekk
- [ ] My Profile: 2 cards, vertikal layout, god spacing, kun avatar + navn.
- [ ] Settings: labels og inputs har korrekt spacing (Field).
- [ ] Auth: login + 2FA fungerer fortsatt.
- [ ] Public booking funker.

Definition of Done
- [ ] Repoet er ryddig.
- [ ] UI form-standard er håndhevet (ikke bare dokumentert).
- [ ] UI importerer ikke Supabase direkte.
- [ ] Hooks er riktige uten `eslint-disable`.
- [ ] Migrering kan ikke kjøre farlige scripts ved uhell.
- [ ] Store filer er splittet.
