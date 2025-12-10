// =====================================================
// Customers Service
// =====================================================
// Business logic layer for customers
// Orchestrates repository calls and handles domain rules

import {
  getCustomersForCurrentSalon,
  createCustomer as createCustomerRepo,
  deleteCustomer as deleteCustomerRepo,
} from "@/lib/repositories/customers";
import type { Customer, CreateCustomerInput } from "@/lib/types";

/**
 * Get customers for current salon
 */
export async function getCustomersForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Customer[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getCustomersForCurrentSalon(salonId, options);
}

/**
 * Create a new customer with business logic
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<{ data: Customer | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.full_name) {
    return { data: null, error: "Salon ID and full name are required" };
  }

  // Validate GDPR consent
  if (!input.gdpr_consent) {
    return { data: null, error: "GDPR consent is required" };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Validate phone format if provided
  if (input.phone && input.phone.trim().length < 8) {
    return { data: null, error: "Phone number must be at least 8 characters" };
  }

  // Call repository
  return await createCustomerRepo(input);
}

/**
 * Delete a customer
 */
export async function deleteCustomer(
  salonId: string,
  customerId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !customerId) {
    return { error: "Salon ID and Customer ID are required" };
  }

  // Call repository
  return await deleteCustomerRepo(salonId, customerId);
}

