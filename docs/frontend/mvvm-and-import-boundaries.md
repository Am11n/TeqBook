# MVVM og import boundaries

## Sammendrag

TeqBook bruker en **lagdelt arkitektur** som kartes til MVVM slik:

- **View** = UI (sider, komponenter) – `src/app/`, `src/components/`
- **ViewModel** = Services og hooks som tilbereder data og tilstand for view – `src/lib/services/`, `src/lib/hooks/`
- **Model** = Repositories og domene-typer – `src/lib/repositories/`, `src/lib/types/`

Dette dokumentet beskriver standarden og ESLint-regler for import boundaries.

## Prinsipp

1. **View** importerer fra ViewModel (services, hooks) og fra delt UI/types – ikke direkte fra repositories.
2. **ViewModel** importerer fra Model (repositories, types) og fra `@teqbook/shared` der det er felles.
3. **Model** (repositories) importerer kun Supabase-klient og types – ingen UI eller services.

## Mappestruktur per app

```
src/
├── app/                    # View (sider)
├── components/             # View (komponenter)
├── lib/
│   ├── hooks/              # ViewModel
│   ├── services/           # ViewModel
│   ├── repositories/       # Model
│   ├── types/              # Model (domene-typer)
│   └── supabase-client.ts  # Infrastruktur (bruker @teqbook/shared under panseret)
```

## ESLint – import boundaries

I alle apper (`apps/public`, `apps/dashboard`, `apps/admin`) er følgende satt i `eslint.config.mjs`:

- **Ingen imports fra `web/`** – `no-restricted-imports` blokkerer `**/web` og `**/web/**` (web/ er fjernet; regelen står for fremtidig beskyttelse).

Utvidelse for lag-grenser (valgfritt senere):

- Komponenter og sider bør unngå direkte import fra `**/repositories/**`; bruk services/hooks i stedet.
- Det kan implementeres med flere `patterns` i `no-restricted-imports` (f.eks. at `src/app/**` og `src/components/**` ikke importerer fra `src/lib/repositories/**`).

## Delt kode – packages

- **@teqbook/shared** – Supabase-klienter (browser/server), auth-contract, session, timezone. Brukes fra `src/lib/supabase/client.ts` og `server.ts` i hver app.
- **@teqbook/ui** – Felles UI-komponenter (når de flyttes hit). Importeres der det trengs i appene.

## Se også

- `docs/architecture/overview.md` – Lagdelt arkitektur og dataflyt
- `docs/decisions/0001-layered-architecture.md` – ADR for lagdelt arkitektur
