// =====================================================
// Domain Error Types
// =====================================================
// Custom error types for each domain to provide better error handling
// and error mapping between layers

/**
 * Base domain error class
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly domain: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Booking domain errors
 */
export class BookingError extends DomainError {
  constructor(message: string, code: BookingErrorCode) {
    super(message, code, "booking");
    this.name = "BookingError";
  }
}

export type BookingErrorCode =
  | "BOOKING_NOT_FOUND"
  | "BOOKING_CONFLICT"
  | "INVALID_TIME_SLOT"
  | "EMPLOYEE_UNAVAILABLE"
  | "SERVICE_NOT_FOUND"
  | "CUSTOMER_REQUIRED"
  | "INVALID_BOOKING_STATUS";

/**
 * Customer domain errors
 */
export class CustomerError extends DomainError {
  constructor(message: string, code: CustomerErrorCode) {
    super(message, code, "customer");
    this.name = "CustomerError";
  }
}

export type CustomerErrorCode =
  | "CUSTOMER_NOT_FOUND"
  | "INVALID_EMAIL"
  | "INVALID_PHONE"
  | "GDPR_CONSENT_REQUIRED"
  | "DUPLICATE_CUSTOMER";

/**
 * Employee domain errors
 */
export class EmployeeError extends DomainError {
  constructor(message: string, code: EmployeeErrorCode) {
    super(message, code, "employee");
    this.name = "EmployeeError";
  }
}

export type EmployeeErrorCode =
  | "EMPLOYEE_NOT_FOUND"
  | "INVALID_EMAIL"
  | "INVALID_ROLE"
  | "EMPLOYEE_INACTIVE"
  | "DUPLICATE_EMPLOYEE";

/**
 * Service domain errors
 */
export class ServiceError extends DomainError {
  constructor(message: string, code: ServiceErrorCode) {
    super(message, code, "service");
    this.name = "ServiceError";
  }
}

export type ServiceErrorCode =
  | "SERVICE_NOT_FOUND"
  | "INVALID_DURATION"
  | "INVALID_PRICE"
  | "SERVICE_INACTIVE"
  | "DUPLICATE_SERVICE";

/**
 * Salon domain errors
 */
export class SalonError extends DomainError {
  constructor(message: string, code: SalonErrorCode) {
    super(message, code, "salon");
    this.name = "SalonError";
  }
}

export type SalonErrorCode =
  | "SALON_NOT_FOUND"
  | "INVALID_SLUG"
  | "SLUG_ALREADY_EXISTS"
  | "SALON_NOT_PUBLIC";

/**
 * Error mapping utilities
 */
export function mapRepositoryErrorToDomainError(
  error: string | null,
  domain: "booking" | "customer" | "employee" | "service" | "salon"
): DomainError | null {
  if (!error) return null;

  // Map common database errors to domain errors
  const lowerError = error.toLowerCase();

  switch (domain) {
    case "booking":
      if (lowerError.includes("not found")) {
        return new BookingError(error, "BOOKING_NOT_FOUND");
      }
      if (lowerError.includes("conflict") || lowerError.includes("overlap")) {
        return new BookingError(error, "BOOKING_CONFLICT");
      }
      break;

    case "customer":
      if (lowerError.includes("not found")) {
        return new CustomerError(error, "CUSTOMER_NOT_FOUND");
      }
      if (lowerError.includes("email")) {
        return new CustomerError(error, "INVALID_EMAIL");
      }
      break;

    case "employee":
      if (lowerError.includes("not found")) {
        return new EmployeeError(error, "EMPLOYEE_NOT_FOUND");
      }
      if (lowerError.includes("email")) {
        return new EmployeeError(error, "INVALID_EMAIL");
      }
      break;

    case "service":
      if (lowerError.includes("not found")) {
        return new ServiceError(error, "SERVICE_NOT_FOUND");
      }
      break;

    case "salon":
      if (lowerError.includes("not found")) {
        return new SalonError(error, "SALON_NOT_FOUND");
      }
      if (lowerError.includes("slug")) {
        return new SalonError(error, "INVALID_SLUG");
      }
      break;
  }

  // Return generic domain error if no specific mapping found
  return new DomainError(error, "UNKNOWN_ERROR", domain);
}

