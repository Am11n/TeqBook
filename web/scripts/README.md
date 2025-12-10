# TeqBook Scripts

This directory contains utility scripts for development and maintenance.

## Available Scripts

### Database Scripts

#### `seed.ts` - Seed Database

Seeds the database with initial test data.

```bash
npm run seed
```

**Options:**
- `--reset` - Reset database before seeding (deletes all data)

```bash
npm run seed:reset
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

#### `migrate-local.ts` - Run Local Migrations

Runs SQL migrations from `supabase/` directory against local Supabase instance.

```bash
npm run migrate:local
```

**Options:**
- `--file=path/to/file.sql` - Run specific migration file

```bash
npm run migrate:local -- --file=supabase/my-migration.sql
```

**Note:** This script attempts to use Supabase RPC `exec_sql`. If that's not available, you'll need to run migrations manually in the Supabase SQL Editor.

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

#### `reset-db.ts` - Reset Database

⚠️ **WARNING:** This will delete ALL data in the database!

Resets the local database by deleting all rows from all tables.

```bash
npm run reset:db
```

The script will wait 5 seconds before executing to give you time to cancel.

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Development Workflow

### Initial Setup

1. Set up environment variables in `.env.local`
2. Run migrations:
   ```bash
   npm run migrate:local
   ```
3. Seed test data:
   ```bash
   npm run seed
   ```

### Resetting Development Database

If you need to start fresh:

```bash
npm run reset:db
npm run seed
```

### Adding New Migrations

1. Create SQL file in `supabase/` directory
2. Run migration:
   ```bash
   npm run migrate:local
   ```

---

## Script Dependencies

These scripts require:
- `tsx` - TypeScript execution
- `dotenv` - Environment variable loading
- `glob` - File pattern matching

Install with:
```bash
npm install --save-dev tsx dotenv glob
```

---

## Security Notes

⚠️ **Important:**
- These scripts use `SUPABASE_SERVICE_ROLE_KEY` which has full database access
- Never commit `.env.local` to version control
- Only use these scripts in development/staging environments
- In production, use Supabase Dashboard or proper migration tools

---

## Troubleshooting

### "Missing required environment variables"

Make sure `.env.local` exists in the `web/` directory with:
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

