# TeqBook Scripts

This directory contains utility scripts for development and maintenance. **Run all commands from the repository root** with `pnpm run <script>`.

## Available Scripts (from repo root)

### Database Scripts

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

Runs SQL migrations from `supabase/migrations/` against your Supabase instance.

```bash
pnpm run migrate:local
```

**Options:**
- `--file=path/to/file.sql` - Run specific migration file

```bash
pnpm run migrate:local -- --file=supabase/migrations/my-migration.sql
```

**Note:** Uses Supabase RPC `exec_sql` if available; otherwise run migrations manually in the Supabase SQL Editor.

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

1. Set up environment variables in **repository root** `.env.local` (or `.env`).
2. Run migrations:
   ```bash
   pnpm run migrate:local
   ```
3. Seed test data:
   ```bash
   pnpm run seed
   ```
4. (Optional) Create E2E users for Playwright:
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

1. Create SQL file in `supabase/migrations/`.
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
```

### "RPC exec_sql not available"

The migration script tries to use a Supabase RPC function that may not exist. In this case:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the migration SQL manually

### "Permission denied" errors

Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) for scripts that modify data.

