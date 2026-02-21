"use client";

import type { Booking } from "@/lib/types";

interface BookingsSummaryProps {
  bookings: Booking[];
  translations: {
    summaryBookings: string;
    summaryNoShow: string;
    summaryNeedsAction: string;
  };
}

export function BookingsSummary({
  bookings,
  translations: t,
}: BookingsSummaryProps) {
  const total = bookings.length;
  const noShowCount = bookings.filter((b) => b.status === "no-show").length;
  const needsActionCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "no-show"
  ).length;

  const parts: string[] = [`${total} ${t.summaryBookings}`];
  if (noShowCount > 0) parts.push(`${noShowCount} ${t.summaryNoShow}`);
  if (needsActionCount > 0) parts.push(`${needsActionCount} ${t.summaryNeedsAction}`);

  return (
    <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
  );
}
