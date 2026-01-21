# Row Level Security (RLS) Patterns

Task Group 25: RLS Policy Tests

## Overview

TeqBook uses PostgreSQL Row Level Security (RLS) to enforce data isolation between tenants (salons). This document describes the RLS patterns used throughout the application.

## Core Principles

1. **Tenant Isolation**: Users can only access data belonging to their salon
2. **Self-Access**: Users can only access their own profile/notifications
3. **Superadmin Override**: Superadmins can view all data for support purposes
4. **Principle of Least Privilege**: Policies grant minimum necessary access

## RLS Patterns

### 1. Tenant Isolation Pattern

Used for: `bookings`, `customers`, `employees`, `services`, `shifts`, `products`

```sql
-- SELECT Policy
CREATE POLICY "Users can view [table] for their salon"
  ON [table] FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- INSERT Policy
CREATE POLICY "Users can insert [table] for their salon"
  ON [table] FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- UPDATE Policy
CREATE POLICY "Users can update [table] for their salon"
  ON [table] FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- DELETE Policy
CREATE POLICY "Users can delete [table] for their salon"
  ON [table] FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

**How it works:**
- Checks if the row's `salon_id` matches the user's salon
- User's salon is determined from the `profiles` table
- Works for all CRUD operations

### 2. Self-Access Pattern

Used for: `profiles`, `notifications`

```sql
-- SELECT Policy
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- UPDATE Policy
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- INSERT Policy
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**How it works:**
- Checks if the row's `user_id` matches the authenticated user
- Simpler check, but only for user-specific data

### 3. Superadmin Override Pattern

Used for: All tables (SELECT only)

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

**How it works:**
- Checks if user has `is_superadmin = TRUE` in their profile
- Grants read-only access to all data
- Used for support and debugging purposes

### 4. Owner-Only Pattern

Used for: `billing`, `settings` (sensitive data)

```sql
CREATE POLICY "Only owners can view billing data"
  ON billing_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
        AND salon_id = billing_data.salon_id 
        AND role = 'owner'
    )
  );
```

**How it works:**
- Checks both salon membership AND owner role
- Restricts sensitive operations to salon owners only

## Tables and Their Policies

| Table | Pattern | SELECT | INSERT | UPDATE | DELETE |
|-------|---------|--------|--------|--------|--------|
| bookings | Tenant | ✅ | ✅ | ✅ | ✅ |
| customers | Tenant | ✅ | ✅ | ✅ | ✅ |
| employees | Tenant | ✅ | ✅ | ✅ | ✅ |
| services | Tenant | ✅ | ✅ | ✅ | ✅ |
| shifts | Tenant | ✅ | ✅ | ✅ | ✅ |
| products | Tenant | ✅ | ✅ | ✅ | ✅ |
| salons | Self | ✅ | RPC | ✅ | ❌ |
| profiles | Self | ✅ | ✅ | ✅ | ❌ |
| notifications | Self | ✅ | ✅ | ✅ | ❌ |
| audit_log | Superadmin | ✅ | ❌ | ❌ | ❌ |

## Policy Naming Convention

Policies follow a consistent naming convention:

```
[Subject] can [action] [object] [scope]
```

Examples:
- "Users can view bookings for their salon"
- "Users can update their own profile"
- "Superadmins can view all customers"
- "Only owners can manage billing"

## Testing RLS Policies

Tests are located in `tests/rls/`:

```bash
# Run RLS policy tests
npm run test tests/rls
```

### Test Categories

1. **Policy Definition Tests** - Verify policies are correctly defined
2. **Tenant Isolation Tests** - Verify cross-tenant access is blocked
3. **Superadmin Tests** - Verify superadmin override works
4. **Self-Access Tests** - Verify users can only access own data

### Test Utilities

```typescript
import {
  TENANT_ISOLATED_TABLES,
  SELF_ACCESS_TABLES,
  shouldHaveTenantIsolation,
  getExpectedPolicies,
  mockUserContext,
} from "./rls-test-utils";
```

## Common Issues

### 1. Policy Not Applied

**Symptom**: User can see data from other salons

**Check**:
1. RLS is enabled: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
2. User is authenticated: `auth.uid()` returns a value
3. Profile has correct `salon_id`

### 2. Superadmin Can't Access Data

**Symptom**: Superadmin sees empty results

**Check**:
1. `is_superadmin = TRUE` in profiles table
2. Superadmin policy exists for the table
3. Policy uses `EXISTS (SELECT 1 ...)` pattern

### 3. INSERT Fails with RLS

**Symptom**: User can't create records for their salon

**Check**:
1. INSERT policy uses `WITH CHECK` not `USING`
2. `salon_id` is correctly set in the INSERT statement
3. User has a profile with matching `salon_id`

## Performance Considerations

### 1. Index the Lookup Column

```sql
-- Add index for RLS lookup performance
CREATE INDEX idx_profiles_user_salon 
  ON profiles(user_id, salon_id);
```

### 2. Avoid Complex Subqueries

Instead of multiple nested queries:

```sql
-- Less efficient
USING (
  salon_id IN (
    SELECT salon_id FROM profiles 
    WHERE user_id IN (
      SELECT id FROM auth.users WHERE ...
    )
  )
)

-- More efficient
USING (
  salon_id IN (
    SELECT salon_id FROM profiles WHERE user_id = auth.uid()
  )
)
```

### 3. Use EXISTS for Boolean Checks

```sql
-- Efficient for boolean checks
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_superadmin = TRUE
  )
)
```

## Adding RLS to New Tables

When creating a new tenant-isolated table:

```sql
-- 1. Create table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  -- other columns
);

-- 2. Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. Add tenant isolation policies
CREATE POLICY "Users can view new_table for their salon"
  ON new_table FOR SELECT
  USING (
    salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert new_table for their salon"
  ON new_table FOR INSERT
  WITH CHECK (
    salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid())
  );

-- ... UPDATE and DELETE policies

-- 4. Add superadmin override
CREATE POLICY "Superadmins can view all new_table"
  ON new_table FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = TRUE)
  );
```

## Security Checklist

- [ ] RLS enabled on all user-facing tables
- [ ] Tenant isolation for all salon-scoped data
- [ ] Self-access for user-specific data
- [ ] Superadmin override for support access
- [ ] No `SECURITY DEFINER` functions bypassing RLS
- [ ] Service role key not exposed to client
- [ ] Tests verify cross-tenant isolation
