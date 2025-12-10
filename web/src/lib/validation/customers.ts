// =====================================================
// Customer Validation Schemas
// =====================================================
// Validation schemas for customer-related operations

import type { CreateCustomerInput, UpdateCustomerInput } from "@/lib/types/dto";

/**
 * Validate create customer input
 */
export function validateCreateCustomer(input: CreateCustomerInput): { valid: boolean; error?: string } {
  if (!input.salon_id || input.salon_id.trim().length === 0) {
    return { valid: false, error: "Salon ID is required" };
  }

  if (!input.full_name || input.full_name.trim().length === 0) {
    return { valid: false, error: "Full name is required" };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validate update customer input
 */
export function validateUpdateCustomer(input: UpdateCustomerInput): { valid: boolean; error?: string } {
  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

