// =====================================================
// Service Validation Schemas
// =====================================================
// Validation schemas for service-related operations

import type { CreateServiceInput, UpdateServiceInput } from "@/lib/types/dto";

/**
 * Validate create service input
 */
export function validateCreateService(input: CreateServiceInput): { valid: boolean; error?: string } {
  if (!input.salon_id || input.salon_id.trim().length === 0) {
    return { valid: false, error: "Salon ID is required" };
  }

  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "Service name is required" };
  }

  if (!input.duration_minutes || input.duration_minutes <= 0) {
    return { valid: false, error: "Duration must be greater than 0" };
  }

  if (input.price_cents === undefined || input.price_cents < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }

  return { valid: true };
}

/**
 * Validate update service input
 */
export function validateUpdateService(input: UpdateServiceInput): { valid: boolean; error?: string } {
  if (input.duration_minutes !== undefined && input.duration_minutes <= 0) {
    return { valid: false, error: "Duration must be greater than 0" };
  }

  if (input.price_cents !== undefined && input.price_cents < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }

  return { valid: true };
}

