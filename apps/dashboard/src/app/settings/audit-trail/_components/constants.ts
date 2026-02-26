export const resourceTypeLabels: Record<string, string> = {
  booking: "Booking",
  customer: "Customer",
  service: "Service",
  employee: "Employee",
  shift: "Shift",
  product: "Product",
  salon: "Salon",
  profile: "Profile",
  auth: "Authentication",
  billing: "Billing",
  admin: "Admin",
  security: "Security",
};

export const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  status_change: "Status Changed",
  activate: "Activated",
  deactivate: "Deactivated",
  assign: "Assigned",
  unassign: "Unassigned",
  login_success: "Login",
  login_failed: "Login Failed",
  logout: "Logout",
  password_change: "Password Changed",
  plan_changed: "Plan Changed",
};

export const actionBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  status_change: "outline",
  activate: "default",
  deactivate: "secondary",
  login_failed: "destructive",
};

export function getMetadataSummary(metadata: Record<string, unknown>, fallbackLabel = "View details"): string {
  const summaryFields = ["customer_name", "service_name", "employee_name", "product_name", "salon_name", "profile_name", "status"];
  for (const field of summaryFields) {
    if (metadata[field]) return String(metadata[field]);
  }
  return fallbackLabel;
}
