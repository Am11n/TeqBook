# DB Run Archive - 2026-03-16

This archive summarizes intermediate failed/obsolete DB run logs from staging and pilot-production before final green runs.

## Latest Green Evidence Kept

- `docs/ops/evidence/db-apply-logs/apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-42-34-732Z.md`
- `docs/ops/evidence/db-verify-logs/verify-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-42-36-154Z.md`
- `docs/ops/evidence/db-apply-logs/apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-49-13-240Z.md`
- `docs/ops/evidence/db-verify-logs/verify-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-50-00-268Z.md`

## Archived Intermediate Logs

### Staging apply failures

- `apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-29-51-733Z.md`  
  Cause: `psql` not installed.
- `apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-33-07-955Z.md`  
  Cause: malformed DB URL (unencoded password/split host parsing).
- `apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-33-57-056Z.md`  
  Cause: direct DB host DNS/IPv4 issue.
- `apply-staging-qacgwgecrsinwjvuiobd-2026-03-16T15-46-05-662Z.md`  
  Cause: baseline dump included non-target schema object conflict (`auth` schema exists).

### Pilot apply/verify failures before final green

- `apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-45-08-396Z.md`  
  Note: apply succeeded against placeholder baseline (no schema content).
- `verify-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-45-09-461Z.md`  
  Cause: expected tables/policies/functions missing (placeholder baseline).
- `apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-46-19-291Z.md`  
  Cause: partial prior state conflict (`auth` schema exists).
- `apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-47-01-332Z.md`  
  Cause: `public` schema conflict from partial apply.
- `apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-47-47-872Z.md`  
  Cause: missing extension/operator class requirement (`btree_gist`).
- `apply-pilot-production-mdqnburqfzvzhvsicdyo-2026-03-16T15-48-33-190Z.md`  
  Cause: re-run on partially applied schema (`booking_status` already exists).

## Resolution Summary

1. Installed `psql` client.
2. Switched to pooler DB URLs and URL-encoded passwords.
3. Regenerated baseline from trusted staging schema and locked checksums.
4. Added required extension creation for baseline prerequisites.
5. Reset pilot `public` schema after partial runs.
6. Re-ran apply + verify to final green state.

