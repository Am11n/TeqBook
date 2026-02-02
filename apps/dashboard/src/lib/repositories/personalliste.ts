// =====================================================
// Personalliste Repository
// =====================================================
// Data access for staff register (personalliste) - compliance documentation

import { supabase } from "@/lib/supabase-client";
import type { PersonallisteEntry } from "@/lib/types/domain";
import type {
  CreatePersonallisteEntryInput,
  UpdatePersonallisteEntryInput,
} from "@/lib/types/dto";

/**
 * Get personalliste entries for a salon in a date range
 */
export async function getPersonallisteEntries(
  salonId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ data: PersonallisteEntry[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("personalliste_entries")
      .select(
        "id, salon_id, employee_id, date, check_in, check_out, duration_minutes, status, changed_by, changed_at, created_at, employees(full_name)"
      )
      .eq("salon_id", salonId)
      .gte("date", dateFrom)
      .lte("date", dateTo)
      .order("date", { ascending: false })
      .order("check_in", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data ?? []).map((row) => ({
        ...row,
        employees: Array.isArray(row.employees) ? row.employees[0] : row.employees,
      })) as PersonallisteEntry[],
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Insert a personalliste entry
 */
export async function insertPersonallisteEntry(
  input: CreatePersonallisteEntryInput
): Promise<{ data: PersonallisteEntry | null; error: string | null }> {
  try {
    const checkIn = new Date(input.check_in);
    const checkOut = input.check_out ? new Date(input.check_out) : null;
    const durationMinutes =
      checkOut && checkOut > checkIn
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)
        : null;

    const { data, error } = await supabase
      .from("personalliste_entries")
      .insert({
        salon_id: input.salon_id,
        employee_id: input.employee_id,
        date: input.date,
        check_in: input.check_in,
        check_out: input.check_out ?? null,
        duration_minutes: durationMinutes,
        status: "ok",
      })
      .select(
        "id, salon_id, employee_id, date, check_in, check_out, duration_minutes, status, changed_by, changed_at, created_at, employees(full_name)"
      )
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create personalliste entry",
      };
    }

    const entry = {
      ...data,
      employees: Array.isArray(data.employees) ? data.employees[0] : data.employees,
    } as PersonallisteEntry;

    return { data: entry, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update a personalliste entry (sets status to 'edited', changed_by, changed_at)
 */
export async function updatePersonallisteEntry(
  salonId: string,
  entryId: string,
  updates: UpdatePersonallisteEntryInput,
  changedByUserId: string
): Promise<{ data: PersonallisteEntry | null; error: string | null }> {
  try {
    const now = new Date().toISOString();
    let durationMinutes: number | null = null;
    if (updates.check_in != null && updates.check_out != null) {
      const checkIn = new Date(updates.check_in);
      const checkOut = new Date(updates.check_out);
      if (checkOut > checkIn) {
        durationMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
      }
    }

    const { data, error } = await supabase
      .from("personalliste_entries")
      .update({
        ...(updates.check_in != null && { check_in: updates.check_in }),
        ...(updates.check_out !== undefined && { check_out: updates.check_out }),
        ...(durationMinutes !== null && { duration_minutes: durationMinutes }),
        status: "edited",
        changed_by: changedByUserId,
        changed_at: now,
      })
      .eq("id", entryId)
      .eq("salon_id", salonId)
      .select(
        "id, salon_id, employee_id, date, check_in, check_out, duration_minutes, status, changed_by, changed_at, created_at, employees(full_name)"
      )
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update personalliste entry",
      };
    }

    const entry = {
      ...data,
      employees: Array.isArray(data.employees) ? data.employees[0] : data.employees,
    } as PersonallisteEntry;

    return { data: entry, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
