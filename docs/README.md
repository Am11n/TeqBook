# TeqBook Documentation

Dette er hoveddokumentasjonen for TeqBook-monorepoet (`apps/*` + `packages/*`).

## Navigasjon

- **Arkitektur**: `docs/architecture/`
- **Backend & database**: `docs/backend/`, `docs/database/`
- **Frontend**: `docs/frontend/`
- **Integrasjoner**: `docs/integrations/`
- **Sikkerhet**: `docs/security/`
- **Compliance (eksisterende)**: `docs/compliance/`
- **Nordic readiness**: `docs/nordic-readiness/`
- **Testing**: `docs/testing/`
- **Drift/ops**: `docs/ops/`, `docs/performance/`, `docs/troubleshooting/`

## Viktige innganger

- [`onboarding.md`](./onboarding.md)
- [`security/security-overview.md`](./security/security-overview.md)
- [`security/implemented-features.md`](./security/implemented-features.md)
- [`security/rate-limiting-operations.md`](./security/rate-limiting-operations.md)
- [`compliance/data-lifecycle.md`](./compliance/data-lifecycle.md)
- [`nordic-readiness/README.md`](./nordic-readiness/README.md)
- [`api/README.md`](./api/README.md)
- [`frontend/ui-composition-patterns.md`](./frontend/ui-composition-patterns.md)

## Evidens-prinsipp

Dokumentasjon skal være bevis-basert:

- Påstander om implementerte features skal peke til kodefiler eller testfiler.
- Hvis noe er planlagt, skal det være eksplisitt merket som planlagt.
- Ved tvil: referer til implementasjonskilder i `apps/*`, `packages/*` eller `supabase/supabase/functions/*`.

