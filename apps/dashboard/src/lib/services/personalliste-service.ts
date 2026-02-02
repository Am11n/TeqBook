// =====================================================
// Personalliste Service
// =====================================================
// Business logic for staff register (personalliste) - compliance documentation
// No feature flag: available for all plans

import {
  getPersonallisteEntries,
  insertPersonallisteEntry,
  updatePersonallisteEntry,
} from "@/lib/repositories/personalliste";
import type { PersonallisteEntry } from "@/lib/types/domain";
import type {
  CreatePersonallisteEntryInput,
  UpdatePersonallisteEntryInput,
} from "@/lib/types/dto";

export type PersonallisteFilters = {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
};

/**
 * Get personalliste entries for a salon in a date range
 */
export async function getPersonallisteEntriesForSalon(
  salonId: string,
  filters: PersonallisteFilters
): Promise<{ data: PersonallisteEntry[] | null; error: string | null }> {
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }
  if (!filters.dateFrom || !filters.dateTo) {
    return { data: null, error: "Date range (dateFrom, dateTo) is required" };
  }
  if (filters.dateFrom > filters.dateTo) {
    return { data: null, error: "dateFrom must be before or equal to dateTo" };
  }

  return getPersonallisteEntries(salonId, filters.dateFrom, filters.dateTo);
}

/**
 * Create a personalliste entry
 */
export async function createPersonallisteEntry(
  input: CreatePersonallisteEntryInput
): Promise<{ data: PersonallisteEntry | null; error: string | null }> {
  if (!input.salon_id || !input.employee_id || !input.date || !input.check_in) {
    return { data: null, error: "salon_id, employee_id, date and check_in are required" };
  }

  const checkIn = new Date(input.check_in);
  if (Number.isNaN(checkIn.getTime())) {
    return { data: null, error: "Invalid check_in date" };
  }
  if (input.check_out) {
    const checkOut = new Date(input.check_out);
    if (Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return { data: null, error: "check_out must be after check_in" };
    }
  }

  return insertPersonallisteEntry(input);
}

/**
 * Update a personalliste entry (sets status to 'edited')
 */
export async function updatePersonallisteEntryForSalon(
  salonId: string,
  entryId: string,
  updates: UpdatePersonallisteEntryInput,
  changedByUserId: string
): Promise<{ data: PersonallisteEntry | null; error: string | null }> {
  if (!salonId || !entryId || !changedByUserId) {
    return { data: null, error: "salonId, entryId and changedByUserId are required" };
  }

  if (updates.check_in != null && updates.check_out != null) {
    const checkIn = new Date(updates.check_in);
    const checkOut = new Date(updates.check_out);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return { data: null, error: "check_out must be after check_in" };
    }
  }

  return updatePersonallisteEntry(salonId, entryId, updates, changedByUserId);
}
