import { getBookingClasses, getEmployeeAccentByIndex } from "@/lib/ui/calendar-theme";
import type { CalendarBooking } from "@/lib/types";

function statusDotColor(status: string): string {
  switch (status) {
    case "confirmed": return "bg-blue-500";
    case "pending": return "bg-amber-500";
    case "completed": return "bg-emerald-500";
    case "cancelled": return "bg-red-400";
    case "no-show": return "bg-orange-500";
    default: return "bg-zinc-400";
  }
}

interface MobileBookingCardProps {
  booking: CalendarBooking;
  height: number;
  showEmployee: boolean;
  employeeIndex?: number;
  formatTime: (iso: string) => string;
  onClick?: (booking: CalendarBooking) => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

export function MobileBookingCard({
  booking,
  height,
  showEmployee,
  employeeIndex,
  formatTime,
  onClick,
  translations,
}: MobileBookingCardProps) {
  const classes = getBookingClasses(booking.status);
  const empAccent = employeeIndex != null ? getEmployeeAccentByIndex(employeeIndex) : null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(booking);
      }}
      className={`w-full text-left overflow-hidden rounded-lg px-3 py-2 active:scale-[0.98] transition-transform ${classes.card}`}
      style={{ minHeight: `${Math.max(height, 40)}px` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold tabular-nums ${classes.subtitle}`}>
          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
        </span>
        {booking.status && (
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor(booking.status)}`} />
            <span className={`text-[10px] capitalize ${classes.subtitle}`}>
              {booking.status}
            </span>
          </span>
        )}
      </div>
      <p className={`text-sm font-semibold leading-tight truncate mt-0.5 ${classes.title}`}>
        {booking.customers?.full_name ?? translations.unknownCustomer}
      </p>
      <p className={`text-xs leading-tight truncate ${classes.subtitle}`}>
        {booking.services?.name ?? translations.unknownService}
      </p>
      {showEmployee && booking.employees?.full_name && (
        <p className={`text-[11px] leading-tight truncate flex items-center gap-1 ${classes.subtitle}`}>
          {empAccent && <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${empAccent.dot}`} />}
          {booking.employees.full_name}
        </p>
      )}
    </button>
  );
}
