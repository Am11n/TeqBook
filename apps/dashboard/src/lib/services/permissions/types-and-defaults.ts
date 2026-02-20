import type { UserRole } from "@/lib/utils/access-control";

export type Resource = "bookings" | "customers" | "employees" | "services" | "products" | "shifts" | "reports" | "settings" | "billing" | "notifications";
export type Action = "view" | "create" | "edit" | "delete";
export type Permission = { resource: Resource; action: Action; allowed: boolean };
export type RolePermissions = Record<Resource, Record<Action, boolean>>;

const FULL_ACCESS: Record<Action, boolean> = { view: true, create: true, edit: true, delete: true };
const VIEW_ONLY: Record<Action, boolean> = { view: true, create: false, edit: false, delete: false };
const NO_ACCESS: Record<Action, boolean> = { view: false, create: false, edit: false, delete: false };
const NO_DELETE: Record<Action, boolean> = { view: true, create: true, edit: true, delete: false };

export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superadmin: {
    bookings: FULL_ACCESS, customers: FULL_ACCESS, employees: FULL_ACCESS, services: FULL_ACCESS,
    products: FULL_ACCESS, shifts: FULL_ACCESS, reports: FULL_ACCESS, settings: FULL_ACCESS,
    billing: FULL_ACCESS, notifications: FULL_ACCESS,
  },
  owner: {
    bookings: FULL_ACCESS, customers: FULL_ACCESS, employees: FULL_ACCESS, services: FULL_ACCESS,
    products: FULL_ACCESS, shifts: FULL_ACCESS, reports: FULL_ACCESS, settings: FULL_ACCESS,
    billing: FULL_ACCESS, notifications: FULL_ACCESS,
  },
  manager: {
    bookings: FULL_ACCESS, customers: NO_DELETE, employees: NO_DELETE, services: NO_DELETE,
    products: NO_DELETE, shifts: FULL_ACCESS, reports: VIEW_ONLY, settings: VIEW_ONLY,
    billing: NO_ACCESS, notifications: NO_DELETE,
  },
  staff: {
    bookings: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: false, delete: false },
    employees: VIEW_ONLY, services: VIEW_ONLY, products: VIEW_ONLY, shifts: VIEW_ONLY,
    reports: NO_ACCESS, settings: NO_ACCESS, billing: NO_ACCESS, notifications: VIEW_ONLY,
  },
};

export function getAllResources(): Resource[] {
  return ["bookings", "customers", "employees", "services", "products", "shifts", "reports", "settings", "billing", "notifications"];
}

export function getAllActions(): Action[] {
  return ["view", "create", "edit", "delete"];
}

export function getResourceDisplayName(resource: Resource): string {
  const names: Record<Resource, string> = {
    bookings: "Bookings", customers: "Customers", employees: "Employees", services: "Services",
    products: "Products", shifts: "Shifts", reports: "Reports", settings: "Settings",
    billing: "Billing", notifications: "Notifications",
  };
  return names[resource] ?? resource;
}

export function getActionDisplayName(action: Action): string {
  const names: Record<Action, string> = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };
  return names[action] ?? action;
}
