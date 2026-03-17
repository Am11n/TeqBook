# TeqBook Scripts

This directory contains utility scripts for development and maintenance. **Run all commands from the repository root** with `pnpm run <script>`.

## Available Scripts (from repo root)

### Database Scripts

#### Controlled Production DB Scripts

#### `db-manifest.ts` - Manifest and Checksum Governance

Validates canonical apply order and file checksums.

```bash
pnpm run db:manifest:verify
pnpm run db:manifest:lock
```

#### `db-apply.ts` - Deterministic Apply Workflow

Applies baseline + post-baseline migrations from `supabase/supabase/migration-manifest.json` using `psql`.

```bash
pnpm run db:apply
```

Required env:
- `TEQBOOK_ENV_TARGET` (`staging` or `pilot-production`)
- `SUPABASE_DB_URL`
- `NEXT_PUBLIC_SUPABASE_URL`

#### `db-verify.ts` - Verification Pack Runner

Runs SQL verification files:
- `supabase/supabase/verification/00_schema_and_security.sql`
- `supabase/supabase/verification/01_booking_integrity.sql`
- `supabase/supabase/verification/02_data_quality.sql`

```bash
pnpm run db:verify
```

#### `seed.ts` - Seed Database

Seeds the database with initial test data.

```bash
pnpm run seed
```

**Options:**
- `--reset` - Reset database before seeding (deletes all data)
- `--force` - Force re-seed even if data exists

```bash
pnpm run seed:reset
pnpm run seed:force
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

(Loaded from `.env.local` or `.env` in the **repository root**.)

---

#### `migrate-local.ts` - Run Local Migrations

Runs SQL migrations from `supabase/supabase/migrations/` against your Supabase instance.

```bash
pnpm run migrate:local
```

**Options:**
- `--file=path/to/file.sql` - Run specific migration file

```bash
pnpm run migrate:local -- --file=supabase/supabase/migrations/my-migration.sql
```

**Note:** This is staging-only. Controlled production rollout should use `db:apply`.

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

#### `reset-db.ts` - Reset Database

⚠️ **WARNING:** This will delete ALL data in the database!

Resets the database by deleting all rows from configured tables.

```bash
pnpm run reset:db
```

The script waits 5 seconds before executing so you can cancel (Ctrl+C).

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

#### `create-e2e-users.ts` - Create E2E Test Users

Creates owner and superadmin users (and test salon) for E2E tests.

```bash
pnpm run create:e2e-users
pnpm run create:e2e-users:cleanup   # Remove test users first
pnpm run setup:e2e                  # Alias for create:e2e-users
pnpm run setup:e2e:clean            # Cleanup then create
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Development Workflow

### Initial Setup

1. Select env file and copy to root `.env.local`:
   ```bash
   cp .env.staging .env.local
   # or
   cp .env.pilot .env.local
   ```
2. Verify manifest integrity:
   ```bash
   pnpm run db:manifest:verify
   ```
3. Run controlled apply:
   ```bash
   pnpm run db:apply
   ```
4. Run verification pack:
   ```bash
   pnpm run db:verify
   ```
5. Staging only: seed fixtures if needed.
   ```bash
   pnpm run seed
   ```
6. (Optional) Create E2E users for Playwright:
   ```bash
   pnpm run setup:e2e
   ```

### Resetting Development Database

If you need to start fresh:

```bash
pnpm run reset:db
pnpm run seed
```

### Adding New Migrations

1. Create SQL file in `supabase/supabase/migrations/`.
2. Run migration:
   ```bash
   pnpm run migrate:local
   ```

---

## Script Dependencies

Installed at repo root: `tsx`, `dotenv`, `glob`. No extra install needed after `pnpm install`.

---

## Security Notes

⚠️ **Important:**
- These scripts use `SUPABASE_SERVICE_ROLE_KEY` (full database access).
- Never commit `.env.local` / `.env` to version control.
- Use only in development/staging; in production use Supabase Dashboard or proper migration tools.

---

## Troubleshooting

### "Missing required environment variables"

Create `.env.local` (or `.env`) in the **repository root** with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://...
TEQBOOK_ENV_TARGET=staging
```

### "psql not found"

Install PostgreSQL client tools so `psql` is available in your shell.

### "Manifest checksum verification failed"

If file changes are intentional:

```bash
pnpm run db:manifest:lock
```

Then commit updated `migration-checksums.json`.

### "Permission denied" errors

Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` (not anon key) and the correct `.env.local` target.

