# Migrasjonspolicy: manifest vs filer på disk

**Beslutning (2026-04-29):** Vi beholder **PR-diff-modellen** som primær gate.

- `scripts/check-migration-manifest-coverage.ts` krever at **endrede** `supabase/supabase/migrations/*.sql` i en PR finnes i [`supabase/supabase/migration-manifest.json`](../../supabase/supabase/migration-manifest.json).
- `pnpm run db:apply` bruker **kun** manifest-listen (post-baseline + baseline), ikke alle filer i migrations-mappen.
- **Full scan** av alle filer på disk mot manifest er **ikke** aktivert, fordi legacy-filer uten timestamp-navn og historiske kopier på disk ville gi støy og falske positiver.

**Operasjonell regel:** Etter `supabase db push` eller manuell SQL mot et miljø skal migrasjonsfil og manifest oppdateres i samme endring der det er teamets praksis; ikke la manifest og faktisk brukt sett divergere.

**Checksum:** Etter endring i manifest eller listefiler: `pnpm run db:manifest:lock`.
