import { supabase } from "@/lib/supabase-client";
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/types";

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  try {
    const { data: employeeData, error: insertError } = await supabase
      .from("employees")
      .insert({
        salon_id: input.salon_id, full_name: input.full_name.trim(),
        email: input.email?.trim() || null, phone: input.phone?.trim() || null,
        role: input.role?.trim() || null, preferred_language: input.preferred_language || "nb",
      })
      .select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at")
      .maybeSingle();
    if (insertError || !employeeData) return { data: null, error: insertError?.message ?? "Failed to create employee" };

    if (input.service_ids && input.service_ids.length > 0) {
      const employeeServices = input.service_ids.map((serviceId) => ({
        employee_id: employeeData.id, service_id: serviceId, salon_id: input.salon_id,
      }));
      const { error: servicesError } = await supabase.from("employee_services").insert(employeeServices);
      if (servicesError) return { data: employeeData as Employee, error: `Employee created but failed to link services: ${servicesError.message}` };
    }
    return { data: employeeData as Employee, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

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
      .from("employees").update(updateData).eq("id", employeeId).eq("salon_id", salonId)
      .select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at")
      .maybeSingle();
    if (error || !data) return { data: null, error: error?.message ?? "Failed to update employee" };

    if (input.service_ids !== undefined) {
      await supabase.from("employee_services").delete().eq("employee_id", employeeId).eq("salon_id", salonId);
      if (input.service_ids.length > 0) {
        const employeeServices = input.service_ids.map((serviceId) => ({ employee_id: employeeId, service_id: serviceId, salon_id: salonId }));
        const { error: servicesError } = await supabase.from("employee_services").insert(employeeServices);
        if (servicesError) return { data: data as Employee, error: `Employee updated but failed to update services: ${servicesError.message}` };
      }
    }
    return { data: data as Employee, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteEmployee(salonId: string, employeeId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("employees").update({ deleted_at: new Date().toISOString() }).eq("id", employeeId).eq("salon_id", salonId).is("deleted_at", null);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function toggleEmployeeActive(salonId: string, employeeId: string, currentStatus: boolean): Promise<{ data: Employee | null; error: string | null }> {
  return updateEmployee(salonId, employeeId, { is_active: !currentStatus });
}
