// =====================================================
// Setup Health Engine
// =====================================================
// Pure functions that compute setup issues for entities.
// All badge/banner components consume Issue[] from these functions.
// Logic lives in one place -- fully testable, no side effects.
//
// Labels are passed in so the engine stays locale-agnostic.
// Each caller provides labels from their i18n context.

import type { Employee, Service, Customer, Shift } from "@/lib/types";

export type IssueSeverity = "error" | "warning" | "info";

export type Issue = {
  key: string;
  label: string;
  severity: IssueSeverity;
};

/** Default English labels -- used when no labels are supplied */
const defaultLabels = {
  inactive: "Inactive",
  noServices: "Missing services",
  noShifts: "Missing shifts",
  noContact: "Missing contact info",
  notBookable: "Not bookable",
  noEmployees: "No staff assigned",
  noGdpr: "Missing GDPR consent",
  noActiveEmployees: "No active staff",
  noActiveServices: "No active services",
  noEmployeesWithServices: "No staff have services assigned",
  noEmployeesWithShifts: "No staff have shifts",
};

export type HealthLabels = Partial<typeof defaultLabels>;

function l(labels: HealthLabels | undefined, key: keyof typeof defaultLabels): string {
  return labels?.[key] ?? defaultLabels[key];
}

// ---------------------------------------------------------------------------
// Employee setup issues
// ---------------------------------------------------------------------------

export function getEmployeeSetupIssues(
  employee: Employee,
  ctx: { services: Service[]; shifts: Shift[]; hasShiftsFeature?: boolean },
  labels?: HealthLabels,
): Issue[] {
  const issues: Issue[] = [];
  const shiftsRequired = ctx.hasShiftsFeature !== false;

  if (!employee.is_active) {
    issues.push({
      key: "inactive",
      label: l(labels, "inactive"),
      severity: "info",
    });
  }

  if (ctx.services.length === 0) {
    issues.push({
      key: "no_services",
      label: l(labels, "noServices"),
      severity: "warning",
    });
  }

  if (shiftsRequired && ctx.shifts.length === 0) {
    issues.push({
      key: "no_shifts",
      label: l(labels, "noShifts"),
      severity: "warning",
    });
  }

  if (!employee.email && !employee.phone) {
    issues.push({
      key: "no_contact",
      label: l(labels, "noContact"),
      severity: "info",
    });
  }

  // Bookable = active + has services (+ has shifts only when the feature exists)
  const hasServices = ctx.services.length > 0;
  const hasShifts = !shiftsRequired || ctx.shifts.length > 0;
  const isBookable = employee.is_active && hasServices && hasShifts;
  if (!isBookable && employee.is_active) {
    issues.push({
      key: "not_bookable",
      label: l(labels, "notBookable"),
      severity: "error",
    });
  }

  return issues;
}

/**
 * Check if an employee can receive bookings.
 * When hasShiftsFeature is false (e.g. Starter plan), shifts are not required.
 */
export function isEmployeeBookable(
  employee: Employee,
  ctx: { services: Service[]; shifts: Shift[]; hasShiftsFeature?: boolean },
): boolean {
  const shiftsRequired = ctx.hasShiftsFeature !== false;
  return (
    employee.is_active &&
    ctx.services.length > 0 &&
    (!shiftsRequired || ctx.shifts.length > 0)
  );
}

// ---------------------------------------------------------------------------
// Service setup issues
// ---------------------------------------------------------------------------

export function getServiceSetupIssues(
  service: Service,
  ctx: { employeeCount: number },
  labels?: HealthLabels,
): Issue[] {
  const issues: Issue[] = [];

  if (!service.is_active) {
    issues.push({
      key: "inactive",
      label: l(labels, "inactive"),
      severity: "info",
    });
  }

  if (ctx.employeeCount === 0) {
    issues.push({
      key: "no_employees",
      label: l(labels, "noEmployees"),
      severity: "warning",
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Customer issues
// ---------------------------------------------------------------------------

export function getCustomerIssues(customer: Customer, labels?: HealthLabels): Issue[] {
  const issues: Issue[] = [];

  if (!customer.email && !customer.phone) {
    issues.push({
      key: "no_contact",
      label: l(labels, "noContact"),
      severity: "warning",
    });
  }

  if (!customer.gdpr_consent) {
    issues.push({
      key: "no_gdpr",
      label: l(labels, "noGdpr"),
      severity: "warning",
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Booking blockers (salon-wide)
// ---------------------------------------------------------------------------

export function getBookingBlockers(
  ctx: {
    employees: Employee[];
    services: Service[];
    employeeServicesMap: Record<string, Service[]>;
    employeeShiftsMap: Record<string, Shift[]>;
    hasShiftsFeature?: boolean;
  },
  labels?: HealthLabels,
): Issue[] {
  const issues: Issue[] = [];
  const shiftsRequired = ctx.hasShiftsFeature !== false;

  const activeEmployees = ctx.employees.filter((e) => e.is_active);

  if (activeEmployees.length === 0) {
    issues.push({
      key: "no_active_employees",
      label: l(labels, "noActiveEmployees"),
      severity: "error",
    });
    return issues;
  }

  if (ctx.services.filter((s) => s.is_active).length === 0) {
    issues.push({
      key: "no_active_services",
      label: l(labels, "noActiveServices"),
      severity: "error",
    });
    return issues;
  }

  const employeesWithServices = activeEmployees.filter(
    (e) => (ctx.employeeServicesMap[e.id]?.length ?? 0) > 0,
  );

  if (employeesWithServices.length === 0) {
    issues.push({
      key: "no_employees_with_services",
      label: l(labels, "noEmployeesWithServices"),
      severity: "error",
    });
  }

  if (shiftsRequired) {
    const employeesWithShifts = activeEmployees.filter(
      (e) => (ctx.employeeShiftsMap[e.id]?.length ?? 0) > 0,
    );

    if (employeesWithShifts.length === 0) {
      issues.push({
        key: "no_employees_with_shifts",
        label: l(labels, "noEmployeesWithShifts"),
        severity: "error",
      });
    }
  }

  return issues;
}
