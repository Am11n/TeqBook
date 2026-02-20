// =====================================================
// Type definitions for entities
// =====================================================

// =====================================================
// Enums (matching Postgres enums)
// =====================================================

export type BookingStatus = 
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show"
  | "scheduled";

export type EmployeeRole = 
  | "owner"
  | "manager"
  | "staff";

export type PlanType = 
  | "starter"
  | "pro"
  | "business";

export type NotificationType = 
  | "sms"
  | "email"
  | "whatsapp";

export type NotificationStatus = 
  | "pending"
  | "sent"
  | "failed";

export type PaymentMethod = 
  | "in_salon"
  | "online";

// =====================================================
// Entity Types
// =====================================================

export type Employee = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole | string | null; // Can be enum or text for backward compatibility
  preferred_language: string | null;
  is_active: boolean;
  deleted_at?: string | null;
};

export type Service = {
  id: string;
  name: string;
  category: string | null; // 'cut', 'beard', 'color', 'nails', 'massage', 'other'
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
  status: BookingStatus | string; // Can be enum or text for backward compatibility
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
    product: {
      id: string;
      name: string;
      price_cents: number;
    };
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
  /** Problem flags computed in UI from data */
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
  employee?: {
    full_name: string;
  };
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

// Input types for creating/updating entities
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

// =====================================================
// Additional Entity Types
// =====================================================

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
  timezone?: string | null; // IANA timezone identifier (e.g., "Europe/Oslo")
  currency?: string | null; // ISO 4217 currency code (e.g. "NOK", "USD", "EUR")
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
    presets?: string[];
  } | null;
  plan?: PlanType | null;
  // Billing fields (for future Stripe integration)
  billing_customer_id?: string | null;
  billing_subscription_id?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  // Payment failure tracking
  payment_failure_count?: number | null;
  payment_failed_at?: string | null;
  last_payment_retry_at?: string | null;
  payment_status?: "active" | "failed" | "grace_period" | "restricted" | null;
  // General settings fields
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
  day: number; // 0-6 (Sunday-Saturday)
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
};

// =====================================================
// Calendar Booking Machine Types
// =====================================================

export type BlockType =
  | "meeting"
  | "vacation"
  | "training"
  | "private"
  | "lunch"
  | "other";

export type TimeBlock = {
  id: string;
  salon_id: string;
  employee_id: string | null;
  title: string;
  block_type: BlockType;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  recurrence_rule: string | null;
  notes: string | null;
};

export type CreateTimeBlockInput = {
  salon_id: string;
  employee_id?: string | null;
  title: string;
  block_type: BlockType;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  recurrence_rule?: string | null;
  notes?: string | null;
};

export type SegmentType =
  | "working"
  | "break"
  | "time_block"
  | "booking"
  | "buffer"
  | "closed";

export type ScheduleSegment = {
  employee_id: string;
  segment_type: SegmentType;
  start_time: string;
  end_time: string;
  metadata: {
    booking_id?: string;
    block_id?: string;
    block_type?: string;
    break_label?: string;
    reason_code?: string;
    source?: string;
    title?: string;
    notes?: string | null;
    status?: string;
    is_walk_in?: boolean;
    service_name?: string;
    service_price?: number;
    service_duration?: number;
    customer_name?: string;
    customer_phone?: string;
    buffer_type?: "prep" | "cleanup";
    [key: string]: unknown;
  };
};

export type ConflictItem = {
  type: string;
  start: string;
  end: string;
  source_id: string;
  message_code: string;
  customer_name?: string;
  service_name?: string;
  title?: string;
  block_type?: string;
  break_label?: string;
};

export type SuggestedSlot = {
  start: string;
  end: string;
  employee_id: string;
};

export type ConflictResponse = {
  is_valid: boolean;
  conflicts: ConflictItem[];
  suggested_slots: SuggestedSlot[];
};

export type AvailableSlotBatch = {
  slot_start: string;
  slot_end: string;
  employee_id: string;
  employee_name: string;
};

