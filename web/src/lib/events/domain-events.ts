// =====================================================
// Domain Events
// =====================================================
// Domain events represent something important that happened in the domain
// They can be used for cross-aggregate communication and side effects

/**
 * Base domain event interface
 */
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

/**
 * Booking domain events
 */
export interface BookingCreatedEvent extends DomainEvent {
  readonly type: "booking.created";
  readonly bookingId: string;
  readonly salonId: string;
  readonly employeeId: string;
  readonly serviceId: string;
  readonly customerId: string | null;
  readonly startTime: string;
  readonly endTime: string;
}

export interface BookingCancelledEvent extends DomainEvent {
  readonly type: "booking.cancelled";
  readonly bookingId: string;
  readonly salonId: string;
  readonly reason?: string;
}

export interface BookingCompletedEvent extends DomainEvent {
  readonly type: "booking.completed";
  readonly bookingId: string;
  readonly salonId: string;
}

/**
 * Customer domain events
 */
export interface CustomerCreatedEvent extends DomainEvent {
  readonly type: "customer.created";
  readonly customerId: string;
  readonly salonId: string;
  readonly fullName: string;
  readonly email: string | null;
}

/**
 * Employee domain events
 */
export interface EmployeeCreatedEvent extends DomainEvent {
  readonly type: "employee.created";
  readonly employeeId: string;
  readonly salonId: string;
  readonly fullName: string;
  readonly role: string | null;
}

export interface EmployeeDeactivatedEvent extends DomainEvent {
  readonly type: "employee.deactivated";
  readonly employeeId: string;
  readonly salonId: string;
}

/**
 * Service domain events
 */
export interface ServiceCreatedEvent extends DomainEvent {
  readonly type: "service.created";
  readonly serviceId: string;
  readonly salonId: string;
  readonly name: string;
  readonly priceCents: number;
}

/**
 * Type union for all domain events
 */
export type AllDomainEvents =
  | BookingCreatedEvent
  | BookingCancelledEvent
  | BookingCompletedEvent
  | CustomerCreatedEvent
  | EmployeeCreatedEvent
  | EmployeeDeactivatedEvent
  | ServiceCreatedEvent;

/**
 * Domain event handler interface
 */
export type DomainEventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

/**
 * Simple event bus for domain events
 * In a production system, you might use a more sophisticated event bus
 */
class DomainEventBus {
  private handlers: Map<string, DomainEventHandler<DomainEvent>[]> = new Map();

  /**
   * Subscribe to a domain event type
   */
  subscribe<T extends DomainEvent>(
    eventType: T["type"],
    handler: DomainEventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.push(handler as DomainEventHandler<DomainEvent>);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler as DomainEventHandler<DomainEvent>);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Publish a domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}

// Singleton instance
export const domainEventBus = new DomainEventBus();

