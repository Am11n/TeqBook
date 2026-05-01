import { supabase } from "@/lib/supabase-client";
import { tb } from "@/lib/i18n/repo-error-codes";
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/types";

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<{ data: Employee | null; error: string | null }> {
  try {
    const { data: employeeData, error: rpcError } = await supabase.rpc("dashboard_create_salon_employee", {
      p_salon_id: input.salon_id,
      p_full_name: input.full_name.trim(),
      p_email: input.email?.trim() || null,
      p_phone: input.phone?.trim() || null,
      p_role: input.role?.trim() || null,
      p_preferred_language: input.preferred_language || "nb",
      p_public_profile_visible: input.public_profile_visible ?? true,
      p_public_title: input.public_title?.trim() || null,
      p_bio: input.bio?.trim() || null,
      p_profile_image_url: input.profile_image_url?.trim() || null,
      p_specialties: input.specialties ?? [],
      p_public_sort_order: input.public_sort_order ?? null,
      p_service_ids: input.service_ids?.length ? input.service_ids : [],
    });

    if (rpcError) {
      const msg = rpcError.message ?? "";
      if (msg.includes("addon_usage_requires_upgrade") || rpcError.code === "P0001") {
        return { data: null, error: tb("ADDON_USAGE_REQUIRES_UPGRADE") };
      }
      return { data: null, error: msg || tb("EMPLOYEE_CREATE_FAILED") };
    }

    if (!employeeData) {
      return { data: null, error: tb("EMPLOYEE_CREATE_FAILED") };
    }

    return { data: employeeData as Employee, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : tb("UNKNOWN") };
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
    if (input.public_profile_visible !== undefined) updateData.public_profile_visible = input.public_profile_visible;
    if (input.public_title !== undefined) updateData.public_title = input.public_title?.trim() || null;
    if (input.bio !== undefined) updateData.bio = input.bio?.trim() || null;
    if (input.profile_image_url !== undefined) updateData.profile_image_url = input.profile_image_url?.trim() || null;
    if (input.specialties !== undefined) updateData.specialties = input.specialties;
    if (input.public_sort_order !== undefined) updateData.public_sort_order = input.public_sort_order;

    const { data, error } = await supabase
      .from("employees").update(updateData).eq("id", employeeId).eq("salon_id", salonId)
      .select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at, public_profile_visible, public_title, bio, profile_image_url, specialties, public_sort_order")
      .maybeSingle();
    if (error || !data) return { data: null, error: error?.message ?? tb("EMPLOYEE_UPDATE_FAILED") };

    if (input.service_ids !== undefined) {
      await supabase.from("employee_services").delete().eq("employee_id", employeeId).eq("salon_id", salonId);
      if (input.service_ids.length > 0) {
        const employeeServices = input.service_ids.map((serviceId) => ({ employee_id: employeeId, service_id: serviceId, salon_id: salonId }));
        const { error: servicesError } = await supabase.from("employee_services").insert(employeeServices);
        if (servicesError)
          return {
            data: data as Employee,
            error: servicesError.message || tb("EMPLOYEE_UPDATE_SERVICES_FAILED"),
          };
      }
    }
    return { data: data as Employee, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : tb("UNKNOWN") };
  }
}

export async function deleteEmployee(salonId: string, employeeId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("employees").update({ deleted_at: new Date().toISOString() }).eq("id", employeeId).eq("salon_id", salonId).is("deleted_at", null);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : tb("UNKNOWN") };
  }
}

export async function toggleEmployeeActive(salonId: string, employeeId: string, currentStatus: boolean): Promise<{ data: Employee | null; error: string | null }> {
  return updateEmployee(salonId, employeeId, { is_active: !currentStatus });
}
