# CI/CD Strategy for Monorepo

## Overview

Use GitHub Action `dorny/paths-filter` for robust path-based deployment detection.

## Setup

### Vercel – steg for steg (din del)

Gjør dette **én gang per app** i [Vercel Dashboard](https://vercel.com/dashboard). Repoet bruker **pnpm** (monorepo).

---

#### Steg 1: Opprett prosjekt for Public-appen

1. **Add New… → Project**
2. **Import** Git-repoet (TeqBook).
3. **Project Name:** f.eks. `teqbook-public`.
4. **Root Directory:** Klikk **Edit**, sett til `apps/public`, **Continue**.
5. **Framework Preset:** Next.js (skal være auto).
6. **Build and Output Settings:**
   - **Build Command:** La stå tomt (Next.js default) eller `pnpm run build` hvis du bygger fra rot – se nedenfor.
   - **Output Directory:** `.next` (default).
   - **Install Command:** La stå tomt (Vercel bruker pnpm fra `pnpm-lock.yaml` i rot). Hvis build feiler med «could not find workspace», sett til: `pnpm install` (Vercel kjører ofte fra repo-rot når Root Directory er satt).
7. **Environment Variables:** Legg til minst:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   (alle som appen trenger, inkl. evt. Resend, Stripe, Sentry – se `.env.example` eller docs).
8. **Node.js Version (valgfritt):** Under **Settings → General** kan du sette Node til **20.x** (repo bruker `>=20.18.0`).
9. **Deploy** (første deploy kan ta litt tid).

---

#### Steg 2: Ignored Build Step (Public)

1. Gå til **Settings → General** for dette prosjektet.
2. **Build & Development Settings** – scroll til **Ignored Build Step**.
3. **Override** – sett til:
   ```bash
   git diff HEAD^ HEAD --quiet . apps/public/ packages/ || echo "should-build"
   ```
   Da bygges Public bare når noe i repo-rot, `apps/public/` eller `packages/` har endret seg.

---

#### Steg 3: Opprett prosjekt for Dashboard-appen

1. **Add New… → Project** (samme repo på nytt).
2. **Project Name:** f.eks. `teqbook-dashboard`.
3. **Root Directory:** `apps/dashboard`.
4. **Framework Preset:** Next.js.
5. **Build / Output:** som over; **Install Command** tom eller `pnpm install` ved workspace-feil.
6. **Environment Variables:** samme Supabase-variabler + evt. Stripe, Sentry, Resend, osv.
7. **Deploy**.

---

#### Steg 4: Ignored Build Step (Dashboard)

**Settings → General → Ignored Build Step (Override):**
```bash
git diff HEAD^ HEAD --quiet . apps/dashboard/ packages/ || echo "should-build"
```

---

#### Steg 5: Opprett prosjekt for Admin-appen

1. **Add New… → Project** (samme repo).
2. **Project Name:** f.eks. `teqbook-admin`.
3. **Root Directory:** `apps/admin`.
4. **Framework Preset:** Next.js.
5. **Build / Output / Install:** som over.
6. **Environment Variables:** samme som andre apper (Supabase, evt. admin-spesifikke).
7. **Deploy**.

---

#### Steg 6: Ignored Build Step (Admin)

**Settings → General → Ignored Build Step (Override):**
```bash
git diff HEAD^ HEAD --quiet . apps/admin/ packages/ || echo "should-build"
```

---

#### Steg 7: En domain – teqbook.com med /dashboard og /admin

**→ Full steg-for-steg-guide:** [docs/ops/vercel-en-domain.md](./vercel-en-domain.md)

For å bruke **én domain** med stier:

- **teqbook.com** → Public (landing, booking)
- **teqbook.com/dashboard** → Dashboard
- **teqbook.com/admin** → Admin

1. **Kun Public-prosjektet** får hoveddomenet:
   - Gå til **Public**-prosjektet i Vercel → **Settings → Domains**.
   - Legg til **teqbook.com** (og evt. **www.teqbook.com**). Fjern eller ikke legg til domener på Dashboard- og Admin-prosjektene for dette domenet.

2. **Sett rewrites-URL-er i Public-prosjektet (viktig for teqbook.com/dashboard og /admin):**
   - **Public**-prosjektet → **Settings → Environment Variables**.
   - Legg til (for **Production** og **Preview**, så de brukes ved build):
     - **DASHBOARD_APP_URL** = full URL til Dashboard-deploy (f.eks. `https://teqbook-dashboard.vercel.app` – uten avsluttende `/`).
     - **ADMIN_APP_URL** = full URL til Admin-deploy (f.eks. `https://teqbook-admin.vercel.app`).
   - **Redeploy Public** etter at variablene er satt – rewrites leses ved **build**, så uten redeploy vil teqbook.com/dashboard gi 404 og «Unexpected token 'export'» (fordi assets lastes fra feil sted).

3. **Dashboard- og Admin-prosjektene** trenger **ikke** teqbook.com på egne prosjekter; de har hver sin `*.vercel.app`-URL som Public-prosjektet peker til via rewrites.

4. **Lokalt:** Uten `DASHBOARD_APP_URL` og `ADMIN_APP_URL` kjører Public uten rewrites (kun public-appen). Kjør dashboard og admin på egne porter (3002, 3003) som vanlig.

---

#### Steg 8: Domener (alternativ: subdomener)

Hvis du vil bruke **subdomener** i stedet (f.eks. `app.teqbook.com`, `admin.teqbook.com`), legg til disse på **Dashboard**- og **Admin**-prosjektene i **Settings → Domains**, og **fjern** `basePath` fra dashboard/admin `next.config` og rewrites fra Public.

---

**Kort oppsummert:** Tre Vercel-prosjekter, ett per app. Root Directory = `apps/public` / `apps/dashboard` / `apps/admin`. Sett env-variabler og Ignored Build Step som over. For én domain: kun teqbook.com på Public; sett DASHBOARD_APP_URL og ADMIN_APP_URL i Public. Deploy.

---

### Vercel Configuration (referanse)

Tre separate Vercel-prosjekter:

1. **Public App Project**
   - Root Directory: `apps/public`
   - Framework Preset: Next.js
   - Build Command: (default eller `pnpm run build` fra rot)
   - Output Directory: `.next`

2. **Dashboard App Project**
   - Root Directory: `apps/dashboard`
   - Framework Preset: Next.js
   - Build Command: (default)
   - Output Directory: `.next`

3. **Admin App Project**
   - Root Directory: `apps/admin`
   - Framework Preset: Next.js
   - Build Command: (default)
   - Output Directory: `.next`

### Ignored Build Step

For each Vercel project, set "Ignored Build Step" to:

```bash
# For public app
git diff HEAD^ HEAD --quiet . apps/public/ packages/ || echo "should-build"

# For dashboard app
git diff HEAD^ HEAD --quiet . apps/dashboard/ packages/ || echo "should-build"

# For admin app
git diff HEAD^ HEAD --quiet . apps/admin/ packages/ || echo "should-build"
```

**Note:** This is a simple approach. For more robust detection, use the GitHub Action workflow.

### E2E in CI

E2E kjører i `.github/workflows/ci.yml` (jobb `e2e`) etter at `build` er bestått. Playwright starter alle tre apper (public 3001, dashboard 3002, admin 3003) via `webServer` i `playwright.config.ts`; i pipeline finnes ingen eksisterende server, så alle tre startes automatisk. Kjør: `pnpm run test:e2e`. For å kjøre E2E på schedule i stedet for på hver PR kan du legge til `schedule:` i workflow.

### GitHub Actions Workflow

The workflow in `.github/workflows/deploy.yml` uses `dorny/paths-filter` to:
- Detect which apps changed
- Trigger deployments only for changed apps
- Deploy all apps when `packages/*` changes

## Benefits

- Only deploy what changed
- Faster CI/CD cycles
- Lower risk per deployment
- Clear separation of concerns
