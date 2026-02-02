# Supabase Migration Workflow

This document describes how to safely manage database migrations and admin scripts in TeqBook.

## Directory Structure

```
supabase/
├── migrations/     # Deterministic migrations (auto-run)
├── admin/          # One-time admin scripts (manual run only)
└── functions/      # Edge Functions (Deno)
```

## Migrations (`supabase/migrations/`)

**Purpose**: Schema changes, table creation, RLS policies, functions, and other deterministic database changes.

**Auto-executed**: Yes, via `npm run migrate:local`

**Naming Convention**:
- **Recommended**: `YYYYMMDD-HHMMSS-description.sql`
  - Example: `20241220-143000-add-profile-fields.sql`
- **Alternative**: Sequential numbers `001-description.sql`, `002-description.sql`, etc.

**Rules**:
- Must be deterministic (same result every time)
- Must be idempotent (safe to run multiple times)
- Should not contain data-specific operations
- Should not delete data without explicit user action

**Example Migration**:
```sql
-- 20241220-143000-add-profile-fields.sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Admin Scripts (`supabase/admin/`)

**Purpose**: One-time fixes, data migrations, debugging queries, manual operations.

**Auto-executed**: No, must be run manually

**Naming Convention**: Descriptive names like `fix-profiles-rls.sql`, `reset-admin-password.sql`

**Rules**:
- Never run automatically
- May contain data-specific operations
- May delete or modify existing data
- Should be documented with purpose and usage

**Example Admin Script**:
```sql
-- fix-profiles-rls.sql
-- Purpose: Fix RLS policies for profiles table
-- Usage: Run manually in Supabase SQL Editor when needed

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```

## Running Migrations

### Local Development

```bash
# Run all migrations
npm run migrate:local

# Run specific migration
npm run migrate:local -- --file supabase/migrations/20241220-143000-add-profile-fields.sql
```

### Production

Migrations should be run manually in Supabase Dashboard SQL Editor, or via Supabase CLI if configured.

**Never** run migrations automatically in production without review.

## Creating a New Migration

1. **Create the migration file**:
   ```bash
   touch supabase/migrations/$(date +%Y%m%d-%H%M%S)-your-description.sql
   ```

2. **Write the migration**:
   ```sql
   -- Use IF NOT EXISTS, IF EXISTS, etc. for idempotency
   -- Add comments explaining what the migration does
   -- Test locally before committing
   ```

3. **Test locally**:
   ```bash
   npm run migrate:local
   ```

4. **Commit and push**:
   ```bash
   git add supabase/migrations/
   git commit -m "Add migration: your-description"
   ```

## Creating an Admin Script

1. **Create the admin script**:
   ```bash
   touch supabase/admin/your-script-name.sql
   ```

2. **Add documentation**:
   ```sql
   -- Purpose: Brief description of what this script does
   -- Usage: When and how to run this script
   -- Warning: Any destructive operations or data changes
   ```

3. **Test in development first**:
   - Run manually in Supabase SQL Editor
   - Verify results
   - Document any side effects

4. **Commit**:
   ```bash
   git add supabase/admin/
   git commit -m "Add admin script: your-script-name"
   ```

## Best Practices

### Migrations

✅ **Do**:
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Add comments explaining the change
- Test locally before committing
- Keep migrations small and focused
- Use transactions where appropriate

❌ **Don't**:
- Delete data without user action
- Hardcode specific IDs or data
- Run admin scripts as migrations
- Skip testing locally

### Admin Scripts

✅ **Do**:
- Document purpose and usage
- Add warnings for destructive operations
- Test in development first
- Keep a backup before running

❌ **Don't**:
- Put admin scripts in `migrations/` directory
- Run admin scripts automatically
- Skip documentation

## Migration Script Details

The `migrate-local.ts` script:

1. **Only runs files from `supabase/migrations/`**
   - Admin scripts in `supabase/admin/` are never auto-run
   - This prevents accidental execution of one-time fixes

2. **Validates file naming**
   - Warns if files don't follow naming convention
   - Still runs them, but warns for consistency

3. **Sorts files deterministically**
   - Date format: sorted by timestamp
   - Sequential: sorted by number
   - Ensures same execution order every time

4. **Logs execution**
   - Shows which files are being run
   - Logs success/failure for each file

## Troubleshooting

### Migration fails

1. Check error message in console
2. Verify SQL syntax in Supabase SQL Editor
3. Check if migration is idempotent (safe to re-run)
4. If needed, create a fix migration

### Admin script needed

1. Create script in `supabase/admin/`
2. Document purpose and usage
3. Run manually in Supabase SQL Editor
4. Commit script for reference

### Migration order issues

1. Ensure files follow naming convention
2. Check sort order in migration script output
3. If needed, rename files to correct order

## Security Notes

- **Never commit sensitive data** in migrations or admin scripts
- **Review all migrations** before running in production
- **Backup database** before running admin scripts
- **Use RLS policies** to protect data, not just migrations

