// =====================================================
// Salons Service
// =====================================================
// Business logic layer for salons
// Orchestrates repository calls and handles domain rules

import { getSalonBySlug, getSalonById, updateSalon as updateSalonRepo } from "@/lib/repositories/salons";
import type { Salon } from "@/lib/repositories/salons";

/**
 * Get salon by slug (for public booking pages)
 */
export async function getSalonBySlugForPublic(
  slug: string
): Promise<{ data: Salon | null; error: string | null }> {
  // Validation
  if (!slug || slug.trim().length === 0) {
    return { data: null, error: "Slug is required" };
  }

  // Call repository
  return await getSalonBySlug(slug);
}

/**
 * Get salon by ID
 */
export async function getSalonByIdForUser(
  salonId: string
): Promise<{ data: Salon | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getSalonById(salonId);
}

/**
 * Update salon settings
 */
export async function updateSalonSettings(
  salonId: string,
  updates: {
    name?: string;
    salon_type?: string | null;
    whatsapp_number?: string | null;
    preferred_language?: string | null;
  }
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId) {
    return { error: "Salon ID is required" };
  }

  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { error: "Salon name cannot be empty" };
  }

  // Call repository
  return await updateSalonRepo(salonId, updates);
}

/**
 * Update salon (alias for backward compatibility)
 */
export async function updateSalon(
  salonId: string,
  updates: {
    name?: string;
    salon_type?: string | null;
    whatsapp_number?: string | null;
  }
): Promise<{ error: string | null }> {
  return updateSalonSettings(salonId, updates);
}

