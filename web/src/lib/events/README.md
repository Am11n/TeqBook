# Domain Events

This directory contains domain event definitions and the event bus for TeqBook.

## Overview

Domain events represent something important that happened in the domain. They enable:
- **Cross-aggregate communication**: Services can react to events from other domains
- **Side effects**: Trigger notifications, analytics, etc.
- **Decoupling**: Services don't need to know about each other directly

## Usage

### Publishing Events

In your service, publish events after important domain operations:

```typescript
import { domainEventBus } from "@/lib/events/domain-events";
import type { BookingCreatedEvent } from "@/lib/events/domain-events";

// After creating a booking
const booking = await createBooking(...);

// Publish event
await domainEventBus.publish({
  type: "booking.created",
  occurredAt: new Date(),
  aggregateId: booking.id,
  bookingId: booking.id,
  salonId: booking.salon_id,
  employeeId: booking.employee_id,
  serviceId: booking.service_id,
  customerId: booking.customer_id,
  startTime: booking.start_time,
  endTime: booking.end_time,
} as BookingCreatedEvent);
```

### Subscribing to Events

Subscribe to events to handle side effects:

```typescript
import { domainEventBus } from "@/lib/events/domain-events";
import type { BookingCreatedEvent } from "@/lib/events/domain-events";

// Subscribe to booking created events
const unsubscribe = domainEventBus.subscribe<BookingCreatedEvent>(
  "booking.created",
  async (event) => {
    // Send notification
    await sendNotification(event.salonId, "New booking created");
    
    // Update analytics
    await trackEvent("booking_created", event);
  }
);

// Later, unsubscribe if needed
unsubscribe();
```

## Available Events

### Booking Events
- `booking.created` - When a new booking is created
- `booking.cancelled` - When a booking is cancelled
- `booking.completed` - When a booking is completed

### Customer Events
- `customer.created` - When a new customer is created

### Employee Events
- `employee.created` - When a new employee is created
- `employee.deactivated` - When an employee is deactivated

### Service Events
- `service.created` - When a new service is created

## Best Practices

1. **Publish events after successful operations** - Only publish if the operation succeeded
2. **Keep events immutable** - Events represent something that already happened
3. **Include all relevant data** - Subscribers shouldn't need to fetch additional data
4. **Use type-safe events** - Always use the typed event interfaces
5. **Handle errors gracefully** - Event handlers should not throw errors that break the main flow

## Future Enhancements

- Event persistence (store events in database)
- Event replay (replay events for debugging/testing)
- Event sourcing (use events as source of truth)
- External event bus (RabbitMQ, Kafka, etc.)

---

## References

- `src/lib/events/domain-events.ts` - Event definitions and bus
- `docs/decisions/` - Architecture decisions

