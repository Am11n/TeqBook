// =====================================================
// Domain Interfaces (with I-prefix)
// =====================================================
// Interface versions of domain types for consistency
// These can be used when you need to distinguish between interfaces and types

import type {
  Booking,
  CalendarBooking,
  Customer,
  Employee,
  Service,
  Shift,
  Salon,
  Profile,
  OpeningHours,
  UserProfile,
} from "./domain";

/**
 * Interface versions of domain types
 * Use these when you need interface semantics (e.g., extending, implementing)
 * These are type aliases that can be extended if needed in the future
 */
export type IBooking = Booking;
export type ICalendarBooking = CalendarBooking;
export type ICustomer = Customer;
export type IEmployee = Employee;
export type IService = Service;
export type IShift = Shift;
export type ISalon = Salon;
export type IProfile = Profile;
export type IOpeningHours = OpeningHours;
export type IUserProfile = UserProfile;

/**
 * Re-export domain types for convenience
 * Most code should use the type aliases (Booking, Customer, etc.)
 * Use interfaces (IBooking, ICustomer, etc.) only when needed
 */
export type {
  Booking,
  CalendarBooking,
  Customer,
  Employee,
  Service,
  Shift,
  Salon,
  Profile,
  OpeningHours,
  UserProfile,
} from "./domain";

