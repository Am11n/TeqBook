# Data Integrity and Triggers

This document describes database triggers, constraints, and data integrity measures in TeqBook.

---

## Overview

TeqBook uses PostgreSQL triggers and foreign key constraints to ensure data integrity at the database level. This provides an additional layer of protection beyond application-level validation.

---

## Foreign Key Constraints (ON DELETE CASCADE)

### Cascade Deletion Rules

When a salon is deleted, all related data is automatically deleted via `ON DELETE CASCADE`:

| Parent Table | Child Tables | Action |
|--------------|--------------|--------|
| `salons` | `employees` | CASCADE - All employees deleted |
| `salons` | `bookings` | CASCADE - All bookings deleted |
| `salons` | `services` | CASCADE - All services deleted |
| `salons` | `customers` | CASCADE - All customers deleted |
| `salons` | `shifts` | CASCADE - All shifts deleted |
| `salons` | `opening_hours` | CASCADE - All opening hours deleted |
| `salons` | `products` | CASCADE - All products deleted |
| `salons` | `addons` | CASCADE - All addons deleted |

### Implementation

Foreign key constraints are defined in the schema with `ON DELETE CASCADE`:

```sql
ALTER TABLE employees 
ADD CONSTRAINT employees_salon_id_fkey 
FOREIGN KEY (salon_id) 
REFERENCES salons(id) 
ON DELETE CASCADE;
```

This ensures that:
- Deleting a salon automatically removes all related data
- No orphaned records remain in the database
- Data integrity is maintained at the database level

---

## Triggers

### 1. Prevent Orphaned Salons

**Purpose**: Ensure that every salon always has at least one owner (profile with `salon_id`).

**Trigger**: `ensure_salon_has_owner`
- **Event**: `AFTER INSERT ON salons`
- **Function**: `check_salon_has_owner()`
- **Action**: Raises exception if salon is created without an owner profile

**Trigger**: `prevent_delete_last_salon_owner`
- **Event**: `BEFORE DELETE ON profiles`
- **Function**: `prevent_delete_last_owner()`
- **Action**: Prevents deletion of the last owner of a salon

**Trigger**: `prevent_nullify_last_salon_owner`
- **Event**: `BEFORE UPDATE ON profiles`
- **Function**: `prevent_nullify_last_owner()`
- **Action**: Prevents setting `salon_id` to NULL if it's the only owner

**Location**: `web/supabase/prevent-orphaned-salons.sql`

### 2. Employee Deletion Handling

**Current Behavior**: When an employee is deleted, related bookings are NOT automatically deleted.

**Options for handling employee deletion**:
1. **Flag as inactive** (recommended): Set `employees.is_active = false` instead of deleting
2. **Transfer bookings**: Move bookings to another employee before deletion
3. **Block deletion**: Prevent deletion if employee has active bookings

**Implementation**: Currently handled at application level in `employees-service.ts`

**Future Enhancement**: Consider adding a trigger to:
- Prevent deletion if employee has future bookings
- Or automatically transfer bookings to salon owner

### 3. Booking State Transitions

**Current Behavior**: Booking state transitions are validated at application level.

**Future Enhancement**: Consider adding a trigger to:
- Validate state transitions (e.g., cannot cancel a completed booking)
- Log state changes for audit trail

---

## Data Integrity Best Practices

### 1. Always Use Transactions

When performing operations that affect multiple tables, use transactions:

```typescript
// Example: Creating a booking with customer
const { data, error } = await supabase.rpc('create_booking_with_customer', {
  // ... parameters
});
```

### 2. Validate at Multiple Levels

- **Database Level**: Constraints, triggers, foreign keys
- **Application Level**: Service validation, business rules
- **UI Level**: Form validation, user feedback

### 3. Handle Cascade Deletions Carefully

When deleting a salon:
- Warn users about data loss
- Consider soft-delete (mark as deleted) instead of hard-delete
- Provide data export before deletion

### 4. Monitor Orphaned Data

Periodically check for:
- Bookings without employees (if employee was deleted)
- Profiles without salons
- Services without salons

---

## Audit Trail

### Current Implementation

- `created_at` and `updated_at` timestamps on most tables
- No explicit audit trail for deletions or state changes

### Future Enhancements

Consider adding:
- `deleted_at` timestamp for soft-deletes
- Audit log table for tracking changes
- Trigger-based change logging

---

## Related Documentation

- `docs/backend/rls-strategy.md` - Row Level Security policies
- `docs/compliance/data-lifecycle.md` - Data retention and GDPR
- `web/supabase/prevent-orphaned-salons.sql` - Trigger implementation

---

## Verification Queries

### Check Foreign Key Constraints

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

### Check Triggers

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Check for Orphaned Records

```sql
-- Bookings without employees (if employee was deleted)
SELECT b.id, b.salon_id, b.employee_id
FROM bookings b
LEFT JOIN employees e ON b.employee_id = e.id
WHERE b.employee_id IS NOT NULL AND e.id IS NULL;

-- Profiles without salons
SELECT p.user_id, p.salon_id
FROM profiles p
LEFT JOIN salons s ON p.salon_id = s.id
WHERE p.salon_id IS NOT NULL AND s.id IS NULL;
```

