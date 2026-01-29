# RLS Policy Patterns

**Last Updated:** 2025-01-04  
**Purpose:** Document common RLS policy patterns used in TeqBook

---

## Overview

TeqBook uses **Row Level Security (RLS)** to ensure multi-tenant data isolation. All tenant tables are protected by RLS policies that filter data based on `salon_id` and user authentication.

---

## Core Principles

1. **Multi-tenant isolation:** Users can only access data for their own salon
2. **Superadmin access:** Superadmins can view all data across all salons
3. **Service role bypass:** Edge Functions use service role to bypass RLS when needed
4. **Consistent patterns:** All tenant tables follow the same policy structure

---

## Pattern 1: Standard Tenant Table Access

**Use Case:** Most tenant tables (bookings, customers, employees, services, shifts, products, etc.)

**Pattern Structure:**
- SELECT: Users can view data for their salon
- INSERT: Users can create data for their salon
- UPDATE: Users can update data for their salon
- DELETE: Users can delete data for their salon
- SELECT: Superadmins can view all data

**Implementation:**

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Users can view data for their salon
CREATE POLICY "Users can view [table] for their salon"
  ON [table] FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert data for their salon
CREATE POLICY "Users can insert [table] for their salon"
  ON [table] FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update data for their salon
CREATE POLICY "Users can update [table] for their salon"
  ON [table] FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete data for their salon
CREATE POLICY "Users can delete [table] for their salon"
  ON [table] FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all data
CREATE POLICY "Superadmins can view all [table]"
  ON [table] FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );
```

**Used in:**
- ✅ `bookings`
- ✅ `customers`
- ✅ `employees`
- ✅ `services`
- ✅ `shifts`
- ✅ `products`
- ✅ `opening_hours`
- ✅ `addons`

---

## Pattern 2: Junction Table Access

**Use Case:** Junction tables that link two tenant tables (e.g., `employee_services`, `booking_products`)

**Pattern Structure:**
- Access is controlled via the related tenant table
- Users can only access junction records for their salon

**Implementation:**

```sql
-- Example: booking_products
CREATE POLICY "Users can view booking_products for their salon"
  ON booking_products FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE salon_id IN (
        SELECT salon_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Example: employee_services
CREATE POLICY "Users can view employee_services for their salon"
  ON employee_services FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

**Used in:**
- ✅ `booking_products`
- ✅ `employee_services`

---

## Pattern 3: Superadmin Access

**Use Case:** Allow superadmins to view all data across all salons

**Pattern Structure:**
- Superadmins can view all records
- Regular users are restricted to their salon

**Implementation:**

```sql
CREATE POLICY "Superadmins can view all [table]"
  ON [table] FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );
```

**Used in:**
- ✅ All tenant tables (bookings, customers, employees, services, shifts, products, etc.)
- ✅ `profiles`
- ✅ `salons`
- ✅ `security_audit_log`

---

## Pattern 4: Public Read, Superadmin Write

**Use Case:** System tables that contain metadata (features, plan_features)

**Pattern Structure:**
- Everyone can read
- Only superadmins can modify

**Implementation:**

```sql
-- Anyone can view
CREATE POLICY "Anyone can view [table]"
  ON [table] FOR SELECT
  USING (true);

-- Only superadmins can modify
CREATE POLICY "Only superadmins can modify [table]"
  ON [table] FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND is_superadmin = true
    )
  );
```

**Used in:**
- ✅ `features`
- ✅ `plan_features`

---

## Pattern 5: Service Role Only

**Use Case:** System tables that should only be accessible by Edge Functions

**Pattern Structure:**
- Only service role can access
- Regular users cannot access

**Implementation:**

```sql
CREATE POLICY "Service role can manage [table]"
  ON [table] FOR ALL
  USING (auth.role() = 'service_role');
```

**Used in:**
- ✅ `rate_limit_entries`

---

## Pattern 6: User Self-Access

**Use Case:** Tables where users can only access their own records (profiles)

**Pattern Structure:**
- Users can view/update their own record
- Superadmins can view all records

**Implementation:**

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Superadmins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND is_superadmin = TRUE
    )
  );
```

**Used in:**
- ✅ `profiles`

---

## Pattern 7: Salon Self-Access

**Use Case:** Salons table where users can only access their own salon

**Pattern Structure:**
- Users can view/update their own salon
- Superadmins can view/update all salons
- INSERT is handled via RPC function

**Implementation:**

```sql
-- Users can view their own salon
CREATE POLICY "Users can view their own salon"
  ON salons FOR SELECT
  USING (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own salon
CREATE POLICY "Users can update their own salon"
  ON salons FOR UPDATE
  USING (
    id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Superadmins can view all salons
CREATE POLICY "Superadmins can view all salons"
  ON salons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );
```

**Used in:**
- ✅ `salons`

---

## Pattern 8: Immutable Audit Log

**Use Case:** Audit logs that should never be modified or deleted

**Pattern Structure:**
- Superadmins can read
- Service role and users can insert
- No updates or deletes allowed

**Implementation:**

```sql
-- Superadmins can read
CREATE POLICY "Superadmins can read audit logs"
  ON security_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- Service role can insert
CREATE POLICY "Service role can insert audit logs"
  ON security_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Users can insert their own audit logs
CREATE POLICY "Users can insert audit logs"
  ON security_audit_log FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
          AND profiles.salon_id = security_audit_log.salon_id
      )
    )
  );

-- No updates allowed
CREATE POLICY "No updates to audit logs"
  ON security_audit_log FOR UPDATE
  USING (false);

-- No deletes allowed
CREATE POLICY "No deletes to audit logs"
  ON security_audit_log FOR DELETE
  USING (false);
```

**Used in:**
- ✅ `security_audit_log`

---

## Best Practices

### 1. Always Enable RLS

```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### 2. Use Consistent Policy Names

Follow the pattern: `"[Action] [target] for [scope]"`

Examples:
- `"Users can view bookings for their salon"`
- `"Superadmins can view all bookings"`
- `"Users can update their own profile"`

### 3. Use Idempotent Migrations

Always drop policies before creating them:

```sql
DROP POLICY IF EXISTS "Policy name" ON [table];
CREATE POLICY "Policy name" ...
```

### 4. Test RLS Policies

- Write integration tests for RLS isolation
- Test cross-tenant access prevention
- Test superadmin access
- Test user access to own salon

### 5. Document Exceptions

If a table doesn't follow standard patterns, document why:
- Public read access (features, plan_features)
- Service role only (rate_limit_entries)
- Immutable logs (security_audit_log)

### 6. Use WITH CHECK for INSERT/UPDATE

- `USING` clause: Determines which rows can be accessed
- `WITH CHECK` clause: Determines which rows can be inserted/updated

```sql
-- SELECT/UPDATE/DELETE use USING
CREATE POLICY "Users can view [table]"
  ON [table] FOR SELECT
  USING (salon_id IN (...));

-- INSERT uses WITH CHECK
CREATE POLICY "Users can insert [table]"
  ON [table] FOR INSERT
  WITH CHECK (salon_id IN (...));

-- UPDATE uses both
CREATE POLICY "Users can update [table]"
  ON [table] FOR UPDATE
  USING (salon_id IN (...))  -- Can access existing rows
  WITH CHECK (salon_id IN (...));  -- Can update to these values
```

---

## Testing RLS Policies

### Unit Tests

Test that policies are correctly defined:

```typescript
// Test that users can only access their own salon's data
it("should prevent user1 from accessing salon2 bookings", async () => {
  const client = createUserClient(user1.accessToken);
  const { data } = await client
    .from("bookings")
    .select("*")
    .eq("id", salon2Data.bookingId);
  
  expect(data).toEqual([]);
});
```

### Integration Tests

Test RLS policies against a real Supabase instance:

```typescript
describe("RLS Isolation Tests", () => {
  it("should prevent cross-tenant data access", async () => {
    // Create two salons with separate users
    // Verify user1 cannot access salon2 data
  });
});
```

See `web/tests/integration/rls/rls-isolation.test.ts` for examples.

---

## Common Issues and Solutions

### Issue 1: Policies Not Applied

**Symptom:** Users can access data from other salons

**Solution:**
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = '[table]';`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = '[table]';`
3. Verify policy logic is correct

### Issue 2: Service Role Bypass

**Symptom:** Edge Functions can access all data

**Solution:** This is expected behavior. Service role bypasses RLS. Ensure Edge Functions validate access manually when needed.

### Issue 3: Superadmin Access Not Working

**Symptom:** Superadmins cannot view all data

**Solution:**
1. Verify `is_superadmin` flag is set: `SELECT * FROM profiles WHERE user_id = '[user_id]';`
2. Check superadmin policy exists
3. Verify policy logic uses `is_superadmin = TRUE`

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Policy Audit Report](../backend/rls-policy-audit.md)
- [RLS Test Utilities](../../tests/integration/rls/rls-test-utils.ts)
- [RLS Isolation Tests](../../tests/integration/rls/rls-isolation.test.ts)

---

## Migration Files

- `20250104000000_add_missing_rls_policies.sql` - Adds RLS policies for bookings, customers, employees, services, shifts, salons
- `add-products-table.sql` - Products RLS policies
- `add-superadmin.sql` - Profiles superadmin policy
- `opening-hours-schema.sql` - Opening hours RLS policies
- `add-addons-and-plan-limits.sql` - Addons RLS policies
- `operations-module-enhancements.sql` - Employee services RLS policies

