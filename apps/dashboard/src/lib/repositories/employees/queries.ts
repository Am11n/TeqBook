import { supabase } from "@/lib/supabase-client";
import { tb } from "@/lib/i18n/repo-error-codes";
import type { Employee, Service } from "@/lib/types";

export async function getEmployeesForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Employee[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const query = supabase
      .from("employees")
      .select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at, public_profile_visible, public_title, bio, profile_image_url, specialties, public_sort_order", { count: "exact" })
      .eq("salon_id", salonId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .range(from, to);
    const { data, error, count } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data as Employee[], error: null, total: count ?? undefined };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : tb("UNKNOWN") };
  }
}

export async function getEmployeeWithServices(
  salonId: string,
  employeeId: string
): Promise<{ data: { employee: Employee; services: Service[] } | null; error: string | null }> {
  try {
    const [{ data: employeeData, error: employeeError }, { data: servicesData, error: servicesError }] =
      await Promise.all([
        supabase.from("employees").select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at, public_profile_visible, public_title, bio, profile_image_url, specialties, public_sort_order").eq("id", employeeId).eq("salon_id", salonId).is("deleted_at", null).maybeSingle(),
        supabase.from("employee_services").select("service_id, services(id, name)").eq("employee_id", employeeId).eq("salon_id", salonId),
      ]);
    if (employeeError || servicesError)
      return {
        data: null,
        error: employeeError?.message ?? servicesError?.message ?? tb("EMPLOYEE_LOAD_FAILED"),
      };
    if (!employeeData) return { data: null, error: tb("EMPLOYEE_NOT_FOUND") };
    const services = servicesData?.map((es) => {
      if (es.services && typeof es.services === "object" && "id" in es.services && "name" in es.services) return es.services as unknown as Service;
      return null;
    }).filter((s): s is Service => s !== null) ?? [];
    return { data: { employee: employeeData as Employee, services }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : tb("UNKNOWN") };
  }
}

export async function getEmployeesWithServicesMap(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: { employees: Employee[]; servicesMap: Record<string, Service[]> } | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const [{ data: employeesData, error: employeesError, count }, { data: employeeServicesData, error: employeeServicesError }] =
      await Promise.all([
        supabase.from("employees").select("id, full_name, email, phone, role, preferred_language, is_active, deleted_at, public_profile_visible, public_title, bio, profile_image_url, specialties, public_sort_order", { count: "exact" }).eq("salon_id", salonId).is("deleted_at", null).order("created_at", { ascending: true }).range(from, to),
        supabase.from("employee_services").select("employee_id, service_id, services(id, name)").eq("salon_id", salonId),
      ]);
    if (employeesError || employeeServicesError)
      return {
        data: null,
        error: employeesError?.message ?? employeeServicesError?.message ?? tb("EMPLOYEES_LOAD_FAILED"),
      };
    const servicesMap: Record<string, Service[]> = {};
    if (employeeServicesData) {
      for (const es of employeeServicesData) {
        if (!servicesMap[es.employee_id]) servicesMap[es.employee_id] = [];
        if (es.services && typeof es.services === "object" && "id" in es.services && "name" in es.services) servicesMap[es.employee_id].push(es.services as unknown as Service);
      }
    }
    return { data: { employees: (employeesData ?? []) as Employee[], servicesMap }, error: null, total: count ?? undefined };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : tb("UNKNOWN") };
  }
}
