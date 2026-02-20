import { supabase } from "@/lib/supabase-client";

export type EmployeeUtilization = {
  employeeId: string;
  employeeName: string;
  date: string;
  availableMinutes: number;
  bookedMinutes: number;
  utilizationPct: number;
};

export type GapSlot = {
  employeeId: string;
  employeeName: string;
  date: string;
  gapStart: string;
  gapEnd: string;
  gapMinutes: number;
};

export type CapacitySummary = {
  averageUtilization: number;
  busiestDay: string | null;
  leastUtilizedEmployee: string | null;
  totalAvailableMinutes: number;
  totalBookedMinutes: number;
};

/**
 * Calculate per-employee, per-day utilization for a date range.
 */
export async function getCapacityUtilization(
  salonId: string,
  startDate: string,
  endDate: string
): Promise<{ data: { byEmployee: EmployeeUtilization[]; summary: CapacitySummary } | null; error: string | null }> {
  try {
    // Get shifts for the date range (shifts are weekly, we need to map to actual dates)
    const { data: shifts, error: shiftsErr } = await supabase
      .from("shifts")
      .select("employee_id, weekday, start_time, end_time, employees(full_name)")
      .eq("salon_id", salonId);

    if (shiftsErr) return { data: null, error: shiftsErr.message };

    // Get bookings
    const { data: bookings, error: bookingsErr } = await supabase
      .from("bookings")
      .select("employee_id, start_time, end_time, status")
      .eq("salon_id", salonId)
      .gte("start_time", startDate + "T00:00:00Z")
      .lte("start_time", endDate + "T23:59:59Z")
      .neq("status", "cancelled");

    if (bookingsErr) return { data: null, error: bookingsErr.message };

    // Build per-employee, per-date utilization
    const start = new Date(startDate);
    const end = new Date(endDate);
    const results: EmployeeUtilization[] = [];
    const employeeNames: Record<string, string> = {};

    for (const shift of shifts ?? []) {
      const emp = shift.employees as unknown as { full_name: string } | null;
      if (emp) employeeNames[shift.employee_id] = emp.full_name;
    }

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const jsWeekday = d.getDay(); // 0=Sun, 1=Mon, ...

      // Find shifts for this weekday
      const dayShifts = (shifts ?? []).filter((s) => s.weekday === jsWeekday);

      for (const shift of dayShifts) {
        const shiftStartParts = shift.start_time.split(":");
        const shiftEndParts = shift.end_time.split(":");
        const shiftStartMinutes = parseInt(shiftStartParts[0]) * 60 + parseInt(shiftStartParts[1]);
        const shiftEndMinutes = parseInt(shiftEndParts[0]) * 60 + parseInt(shiftEndParts[1]);
        const availableMinutes = shiftEndMinutes - shiftStartMinutes;

        if (availableMinutes <= 0) continue;

        // Sum booked minutes for this employee on this date
        const empBookings = (bookings ?? []).filter(
          (b) => b.employee_id === shift.employee_id && b.start_time.startsWith(dateStr)
        );

        const bookedMinutes = empBookings.reduce((sum, b) => {
          const bStart = new Date(b.start_time).getTime();
          const bEnd = new Date(b.end_time).getTime();
          return sum + (bEnd - bStart) / 60000;
        }, 0);

        results.push({
          employeeId: shift.employee_id,
          employeeName: employeeNames[shift.employee_id] || "Unknown",
          date: dateStr,
          availableMinutes,
          bookedMinutes: Math.min(bookedMinutes, availableMinutes),
          utilizationPct: availableMinutes > 0 ? Math.round((Math.min(bookedMinutes, availableMinutes) / availableMinutes) * 100) : 0,
        });
      }
    }

    // Summary
    const totalAvail = results.reduce((s, r) => s + r.availableMinutes, 0);
    const totalBooked = results.reduce((s, r) => s + r.bookedMinutes, 0);
    const avgUtil = totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 100) : 0;

    // Busiest day
    const byDay: Record<string, { avail: number; booked: number }> = {};
    for (const r of results) {
      if (!byDay[r.date]) byDay[r.date] = { avail: 0, booked: 0 };
      byDay[r.date].avail += r.availableMinutes;
      byDay[r.date].booked += r.bookedMinutes;
    }
    let busiestDay: string | null = null;
    let busiestPct = 0;
    for (const [date, val] of Object.entries(byDay)) {
      const pct = val.avail > 0 ? val.booked / val.avail : 0;
      if (pct > busiestPct) {
        busiestPct = pct;
        busiestDay = date;
      }
    }

    // Least utilized employee (aggregated across all days)
    const byEmp: Record<string, { name: string; avail: number; booked: number }> = {};
    for (const r of results) {
      if (!byEmp[r.employeeId]) byEmp[r.employeeId] = { name: r.employeeName, avail: 0, booked: 0 };
      byEmp[r.employeeId].avail += r.availableMinutes;
      byEmp[r.employeeId].booked += r.bookedMinutes;
    }
    let leastEmp: string | null = null;
    let leastPct = 101;
    for (const [, val] of Object.entries(byEmp)) {
      const pct = val.avail > 0 ? (val.booked / val.avail) * 100 : 0;
      if (pct < leastPct) {
        leastPct = pct;
        leastEmp = val.name;
      }
    }

    return {
      data: {
        byEmployee: results,
        summary: {
          averageUtilization: avgUtil,
          busiestDay,
          leastUtilizedEmployee: leastEmp,
          totalAvailableMinutes: totalAvail,
          totalBookedMinutes: totalBooked,
        },
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Find unbooked gaps > 30 min for each employee on a given date.
 */
export async function getGapAnalysis(
  salonId: string,
  date: string
): Promise<{ data: GapSlot[] | null; error: string | null }> {
  try {
    const d = new Date(date);
    const jsWeekday = d.getDay();

    const { data: shifts, error: shiftsErr } = await supabase
      .from("shifts")
      .select("employee_id, start_time, end_time, employees(full_name)")
      .eq("salon_id", salonId)
      .eq("weekday", jsWeekday);

    if (shiftsErr) return { data: null, error: shiftsErr.message };

    const { data: bookings, error: bookingsErr } = await supabase
      .from("bookings")
      .select("employee_id, start_time, end_time, status")
      .eq("salon_id", salonId)
      .gte("start_time", date + "T00:00:00Z")
      .lte("start_time", date + "T23:59:59Z")
      .neq("status", "cancelled")
      .order("start_time", { ascending: true });

    if (bookingsErr) return { data: null, error: bookingsErr.message };

    const gaps: GapSlot[] = [];

    for (const shift of shifts ?? []) {
      const emp = shift.employees as unknown as { full_name: string } | null;
      const empName = emp?.full_name || "Unknown";

      // Parse shift times
      const shiftStartParts = shift.start_time.split(":");
      const shiftEndParts = shift.end_time.split(":");
      const shiftStartMin = parseInt(shiftStartParts[0]) * 60 + parseInt(shiftStartParts[1]);
      const shiftEndMin = parseInt(shiftEndParts[0]) * 60 + parseInt(shiftEndParts[1]);

      // Get employee bookings, sorted by start time
      const empBookings = (bookings ?? [])
        .filter((b) => b.employee_id === shift.employee_id)
        .map((b) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return {
            startMin: bStart.getHours() * 60 + bStart.getMinutes(),
            endMin: bEnd.getHours() * 60 + bEnd.getMinutes(),
          };
        })
        .sort((a, b) => a.startMin - b.startMin);

      // Find gaps
      let cursor = shiftStartMin;
      for (const booking of empBookings) {
        if (booking.startMin > cursor) {
          const gapMinutes = booking.startMin - cursor;
          if (gapMinutes >= 30) {
            gaps.push({
              employeeId: shift.employee_id,
              employeeName: empName,
              date,
              gapStart: `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`,
              gapEnd: `${String(Math.floor(booking.startMin / 60)).padStart(2, "0")}:${String(booking.startMin % 60).padStart(2, "0")}`,
              gapMinutes,
            });
          }
        }
        cursor = Math.max(cursor, booking.endMin);
      }

      // Gap at end of shift
      if (shiftEndMin > cursor) {
        const gapMinutes = shiftEndMin - cursor;
        if (gapMinutes >= 30) {
          gaps.push({
            employeeId: shift.employee_id,
            employeeName: empName,
            date,
            gapStart: `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`,
            gapEnd: `${String(Math.floor(shiftEndMin / 60)).padStart(2, "0")}:${String(shiftEndMin % 60).padStart(2, "0")}`,
            gapMinutes,
          });
        }
      }
    }

    gaps.sort((a, b) => b.gapMinutes - a.gapMinutes);
    return { data: gaps, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
