import {
  getPackages,
  createPackage as createPackageRepo,
  updatePackage as updatePackageRepo,
  sellPackageToCustomer as sellPackageRepo,
  getCustomerPackages,
  redeemServiceFromPackage as redeemServiceRepo,
  type Package,
  type CustomerPackage,
} from "@/lib/repositories/packages";

export type { Package, CustomerPackage };

export async function listPackages(salonId: string) {
  return getPackages(salonId);
}

export async function createPackage(input: {
  salonId: string;
  name: string;
  description?: string;
  includedServices: Array<{ service_id: string; quantity: number }>;
  priceCents: number;
  validityDays: number;
}) {
  if (!input.name.trim()) return { data: null, error: "Package name is required" };
  if (input.priceCents <= 0) return { data: null, error: "Price must be positive" };
  if (input.includedServices.length === 0) return { data: null, error: "At least one service is required" };

  return createPackageRepo({
    salon_id: input.salonId,
    name: input.name.trim(),
    description: input.description ?? null,
    included_services: input.includedServices,
    price_cents: input.priceCents,
    validity_days: input.validityDays,
  });
}

export async function updatePackage(
  salonId: string,
  packageId: string,
  updates: Partial<Pick<Package, "name" | "description" | "included_services" | "price_cents" | "validity_days" | "is_active">>
) {
  return updatePackageRepo(salonId, packageId, updates);
}

export async function sellToCustomer(input: {
  salonId: string;
  customerId: string;
  packageId: string;
  pkg: Package;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.pkg.validity_days);

  const remainingServices = input.pkg.included_services.map((s) => ({
    service_id: s.service_id,
    remaining: s.quantity,
  }));

  return sellPackageRepo({
    salon_id: input.salonId,
    customer_id: input.customerId,
    package_id: input.packageId,
    remaining_services: remainingServices,
    expires_at: expiresAt.toISOString(),
  });
}

export async function getPackagesForCustomer(salonId: string, customerId: string) {
  return getCustomerPackages(salonId, customerId);
}

export async function redeemService(salonId: string, customerPackageId: string, serviceId: string) {
  return redeemServiceRepo(salonId, customerPackageId, serviceId);
}
