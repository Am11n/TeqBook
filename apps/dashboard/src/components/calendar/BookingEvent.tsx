"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { formatTimeInTimezone, getHoursInTimezone, getMinutesInTimezone } from "@/lib/utils/timezone";
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

function formatTimeRange(booking: CalendarBooking, timezone: string, locale: string): string {
  try {
    const startTime = formatTimeInTimezone(booking.start_time, timezone, locale, {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = formatTimeInTimezone(booking.end_time, timezone, locale, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startTime} – ${endTime}`;
  } catch {
    const sH = getHoursInTimezone(booking.start_time, timezone);
    const sM = getMinutesInTimezone(booking.start_time, timezone);
    const eH = getHoursInTimezone(booking.end_time, timezone);
    const eM = getMinutesInTimezone(booking.end_time, timezone);
    return `${sH.toString().padStart(2, "0")}:${sM.toString().padStart(2, "0")} – ${eH.toString().padStart(2, "0")}:${eM.toString().padStart(2, "0")}`;
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
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setHoverPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const height = style?.height ? parseInt(String(style.height)) : 40;
  const isCompact = height < 50;
  const problems = booking._problems || [];
  const classes = getBookingClasses(booking.status);

  // Separate layout styles (position/size for DayView grid) from visual styles
  const { position, top: styleTop, left: styleLeft, width: styleWidth, zIndex: styleZIndex, height: styleHeight, ...visualStyle } = (style || {}) as React.CSSProperties & Record<string, unknown>;
  const layoutStyle: React.CSSProperties = { position, top: styleTop, left: styleLeft, width: styleWidth, zIndex: styleZIndex, height: styleHeight } as React.CSSProperties;

  return (
    <div
      ref={cardRef}
      className="group"
      style={layoutStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(booking);
        }}
        className={`cursor-pointer overflow-hidden ${densityPadding()} ${classes.card} ${isSelected ? "ring-2 ring-ring ring-offset-1" : ""} ${onClick ? "hover:shadow-md" : ""}`}
        style={{
          ...visualStyle,
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
          {formatTimeRange(booking, timezone, appLocale)}
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

      {/* Hover preview card — rendered via portal to escape overflow:auto */}
      {hoverPos && createPortal(
        <div
          className="fixed z-50 w-56 rounded-lg border bg-popover p-3 shadow-lg text-xs pointer-events-none animate-in fade-in-0 zoom-in-95"
          style={{
            top: `${hoverPos.top - 8}px`,
            left: `${hoverPos.left}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
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
              {formatTimeRange(booking, timezone, appLocale)}
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
          {/* Small arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-3 w-3 rotate-45 border-b border-r bg-popover" />
        </div>,
        document.body
      )}
    </div>
  );
}

function densityPadding(): string {
  return "px-2 py-1";
}
