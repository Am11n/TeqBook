# Legacy mirror — ikke bruk som deploy-kilde

Mappen `supabase/functions/` (denne) er et **speil** av et delsett av Edge Functions.

**Kanonisk kilde i repo:** `supabase/supabase/functions/` (én mappe `supabase` under rot, deretter `supabase/functions`).

Endringer gjøres alltid der; hold denne mappen synket slik at `pnpm run check:supabase-functions-drift` er grønn.

Se [`docs/operations/edge-functions-canonical-path.md`](../../docs/operations/edge-functions-canonical-path.md).
