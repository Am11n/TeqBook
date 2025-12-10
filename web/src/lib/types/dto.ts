// =====================================================
// DTO Types (Data Transfer Objects)
// =====================================================
// Input/output types for API/service layer
// These types represent data structures used for communication between layers

import type {
  BookingStatus,
  EmployeeRole,
  PlanType,
  NotificationType,
  NotificationStatus,
  PaymentMethod,
} from "./domain";

// =====================================================
// Create Input Types
// =====================================================

export type CreateEmployeeInput = {
  salon_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  service_ids?: string[];
};

export type CreateServiceInput = {
  salon_id: string;
  name: string;
  category?: string | null;
  duration_minutes: number;
  price_cents: number;
  sort_order?: number;
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
// Update Input Types
// =====================================================

export type UpdateEmployeeInput = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  preferred_language?: string;
  is_active?: boolean;
  service_ids?: string[];
};

export type UpdateServiceInput = {
  name?: string;
  category?: string | null;
  duration_minutes?: number;
  price_cents?: number;
  sort_order?: number;
  is_active?: boolean;
};

export type UpdateBookingInput = {
  status?: BookingStatus | string;
  notes?: string | null;
  start_time?: string;
  end_time?: string;
};

export type UpdateCustomerInput = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  gdpr_consent?: boolean;
};

export type UpdateShiftInput = {
  weekday?: number;
  start_time?: string;
  end_time?: string;
};

// =====================================================
// Service Response Types
// =====================================================

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedServiceResult<T> = ServiceResult<T> & {
  total?: number;
};

// =====================================================
// Query/Filter Types
// =====================================================

export type PaginationOptions = {
  page?: number;
  pageSize?: number;
};

export type DateRangeOptions = {
  startDate?: string;
  endDate?: string;
};

export type BookingFilterOptions = PaginationOptions & DateRangeOptions & {
  status?: BookingStatus | string;
  employee_id?: string;
  customer_id?: string;
};

