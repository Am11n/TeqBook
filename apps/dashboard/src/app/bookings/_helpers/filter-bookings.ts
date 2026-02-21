import type { StatusFilter } from "../_types";
import type { Booking } from "@/lib/types";

const DESCENDING_STATUSES: (StatusFilter | null)[] = ["completed", "cancelled", "no_show"];

export function filterBookings(
  bookings: Booking[],
  statusFilter: StatusFilter | null,
  filterEmployeeId: string,
): Booking[] {
  const now = Date.now();

  const filtered = bookings.filter((b) => {
    if (filterEmployeeId !== "all" && b.employee_id !== filterEmployeeId) return false;

    if (statusFilter !== null) {
      switch (statusFilter) {
        case "upcoming": {
          const bStart = new Date(b.start_time).getTime();
          if (bStart <= now) return false;
          if (b.status !== "pending" && b.status !== "scheduled" && b.status !== "confirmed")
            return false;
          break;
        }
        case "confirmed":
          if (b.status !== "confirmed") return false;
          break;
        case "completed":
          if (b.status !== "completed") return false;
          break;
        case "cancelled":
          if (b.status !== "cancelled") return false;
          break;
        case "no_show":
          if (b.status !== "no-show") return false;
          break;
      }
    }

    return true;
  });

  const desc = DESCENDING_STATUSES.includes(statusFilter);

  filtered.sort((a, b) => {
    const diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    if (diff !== 0) return desc ? -diff : diff;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return filtered;
}
