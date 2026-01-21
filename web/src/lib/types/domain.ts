// =====================================================
// Domain Types
// =====================================================
// Core entity types representing business domain models
// These types match the database schema and represent the "source of truth"
//
// Note: We use interface prefixing (IBooking, ICustomer, etc.) for consistency
// but export them without the prefix for cleaner usage in code.

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

// Feature keys - must match database features.key values
export type FeatureKey = 
  | "BOOKINGS"
  | "CALENDAR"
  | "SHIFTS"
  | "ADVANCED_REPORTS"
  | "MULTILINGUAL"
  | "SMS_NOTIFICATIONS"
  | "EMAIL_NOTIFICATIONS"
  | "WHATSAPP"
  | "INVENTORY"
  | "BRANDING"
  | "ROLES_ACCESS"
  | "EXPORTS"
  | "CUSTOMER_HISTORY"
  | "ONLINE_PAYMENTS"
  | "ADVANCED_PERMISSIONS";

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
};

export type Service = {
  id: string;
  name: string;
  category: string | null; // 'cut', 'beard', 'color', 'nails', 'massage', 'other'
  duration_minutes: number;
  price_cents: number;
  sort_order: number | null;
  is_active: boolean;
};

export type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus | string; // Can be enum or text for backward compatibility
  is_walk_in: boolean;
  notes: string | null;
  customers: { full_name: string | null } | null;
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
  status: BookingStatus | string; // Can be enum or text for backward compatibility
  is_walk_in: boolean;
  customers: { full_name: string | null } | null;
  employees: { id: string; full_name: string | null } | null;
  services: { name: string | null } | null;
};

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

export type EmployeeService = {
  employee_id: string;
  service_id: string;
  services: { id: string; name: string } | null;
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
  default_language?: string;
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

export type UserProfile = {
  user_id: string;
  salon_id: string | null;
  is_superadmin: boolean;
  role?: string | null;
  user_preferences?: {
    sidebarCollapsed?: boolean;
    [key: string]: unknown;
  } | null;
  preferred_language?: string | null;
};

