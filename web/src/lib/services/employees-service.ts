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
import { canAddEmployee } from "./plan-limits-service";

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
  return await createEmployeeRepo(input);
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
  // This prevents bypassing limits by deactivating and reactivating employees
  if (input.is_active === true && salonPlan !== undefined) {
    // Get current employee to check if it's being reactivated
    const { data: employeeData } = await getEmployeeWithServices(salonId, employeeId);
    const currentEmployee = employeeData?.employee;
    
    // If employee was inactive and is being reactivated, check limit
    if (currentEmployee && currentEmployee.is_active === false) {
      const { canAdd, currentCount, limit, error: limitError } = await canAddEmployee(
        salonId,
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
  }

  // Call repository
  return await updateEmployeeRepo(salonId, employeeId, input);
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
  return await deleteEmployeeRepo(salonId, employeeId);
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

