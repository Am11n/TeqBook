# Frontend layering (Next.js)

Tillatt import-retning
- src/app og src/components kan bruke:
  - src/hooks
  - src/lib/types, src/lib/utils
  - UI-komponentbibliotek
- src/app og src/components skal IKKE importere:
  - @/lib/supabase-client
  - @supabase/supabase-js
  - repositories

Dataflyt
- UI kaller hooks.
- Hooks kaller services.
- Services kaller repositories.
- Repositories snakker med supabase-client.

Se repoets detaljer:
- docs/architecture/layers.md
- docs/coding-style.md
