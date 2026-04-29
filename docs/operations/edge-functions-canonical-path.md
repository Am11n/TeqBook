# Edge Functions: kanonisk mappe og legacy-speil

## Kanonisk kilde

**Eneste sannhet for implementasjon og deploy:** [`supabase/supabase/functions/`](../../supabase/supabase/functions/).

Supabase CLI og prosjektets dokumentasjon skal alltid referere til denne stien.

## Legacy-speil

Mappen [`supabase/functions/`](../../supabase/functions/) inneholder **speilede** kopier av et delsett av funksjoner (historiske stier). Innholdet skal være **byte-identisk** med canonical `index.ts` der begge finnes.

## CI

`pnpm run check:supabase-functions-drift` feiler hvis samme funksjonsnavn har forskjellig `index.ts`-hash i de to trærne. Jobben **Edge Functions Tests** i CI kjører denne sjekken (se `package.json` og `.github/workflows/ci.yml`).

## Deploy

Følg Supabase-prosjektets vanlige `supabase functions deploy` fra repo-root med config som peker på **`supabase/supabase/functions`**. Ikke deploy fra legacy-mappen alene uten å synke canonical først.
