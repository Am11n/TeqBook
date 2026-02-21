"use client";

import { useState, useEffect } from "react";
import { Clock, User, Scissors, CalendarClock, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/types";

interface NextBookingSidebarProps {
  bookings: Booking[];
  locale: string;
  timezone?: string;
  hour12?: boolean;
  translations: {
    sidebarNextCustomer: string;
    sidebarNoUpcoming: string;
    sidebarStartTreatment: string;
    sidebarCancelBooking: string;
  };
  onComplete?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

function getNextBooking(bookings: Booking[]): Booking | null {
  const now = Date.now();
  return (
    bookings.find((b) => {
      const start = new Date(b.start_time).getTime();
      const isUpcoming = start > now;
      const isActive =
        b.status === "confirmed" || b.status === "scheduled" || b.status === "pending";
      return isUpcoming && isActive;
    }) ?? null
  );
}

function formatCountdown(ms: number, isNb: boolean, startIso: string): string {
  if (ms <= 0) return isNb ? "Nå" : "Now";
  const totalMin = Math.floor(ms / 60_000);

  if (totalMin >= 24 * 60) {
    const date = new Date(startIso);
    const day = date.toLocaleDateString(isNb ? "nb-NO" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    return day;
  }

  if (totalMin < 60) return isNb ? `om ${totalMin} min` : `in ${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return isNb ? `om ${h} t` : `in ${h}h`;
  return isNb ? `om ${h} t ${m} min` : `in ${h}h ${m}m`;
}

function formatTimeStr(iso: string, locale: string, timezone?: string, hour12?: boolean): string {
  const date = new Date(iso);
  try {
    return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
      ...(hour12 !== undefined ? { hour12 } : {}),
    });
  } catch {
    return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function NextBookingSidebar({
  bookings,
  locale,
  timezone,
  hour12,
  translations: t,
  onComplete,
  onCancel,
}: NextBookingSidebarProps) {
  const [now, setNow] = useState(Date.now());
  const isNb = locale === "nb";

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = getNextBooking(bookings);

  if (!next) {
    return (
      <div className="sticky top-4 w-64 shrink-0 rounded-xl border-2 border-border/60 bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">
          {t.sidebarNextCustomer}
        </p>
        <p className="mt-3 text-xs text-muted-foreground/70">
          {t.sidebarNoUpcoming}
        </p>
      </div>
    );
  }

  const startMs = new Date(next.start_time).getTime();
  const diff = startMs - now;
  const countdown = formatCountdown(diff, isNb, next.start_time);
  const timeStr = formatTimeStr(next.start_time, locale, timezone, hour12);
  const canComplete = next.status === "confirmed";

  return (
    <div className="sticky top-4 w-64 shrink-0 rounded-xl border-2 border-border/60 bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">
        {t.sidebarNextCustomer}
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold tabular-nums">
            {timeStr}
          </span>
          <span className="text-xs text-muted-foreground">
            ({countdown})
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate font-medium">
            {next.customers?.full_name ?? (isNb ? "Ukjent kunde" : "Unknown customer")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">
            {next.services?.name ?? (isNb ? "Ukjent tjeneste" : "Unknown service")}
          </span>
        </div>

        {next.employees?.full_name && (
          <div className="flex items-center gap-2 text-sm">
            <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate text-muted-foreground">
              {next.employees.full_name}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {canComplete && onComplete && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onComplete(next)}
          >
            {t.sidebarStartTreatment}
          </Button>
        )}
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onCancel(next)}
          >
            {t.sidebarCancelBooking}
          </Button>
        )}
      </div>
    </div>
  );
}
