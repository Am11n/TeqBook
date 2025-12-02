# Supabase SQL Scripts

This directory contains SQL scripts for managing the Supabase database schema and functions.

## Usage

These SQL scripts should be run in the **Supabase SQL Editor** in your Supabase dashboard.

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of the SQL file you want to run
4. Execute the script

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

## Adding New Scripts

When adding new SQL scripts:

1. Place them in this `supabase/` directory
2. Use descriptive filenames (e.g., `migration-YYYY-MM-DD-description.sql`)
3. Add comments explaining what the script does
4. Make scripts idempotent when possible (check for existence before creating)
5. Document the script in this README

