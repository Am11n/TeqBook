# Environment Setup Guide (Monorepo)

Denne guiden forklarer hvordan du setter opp environment-variabler for alle apper i TeqBook-monorepoet.

Se også referansedokumentet `docs/environment-variables.md` for full liste og forklaringer.

---

## 1. Felles verdier (Supabase)

Disse verdiene er felles og brukes av alle Next.js-appene:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Du kan gjenbruke de samme verdiene i alle appene.

---

## 2. Public App (`apps/public`)

Opprett filen `apps/public/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
```

Se seksjonen **Public App** i `environment-variables.md` for detaljer.

---

## 3. Dashboard App (`apps/dashboard`)

Opprett filen `apps/dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Se seksjonen **Dashboard App** i `environment-variables.md`.

---

## 4. Admin App (`apps/admin`)

Opprett filen `apps/admin/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
ADMIN_SECRET_KEY=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Se seksjonen **Admin App** i `environment-variables.md`.

---

## 5. Edge Functions (Supabase Dashboard)

Disse verdiene settes normalt i **Supabase Dashboard** (ikke i `.env.local`-filene i appene):

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # NEVER exposed to client
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
```

Se seksjonen **Edge Functions** i `environment-variables.md`.  
Service role key skal **aldri** inn i Next.js-appene – kun i edge functions.

---

## 6. Hurtigkommandoer

Eksempel på hvordan du kan kopiere en template til lokal fil (fra root):

```bash
cp apps/public/.env.example apps/public/.env.local   # hvis/ når dere legger til egne .env.example per app
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Inntil `.env.example`-filer er på plass per app, bruk innholdet over som mal når du oppretter `.env.local`.

