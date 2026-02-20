import type { TimeFilter } from "../_types";
import type { Booking } from "@/lib/types";

export function filterBookings(
  bookings: Booking[],
  filterEmployeeId: string,
  timeFilter: TimeFilter
): Booking[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const tomorrowEnd = new Date(todayStart.getTime() + 2 * 86_400_000);
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(todayStart.getTime() + mondayOffset * 86_400_000);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const twoHoursFromNow = now.getTime() + 2 * 60 * 60 * 1000;

  let filtered = bookings.filter((b) => {
    if (filterEmployeeId !== "all" && b.employee_id !== filterEmployeeId) return false;
    const start = new Date(b.start_time).getTime();
    const end = new Date(b.end_time).getTime();
    switch (timeFilter) {
      case "today": return start >= todayStart.getTime() && start < todayEnd.getTime();
      case "tomorrow": return start >= todayEnd.getTime() && start < tomorrowEnd.getTime();
      case "this_week": return start >= weekStart.getTime() && start < weekEnd.getTime();
      case "next_2h": return start > now.getTime() && start <= twoHoursFromNow && b.status !== "completed" && b.status !== "cancelled";
      case "needs_action": return (b.status === "pending" || b.status === "no-show") && end >= now.getTime();
      case "cancelled": return b.status === "cancelled";
      case "history": return end < now.getTime() || b.status === "completed" || b.status === "cancelled";
      default: return true;
    }
  });

  if (timeFilter === "history") {
    filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  } else {
    filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }
  return filtered;
}
