# Domain Principles

This document defines the core domain models, state machines, and business rules for TeqBook. These principles guide all business logic implementation and ensure consistency across the application.

## Table of Contents

- [Booking State Machine](#booking-state-machine)
- [Employee Domain Model](#employee-domain-model)
- [Customer Domain Model](#customer-domain-model)
- [Salon/Organization Domain Model](#salonorganization-domain-model)
- [Service Domain Model](#service-domain-model)
- [Business Rules](#business-rules)

---

## Booking State Machine

### Definition

A **Booking** represents a scheduled appointment between a customer and an employee for a specific service at a salon.

### States

```typescript
type BookingStatus = 
  | "pending"      // Initial state - booking created but not confirmed
  | "scheduled"     // Booking is scheduled and confirmed
  | "confirmed"    // Booking is confirmed (synonym for scheduled)
  | "completed"     // Service has been completed
  | "cancelled"     // Booking was cancelled
  | "no-show"       // Customer did not show up
```

### State Transitions

```
┌─────────┐
│ pending │ ────┐
└─────────┘     │
                │
                ▼
         ┌──────────────┐
         │  scheduled   │ ◄───┐ (manual confirmation)
         │  confirmed   │     │
         └──────────────┘     │
                │             │
                │             │
        ┌───────┴───────┐      │
        │              │      │
        ▼              ▼      │
  ┌──────────┐   ┌──────────┐ │
  │completed │   │cancelled │ │
  └──────────┘   └──────────┘ │
        │              │       │
        │              │       │
        └──────┬───────┘       │
               │               │
               ▼               │
         ┌──────────┐          │
         │ no-show  │ ◄────────┘ (can be set from scheduled/confirmed)
         └──────────┘
```

### Valid Transitions

| From State | To State | Conditions | Notes |
|------------|----------|------------|-------|
| `pending` | `scheduled` | Always allowed | Initial confirmation |
| `pending` | `confirmed` | Always allowed | Synonym for scheduled |
| `pending` | `cancelled` | Always allowed | Can cancel before confirmation |
| `scheduled` | `completed` | Service time has passed or is current | Mark as completed after service |
| `scheduled` | `cancelled` | Always allowed | Can cancel confirmed bookings |
| `scheduled` | `no-show` | Service time has passed | Customer didn't show up |
| `confirmed` | `completed` | Service time has passed or is current | Mark as completed after service |
| `confirmed` | `cancelled` | Always allowed | Can cancel confirmed bookings |
| `confirmed` | `no-show` | Service time has passed | Customer didn't show up |
| `completed` | ❌ | No transitions allowed | Terminal state |
| `cancelled` | ❌ | No transitions allowed | Terminal state |
| `no-show` | ❌ | No transitions allowed | Terminal state |

### Business Rules

1. **Creation Rules:**
   - A booking must have: `salon_id`, `employee_id`, `service_id`, `start_time`, `end_time`, `customer_full_name`
   - For non-walk-in bookings: `start_time` must be in the future
   - Walk-in bookings (`is_walk_in: true`) can have `start_time` in the past or present
   - Booking duration is determined by the service's `duration_minutes`
   - Bookings cannot overlap with existing bookings for the same employee
   - Bookings must be within employee's available shifts
   - Bookings must be within salon's opening hours

2. **Status Change Rules:**
   - Only staff with appropriate permissions can change booking status
   - `completed` can only be set if `start_time` has passed
   - `no-show` can only be set if `start_time` has passed and booking is not `completed` or `cancelled`
   - Once `completed`, `cancelled`, or `no-show`, status cannot be changed

3. **Cancellation Rules:**
   - Any booking can be cancelled before or after its scheduled time
   - Cancelled bookings should retain all data for historical purposes
   - Cancellation reason can be stored in `notes` field

4. **Walk-in Bookings:**
   - Walk-in bookings (`is_walk_in: true`) can be created with `start_time` in the past or present
   - Walk-in bookings typically start in `pending` or `scheduled` state
   - Walk-in bookings can be immediately marked as `completed` if service is already done

---

## Employee Domain Model

### Definition

An **Employee** represents a staff member working at a salon.

### Attributes

- `id`: Unique identifier (UUID)
- `salon_id`: Foreign key to salon (required)
- `full_name`: Employee's full name (required)
- `email`: Contact email (optional)
- `phone`: Contact phone (optional)
- `role`: Employee role (`owner`, `manager`, `staff`)
- `preferred_language`: Language preference (optional)
- `is_active`: Whether employee is currently active (boolean)

### States

An employee has a simple binary state:

- **Active** (`is_active: true`): Employee can receive bookings, appears in schedules
- **Inactive** (`is_active: false`): Employee is hidden from booking flows, cannot receive new bookings

### State Transitions

```
┌──────────┐
│ Inactive │ ◄───┐
└──────────┘     │
     │           │ (deactivate)
     │           │
     │ (activate)│
     ▼           │
┌──────────┐     │
│  Active  │ ────┘
└──────────┘
```

### Business Rules

1. **Creation Rules:**
   - `salon_id` is required
   - `full_name` is required
   - At least one of `email` or `phone` should be provided (recommended)
   - `role` defaults to `staff` if not specified
   - New employees are created as `is_active: true` by default

2. **Activation/Deactivation:**
   - Only salon owners/managers can activate/deactivate employees
   - Deactivating an employee does not affect existing bookings
   - Deactivated employees cannot receive new bookings
   - Deactivated employees do not appear in employee selection lists

3. **Role Hierarchy:**
   - `owner`: Full access, can manage all aspects of salon
   - `manager`: Can manage employees, bookings, customers (except billing)
   - `staff`: Can view and manage their own bookings, view customers

4. **Service Assignment:**
   - Employees can be assigned to multiple services (many-to-many)
   - An employee must be assigned to at least one service to receive bookings for that service
   - Removing an employee from all services effectively prevents new bookings

---

## Customer Domain Model

### Definition

A **Customer** represents a person who books services at a salon.

### Attributes

- `id`: Unique identifier (UUID)
- `salon_id`: Foreign key to salon (required)
- `full_name`: Customer's full name (required)
- `email`: Contact email (optional, but recommended)
- `phone`: Contact phone (optional, but recommended)
- `notes`: Internal notes about customer (optional)
- `gdpr_consent`: Whether customer has consented to data processing (boolean, required)

### States

Customers do not have explicit states, but they have an implicit lifecycle:

- **Active**: Customer has bookings or is recently active
- **Inactive**: Customer has no recent bookings (can be archived)

### Business Rules

1. **Creation Rules:**
   - `salon_id` is required
   - `full_name` is required
   - At least one of `email` or `phone` should be provided (recommended for contact)
   - `gdpr_consent` is required (must be `true` to store customer data)
   - Email and phone should be unique per salon (enforced at application level, not database)

2. **Uniqueness:**
   - Within a salon, email should be unique (if provided)
   - Within a salon, phone should be unique (if provided)
   - Same customer can exist in multiple salons (different `salon_id`)

3. **Data Privacy (GDPR):**
   - `gdpr_consent` must be `true` to create customer record
   - Customers can request data deletion (anonymization)
   - Customer data should be retained according to legal requirements
   - See [Data Lifecycle Documentation](../compliance/data-lifecycle.md) for details

4. **Customer History:**
   - All bookings are linked to customer
   - Customer history includes: bookings, services used, employees, dates, amounts
   - Customer notes can be updated by staff with appropriate permissions

---

## Salon/Organization Domain Model

### Definition

A **Salon** represents a business entity (hair salon, barbershop, etc.) that uses TeqBook.

### Attributes

- `id`: Unique identifier (UUID)
- `name`: Salon name (required)
- `slug`: URL-friendly identifier for public booking page (optional, unique)
- `is_public`: Whether salon accepts public bookings (boolean)
- `preferred_language`: Default language for salon (optional)
- `salon_type`: Type of salon (e.g., "barbershop", "hair_salon", "nail_salon")
- `whatsapp_number`: WhatsApp contact number (optional)
- `supported_languages`: Array of supported languages for booking page
- `default_language`: Default language for booking page
- `plan`: Subscription plan (`starter`, `pro`, `business`)
- `billing_customer_id`: Stripe customer ID (optional)
- `billing_subscription_id`: Stripe subscription ID (optional)

### States

A salon has implicit states based on subscription:

- **Active**: Has active subscription, can use all features according to plan
- **Trial**: In trial period (if applicable)
- **Cancelled**: Subscription cancelled, access may be limited
- **Suspended**: Payment failed, access suspended

### Business Rules

1. **Creation Rules:**
   - `name` is required
   - `slug` must be unique across all salons (if provided)
   - `slug` is required if `is_public: true`
   - `plan` defaults to `starter` if not specified
   - Salon is created with default opening hours (all closed)

2. **Public Booking:**
   - Salon must have `is_public: true` and valid `slug` to accept public bookings
   - Public booking page is accessible at `/book/{slug}`
   - Public bookings require customer information (name, email/phone)

3. **Plan Features:**
   - Features are determined by `plan` type
   - See [Feature Management Documentation](../unmarked-checklist/SaaS-plans.md) for plan details
   - Feature limits are enforced at application level

4. **Multi-tenancy:**
   - All salon data is isolated by `salon_id`
   - Row Level Security (RLS) enforces data isolation
   - See [RLS Strategy Documentation](../backend/rls-strategy.md) for details

---

## Service Domain Model

### Definition

A **Service** represents a service offered by a salon (e.g., "Haircut", "Beard Trim", "Hair Color").

### Attributes

- `id`: Unique identifier (UUID)
- `salon_id`: Foreign key to salon (required)
- `name`: Service name (required)
- `category`: Service category (optional: "cut", "beard", "color", "nails", "massage", "other")
- `duration_minutes`: Duration of service in minutes (required)
- `price_cents`: Price in cents (required)
- `sort_order`: Display order (optional, defaults to creation order)
- `is_active`: Whether service is currently offered (boolean)

### States

A service has a simple binary state:

- **Active** (`is_active: true`): Service appears in booking flows, can be selected
- **Inactive** (`is_active: false`): Service is hidden from booking flows, cannot be selected

### Business Rules

1. **Creation Rules:**
   - `salon_id` is required
   - `name` is required
   - `duration_minutes` must be > 0
   - `price_cents` must be >= 0 (can be free)
   - New services are created as `is_active: true` by default

2. **Activation/Deactivation:**
   - Only staff with appropriate permissions can activate/deactivate services
   - Deactivating a service does not affect existing bookings
   - Deactivated services do not appear in service selection lists
   - Deactivated services cannot be selected for new bookings

3. **Service Assignment:**
   - Services can be assigned to multiple employees (many-to-many)
   - An employee must be assigned to a service to receive bookings for that service
   - Removing a service from all employees effectively prevents bookings for that service

4. **Pricing:**
   - Price is stored in cents to avoid floating-point precision issues
   - Price can be 0 (free service)
   - Price can be updated at any time (does not affect existing bookings)

---

## Business Rules

### Cross-Domain Rules

1. **Booking Validation:**
   - Booking time must be within employee's available shifts
   - Booking time must be within salon's opening hours
   - Booking cannot overlap with existing bookings for the same employee
   - Booking duration must match service's `duration_minutes`

2. **Data Integrity:**
   - All foreign keys must reference valid records
   - Cascade deletes: Deleting a salon deletes all related data (employees, bookings, customers, etc.)
   - Soft deletes: Consider soft-deleting customers and bookings for historical purposes

3. **Permissions:**
   - Role-based access control (RBAC) determines what actions users can perform
   - See [Access Control Documentation](../backend/access-control.md) for details
   - Superadmins have full access across all salons

4. **Multi-tenancy:**
   - All queries must filter by `salon_id`
   - RLS policies enforce salon-level data isolation
   - Users can only access data for salons they belong to

5. **Notifications:**
   - Notifications can be sent via SMS, Email, or WhatsApp
   - Notification preferences are stored at salon level
   - Notifications are triggered by booking state changes

---

## Implementation Notes

### State Machine Implementation

State transitions should be validated in the service layer:

```typescript
// Example: validateBookingStatusTransition
function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    pending: ["scheduled", "confirmed", "cancelled"],
    scheduled: ["completed", "cancelled", "no-show"],
    confirmed: ["completed", "cancelled", "no-show"],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
    "no-show": [], // Terminal state
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
```

### Business Rule Enforcement

Business rules should be enforced at multiple layers:

1. **Database Layer:** Constraints, triggers, RLS policies
2. **Repository Layer:** Data validation, query filtering
3. **Service Layer:** Business logic, state transitions, complex validations
4. **UI Layer:** User feedback, input validation

---

## References

- [Service Standards](../architecture/service-standards.md)
- [RLS Strategy](../backend/rls-strategy.md)
- [Access Control](../backend/access-control.md)
- [Data Lifecycle](../compliance/data-lifecycle.md)

