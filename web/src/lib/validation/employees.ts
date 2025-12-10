// =====================================================
// Employee Validation Schemas
// =====================================================
// Validation schemas for employee-related operations

import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/types/dto";

/**
 * Validate create employee input
 */
export function validateCreateEmployee(input: CreateEmployeeInput): { valid: boolean; error?: string } {
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

  // Validate phone format if provided (basic validation)
  if (input.phone && input.phone.trim().length < 8) {
    return { valid: false, error: "Phone number must be at least 8 characters" };
  }

  return { valid: true };
}

/**
 * Validate update employee input
 */
export function validateUpdateEmployee(input: UpdateEmployeeInput): { valid: boolean; error?: string } {
  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate phone format if provided
  if (input.phone && input.phone.trim().length < 8) {
    return { valid: false, error: "Phone number must be at least 8 characters" };
  }

  return { valid: true };
}

