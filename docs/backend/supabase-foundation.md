# TeqBook – Supabase Foundation Documentation

This document describes the Supabase backend foundation for TeqBook, including the data model, indexes, enums, and best practices.

## 1. Multi-Tenant Data Model

TeqBook uses a salon-based multi-tenant architecture. All functional tables are linked to a `salons` table via `salon_id`.

### Tables with `salon_id` Foreign Key

The following tables have `salon_id` as a foreign key to `salons(id)` with `ON DELETE CASCADE`:

- **`employees`** – Staff members belonging to a salon
- **`bookings`** – Appointments/bookings for a salon
- **`services`** – Services offered by a salon
- **`customers`** – Customer records for a salon
- **`shifts`** – Employee work shifts for a salon
- **`opening_hours`** – Salon opening hours per day of week
- **`employee_services`** – Junction table linking employees to services (many-to-many)

### Foreign Key Constraints

All `salon_id` columns:
- Type: `UUID` (matching `salons.id`)
- Constraint: `FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE`
- Ensures data integrity: when a salon is deleted, all related data is automatically removed

## 2. Postgres Enums

The following Postgres enums are defined for type safety and consistency:

### `booking_status`
- `pending` – Booking is pending confirmation
- `confirmed` – Booking is confirmed
- `completed` – Booking has been completed
- `cancelled` – Booking was cancelled
- `no-show` – Customer did not show up
- `scheduled` – Booking is scheduled

### `employee_role`
- `owner` – Salon owner
- `manager` – Salon manager
- `staff` – Regular staff member

### `plan_type`
- `starter` – Starter plan ($25/month)
- `pro` – Pro plan ($50/month)
- `business` – Business plan ($75/month)

### `notification_type`
- `sms` – SMS notification
- `email` – Email notification
- `whatsapp` – WhatsApp notification

### `notification_status`
- `pending` – Notification is pending
- `sent` – Notification was sent successfully
- `failed` – Notification failed to send

### `payment_method`
- `in_salon` – Payment made in salon (current default)
- `online` – Online payment (for future use)

**Note:** Currently, text columns with CHECK constraints are used instead of enum types for backward compatibility. Full migration to enum types can be done gradually.

## 3. Indexes

Indexes are created on frequently queried columns to ensure fast queries:

### Bookings
- `idx_bookings_salon_start_time` – Index on `(salon_id, start_time)` for date-range queries
- `idx_bookings_salon_employee_start` – Index on `(salon_id, employee_id, start_time)` for employee-specific queries

### Other Tables
- `idx_employees_salon_id` – Index on `employees.salon_id`
- `idx_customers_salon_id` – Index on `customers.salon_id`
- `idx_services_salon_id` – Index on `services.salon_id`
- `idx_shifts_salon_id` – Index on `shifts.salon_id`
- `idx_shifts_salon_employee_start` – Index on `(salon_id, employee_id, start)` for employee shift queries
- `idx_opening_hours_salon_id` – Index on `opening_hours.salon_id`
- `idx_employee_services_salon_id` – Index on `employee_services.salon_id`

## 4. Language Preferences

Language preferences are stored in Supabase, not in localStorage:

### `profiles.preferred_language`
- User-level preferred language
- Type: `TEXT` (matches `AppLocale` type)
- Updated when user changes language in dashboard

### `salons.supported_languages`
- Array of languages supported by the salon
- Type: `TEXT[]` (array of text)
- Default: `['en']`
- Updated in onboarding/settings

### `salons.default_language`
- Default language for the salon
- Type: `TEXT` (matches `AppLocale` type)
- Default: `'en'`
- Used as fallback for public booking page

### `salons.preferred_language`
- Preferred language for staff interface
- Type: `TEXT`
- Default: `'en'`

## 5. Pagination

All list queries in repositories support pagination using Supabase's `.range()` method:

```typescript
// Example: Paginated query
const { data, error } = await supabase
  .from("employees")
  .select("*")
  .eq("salon_id", salonId)
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order("created_at", { ascending: true });
```

**Default page size:** 50 items per page (configurable per repository)

## 6. Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Filter by `salon_id` based on the user's profile
- Allow superadmins to view all data
- Prevent cross-salon data access

### RLS Policies Pattern

```sql
-- Example policy
CREATE POLICY "Users can view employees for their salon"
ON employees FOR SELECT
USING (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE user_id = auth.uid()
  )
);
```

## 7. Edge Functions

Edge functions are used minimally and only for:
- Background jobs (cron tasks, e.g., SMS reminders)
- External API integrations (Twilio, WhatsApp, email)
- Secure processing where public client should not have access

**Current edge functions:**
- None yet (structure is in place at `web/supabase/functions/`)

**Not in edge functions:**
- Regular list queries (done via Supabase client)
- Simple CRUD operations (done via repositories)
- Report queries (done via RPC functions in Postgres)

## 8. RPC Functions

Postgres functions (RPC) are used for complex business logic:

### `create_salon_for_current_user`
- Creates a salon and links it to the current user
- Parameters: salon name, type, preferred language, online booking enabled, is public
- Returns: salon UUID

### `get_user_emails`
- Returns email addresses for given user IDs
- Only accessible to superadmins
- Used in admin dashboard

### `create_booking_with_validation`
- Creates a booking with validation logic
- Parameters: salon_id, employee_id, service_id, start_time, customer info, is_walk_in
- Returns: created booking with related data

### `generate_availability`
- Generates available time slots for booking
- Used in booking flow

## 9. Database Migrations

All SQL migrations are stored in `web/supabase/` directory:

- `onboarding-schema-update.sql` – Salon fields and onboarding support
- `opening-hours-schema.sql` – Opening hours table
- `operations-module-enhancements.sql` – Enhanced fields for operations modules
- `add-whatsapp-number.sql` – WhatsApp number field
- `add-superadmin.sql` – Super admin support
- `fix-profiles-rls.sql` – RLS policies for profiles
- `supabase-foundation-complete.sql` – Complete foundation setup (enums, indexes, etc.)

**Migration Strategy:**
- All migrations are idempotent (can be run multiple times safely)
- Use `IF NOT EXISTS` checks before creating objects
- Use `DROP IF EXISTS` before recreating objects when needed

## 10. Best Practices

1. **Always filter by `salon_id`** in queries to ensure multi-tenant isolation
2. **Use RLS policies** as the primary security mechanism
3. **Use indexes** on frequently queried columns, but don't over-index
4. **Use pagination** for all list queries (default: 50 items per page)
5. **Store persistent state in Supabase**, not in localStorage
6. **Use RPC functions** for complex business logic
7. **Use edge functions** only for external integrations and background jobs
8. **Keep migrations idempotent** for safe re-runs

## 11. Verification Queries

Run these queries to verify the foundation setup:

```sql
-- Check enums
SELECT typname FROM pg_type 
WHERE typname IN ('booking_status', 'employee_role', 'plan_type', 'notification_type', 'notification_status', 'payment_method');

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Check foreign keys
SELECT tc.table_name, tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('employees', 'bookings', 'services', 'customers', 'shifts');

-- Check language columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('salons', 'profiles') 
AND column_name IN ('supported_languages', 'default_language', 'preferred_language');
```

