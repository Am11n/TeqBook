# Drift- og database-changelog (kort, datert)

**Formål:** Et lett sted å appende **kort** hva som ble gjort samme dag (migrasjoner, `db push`, repair, RLS, pilot/staging). Full kontekst og læringsnotater: [`pilot-supabase-migrasjon-retrospektiv.md`](./pilot-supabase-migrasjon-retrospektiv.md).

**Format per oppføring:**

```text
## YYYY-MM-DD
- [miljø] Kort handling (kommando eller PR). Valgfritt: lenke til migrasjonsfil(er).
```

---

## 2026-03-29

- [pilot / dokumentasjon] Skrev `docs/operations/pilot-supabase-migrasjon-retrospektiv.md` (full retrospektiv på pilot-`db push`, CLI-feil, idempotens, legacy-filer, sjekklister). Etablerte denne changelog-filen for daglige notater.
- [pilot] Tidligere i økt: migrasjonsfiks for venteliste (020–022), stripe constraint, waitlist RLS drops, booking `update_booking_atomic` split (015–017), RPC product grants (`29140101`), m.m.; `supabase db push` fullførte kjede mot lenket prosjekt da nett var tilgjengelig. Verifiser på nytt med `supabase migration list` / `db push` ved timeout/503.
- [oppfølging] Manuell smoke-test av apper mot pilot + `pnpm run db:verify` når DB er tilgjengelig.
- [pilot] Fikset *Remote migration versions not found* ved å omdøpe `20260301000001`→`018`, `00002`→`019`, `00003`→`030`, `20260313000001`→`010`; `migration repair --status reverted` på gamle nøkler; `db push --include-all` én gang. Vanlig `db push` gir nå *up to date* uten spøkelsesrader.
