// =====================================================
// Services Repository
// =====================================================
// Centralized data access layer for services
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Service, CreateServiceInput, UpdateServiceInput } from "@/lib/types";

/**
 * Get all services for the current salon with pagination
 */
export async function getServicesForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Service[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("services")
      .select("id, name, category, duration_minutes, price_cents, sort_order, is_active", { count: "exact" })
      .eq("salon_id", salonId)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Service[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get active services only (with pagination)
 */
export async function getActiveServicesForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Service[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("services")
      .select("id, name, category, duration_minutes, price_cents, sort_order, is_active", { count: "exact" })
      .eq("salon_id", salonId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Service[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(
  salonId: string,
  serviceId: string
): Promise<{ data: Service | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, name, category, duration_minutes, price_cents, sort_order, is_active")
      .eq("id", serviceId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Service not found" };
    }

    return { data: data as Service, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new service
 */
export async function createService(
  input: CreateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("services")
      .insert({
        salon_id: input.salon_id,
        name: input.name.trim(),
        category: input.category || null,
        duration_minutes: input.duration_minutes,
        price_cents: input.price_cents,
        sort_order: input.sort_order ?? 0,
      })
      .select("id, name, category, duration_minutes, price_cents, sort_order, is_active")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create service",
      };
    }

    return { data: data as Service, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update a service
 */
export async function updateService(
  salonId: string,
  serviceId: string,
  input: UpdateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  try {
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.category !== undefined) updateData.category = input.category || null;
    if (input.duration_minutes !== undefined) updateData.duration_minutes = input.duration_minutes;
    if (input.price_cents !== undefined) updateData.price_cents = input.price_cents;
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    const { data, error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", serviceId)
      .eq("salon_id", salonId)
      .select("id, name, category, duration_minutes, price_cents, sort_order, is_active")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update service",
      };
    }

    return { data: data as Service, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a service
 */
export async function deleteService(
  salonId: string,
  serviceId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("salon_id", salonId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Toggle service active status
 */
export async function toggleServiceActive(
  salonId: string,
  serviceId: string,
  currentStatus: boolean
): Promise<{ data: Service | null; error: string | null }> {
  return updateService(salonId, serviceId, { is_active: !currentStatus });
}

