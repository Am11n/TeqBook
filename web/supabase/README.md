# Supabase SQL Scripts

This directory contains SQL scripts for managing the Supabase database schema and functions.

## Usage

These SQL scripts should be run in the **Supabase SQL Editor** in your Supabase dashboard.

### When to Run SQL Scripts

**Initial Setup:**
1. Run `supabase-foundation-complete.sql` **first** - This sets up the complete foundation (enums, indexes, foreign keys)
2. Run `onboarding-schema-update.sql` - Adds onboarding fields to salons table
3. Run `opening-hours-schema.sql` - Adds opening hours support
4. Run `operations-module-enhancements.sql` - Enhances operations modules
5. Run `add-superadmin.sql` - Adds super admin support (if needed)
6. Run `add-whatsapp-number.sql` - Adds WhatsApp number field (if needed)

**Admin Setup:**
- Run `create-superadmin.sql` **after** creating a user in Supabase Auth
- Run `fix-superadmin-role.sql` if you need to fix existing superadmin roles

**Troubleshooting:**
- Run `check-profiles-errors.sql` to diagnose profile query issues
- Run `fix-profiles-rls.sql` to fix RLS policy issues
- Run `verify-superadmin-profile.sql` to verify superadmin setup

### How to Run Scripts

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy and paste the contents of the SQL file you want to run
5. Click **"Run"** (or press `Cmd/Ctrl + Enter`)
6. Check for errors in the output panel

**Important Notes:**
- Most scripts are **idempotent** (can be run multiple times safely)
- Scripts use `IF NOT EXISTS` checks to avoid errors
- Always check the output for warnings or errors
- For production, consider running scripts in a transaction for rollback capability

## Files

### `supabase-foundation-complete.sql`

**Complete Supabase foundation setup** - This is the main script to run for setting up the foundation:

- Creates all Postgres enums (`booking_status`, `employee_role`, `plan_type`, `notification_type`, `notification_status`, `payment_method`)
- Verifies and adds foreign key constraints for `salon_id` on all relevant tables
- Creates indexes on all frequently queried columns
- Adds language preference columns (`supported_languages`, `default_language`)

**Run this first** to set up the complete foundation, then run other scripts as needed.

### `onboarding-schema-update.sql`

Adds new columns to the `salons` table and updates the `create_salon_for_current_user` function to support the onboarding wizard fields:

- `salon_type` - Type of salon (barber, nails, massage, other)
- `preferred_language` - Preferred language for staff interface
- `online_booking_enabled` - Whether online booking is enabled
- `is_public` - Whether the public booking page is active

**Note:** This script is idempotent - it can be run multiple times safely. It checks for existing columns and constraints before adding them.

### `opening-hours-schema.sql`

Adds opening hours support to the `salons` table.

### `operations-module-enhancements.sql`

Enhances the operations modules (services, employees, bookings, etc.) with additional fields and functionality.

### `add-whatsapp-number.sql`

Adds the `whatsapp_number` column to the `salons` table for storing WhatsApp contact information that will be displayed on the public booking page.

- `whatsapp_number` - WhatsApp contact number (text, nullable, should include country code)

**Note:** This script is idempotent - it can be run multiple times safely. It checks for existing columns before adding them.

### `add-branding-theme.sql`

Adds the `theme` JSONB column to the `salons` table for storing custom branding information (colors, fonts, logo, etc.).

- `theme` - JSONB column storing theme configuration:
  - `primary` - Primary brand color (hex)
  - `secondary` - Secondary accent color (hex)
  - `font` - Font family name
  - `logo_url` - URL to salon logo
  - `presets` - Array of preset names

**Note:** This script is idempotent - it can be run multiple times safely. It creates a GIN index for faster JSONB queries.

### `add-superadmin.sql`

Adds the `is_superadmin` column to the `profiles` table and creates RLS policies for super admin access.

- `is_superadmin` - Boolean flag indicating if a user is a super admin (default: FALSE)
- Creates index for faster queries
- Adds RLS policy for super admins to view all profiles

**Note:** This script is idempotent - it can be run multiple times safely.

### `create-superadmin.sql`

Sets a user as superadmin. **Important:** The user must already exist in Supabase Auth before running this script.

**To create the user first:**
1. Go to **Authentication > Users** in your Supabase dashboard
2. Click **"Add user"** > **"Create new user"**
3. Enter email: `admin@teqbook.com`
4. Enter password: `Test123`
5. Click **"Create user"**

**Then run this SQL script** to set the user as superadmin.

**Note:** Superadmins will have `role = 'superadmin'` instead of `role = 'owner'` to distinguish them from regular salon owners.

### `fix-superadmin-role.sql`

Updates existing superadmin users to have `role = 'superadmin'` instead of `role = 'owner'`. Use this if you've already created a superadmin user and need to fix their role.

---

## Admin Scripts

These scripts are used for admin operations and troubleshooting:

### `admin-get-user-emails.sql`

Creates a function `get_user_emails()` that allows superadmins to get email addresses for user IDs. This is used in the admin dashboard to display user information.

**Usage:**
```sql
SELECT * FROM get_user_emails(ARRAY['user-id-1'::UUID, 'user-id-2'::UUID]);
```

**Security:** Only superadmins can call this function (checked via `is_superadmin` flag).

### `find-salon-owner.sql`

Helper script to find the owner of a specific salon by looking up the profile that has the `salon_id`.

**Usage:** Modify the salon ID or name in the script, then run it.

### `verify-admin-function.sql`

Verifies that the `get_user_emails` function exists and can be called. Useful for troubleshooting admin dashboard issues.

### `check-profiles-errors.sql`

Diagnostic script to help identify why profiles queries are failing with 500 errors. Checks:
- If `is_superadmin` column exists
- RLS status
- RLS policies
- Triggers
- Constraints

### `fix-profiles-rls.sql`

Fixes RLS policies on the `profiles` table to ensure:
- Users can view their own profile
- Superadmins can view all profiles
- Users can update their own profile
- Users can insert their own profile

**Run this if:** You're experiencing issues with profile queries or RLS policy errors.

### `verify-superadmin-profile.sql`

Verifies that a superadmin profile is set up correctly. Checks:
- If user exists in auth
- If profile exists
- If `is_superadmin` flag is set
- If role is correct

### `prevent-orphaned-salons.sql`

Creates a trigger to prevent orphaned salons (salons without owners). Ensures data integrity.

### `delete-orphaned-salon.sql`

Helper script to delete orphaned salons. Use with caution.

### `reset-admin-password.sql`

Helper script to reset admin password. Use with caution.

### `fix-admin-user-auth.sql`

Fixes authentication issues for admin users. Use if admin login is not working.

---

## Multi-Tenant Security (RLS Policies)

TeqBook uses **Row Level Security (RLS)** to ensure multi-tenant data isolation. All tables are protected by RLS policies that filter data based on `salon_id` and user authentication.

### How Multi-Tenant Security Works

1. **User Authentication:** Users authenticate via Supabase Auth (`auth.uid()`)
2. **Profile Lookup:** User's `salon_id` is stored in the `profiles` table
3. **RLS Policy Pattern:** Most policies follow this pattern:

```sql
CREATE POLICY "Users can view data for their salon"
  ON table_name
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### RLS Policy Examples

**Opening Hours:**
```sql
CREATE POLICY "Users can view opening_hours for their salon"
  ON opening_hours
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

**Employee Services:**
```sql
CREATE POLICY "Users can view employee_services for their salon"
  ON employee_services
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### Superadmin Access

Superadmins have special access via the `is_superadmin()` function:

```sql
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE user_id = auth.uid() 
    AND is_superadmin = TRUE
  );
END;
$$;
```

Superadmins can:
- View all profiles (via RLS policy)
- Access admin dashboard
- View all salons and users

### Tables with Multi-Tenant RLS

All these tables have `salon_id` foreign keys and RLS policies:
- `employees` - Filtered by `salon_id`
- `bookings` - Filtered by `salon_id`
- `services` - Filtered by `salon_id`
- `customers` - Filtered by `salon_id`
- `shifts` - Filtered by `salon_id`
- `opening_hours` - Filtered by `salon_id`
- `employee_services` - Filtered by `salon_id`

### Public Access (No Auth Required)

Some tables have public read access for the public booking page:
- `salons` - Public can read if `is_public = true`
- `services` - Public can read if salon is public
- `employees` - Public can read if salon is public
- `opening_hours` - Public can read if salon is public

**Note:** Public access is read-only. Only authenticated users can create/update/delete data.

---

## Migration Strategy

**Current Approach:**
- All SQL scripts are stored in `web/supabase/` directory
- Scripts are idempotent (can be run multiple times safely)
- Use `IF NOT EXISTS` checks before creating objects
- Use `DROP IF EXISTS` before recreating objects when needed

**Future Consideration:**
- Consider using Supabase CLI migrations (`supabase/migrations/`) for version control
- Track migration history in a `migrations` table
- Use numbered migration files (e.g., `001_initial_schema.sql`)

**For Now:**
- Continue using the current approach (SQL scripts in `supabase/`)
- Document all schema changes in SQL files
- Keep scripts idempotent for safe re-runs

---

## Supabase Sync Process

**Current Setup:**
- SQL scripts are manually run in Supabase SQL Editor
- No automated sync process
- Changes are applied directly to the database

**Best Practices:**
1. **Always test scripts in development first**
2. **Backup database before running scripts in production**
3. **Run scripts in transactions when possible** (for rollback capability)
4. **Document all changes** in SQL file comments
5. **Verify changes** using verification queries in scripts

**Future Enhancement:**
- Consider using Supabase CLI for local development
- Set up automated migrations via CI/CD
- Use Supabase migrations for version control

---

## Adding New Scripts

When adding new SQL scripts:

1. Place them in this `supabase/` directory
2. Use descriptive filenames (e.g., `migration-YYYY-MM-DD-description.sql`)
3. Add comments explaining what the script does
4. Make scripts idempotent when possible (check for existence before creating)
5. Document the script in this README
6. Include verification queries at the end of the script
7. Test the script in development before running in production

