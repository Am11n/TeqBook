"use client";

import { useState } from "react";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { formatTimeInTimezone } from "@/lib/utils/timezone";
import { getBookingClasses } from "@/lib/ui/calendar-theme";

interface BookingEventProps {
  booking: CalendarBooking;
  style?: React.CSSProperties;
  onClick?: (booking: CalendarBooking) => void;
  isSelected?: boolean;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

function formatTimeRange(booking: CalendarBooking, timezone: string): string {
  try {
    const startTime = formatTimeInTimezone(booking.start_time, timezone, "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = formatTimeInTimezone(booking.end_time, timezone, "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startTime} – ${endTime}`;
  } catch {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} – ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
  }
}

export function BookingEvent({
  booking,
  style,
  onClick,
  isSelected,
  translations,
}: BookingEventProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const [showHover, setShowHover] = useState(false);

  const height = style?.height ? parseInt(String(style.height)) : 40;
  const isCompact = height < 50;
  const problems = booking._problems || [];
  const classes = getBookingClasses(booking.status);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(booking);
        }}
        className={`cursor-pointer overflow-hidden ${densityPadding()} ${classes.card} ${isSelected ? "ring-2 ring-ring ring-offset-1" : ""} ${onClick ? "hover:shadow-md" : ""}`}
        style={{
          ...style,
          minHeight: "36px",
        }}
      >
        {/* Problem badges */}
        {problems.length > 0 && (
          <div className="absolute top-0.5 right-0.5 flex gap-0.5">
            {problems.includes("conflict") && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Conflict" />
            )}
            {problems.includes("unpaid") && (
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" title="Unpaid" />
            )}
            {problems.includes("unconfirmed") && (
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" title="Unconfirmed" />
            )}
            {problems.includes("missing_contact") && (
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" title="Missing contact" />
            )}
          </div>
        )}

        {/* Service name */}
        <p className={`text-xs font-semibold truncate leading-tight pr-4 ${classes.title}`}>
          {booking.services?.name ?? translations.unknownService}
        </p>

        {/* Time */}
        <p className={`text-[11px] leading-tight ${classes.subtitle}`}>
          {formatTimeRange(booking, timezone)}
        </p>

        {/* Customer (only if not too compact) */}
        {!isCompact && (
          <p className={`text-xs font-medium truncate leading-tight ${classes.subtitle}`}>
            {booking.customers?.full_name ?? translations.unknownCustomer}
            {booking.is_walk_in && (
              <span className="ml-1 text-[10px] px-1 rounded bg-muted text-muted-foreground">
                walk-in
              </span>
            )}
          </p>
        )}

        {/* New customer badge */}
        {!isCompact && problems.includes("new_customer") && (
          <span className="inline-block mt-0.5 text-[10px] px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            New
          </span>
        )}
      </div>

      {/* Hover preview card */}
      {showHover && (
        <div className="absolute left-full top-0 ml-2 z-30 w-56 rounded-lg border bg-popover p-3 shadow-lg text-xs pointer-events-none animate-in fade-in-0 zoom-in-95">
          <p className="font-semibold text-sm">
            {booking.customers?.full_name ?? translations.unknownCustomer}
          </p>
          {booking.customers?.phone && (
            <p className="text-muted-foreground mt-0.5">{booking.customers.phone}</p>
          )}
          <div className="mt-2 space-y-1 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Service:</span>{" "}
              {booking.services?.name ?? "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Time:</span>{" "}
              {formatTimeRange(booking, timezone)}
            </p>
            {booking.services?.duration_minutes && (
              <p>
                <span className="font-medium text-foreground">Duration:</span>{" "}
                {(booking.services.prep_minutes || 0) > 0 && (
                  <span className="text-amber-600">{booking.services.prep_minutes}m prep + </span>
                )}
                {booking.services.duration_minutes}m
                {(booking.services.cleanup_minutes || 0) > 0 && (
                  <span className="text-amber-600"> + {booking.services.cleanup_minutes}m cleanup</span>
                )}
              </p>
            )}
            {booking.services?.price_cents != null && (
              <p>
                <span className="font-medium text-foreground">Price:</span>{" "}
                {(booking.services.price_cents / 100).toFixed(0)} kr
              </p>
            )}
            <p>
              <span className="font-medium text-foreground">Status:</span>{" "}
              <span className="capitalize">{booking.status}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Type:</span>{" "}
              {booking.is_walk_in ? "Walk-in" : "Online"}
            </p>
            {booking.notes && (
              <p className="mt-1 italic text-[10px] border-t pt-1">
                {booking.notes.length > 80
                  ? booking.notes.slice(0, 80) + "..."
                  : booking.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function densityPadding(): string {
  return "px-2 py-1";
}
