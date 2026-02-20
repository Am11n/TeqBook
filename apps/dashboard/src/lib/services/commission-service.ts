import { supabase } from "@/lib/supabase-client";
import {
  getCommissionRules,
  getRuleForEmployee,
  upsertCommissionRule,
  deleteCommissionRule as deleteCommissionRuleRepo,
  type CommissionRule,
} from "@/lib/repositories/commission-rules";

export type { CommissionRule };

export type EmployeeCommissionReport = {
  employeeId: string;
  employeeName: string;
  bookingsCount: number;
  revenueGeneratedCents: number;
  commissionEarnedCents: number;
  netToSalonCents: number;
  rule: CommissionRule | null;
};

export async function listRules(salonId: string) {
  return getCommissionRules(salonId);
}

export async function saveRule(input: {
  salonId: string;
  employeeId?: string | null;
  commissionType: "percentage" | "fixed_per_booking";
  rate: number;
  appliesTo: "services" | "products" | "both";
}) {
  if (input.rate < 0) return { data: null, error: "Rate must be non-negative" };
  if (input.commissionType === "percentage" && input.rate > 1) {
    return { data: null, error: "Percentage rate must be between 0 and 1 (e.g. 0.30 for 30%)" };
  }

  return upsertCommissionRule({
    salon_id: input.salonId,
    employee_id: input.employeeId ?? null,
    commission_type: input.commissionType,
    rate: input.rate,
    applies_to: input.appliesTo,
  });
}

export async function deleteRule(salonId: string, ruleId: string) {
  return deleteCommissionRuleRepo(salonId, ruleId);
}

/**
 * Calculate commission report for all employees in a date range.
 * Commission is computed at report time — no data stored per booking.
 */
export async function calculateCommissionReport(
  salonId: string,
  startDate: string,
  endDate: string
): Promise<{ data: EmployeeCommissionReport[] | null; error: string | null }> {
  try {
    // Get all completed bookings in the date range with employee info
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, employee_id, services(price_cents), employees(id, full_name)")
      .eq("salon_id", salonId)
      .eq("status", "completed")
      .gte("start_time", startDate)
      .lte("start_time", endDate);

    if (bookingsError) return { data: null, error: bookingsError.message };
    if (!bookings || bookings.length === 0) return { data: [], error: null };

    // Group bookings by employee
    const byEmployee: Record<string, {
      name: string;
      bookings: Array<{ price_cents: number }>;
    }> = {};

    for (const b of bookings) {
      const emp = b.employees as unknown as { id: string; full_name: string } | null;
      const svc = b.services as unknown as { price_cents: number } | null;
      if (!emp?.id) continue;

      if (!byEmployee[emp.id]) {
        byEmployee[emp.id] = { name: emp.full_name || "Unknown", bookings: [] };
      }
      byEmployee[emp.id].bookings.push({ price_cents: svc?.price_cents ?? 0 });
    }

    // Calculate commission per employee
    const reports: EmployeeCommissionReport[] = [];

    for (const [empId, { name, bookings: empBookings }] of Object.entries(byEmployee)) {
      const { data: rule } = await getRuleForEmployee(salonId, empId);

      const revenueGenerated = empBookings.reduce((sum, b) => sum + b.price_cents, 0);
      let commissionEarned = 0;

      if (rule) {
        if (rule.commission_type === "percentage") {
          commissionEarned = Math.round(revenueGenerated * rule.rate);
        } else {
          commissionEarned = Math.round(rule.rate * empBookings.length);
        }
      }

      reports.push({
        employeeId: empId,
        employeeName: name,
        bookingsCount: empBookings.length,
        revenueGeneratedCents: revenueGenerated,
        commissionEarnedCents: commissionEarned,
        netToSalonCents: revenueGenerated - commissionEarned,
        rule,
      });
    }

    reports.sort((a, b) => b.revenueGeneratedCents - a.revenueGeneratedCents);
    return { data: reports, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
