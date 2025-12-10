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
 */
export interface IBooking extends Booking {}
export interface ICalendarBooking extends CalendarBooking {}
export interface ICustomer extends Customer {}
export interface IEmployee extends Employee {}
export interface IService extends Service {}
export interface IShift extends Shift {}
export interface ISalon extends Salon {}
export interface IProfile extends Profile {}
export interface IOpeningHours extends OpeningHours {}
export interface IUserProfile extends UserProfile {}

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

