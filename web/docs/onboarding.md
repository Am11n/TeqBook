# TeqBook – Developer Onboarding Guide

Velkommen til TeqBook! Denne guiden hjelper deg med å komme i gang med utvikling.

---

## Forutsetninger

Før du starter, sørg for at du har installert:

- **Node.js** (v18 eller nyere) - [Last ned](https://nodejs.org/)
- **npm** eller **pnpm** (anbefalt) - Kommer med Node.js
- **Git** - [Last ned](https://git-scm.com/)
- **Kodeeditor** (anbefalt: VS Code) - [Last ned](https://code.visualstudio.com/)

---

## Installasjon

### 1. Klon repositoryet

```bash
git clone https://github.com/your-org/TeqBook.git
cd TeqBook/web
```

### 2. Installer dependencies

```bash
# Med npm
npm install

# Eller med pnpm (anbefalt)
pnpm install
```

### 3. Opprett `.env.local` fil

Kopier `.env.example` til `.env.local`:

```bash
cp .env.example .env.local
```

Fyll inn Supabase-verdiene:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Hvor finner jeg disse verdiene?**

1. Gå til [Supabase Dashboard](https://app.supabase.com/)
2. Velg ditt prosjekt
3. Gå til **Settings** → **API**
4. Kopier **Project URL** og **anon/public key**

---

## Starte dev-server

### Lokal utvikling

```bash
# Med npm
npm run dev

# Eller med pnpm
pnpm dev
```

Serveren starter på [http://localhost:3000](http://localhost:3000)

### Bygge for produksjon

```bash
npm run build
npm start
```

---

## Supabase Setup

### Alternativ 1: Bruk eksisterende Supabase-prosjekt

1. Få tilgang til Supabase-prosjektet fra teamet
2. Kopier `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Legg dem i `.env.local`

### Alternativ 2: Opprett nytt Supabase-prosjekt

1. Gå til [Supabase](https://supabase.com/) og opprett konto
2. Opprett nytt prosjekt
3. Kjør SQL-scripts i `supabase/` mappen:
   - Start med `supabase-foundation-complete.sql`
   - Deretter `onboarding-schema-update.sql`
   - Deretter `operations-module-enhancements.sql`
   - Deretter `opening-hours-schema.sql`
   - Deretter `add-whatsapp-number.sql`
4. Kopier credentials til `.env.local`

### SQL Scripts Rekkefølge

Kjør scripts i Supabase SQL Editor i denne rekkefølgen:

1. `supabase-foundation-complete.sql` - Foundation setup
2. `onboarding-schema-update.sql` - Onboarding schema
3. `operations-module-enhancements.sql` - Operations modules
4. `opening-hours-schema.sql` - Opening hours
5. `add-whatsapp-number.sql` - WhatsApp number

**Se `supabase/README.md` for detaljer.**

---

## Prosjektstruktur

```
web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/
│   │   ├── services/     # Business logic layer
│   │   ├── repositories/ # Data access layer
│   │   ├── types.ts      # Type definitions
│   │   └── supabase-client.ts
│   └── i18n/            # Translations
├── docs/                 # Documentation
├── supabase/            # SQL scripts
└── public/              # Static assets
```

**Se `docs/architecture/folder-structure.md` for detaljer.**

---

## Kom i gang - Første steg

### 1. Forstå arkitekturen

Les disse dokumentene først:

- `docs/architecture/overview.md` - Systemoversikt
- `docs/architecture/layers.md` - Lag-inndeling
- `docs/coding-style.md` - Kodestandarder

### 2. Test at alt fungerer

1. Start dev-server: `npm run dev`
2. Gå til [http://localhost:3000](http://localhost:3000)
3. Test login/signup
4. Test onboarding flow

### 3. Utforsk koden

- Start med `src/app/dashboard/page.tsx` - Dashboard
- Se på `src/lib/services/` - Services layer
- Se på `src/lib/repositories/` - Repositories layer

---

## Vanlige oppgaver

### Legge til ny side

1. Opprett fil i `src/app/your-page/page.tsx`
2. Bruk `DashboardShell` for layout
3. Importer services, ikke Supabase direkte

**Eksempel:**

```typescript
import { DashboardShell } from "@/components/dashboard-shell";
import { getBookingsForSalon } from "@/lib/services/bookings-service";

export default function YourPage() {
  // ...
}
```

### Legge til ny service

1. Opprett fil i `src/lib/services/your-service.ts`
2. Importer repositories
3. Legg til forretningslogikk

**Eksempel:**

```typescript
import * as yourRepo from "@/lib/repositories/your-repo";

export async function getYourData() {
  // Business logic
  return await yourRepo.getYourData();
}
```

### Legge til ny oversettelse

Se `docs/frontend/i18n.md` for detaljer.

---

## Troubleshooting

### "Cannot find module '@/lib/...'"

Sjekk at `tsconfig.json` har riktig path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Supabase connection error"

1. Sjekk at `.env.local` eksisterer
2. Verifiser at `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` er riktig
3. Sjekk at Supabase-prosjektet er aktivt

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build errors

```bash
# Clean build
rm -rf .next out
npm run build
```

---

## Neste steg

Nå som du er satt opp:

1. ✅ Les `docs/architecture/overview.md`
2. ✅ Les `docs/coding-style.md`
3. ✅ Les `CONTRIBUTING.md`
4. ✅ Utforsk kodebasen
5. ✅ Start med enkle oppgaver

---

## Hjelp og støtte

- **Dokumentasjon:** `docs/` mappen
- **Issues:** GitHub Issues
- **Spørsmål:** Kontakt teamet

---

## Relaterte dokumenter

- `docs/architecture/overview.md` - Systemoversikt
- `docs/architecture/folder-structure.md` - Filstruktur
- `docs/coding-style.md` - Kodestandarder
- `CONTRIBUTING.md` - Contributing guide
- `docs/frontend/i18n.md` - Internationalization
- `supabase/README.md` - Supabase setup

