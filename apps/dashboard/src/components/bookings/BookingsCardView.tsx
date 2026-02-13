"use client";

import { Badge } from "@/components/ui/badge";
import type { Booking, Shift } from "@/lib/types";
import { formatDate, formatTime, statusColor, statusLabel, hasEmployeeAvailable } from "@/lib/utils/bookings/bookings-utils";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

interface BookingsCardViewProps {
  bookings: Booking[];
  employees: Array<{ id: string; full_name: string }>;
  shifts: Shift[];
  translations: {
    unknownService: string;
    unknownEmployee: string;
    unknownCustomer: string;
    typeWalkIn: string;
    typeOnline: string;
    statusPending: string;
    statusConfirmed: string;
    statusNoShow: string;
    statusCompleted: string;
    statusCancelled: string;
    statusScheduled: string;
  };
  locale: string;
  onCancelBooking: (booking: Booking) => void;
}

export function BookingsCardView({
  bookings,
  employees,
  shifts,
  translations,
  locale,
  onCancelBooking,
}: BookingsCardViewProps) {
  const { salon } = useCurrentSalon();
  const { locale: localeCtx } = useLocale();
  const appLocale = normalizeLocale(localeCtx);
  const salonCurrency = salon?.currency ?? "NOK";
  const timezone = salon?.timezone || "UTC";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  return (
    <div className="space-y-3 md:hidden">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="rounded-lg border bg-card px-3 py-3 text-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium">
                {booking.services?.name ?? translations.unknownService}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {booking.employees?.full_name ?? translations.unknownEmployee}
                {!hasEmployeeAvailable(booking, employees, shifts) && (
                  <span
                    className="ml-2 text-destructive"
                    title="Employee not available at this time"
                  >
                    ⚠️
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {booking.customers?.full_name ?? translations.unknownCustomer}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
            >
              {statusLabel(booking.status, translations)}
            </Badge>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {formatDate(booking.start_time, locale, timezone)} •{" "}
            {formatTime(booking.start_time, locale, timezone)} –{" "}
            {formatTime(booking.end_time, locale, timezone)} •{" "}
            {booking.is_walk_in ? translations.typeWalkIn : translations.typeOnline}
          </div>
          {booking.notes && (
            <p className="mt-2 text-[11px] text-muted-foreground">{booking.notes}</p>
          )}
          {booking.products && booking.products.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Products:</p>
              {booking.products.map((bp) => (
                <p key={bp.id} className="text-[11px] text-muted-foreground">
                  {bp.product.name} x{bp.quantity} (
                  {fmtPrice(bp.price_cents * bp.quantity)})
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

