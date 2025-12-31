# Supabase access rules

- Alle DB-kall går via repositories.
- Services inneholder business logic og orkestrerer repositories.
- UI skal aldri kalle repositories direkte.
- Scripts kan bruke Supabase direkte (seed/migrate/reset), men ikke UI-kode.

Migrations og RLS
- Endringer i database skjer via supabase/migrations.
- RLS/policies skal dokumenteres når de endres.
