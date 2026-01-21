# Database Query Patterns

Best practices for database queries in TeqBook repositories.

## Core Principles

### 1. Always Select Specific Fields

**Bad:**
```typescript
.select("*")
```

**Good:**
```typescript
.select("id, full_name, email, phone, created_at")
```

**Why:**
- Reduces data transfer
- Avoids exposing sensitive fields
- Makes query intent explicit
- Better performance with indexes

### 2. Use Pagination for All List Queries

All list queries must support pagination to prevent memory issues with large datasets.

```typescript
export async function getItemsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Item[] | null; error: string | null; total?: number }> {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 50;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("items")
    .select("id, name, ...", { count: "exact" })
    .eq("salon_id", salonId)
    .range(from, to);
    
  return { data, error: error?.message ?? null, total: count ?? undefined };
}
```

### 3. Use Composite Indexes for Common Query Patterns

Queries that filter on multiple columns benefit from composite indexes.

**Query:**
```typescript
.eq("salon_id", salonId)
.gte("start_time", startDate)
.lte("start_time", endDate)
```

**Index:**
```sql
CREATE INDEX idx_bookings_salon_date_range
  ON bookings(salon_id, start_time, end_time);
```

### 4. Use Partial Indexes for Common Filters

When queries frequently filter on specific values, use partial indexes.

**Query:**
```typescript
.eq("salon_id", salonId)
.eq("is_active", true)
```

**Index:**
```sql
CREATE INDEX idx_employees_salon_active
  ON employees(salon_id, is_active)
  WHERE is_active = true;
```

### 5. Avoid N+1 Queries with JOINs

**Bad (N+1):**
```typescript
const employees = await getEmployees(salonId);
for (const emp of employees) {
  const services = await getServicesForEmployee(emp.id);
}
```

**Good (Single Query with JOIN):**
```typescript
const { data } = await supabase
  .from("employees")
  .select(`
    id, full_name,
    employee_services(service_id, services(id, name))
  `)
  .eq("salon_id", salonId);
```

### 6. Use RPC Functions for Complex Operations

For complex queries or operations that need atomicity, use database functions.

```typescript
const { data } = await supabase.rpc("create_booking_with_validation", {
  p_salon_id: salonId,
  p_employee_id: employeeId,
  p_service_id: serviceId,
  p_start_time: startTime,
});
```

## Query Patterns by Table

### Bookings

```typescript
// Calendar view - date range query
.select("id, start_time, end_time, status, is_walk_in, customers(full_name), employees(id, full_name), services(name)")
.eq("salon_id", salonId)
.gte("start_time", startDate)
.lte("start_time", endDate)
.order("start_time", { ascending: true })

// Upcoming bookings only
.eq("salon_id", salonId)
.in("status", ["pending", "confirmed", "scheduled"])
.gte("start_time", new Date().toISOString())
```

### Customers

```typescript
// List with pagination
.select("id, full_name, email, phone, notes, gdpr_consent", { count: "exact" })
.eq("salon_id", salonId)
.order("full_name", { ascending: true })
.range(from, to)

// Search
.select("id, full_name, email, phone")
.eq("salon_id", salonId)
.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
.limit(5)
```

### Employees

```typescript
// List with pagination
.select("id, full_name, email, phone, role, preferred_language, is_active", { count: "exact" })
.eq("salon_id", salonId)
.order("created_at", { ascending: true })
.range(from, to)

// With services (avoids N+1)
.select(`
  id, full_name, email, phone, role, preferred_language, is_active,
  employee_services(service_id, services(id, name))
`)
.eq("salon_id", salonId)
```

### Services

```typescript
// Active services for booking form
.select("id, name, category, duration_minutes, price_cents, sort_order, is_active", { count: "exact" })
.eq("salon_id", salonId)
.eq("is_active", true)
.order("sort_order", { ascending: true, nullsFirst: false })
.order("name", { ascending: true })
```

### Notifications

```typescript
// User notifications
.select("id, user_id, salon_id, type, title, body, read, metadata, action_url, created_at")
.eq("user_id", userId)
.order("created_at", { ascending: false })
.range(offset, offset + limit - 1)

// Unread count (use RPC for efficiency)
await supabase.rpc("get_unread_notification_count", { p_user_id: userId })
```

## Index Strategy

### Primary Indexes (Already Created)

These indexes exist in `supabase-foundation-complete.sql`:

| Table | Index | Columns |
|-------|-------|---------|
| bookings | idx_bookings_salon_start_time | (salon_id, start_time) |
| bookings | idx_bookings_salon_employee_start | (salon_id, employee_id, start_time) |
| employees | idx_employees_salon_id | (salon_id) |
| customers | idx_customers_salon_id | (salon_id) |
| services | idx_services_salon_id | (salon_id) |
| shifts | idx_shifts_salon_id | (salon_id) |
| shifts | idx_shifts_salon_employee_start | (salon_id, employee_id, start_time) |
| opening_hours | idx_opening_hours_salon_id | (salon_id) |
| employee_services | idx_employee_services_salon_id | (salon_id) |

### Performance Indexes (Migration 20260122000001)

Additional indexes for query optimization:

| Table | Index | Purpose |
|-------|-------|---------|
| bookings | idx_bookings_salon_date_range | Calendar date range queries |
| bookings | idx_bookings_salon_status | Status filtering |
| bookings | idx_bookings_customer_id | Customer booking history |
| bookings | idx_bookings_employee_id | Employee performance metrics |
| bookings | idx_bookings_upcoming | Upcoming bookings (partial) |
| customers | idx_customers_full_name_trgm | Name search (trigram) |
| customers | idx_customers_email | Email lookup |
| customers | idx_customers_phone | Phone lookup |
| employees | idx_employees_salon_active | Active employee filter |
| services | idx_services_salon_active | Active service filter |
| notifications | idx_notifications_user_unread | Unread count |
| notifications | idx_notifications_user_created | Notification listing |
| profiles | idx_profiles_salon_id | RLS policy performance |
| profiles | idx_profiles_superadmin | Superadmin check |

## RLS Policy Performance

RLS policies use subqueries on `profiles` table. Ensure these indexes exist:

```sql
-- Used by all tenant RLS policies
CREATE INDEX idx_profiles_salon_id ON profiles(salon_id) WHERE salon_id IS NOT NULL;

-- Used by superadmin checks
CREATE INDEX idx_profiles_superadmin ON profiles(user_id) WHERE is_superadmin = true;
```

## Monitoring Slow Queries

### Enable pg_stat_statements

In Supabase Dashboard > Database > Extensions, enable `pg_stat_statements`.

### Query to Find Slow Queries

```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### EXPLAIN ANALYZE Example

```sql
EXPLAIN ANALYZE
SELECT * FROM bookings
WHERE salon_id = 'uuid-here'
AND start_time >= '2026-01-01'
AND start_time <= '2026-01-31';
```

Look for:
- `Seq Scan` → May need index
- `Index Scan` → Good
- `Bitmap Index Scan` → Good for multiple conditions
- High `actual time` values → Query needs optimization

## Common Pitfalls

### 1. Using SELECT * in Production

Always list specific columns. `SELECT *`:
- Fetches unnecessary data
- Breaks when columns are added/removed
- May expose sensitive data

### 2. Missing Indexes on Foreign Keys

Foreign keys don't automatically create indexes. Always add:
```sql
CREATE INDEX idx_tablename_fk ON tablename(foreign_key_column);
```

### 3. Inefficient LIKE Queries

```sql
-- Bad: Can't use index
WHERE name LIKE '%search%'

-- Better: Can use index
WHERE name LIKE 'search%'

-- Best: Use trigram index for partial matches
CREATE INDEX idx_name_trgm ON table USING gin (name gin_trgm_ops);
```

### 4. Not Using Partial Indexes

When most queries filter on specific values:
```sql
-- Instead of full index
CREATE INDEX idx_status ON bookings(status);

-- Use partial index
CREATE INDEX idx_bookings_pending ON bookings(salon_id) 
  WHERE status = 'pending';
```
