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
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, PlanType } from "@/lib/types";
import { canAddEmployee, getEffectiveLimit } from "./plan-limits-service";
import { logEmployeeEvent } from "@/lib/services/audit-trail-service";

/**
 * Get employees for current salon
 */
export async function getEmployeesForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
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
    return { data: null, error: "Salon ID and Employee ID are required" };
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
    return { data: null, error: "Salon ID is required" };
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
    return { data: null, error: "Salon ID and full name are required" };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Validate phone format if provided (basic validation)
  if (input.phone && input.phone.trim().length < 8) {
    return { data: null, error: "Phone number must be at least 8 characters" };
  }

  // Check plan limits if plan is provided
  if (salonPlan !== undefined) {
    const { canAdd, currentCount, limit, error: limitError } = await canAddEmployee(
      input.salon_id,
      salonPlan
    );

    if (limitError) {
      return { data: null, error: limitError };
    }

    if (!canAdd && limit !== null) {
      return {
        data: null,
        error: `Employee limit reached. Current: ${currentCount}/${limit}. Please upgrade your plan or add more staff seats.`,
        limitReached: true,
      };
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
    return { data: null, error: "Salon ID and Employee ID are required" };
  }

  // Validate email format if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Validate phone format if provided
  if (input.phone && input.phone.trim().length < 8) {
    return { data: null, error: "Phone number must be at least 8 characters" };
  }

  // Check plan limits if reactivating an inactive employee
  // Only count currently ACTIVE employees against the limit, since reactivating
  // an existing employee doesn't increase the total headcount.
  if (input.is_active === true && salonPlan !== undefined) {
    // Get current employee to check if it's being reactivated
    const { data: employeeData } = await getEmployeeWithServices(salonId, employeeId);
    const currentEmployee = employeeData?.employee;
    
    // If employee was inactive and is being reactivated, check active count vs limit
    if (currentEmployee && currentEmployee.is_active === false) {
      const { data: allEmployees, error: listError } = await getEmployeesForCurrentSalon(salonId);

      if (listError) {
        return { data: null, error: listError };
      }

      const activeCount = allEmployees?.filter((e) => e.is_active).length ?? 0;

      const { limit, error: limitError } = await getEffectiveLimit(salonId, salonPlan, "employees");

      if (limitError) {
        return { data: null, error: limitError };
      }

      if (limit !== null && activeCount >= limit) {
        return {
          data: null,
          error: `Active employee limit reached. Current: ${activeCount}/${limit}. Please upgrade your plan or deactivate another employee first.`,
          limitReached: true,
        };
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
    return { error: "Salon ID and Employee ID are required" };
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
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository with large page size to get all active employees
  const result = await getEmployeesForCurrentSalon(salonId, { pageSize: 1000 });
  
  if (result.error || !result.data) {
    return { data: null, error: result.error || "Failed to load employees" };
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

