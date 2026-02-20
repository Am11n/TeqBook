import type { BookingStatus, EmployeeRole, PlanType } from "./enums";

export type Employee = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole | string | null;
  preferred_language: string | null;
  is_active: boolean;
  deleted_at?: string | null;
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  prep_minutes: number;
  cleanup_minutes: number;
  price_cents: number;
  sort_order: number | null;
  is_active: boolean;
};

export type Booking = {
  id: string;
  employee_id?: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus | string;
  is_walk_in: boolean;
  notes: string | null;
  customers: { full_name: string | null; email?: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
  products?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_cents: number;
    product: { id: string; name: string; price_cents: number };
  }> | null;
};

export type CalendarBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus | string;
  is_walk_in: boolean;
  customer_id: string | null;
  service_id: string | null;
  is_imported?: boolean;
  notes: string | null;
  customers: { full_name: string | null; phone?: string | null; email?: string | null } | null;
  employees: { id: string; full_name: string | null } | null;
  services: {
    name: string | null;
    price_cents?: number;
    duration_minutes?: number;
    prep_minutes?: number;
    cleanup_minutes?: number;
  } | null;
  _problems?: BookingProblem[];
};

export type BookingProblem =
  | "unpaid"
  | "unconfirmed"
  | "conflict"
  | "missing_contact"
  | "new_customer";

export type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  gdpr_consent: boolean;
};

export type Shift = {
  id: string;
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  employee?: { full_name: string };
};

export type ShiftOverride = {
  id: string;
  salon_id: string;
  employee_id: string;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  source: "manual" | "copied" | "template";
  created_at: string;
};

export type EmployeeService = {
  employee_id: string;
  service_id: string;
  services: { id: string; name: string } | null;
};

export type CreateEmployeeInput = {
  salon_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  service_ids?: string[];
};

export type UpdateEmployeeInput = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  is_active?: boolean;
  service_ids?: string[];
};

export type CreateServiceInput = {
  salon_id: string;
  name: string;
  category?: string | null;
  duration_minutes: number;
  price_cents: number;
  sort_order?: number;
  is_active?: boolean;
  prep_minutes?: number;
  cleanup_minutes?: number;
};

export type UpdateServiceInput = {
  name?: string;
  category?: string | null;
  duration_minutes?: number;
  price_cents?: number;
  sort_order?: number;
  is_active?: boolean;
  prep_minutes?: number;
  cleanup_minutes?: number;
};

export type CreateBookingInput = {
  salon_id: string;
  employee_id: string;
  service_id: string;
  start_time: string;
  customer_full_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_notes?: string | null;
  is_walk_in?: boolean;
};

export type CreateShiftInput = {
  salon_id: string;
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type CreateCustomerInput = {
  salon_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  gdpr_consent: boolean;
};

export type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  timezone?: string | null;
  currency?: string | null;
  time_format?: "12h" | "24h" | null;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
    presets?: string[];
  } | null;
  plan?: PlanType | null;
  billing_customer_id?: string | null;
  billing_subscription_id?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  payment_failure_count?: number | null;
  payment_failed_at?: string | null;
  last_payment_retry_at?: string | null;
  payment_status?: "active" | "failed" | "grace_period" | "restricted" | null;
  business_address?: string | null;
  org_number?: string | null;
  cancellation_hours?: number | null;
  default_buffer_minutes?: number | null;
};

export type Profile = {
  user_id: string;
  salon_id: string | null;
  is_superadmin?: boolean;
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  user_preferences?: {
    sidebarCollapsed?: boolean;
    notifications?: {
      email?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
        newBooking?: boolean;
        paymentFailure?: boolean;
        paymentRetry?: boolean;
        accessRestrictionWarning?: boolean;
      };
      inApp?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
        newBooking?: boolean;
        systemAnnouncements?: boolean;
      };
      sms?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
      };
      whatsapp?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
      };
    };
    [key: string]: unknown;
  } | null;
  preferred_language?: string | null;
};

export type OpeningHours = {
  day: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};
