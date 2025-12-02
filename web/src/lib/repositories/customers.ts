// =====================================================
// Customers Repository
// =====================================================
// Centralized data access layer for customers
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Customer, CreateCustomerInput } from "@/lib/types";

/**
 * Get all customers for the current salon with pagination
 */
export async function getCustomersForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Customer[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("customers")
      .select("id, full_name, email, phone, notes, gdpr_consent", { count: "exact" })
      .eq("salon_id", salonId)
      .order("full_name", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Customer[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<{ data: Customer | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        salon_id: input.salon_id,
        full_name: input.full_name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        notes: input.notes?.trim() || null,
        gdpr_consent: input.gdpr_consent,
      })
      .select("id, full_name, email, phone, notes, gdpr_consent")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create customer",
      };
    }

    return { data: data as Customer, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(
  salonId: string,
  customerId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
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

