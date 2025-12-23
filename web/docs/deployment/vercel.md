# TeqBook – Migrering fra GitHub Pages til Vercel

Mål:
- Slutte å bruke GitHub Pages som hosting.
- Deploye Next.js-appen på Vercel.
- Flytte domenet fra GitHub Pages til Vercel.
- Rydde vekk gammel Pages-config (CNAME, workflows osv.)

> NB: Oppgaver merket "MANUELL" må gjøres av menneske i Vercel/DNS-panel. Resten kan Cursor/agent gjøre i repoet.

---

## 1. Klargjør Next.js-prosjektet for Vercel

- [x] Verifiser at prosjektet er en vanlig Next.js-app (ikke hardkodet for static export):
  - [x] Åpne `package.json` og sjekk scripts:
    - [x] `build` skal være `next build` (ikke `next build && next export`).
    - [x] Hvis `next export` brukes: fjern det fra `build`-scriptet.
  - [x] Slett eventuelle `out/`-relaterte scripts eller config kun brukt for GitHub Pages.

- [x] Fjern GitHub Pages-spesifikke hacks:
  - [x] Sjekk om `next.config.js` / `next.config.mjs` har `basePath` eller `assetPrefix` satt for GitHub Pages-domene.
    - [x] Hvis `basePath` peker mot repo-navn eller GitHub Pages-url, fjern det eller sett korrekt base (ofte ingen).
  - [x] Sjekk om det finnes `exportPathMap` eller liknende legacy-oppsett. Fjern hvis kun brukt for static export.
  - [x] Fjernet `output: "export"` fra `next.config.ts` (Vercel trenger ikke static export).

- [x] Rydd `.gitignore`:
  - [x] Sørg for at både `.next/` og `out/` ignoreres:
    - [x] Legg til:
      - [x] `.next/`
      - [x] `out/`

---

## 2. Fjern GitHub Pages-oppsett i repoet

- [x] Sjekk etter GitHub Pages-konfig:
  - [x] Finn `.github/workflows/*` som deployer til GitHub Pages (`gh-pages` branch, `peaceiris/actions-gh-pages`, etc.).
    - [x] Funnet: `.github/workflows/nextjs.yml` - GitHub Pages deployment workflow
    - [x] Funnet: `.github/workflows/ci.yml` - Kun CI/testing, beholder denne
  - [x] Fjern eller deaktiver disse workflow-filene.
    - [x] Fjernet `.github/workflows/nextjs.yml` (GitHub Pages deployment)
- [x] Sjekk om det finnes en `CNAME`-fil i prosjektet (ofte i `public/` eller root for Pages):
  - [x] Funnet: `CNAME` i root (peker til `teqbook.com`)
  - [x] Funnet: `web/CNAME` (peker til `teqbook.com`)
  - [x] Disse skal fjernes når domenet er flyttet til Vercel (markert for senere sletting).
- [ ] Sjekk om det finnes en dedikert `gh-pages` branch:
  - [ ] Oppgave for menneske: vurdér å slette `gh-pages` i GitHub når Vercel er oppe og kjører.

---

## 3. Konfigurer miljøvariabler for Vercel

- [x] Lag/oppdater `.env.example` i repoet:
  - [x] Sørg for at minst følgende nøkler finnes:
    - [x] `NEXT_PUBLIC_SUPABASE_URL=`
    - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
    - [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` (valgfritt, for billing)
    - [x] `NEXT_PUBLIC_APP_URL=` (valgfritt, for production)
  - [x] Ikke legg inn faktiske secrets, kun placeholders.
  - [x] Opprettet/oppdatert `.env.example` med alle nødvendige variabler.

- [x] Sjekk kodebasen etter bruk av miljøvariabler:
  - [x] Bekreft at alle miljøvariabler i koden også finnes i `.env.example`.
  - [x] Funnet variabler i kodebasen:
    - [x] `NEXT_PUBLIC_SUPABASE_URL` (brukt i `supabase-client.ts`, `billing-service.ts`)
    - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (brukt i `supabase-client.ts`, `billing-service.ts`)
    - [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (brukt i `settings/billing/page.tsx`, `test-billing/page.tsx`)
    - [x] Alle variabler er inkludert i `.env.example`.

- [ ] MANUELL: I Vercel Dashboard (etter at prosjektet er opprettet):
  - [ ] Gå til "Settings" → "Environment Variables".
  - [ ] Legg inn alle relevante env-vars fra din lokale `.env.local`:
    - [ ] `NEXT_PUBLIC_SUPABASE_URL`
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (hvis billing er aktivert)
    - [ ] `NEXT_PUBLIC_APP_URL` (hvis satt)
  - [ ] Pass på å legge dem under riktig miljø:
    - [ ] `Production`
    - [ ] `Preview` (valgfritt)
    - [ ] `Development` (valgfritt)

---

## 4. Opprett og koble prosjektet i Vercel (MANUELL)

- [x] MANUELL: Logg inn på Vercel med GitHub-kontoen.
- [x] MANUELL: Importer TeqBook-repoet fra GitHub:
  - [x] Velg riktig repo.
  - [x] Velg riktig branch, vanligvis `main` eller `master`.
- [x] MANUELL: Sjekk build settings:
  - [x] Framework: skal automatisk bli detektert som `Next.js`.
  - [x] Build command: `next build` (normalt default).
  - [x] Output directory: `.next` ( håndteres automatisk av Vercel for Next-prosjekter).
- [x] MANUELL: Trigger første deploy.
  - [x] Build passerte! ✓
  - [x] Oppdatert Next.js fra 16.0.4 til 16.1.1 for å fikse sikkerhetssårbarhet (CVE-2025-66478)
  - [x] Oppdatert eslint-config-next til 16.1.1
  - [ ] Åpne preview-URL og test:
    - [ ] Login
    - [ ] Dashboard
    - [ ] Booking-flow
    - [ ] Eventuelle dynamic routes (f.eks. `/book/[salon_slug]`).

**Notat om "detected `next export`" advarsel:**
- Dette er sannsynligvis en false positive fra Vercel's build system
- `output: "export"` er fjernet fra `next.config.ts`
- Build fungerer korrekt med full Next.js funksjonalitet
- Advarselen kan forsvinne ved neste deploy etter at cache er oppdatert

---

## 5. Flytt domenet fra GitHub Pages til Vercel

### 5.1. Frikoble domenet fra GitHub Pages

- [ ] MANUELL: Gå til GitHub-repoet → Settings → Pages:
  - [ ] Fjern custom domain som er satt der.
  - [ ] Deaktiver GitHub Pages (sett til "None" dersom det finnes valg for det).
- [ ] MANUELL: Gå til domeneregistrar (der domenet ditt er registrert, f.eks. Cloudflare, Domeneshop, GoDaddy):
  - [ ] Finn DNS-innstillingene.
  - [ ] Noter eksisterende `CNAME`/`A`-records som peker til GitHub Pages (f.eks. `username.github.io`).
  - [ ] Fjern eller oppdater disse rekordene (de skal etterpå peke til Vercel).

### 5.2. Koble domene til Vercel

- [ ] MANUELL: I Vercel Dashboard:
  - [ ] Gå til prosjektet → "Settings" → "Domains".
  - [ ] Legg til ditt domene (f.eks. `teqbook.no`).
  - [ ] Følg Vercels instruksjon for DNS:
    - [ ] Hvis anbefalt: legg til `CNAME`-record fra `www` til `cname.vercel-domenet`.
    - [ ] Evt. bruk Vercel DNS og bytt NS-records (hvis du vil la Vercel håndtere alt).
- [ ] MANUELL: Oppdater DNS hos din registrar basert på Vercel sine instrukser.
- [ ] Vent til DNS har propagert:
  - [ ] Test domenet i nettleser.
  - [ ] Verifiser at det peker til Vercel og lastes raskt.

---

## 6. Konfigurer produksjons-URL i appen

- [ ] Legg til `NEXT_PUBLIC_APP_URL` eller `SITE_URL` i `.env.example`.
- [ ] MANUELL: Sett samme variabel i Vercel Environment (Production) med ditt hoveddomene, f.eks.:
  - [ ] `NEXT_PUBLIC_APP_URL=https://teqbook.no`
- [ ] Oppdater eventuelle steder i koden hvor URL hardkodes:
  - [ ] Bruk `process.env.NEXT_PUBLIC_APP_URL` i stedet.

---

## 7. Opprydding etter migrering

- [ ] Verifiser at GitHub Pages ikke lenger er aktiv:
  - [ ] Åpne tidligere GitHub Pages-URL og sjekk at den ikke lenger viser appen (eller redirecter til ny).
- [ ] Rydd repoet:
  - [ ] Fjern gamle GitHub Pages-relaterte markdown-filer / docs som ikke lenger er relevante.
- [ ] Oppdater `README.md`:
  - [ ] Forklar at prosjektet nå deployes via Vercel.
  - [ ] Legg til lenke til produksjons-URL.
  - [ ] Kort avsnitt om deploy-prosess:
    - [ ] "Deploy trigges automatisk ved push til `main`."

---

## 8. Ekstra kvalitetssjekk

- [ ] Kjør full manuell test i produksjon:
  - [ ] Login / logout.
  - [ ] Onboarding ny salong.
  - [ ] Opprett booking.
  - [ ] Se kalender.
  - [ ] Endre innstillinger (branding, info).
- [ ] Sjekk konsollen i nettleser for errors.
- [ ] Sjekk Vercel-logs for runtime-feil.

---

Når alle checkboksene over er fullført, skal:

- Next.js-appen kjøre på Vercel.
- Domenet peke til Vercel, ikke GitHub Pages.
- Repoet være ryddet for Pages-oppsett.
- Appen føles merkbart raskere og mer stabil enn GitHub Pages-hostingen.
