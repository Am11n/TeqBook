# Domain Errors

This directory contains domain-specific error types for TeqBook.

## Overview

Domain errors provide:
- **Type-safe error handling** - Know exactly what errors can occur
- **Better error messages** - Domain-specific error codes and messages
- **Error mapping** - Convert repository errors to domain errors
- **Consistent error handling** - Same error structure across all domains

## Usage

### Throwing Domain Errors

In your service, throw domain errors for business rule violations:

```typescript
import { BookingError } from "@/lib/errors/domain-errors";

// Validate booking time
if (startTime < new Date()) {
  throw new BookingError(
    "Booking start time must be in the future",
    "INVALID_TIME_SLOT"
  );
}

// Check for conflicts
if (hasConflict) {
  throw new BookingError(
    "Booking conflicts with existing booking",
    "BOOKING_CONFLICT"
  );
}
```

### Mapping Repository Errors

Map repository errors to domain errors:

```typescript
import { mapRepositoryErrorToDomainError } from "@/lib/errors/domain-errors";

const { data, error } = await createBookingRepo(input);

if (error) {
  const domainError = mapRepositoryErrorToDomainError(error, "booking");
  if (domainError) {
    throw domainError;
  }
  // Fallback to generic error
  throw new Error(error);
}
```

### Catching Domain Errors

Handle domain errors in UI:

```typescript
import { BookingError, CustomerError } from "@/lib/errors/domain-errors";

try {
  await createBooking(input);
} catch (error) {
  if (error instanceof BookingError) {
    switch (error.code) {
      case "BOOKING_CONFLICT":
        showError("This time slot is already booked");
        break;
      case "INVALID_TIME_SLOT":
        showError("Please select a future time");
        break;
      default:
        showError(error.message);
    }
  } else if (error instanceof CustomerError) {
    // Handle customer errors
  } else {
    // Handle generic errors
    showError("An unexpected error occurred");
  }
}
```

## Available Error Types

### BookingError
- `BOOKING_NOT_FOUND`
- `BOOKING_CONFLICT`
- `INVALID_TIME_SLOT`
- `EMPLOYEE_UNAVAILABLE`
- `SERVICE_NOT_FOUND`
- `CUSTOMER_REQUIRED`
- `INVALID_BOOKING_STATUS`

### CustomerError
- `CUSTOMER_NOT_FOUND`
- `INVALID_EMAIL`
- `INVALID_PHONE`
- `GDPR_CONSENT_REQUIRED`
- `DUPLICATE_CUSTOMER`

### EmployeeError
- `EMPLOYEE_NOT_FOUND`
- `INVALID_EMAIL`
- `INVALID_ROLE`
- `EMPLOYEE_INACTIVE`
- `DUPLICATE_EMPLOYEE`

### ServiceError
- `SERVICE_NOT_FOUND`
- `INVALID_DURATION`
- `INVALID_PRICE`
- `SERVICE_INACTIVE`
- `DUPLICATE_SERVICE`

### SalonError
- `SALON_NOT_FOUND`
- `INVALID_SLUG`
- `SLUG_ALREADY_EXISTS`
- `SALON_NOT_PUBLIC`

## Best Practices

1. **Use specific error codes** - Makes error handling easier
2. **Provide helpful messages** - Users should understand what went wrong
3. **Map repository errors** - Convert low-level errors to domain errors
4. **Handle errors at the right level** - Services throw, UI handles
5. **Log errors** - Always log errors for debugging

## Future Enhancements

- Error localization (translate error messages)
- Error analytics (track error frequency)
- Error recovery (automatic retry for transient errors)
- Error notifications (alert on critical errors)

---

## References

- `src/lib/errors/domain-errors.ts` - Error definitions
- `docs/decisions/` - Architecture decisions

