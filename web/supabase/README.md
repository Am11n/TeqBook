# Supabase SQL Scripts

This directory contains SQL scripts for managing the Supabase database schema and functions.

## Usage

These SQL scripts should be run in the **Supabase SQL Editor** in your Supabase dashboard.

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of the SQL file you want to run
4. Execute the script

## Files

### `onboarding-schema-update.sql`

Adds new columns to the `salons` table and updates the `create_salon_for_current_user` function to support the onboarding wizard fields:

- `salon_type` - Type of salon (barber, nails, massage, other)
- `preferred_language` - Preferred language for staff interface
- `online_booking_enabled` - Whether online booking is enabled
- `is_public` - Whether the public booking page is active

**Note:** This script is idempotent - it can be run multiple times safely. It checks for existing columns and constraints before adding them.

## Adding New Scripts

When adding new SQL scripts:

1. Place them in this `supabase/` directory
2. Use descriptive filenames (e.g., `migration-YYYY-MM-DD-description.sql`)
3. Add comments explaining what the script does
4. Make scripts idempotent when possible (check for existence before creating)
5. Document the script in this README

