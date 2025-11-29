// =====================================================
// Employees Repository
// =====================================================
// Centralized data access layer for employees
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type {
  Employee,
  Service,
  EmployeeService,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/lib/types";

/**
 * Get all employees for the current salon
 */
export async function getEmployeesForCurrentSalon(
  salonId: string
): Promise<{ data: Employee[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name, email, phone, role, preferred_language, is_active")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Employee[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get employee with their associated services
 */
export async function getEmployeeWithServices(
  salonId: string,
  employeeId: string
): Promise<{
  data: { employee: Employee; services: Service[] } | null;
  error: string | null;
}> {
  try {
    const [{ data: employeeData, error: employeeError }, { data: servicesData, error: servicesError }] =
      await Promise.all([
        supabase
          .from("employees")
          .select("id, full_name, email, phone, role, preferred_language, is_active")
          .eq("id", employeeId)
          .eq("salon_id", salonId)
          .maybeSingle(),
        supabase
          .from("employee_services")
          .select("service_id, services(id, name)")
          .eq("employee_id", employeeId)
          .eq("salon_id", salonId),
      ]);

    if (employeeError || servicesError) {
      return {
        data: null,
        error: employeeError?.message ?? servicesError?.message ?? "Failed to load employee",
      };
    }

    if (!employeeData) {
      return { data: null, error: "Employee not found" };
    }

    const services =
      servicesData
        ?.map((es) => {
          if (es.services && typeof es.services === "object" && "id" in es.services && "name" in es.services) {
            return es.services as Service;
          }
          return null;
        })
        .filter((s): s is Service => s !== null) ?? [];

    return {
      data: { employee: employeeData as Employee, services },
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
 * Get all employees with their services mapped
 */
export async function getEmployeesWithServicesMap(
  salonId: string
): Promise<{
  data: { employees: Employee[]; servicesMap: Record<string, Service[]> } | null;
  error: string | null;
}> {
  try {
    const [
      { data: employeesData, error: employeesError },
      { data: employeeServicesData, error: employeeServicesError },
    ] = await Promise.all([
      supabase
        .from("employees")
        .select("id, full_name, email, phone, role, preferred_language, is_active")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: true }),
      supabase
        .from("employee_services")
        .select("employee_id, service_id, services(id, name)")
        .eq("salon_id", salonId),
    ]);

    if (employeesError || employeeServicesError) {
      return {
        data: null,
        error: employeesError?.message ?? employeeServicesError?.message ?? "Failed to load employees",
      };
    }

    // Map employee services
    const servicesMap: Record<string, Service[]> = {};
    if (employeeServicesData) {
      for (const es of employeeServicesData) {
        if (!servicesMap[es.employee_id]) {
          servicesMap[es.employee_id] = [];
        }
        if (es.services && typeof es.services === "object" && "id" in es.services && "name" in es.services) {
          servicesMap[es.employee_id].push(es.services as Service);
        }
      }
    }

    return {
      data: {
        employees: (employeesData ?? []) as Employee[],
        servicesMap,
      },
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
 * Create a new employee
 */
export async function createEmployee(
  input: CreateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  try {
    // Insert employee
    const { data: employeeData, error: insertError } = await supabase
      .from("employees")
      .insert({
        salon_id: input.salon_id,
        full_name: input.full_name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        role: input.role?.trim() || null,
        preferred_language: input.preferred_language || "nb",
      })
      .select("id, full_name, email, phone, role, preferred_language, is_active")
      .maybeSingle();

    if (insertError || !employeeData) {
      return {
        data: null,
        error: insertError?.message ?? "Failed to create employee",
      };
    }

    // Insert employee_services if any services selected
    if (input.service_ids && input.service_ids.length > 0) {
      const employeeServices = input.service_ids.map((serviceId) => ({
        employee_id: employeeData.id,
        service_id: serviceId,
        salon_id: input.salon_id,
      }));

      const { error: servicesError } = await supabase
        .from("employee_services")
        .insert(employeeServices);

      if (servicesError) {
        // Employee was created but services failed - return employee anyway
        return {
          data: employeeData as Employee,
          error: `Employee created but failed to link services: ${servicesError.message}`,
        };
      }
    }

    return { data: employeeData as Employee, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(
  salonId: string,
  employeeId: string,
  input: UpdateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  try {
    const updateData: Record<string, unknown> = {};

    if (input.full_name !== undefined) updateData.full_name = input.full_name.trim();
    if (input.email !== undefined) updateData.email = input.email?.trim() || null;
    if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null;
    if (input.role !== undefined) updateData.role = input.role?.trim() || null;
    if (input.preferred_language !== undefined) updateData.preferred_language = input.preferred_language;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", employeeId)
      .eq("salon_id", salonId)
      .select("id, full_name, email, phone, role, preferred_language, is_active")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update employee",
      };
    }

    // Update employee_services if provided
    if (input.service_ids !== undefined) {
      // Delete existing services
      await supabase
        .from("employee_services")
        .delete()
        .eq("employee_id", employeeId)
        .eq("salon_id", salonId);

      // Insert new services
      if (input.service_ids.length > 0) {
        const employeeServices = input.service_ids.map((serviceId) => ({
          employee_id: employeeId,
          service_id: serviceId,
          salon_id: salonId,
        }));

        const { error: servicesError } = await supabase
          .from("employee_services")
          .insert(employeeServices);

        if (servicesError) {
          return {
            data: data as Employee,
            error: `Employee updated but failed to update services: ${servicesError.message}`,
          };
        }
      }
    }

    return { data: data as Employee, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(
  salonId: string,
  employeeId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId)
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
 * Toggle employee active status
 */
export async function toggleEmployeeActive(
  salonId: string,
  employeeId: string,
  currentStatus: boolean
): Promise<{ data: Employee | null; error: string | null }> {
  return updateEmployee(salonId, employeeId, { is_active: !currentStatus });
}

