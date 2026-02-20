import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/services/customer-history-service";
import type { CustomerBookingHistoryItem } from "@/lib/repositories/bookings";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
  scheduled: "bg-purple-100 text-purple-800",
};

export { statusColors };

export function BookingCard({
  booking,
  locale,
  fmtPrice,
}: {
  booking: CustomerBookingHistoryItem;
  locale: string;
  fmtPrice: (cents: number) => string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{booking.service_name || "Unknown service"}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDate(booking.start_time, locale)} at{" "}
            {new Date(booking.start_time).toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {booking.employee_name && (
            <div className="mt-1 text-xs text-muted-foreground">
              with {booking.employee_name}
            </div>
          )}
        </div>
        <div className="text-right">
          <Badge className={statusColors[booking.status] || "bg-gray-100"}>
            {booking.status}
          </Badge>
          {booking.service_price_cents && (
            <div className="mt-1 text-sm font-medium">
              {fmtPrice(booking.service_price_cents)}
            </div>
          )}
        </div>
      </div>
      {booking.notes && (
        <div className="mt-2 text-xs text-muted-foreground">{booking.notes}</div>
      )}
    </div>
  );
}
