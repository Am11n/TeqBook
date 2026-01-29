/**
 * Component Test Utilities
 * Task Group 24: Component Tests
 * 
 * Provides utilities for testing React components with proper context
 */

import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import "@testing-library/jest-dom";

// =====================================================
// Test Providers
// =====================================================

/**
 * Wrapper component that provides necessary context for tests
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

// =====================================================
// Custom Render
// =====================================================

/**
 * Custom render function that wraps components with test providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// =====================================================
// Mock Data Factories
// =====================================================

export const mockEmployee = (overrides = {}) => ({
  id: "emp-123",
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+47 123 45 678",
  role: "staff" as const,
  preferred_language: "en",
  ...overrides,
});

export const mockService = (overrides = {}) => ({
  id: "svc-123",
  name: "Haircut",
  category: "cut",
  duration_minutes: 30,
  price_cents: 35000,
  sort_order: 0,
  is_active: true,
  ...overrides,
});

export const mockCustomer = (overrides = {}) => ({
  id: "cust-123",
  full_name: "Jane Smith",
  email: "jane@example.com",
  phone: "+47 987 65 432",
  notes: "",
  ...overrides,
});

export const mockBooking = (overrides = {}) => ({
  id: "booking-123",
  salon_id: "salon-123",
  employee_id: "emp-123",
  service_id: "svc-123",
  customer_id: "cust-123",
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  status: "confirmed" as const,
  is_walk_in: false,
  notes: null,
  employees: mockEmployee(),
  services: mockService(),
  customers: mockCustomer(),
  products: [],
  ...overrides,
});

export const mockShift = (overrides = {}) => ({
  id: "shift-123",
  employee_id: "emp-123",
  salon_id: "salon-123",
  date: new Date().toISOString().split("T")[0],
  start_time: "09:00",
  end_time: "17:00",
  is_available: true,
  weekday: new Date().getDay(),
  ...overrides,
});

export const mockProduct = (overrides = {}) => ({
  id: "prod-123",
  salon_id: "salon-123",
  name: "Shampoo",
  price_cents: 15000,
  stock_quantity: 10,
  low_stock_threshold: 3,
  active: true,
  ...overrides,
});

// =====================================================
// Mock Translation Factories
// =====================================================

export const mockBookingFormTranslations = () => ({
  dialogTitle: "Create Booking",
  dialogDescription: "Fill in the booking details",
  employeeLabel: "Employee",
  employeePlaceholder: "Select employee",
  serviceLabel: "Service",
  servicePlaceholder: "Select service",
  dateLabel: "Date",
  timeLabel: "Time",
  loadSlotsButton: "Load available slots",
  loadingSlots: "Loading...",
  noSlotsYet: "Select employee, service and date first",
  selectSlotPlaceholder: "Select a time slot",
  customerNameLabel: "Customer name",
  customerEmailLabel: "Email",
  customerEmailPlaceholder: "customer@example.com",
  customerPhoneLabel: "Phone",
  customerPhonePlaceholder: "+47 123 45 678",
  isWalkInLabel: "Walk-in",
  cancelButton: "Cancel",
  createBooking: "Create booking",
  creatingBooking: "Creating...",
  invalidSlot: "Invalid time slot",
  createError: "Failed to create booking",
});

export const mockBookingsTableTranslations = () => ({
  colDate: "Date",
  colTime: "Time",
  colService: "Service",
  colEmployee: "Employee",
  colCustomer: "Customer",
  colStatus: "Status",
  colType: "Type",
  colNotes: "Notes",
  unknownService: "Unknown service",
  unknownEmployee: "Unknown employee",
  unknownCustomer: "Unknown customer",
  typeWalkIn: "Walk-in",
  typeOnline: "Online",
  statusPending: "Pending",
  statusConfirmed: "Confirmed",
  statusNoShow: "No-show",
  statusCompleted: "Completed",
  statusCancelled: "Cancelled",
  statusScheduled: "Scheduled",
  cancelButton: "Cancel",
});

export const mockServiceFormTranslations = () => ({
  nameLabel: "Name",
  namePlaceholder: "Service name",
  categoryLabel: "Category",
  categoryOther: "Other",
  categoryCut: "Cut",
  categoryBeard: "Beard",
  categoryColor: "Color",
  categoryNails: "Nails",
  categoryMassage: "Massage",
  durationLabel: "Duration (min)",
  priceLabel: "Price (cents)",
  sortOrderLabel: "Sort order",
  newService: "New Service",
});

export const mockEmployeeFormTranslations = () => ({
  nameLabel: "Full name",
  namePlaceholder: "Enter full name",
  emailLabel: "Email",
  emailPlaceholder: "email@example.com",
  phoneLabel: "Phone",
  phonePlaceholder: "+47 123 45 678",
  roleLabel: "Role",
  rolePlaceholder: "Select role",
  preferredLanguageLabel: "Language",
  servicesLabel: "Services",
  servicesPlaceholder: "Select services",
  addButton: "Add Employee",
});

// =====================================================
// Re-export everything from testing-library
// =====================================================

export * from "@testing-library/react";
export { customRender as render };
