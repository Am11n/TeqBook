// =====================================================
// Employees Service
// =====================================================
// Business logic layer for employees
// Orchestrates repository calls and handles domain rules

import {
  getEmployeesForCurrentSalon,
  getEmployeeWithServices,
  getEmployeesWithServicesMap,
  createEmployee as createEmployeeRepo,
  updateEmployee as updateEmployeeRepo,
  deleteEmployee as deleteEmployeeRepo,
} from "@/lib/repositories/employees";
import { tb } from "@/lib/i18n/repo-error-codes";
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, PlanType } from "@/lib/types";
import { canAddEmployee, getEffectiveLimit } from "./plan-limits-service";
import { logEmployeeEvent } from "@/lib/services/audit-trail-service";
import { syncUsageDerivedAddons } from "@/lib/services/billing-service";

async function syncUsageDerivedAddonsBestEffort(salonId: string): Promise<void> {
  await syncUsageDerivedAddons(salonId).catch(() => {});
}

/**
 * Get employees for current salon
 */
export async function getEmployeesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: tb("SALON_ID_REQUIRED") };
  }

  // Call repository
  return await getEmployeesForCurrentSalon(salonId, options);
}

/**
 * Get employee with services
 */
export async function getEmployeeWithServicesForSalon(
  salonId: string,
  employeeId: string
): Promise<{ data: { employee: Employee; services: { id: string; name: string }[] } | null; error: string | null }> {
  // Validation
  if (!salonId || !employeeId) {
    return { data: null, error: tb("SALON_EMPLOYEE_IDS_REQUIRED") };
  }

  // Call repository
  return await getEmployeeWithServices(salonId, employeeId);
}

/**
 * Get employees with services map
 */
export async function getEmployeesWithServicesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{
  data: { employees: Employee[]; servicesMap: Record<string, { id: string; name: string }[]> } | null;
  error: string | null;
  total?: number;
}> {
  // Validation
  if (!salonId) {
    return { data: null, error: tb("SALON_ID_REQUIRED") };
  }

  // Call repository
  return await getEmployeesWithServicesMap(salonId, options);
}

/**
 * Create a new employee with business logic
 */
export async function createEmployee(
  input: CreateEmployeeInput,
  salonPlan?: PlanType | null
): Promise<{ data: Employee | null; error: string | null; limitReached?: boolean }> {
  // Validation
  if (!input.salon_id || !input.full_name) {
    return { data: null, error: tb("SALON_FULL_NAME_REQUIRED") };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { data: null, error: tb("INVALID_EMAIL") };
  }

  // Validate phone format if provided (basic validation)
  if (input.phone && input.phone.trim().length < 8) {
    return { data: null, error: tb("PHONE_TOO_SHORT") };
  }

  // Soft allow: staff beyond included plan seats is billed as usage-derived add-ons.
  // Still surface limit check errors (e.g. DB), but never hard-block creation.
  if (salonPlan !== undefined) {
    const { error: limitError } = await canAddEmployee(input.salon_id, salonPlan);
    if (limitError) {
      return { data: null, error: limitError };
    }
  }

  // Call repository
  const result = await createEmployeeRepo(input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logEmployeeEvent("create", {
      salonId: input.salon_id,
      resourceId: result.data.id,
      employeeName: result.data.full_name,
      role: result.data.role || undefined,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block employee creation if audit fails
    });
    await syncUsageDerivedAddonsBestEffort(input.salon_id);
  }

  return result;
}

/**
 * Update an employee with business logic
 */
export async function updateEmployee(
  salonId: string,
  employeeId: string,
  input: UpdateEmployeeInput,
  salonPlan?: PlanType | null
): Promise<{ data: Employee | null; error: string | null; limitReached?: boolean }> {
  // Validation
  if (!salonId || !employeeId) {
    return { data: null, error: tb("SALON_EMPLOYEE_IDS_REQUIRED") };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { data: null, error: tb("INVALID_EMAIL") };
  }

  // Validate phone format if provided
  if (input.phone && input.phone.trim().length < 8) {
    return { data: null, error: tb("PHONE_TOO_SHORT") };
  }

  // Soft allow: reactivating staff when already at included count may add billable seats.
  if (input.is_active === true && salonPlan !== undefined) {
    const { data: employeeData } = await getEmployeeWithServices(salonId, employeeId);
    const currentEmployee = employeeData?.employee;
    if (currentEmployee && currentEmployee.is_active === false) {
      const { error: limitError } = await getEffectiveLimit(salonId, salonPlan, "employees");
      if (limitError) {
        return { data: null, error: limitError };
      }
    }
  }

  // Call repository
  const result = await updateEmployeeRepo(salonId, employeeId, input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    // Determine the action based on what changed
    let action: "update" | "activate" | "deactivate" = "update";
    if (input.is_active !== undefined) {
      action = input.is_active ? "activate" : "deactivate";
    }

    logEmployeeEvent(action, {
      salonId,
      resourceId: employeeId,
      employeeName: result.data.full_name,
      role: result.data.role || undefined,
      isActive: result.data.is_active,
    }).catch(() => {
      // Silent fail - don't block employee update if audit fails
    });
    await syncUsageDerivedAddonsBestEffort(salonId);
  }

  return result;
}

/**
 * Toggle employee active status
 */
export async function toggleEmployeeActive(
  salonId: string,
  employeeId: string,
  currentStatus: boolean,
  salonPlan?: PlanType | null
): Promise<{ data: Employee | null; error: string | null; limitReached?: boolean }> {
  // Use updateEmployee which includes limit checking for reactivation
  return await updateEmployee(salonId, employeeId, { is_active: !currentStatus }, salonPlan);
}

/**
 * Delete an employee
 */
export async function deleteEmployee(
  salonId: string,
  employeeId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !employeeId) {
    return { error: tb("SALON_EMPLOYEE_IDS_REQUIRED") };
  }

  // Call repository
  const result = await deleteEmployeeRepo(salonId, employeeId);

  // Log to audit trail on success
  if (!result.error) {
    logEmployeeEvent("delete", {
      salonId,
      resourceId: employeeId,
    }).catch(() => {
      // Silent fail - don't block employee deletion if audit fails
    });
    await syncUsageDerivedAddonsBestEffort(salonId);
  }

  return result;
}

/**
 * Get active employees for public booking (simplified, no pagination)
 */
export async function getActiveEmployeesForPublicBooking(
  salonId: string
): Promise<{ data: { id: string; full_name: string }[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: tb("SALON_ID_REQUIRED") };
  }

  // Call repository with large page size to get all active employees
  const result = await getEmployeesForCurrentSalon(salonId, { pageSize: 1000 });
  
  if (result.error || !result.data) {
    return { data: null, error: result.error || tb("FAILED_TO_LOAD_EMPLOYEES") };
  }

  // Filter to only active employees and map to simplified format
  const simplified = result.data
    .filter((employee) => employee.is_active)
    .map((employee) => ({
      id: employee.id,
      full_name: employee.full_name,
    }));

  return { data: simplified, error: null };
}

