"use client";

import type { CalendarBooking } from "@/lib/types";
import { formatTimeRange, getStatusColor } from "@/lib/utils/calendar/calendar-utils";
import { useCurrentSalon } from "@/components/salon-provider";

interface BookingEventProps {
  booking: CalendarBooking;
  style?: React.CSSProperties;
  onClick?: (booking: CalendarBooking) => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

export function BookingEvent({
  booking,
  style,
  onClick,
  translations,
}: BookingEventProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";

  const handleClick = () => {
    if (onClick) {
      onClick(booking);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded border px-1 py-0.5 text-[10px] shadow-sm transition-all ${
        getStatusColor(booking.status)
      } ${onClick ? "hover:shadow-md" : ""}`}
      style={style}
    >
      <p className="font-medium truncate leading-tight">{booking.services?.name ?? translations.unknownService}</p>
      <p className="text-[9px] text-muted-foreground leading-tight">{formatTimeRange(booking, timezone)}</p>
      <p className="text-[9px] text-muted-foreground truncate leading-tight">
        {booking.customers?.full_name ?? translations.unknownCustomer}
      </p>
    </div>
  );
}
