import { supabase } from "@/lib/supabase-client";

export type Package = {
  id: string;
  salon_id: string;
  name: string;
  description: string | null;
  included_services: Array<{ service_id: string; quantity: number }>;
  price_cents: number;
  validity_days: number;
  is_active: boolean;
  created_at: string;
};

export type CustomerPackage = {
  id: string;
  salon_id: string;
  customer_id: string;
  package_id: string;
  remaining_services: Array<{ service_id: string; remaining: number }>;
  purchased_at: string;
  expires_at: string | null;
  package?: Package;
  customer?: { full_name: string };
};

export async function getPackages(
  salonId: string
): Promise<{ data: Package[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as Package[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createPackage(input: {
  salon_id: string;
  name: string;
  description?: string | null;
  included_services: Array<{ service_id: string; quantity: number }>;
  price_cents: number;
  validity_days: number;
}): Promise<{ data: Package | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("packages")
      .insert({
        salon_id: input.salon_id,
        name: input.name,
        description: input.description ?? null,
        included_services: input.included_services,
        price_cents: input.price_cents,
        validity_days: input.validity_days,
      })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Package, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updatePackage(
  salonId: string,
  packageId: string,
  updates: Partial<Pick<Package, "name" | "description" | "included_services" | "price_cents" | "validity_days" | "is_active">>
): Promise<{ data: Package | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("packages")
      .update(updates)
      .eq("id", packageId)
      .eq("salon_id", salonId)
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Package, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sellPackageToCustomer(input: {
  salon_id: string;
  customer_id: string;
  package_id: string;
  remaining_services: Array<{ service_id: string; remaining: number }>;
  expires_at?: string | null;
}): Promise<{ data: CustomerPackage | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("customer_packages")
      .insert({
        salon_id: input.salon_id,
        customer_id: input.customer_id,
        package_id: input.package_id,
        remaining_services: input.remaining_services,
        expires_at: input.expires_at ?? null,
      })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as CustomerPackage, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getCustomerPackages(
  salonId: string,
  customerId: string
): Promise<{ data: CustomerPackage[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("customer_packages")
      .select("*, package:packages(id, name, price_cents, included_services)")
      .eq("salon_id", salonId)
      .eq("customer_id", customerId)
      .order("purchased_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as CustomerPackage[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function redeemServiceFromPackage(
  salonId: string,
  customerPackageId: string,
  serviceId: string
): Promise<{ data: CustomerPackage | null; error: string | null }> {
  try {
    const { data: cp, error: fetchErr } = await supabase
      .from("customer_packages")
      .select("remaining_services, expires_at")
      .eq("id", customerPackageId)
      .eq("salon_id", salonId)
      .single();

    if (fetchErr || !cp) return { data: null, error: fetchErr?.message ?? "Package not found" };
    if (cp.expires_at && new Date(cp.expires_at) < new Date()) return { data: null, error: "Package has expired" };

    const services = cp.remaining_services as Array<{ service_id: string; remaining: number }>;
    const idx = services.findIndex((s) => s.service_id === serviceId && s.remaining > 0);
    if (idx === -1) return { data: null, error: "No remaining uses for this service" };

    services[idx].remaining -= 1;

    const { data, error } = await supabase
      .from("customer_packages")
      .update({ remaining_services: services })
      .eq("id", customerPackageId)
      .eq("salon_id", salonId)
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as CustomerPackage, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
