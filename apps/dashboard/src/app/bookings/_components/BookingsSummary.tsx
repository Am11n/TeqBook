"use client";

import type { Booking } from "@/lib/types";
import type { TimeFilter } from "../_types";

interface BookingsSummaryProps {
  bookings: Booking[];
  timeFilter: TimeFilter;
  locale: string;
  translations: {
    summaryBookings: string;
    summaryNoShow: string;
    summaryNeedsAction: string;
  };
}

function getDateLabel(timeFilter: TimeFilter, locale: string): string {
  const isNb = locale === "nb";
  const now = new Date();

  switch (timeFilter) {
    case "today": {
      const formatted = now.toLocaleDateString(isNb ? "nb-NO" : "en-US", {
        day: "numeric",
        month: "short",
      });
      return `${isNb ? "I dag" : "Today"} – ${formatted}`;
    }
    case "tomorrow": {
      const tmr = new Date(now.getTime() + 86_400_000);
      const formatted = tmr.toLocaleDateString(isNb ? "nb-NO" : "en-US", {
        day: "numeric",
        month: "short",
      });
      return `${isNb ? "I morgen" : "Tomorrow"} – ${formatted}`;
    }
    case "this_week":
      return isNb ? "Denne uken" : "This week";
    case "next_2h":
      return isNb ? "Neste 2 timer" : "Next 2 hours";
    case "needs_action":
      return isNb ? "Trenger handling" : "Needs action";
    case "cancelled":
      return isNb ? "Avbrutte" : "Cancelled";
    case "history":
      return isNb ? "Historikk" : "History";
    default:
      return "";
  }
}

export function BookingsSummary({ bookings, timeFilter, locale, translations: t }: BookingsSummaryProps) {
  const dateLabel = getDateLabel(timeFilter, locale);

  const total = bookings.length;
  const noShowCount = bookings.filter((b) => b.status === "no-show").length;
  const needsActionCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "no-show"
  ).length;

  const parts: string[] = [`${total} ${t.summaryBookings}`];
  if (noShowCount > 0) parts.push(`${noShowCount} ${t.summaryNoShow}`);
  if (needsActionCount > 0) parts.push(`${needsActionCount} ${t.summaryNeedsAction}`);

  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="font-semibold">{dateLabel}</span>
      <span className="text-muted-foreground">&middot;</span>
      <span className="text-muted-foreground">{parts.join(" · ")}</span>
    </div>
  );
}
