# web/ mappen er fjernet

**Dato:** 2026-02-02

Mappen `web/` er slettet fra repoet. All funksjonalitet ligger nå i monorepo-appene:

- **Dashboard (innlogget brukeropplevelse):** `apps/dashboard/`
- **Public (landing, booking, onboarding):** `apps/public/`
- **Admin:** `apps/admin/`

## Dokumentasjon som fortsatt nevner web/

Mange filer under `docs/` refererer fortsatt til stier under `web/` (migrering, sikkerhet, troubleshooting, integrasjoner). Disse referansene er **historiske/legacy**:

- **Tilsvarende kode** finnes i `apps/dashboard/`, `apps/public/` eller `apps/admin/` (se migreringsdokumentene i `docs/migration/`).
- **Env og oppsett:** Bruk `.env.local` i den appen du kjører (f.eks. `apps/dashboard/.env.local`). Se root-`README.md` og `docs/env/env-setup.md`.
- **Bygg og kjøring** er ikke avhengig av `web/`; workspace er `apps/*` og `packages/*`.

Dokumentasjonen under `docs/` er oppdatert: `web/`-stier er erstattet med `apps/dashboard/`, `apps/public/`, `apps/admin/` eller root `supabase/`/`docs/`/`scripts/` der det passer.
