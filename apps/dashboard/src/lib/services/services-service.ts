// =====================================================
// Services Service (Salon Services)
// =====================================================
// Business logic layer for salon services
// Orchestrates repository calls and handles domain rules

import {
  getServicesForCurrentSalon,
  getActiveServicesForCurrentSalon,
  getServiceById as getServiceByIdRepo,
  createService as createServiceRepo,
  updateService as updateServiceRepo,
  deleteService as deleteServiceRepo,
  toggleServiceActive,
} from "@/lib/repositories/services";
import type { Service, CreateServiceInput, UpdateServiceInput } from "@/lib/types";
import { logServiceEvent } from "@/lib/services/audit-trail-service";

/**
 * Get services for current salon
 */
export async function getServicesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Service[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getServicesForCurrentSalon(salonId, options);
}

/**
 * Get active services only
 */
export async function getActiveServicesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Service[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getActiveServicesForCurrentSalon(salonId, options);
}

/**
 * Get active services for public booking (simplified, no pagination)
 */
export async function getActiveServicesForPublicBooking(
  salonId: string
): Promise<{ data: { id: string; name: string }[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository with large page size to get all active services
  const result = await getActiveServicesForCurrentSalon(salonId, { pageSize: 1000 });
  
  if (result.error || !result.data) {
    return { data: null, error: result.error || "Failed to load services" };
  }

  // Map to simplified format for public booking
  const simplified = result.data.map((service) => ({
    id: service.id,
    name: service.name,
  }));

  return { data: simplified, error: null };
}

/**
 * Get a single service by ID
 */
export async function getServiceById(
  salonId: string,
  serviceId: string
): Promise<{ data: Service | null; error: string | null }> {
  // Validation
  if (!salonId || !serviceId) {
    return { data: null, error: "Salon ID and Service ID are required" };
  }

  // Call repository
  return await getServiceByIdRepo(salonId, serviceId);
}

/**
 * Create a new service with business logic
 */
export async function createService(
  input: CreateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.name || !input.duration_minutes || input.price_cents === undefined) {
    return { data: null, error: "All required fields must be provided" };
  }

  // Validate duration is positive
  if (input.duration_minutes <= 0) {
    return { data: null, error: "Duration must be greater than 0" };
  }

  // Validate price is non-negative
  if (input.price_cents < 0) {
    return { data: null, error: "Price cannot be negative" };
  }

  // Call repository
  const result = await createServiceRepo(input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logServiceEvent("create", {
      salonId: input.salon_id,
      resourceId: result.data.id,
      serviceName: result.data.name,
      priceCents: result.data.price_cents,
      durationMinutes: result.data.duration_minutes,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block service creation if audit fails
    });
  }

  return result;
}

/**
 * Update a service with business logic
 */
export async function updateService(
  salonId: string,
  serviceId: string,
  input: UpdateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  // Validation
  if (!salonId || !serviceId) {
    return { data: null, error: "Salon ID and Service ID are required" };
  }

  // Validate duration if provided
  if (input.duration_minutes !== undefined && input.duration_minutes <= 0) {
    return { data: null, error: "Duration must be greater than 0" };
  }

  // Validate price if provided
  if (input.price_cents !== undefined && input.price_cents < 0) {
    return { data: null, error: "Price cannot be negative" };
  }

  // Call repository
  const result = await updateServiceRepo(salonId, serviceId, input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logServiceEvent("update", {
      salonId,
      resourceId: serviceId,
      serviceName: result.data.name,
      priceCents: result.data.price_cents,
      durationMinutes: result.data.duration_minutes,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block service update if audit fails
    });
  }

  return result;
}

/**
 * Delete a service
 */
export async function deleteService(
  salonId: string,
  serviceId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !serviceId) {
    return { error: "Salon ID and Service ID are required" };
  }

  // Call repository
  const result = await deleteServiceRepo(salonId, serviceId);

  // Log to audit trail on success
  if (!result.error) {
    logServiceEvent("delete", {
      salonId,
      resourceId: serviceId,
    }).catch(() => {
      // Silent fail - don't block service deletion if audit fails
    });
  }

  return result;
}

/**
 * Toggle service active status
 */
export async function toggleServiceStatus(
  salonId: string,
  serviceId: string,
  currentStatus: boolean
): Promise<{ data: Service | null; error: string | null }> {
  // Validation
  if (!salonId || !serviceId) {
    return { data: null, error: "Salon ID and Service ID are required" };
  }

  // Call repository
  const result = await toggleServiceActive(salonId, serviceId, currentStatus);

  // Log to audit trail on success
  if (!result.error && result.data) {
    const action = result.data.is_active ? "activate" : "deactivate";
    logServiceEvent(action, {
      salonId,
      resourceId: serviceId,
      serviceName: result.data.name,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block service toggle if audit fails
    });
  }

  return result;
}

