# Role-Based Access Control (RBAC) Matrix

This document describes the permissions matrix for different user roles in TeqBook.

## Role Hierarchy

1. **Superadmin** - Full access to all salons and features
2. **Owner** - Full access to their salon(s)
3. **Manager** - Most permissions except billing and some settings
4. **Staff** - Limited permissions, primarily view and create operations

## Permission Matrix by Resource

### Bookings

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ❌ | ✅ |

**RLS Policy:** DELETE requires owner/manager role (enforced at database level)

### Customers

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ✅ | ❌ | ✅ |

**RLS Policy:** DELETE requires owner/manager role (enforced at database level)

### Employees

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

**Note:** Manager can update but not delete employees

### Services

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ✅ | ❌ | ✅ |

**RLS Policy:** UPDATE and DELETE require owner/manager role (enforced at database level)

### Products

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

**Note:** Manager can update but not delete products

### Shifts

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ✅ | ❌ | ✅ |

### Reports

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ❌ | ✅ |
| Create | ✅ | ❌ | ❌ | ✅ |
| Update | ✅ | ❌ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

### Settings

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ❌ | ✅ |
| Create | ✅ | ❌ | ❌ | ✅ |
| Update | ✅ | ❌ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

### Billing

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ❌ | ❌ | ✅ |
| Create | ✅ | ❌ | ❌ | ✅ |
| Update | ✅ | ❌ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

**Note:** Only owners can access billing information

### Notifications

| Action | Owner | Manager | Staff | Superadmin |
|--------|-------|---------|-------|------------|
| View | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ✅ |
| Update | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ✅ |

## Database-Level Enforcement

The following operations are enforced at the database level via RLS policies:

1. **Bookings DELETE** - Requires owner/manager role
2. **Customers DELETE** - Requires owner/manager role
3. **Services UPDATE** - Requires owner/manager role
4. **Services DELETE** - Requires owner/manager role

These policies use the `user_has_role()` SQL function to check user roles.

## Implementation Details

### Role Checking Function

```sql
CREATE OR REPLACE FUNCTION user_has_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Example RLS Policy with Role Check

```sql
CREATE POLICY "Users can delete bookings for their salon"
  ON bookings FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
    AND (
      user_has_role('owner')
      OR user_has_role('manager')
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND is_superadmin = TRUE
      )
    )
  );
```

## UI-Level vs Database-Level Restrictions

### UI-Level Restrictions
- Most permissions are enforced in the UI (buttons hidden/disabled)
- Staff users don't see delete buttons for bookings/customers
- Staff users don't see edit buttons for services

### Database-Level Restrictions
- Critical operations (DELETE bookings/customers, UPDATE/DELETE services) are enforced at database level
- Prevents bypassing UI restrictions via direct Supabase client access
- Provides defense-in-depth security

## Superadmin Access

Superadmins bypass all role checks and have full access to:
- All salons (regardless of ownership)
- All operations (regardless of role restrictions)
- System-wide settings and features

Superadmin status is checked via `profiles.is_superadmin` field.

## Multi-Salon Context

For multi-salon owners:
- Role checks are per-salon (via `salon_ownerships` table)
- A user can be owner of Salon A but manager of Salon B
- Permissions are evaluated per salon context

## Migration History

- **Task Group 42** (2026-01-23): Added role checks to critical DELETE and UPDATE policies
- Uses `user_has_role()` helper function for consistent role checking
- Applied to: bookings DELETE, customers DELETE, services UPDATE/DELETE
