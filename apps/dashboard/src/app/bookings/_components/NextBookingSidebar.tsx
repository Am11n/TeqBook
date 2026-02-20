"use client";

import { useState, useEffect } from "react";
import { Clock, User, Scissors, CalendarClock } from "lucide-react";
import type { Booking } from "@/lib/types";

interface NextBookingSidebarProps {
  bookings: Booking[];
  locale: string;
  timezone?: string;
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

function formatTimeStr(iso: string, locale: string, timezone?: string): string {
  const date = new Date(iso);
  try {
    return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function NextBookingSidebar({ bookings, locale, timezone }: NextBookingSidebarProps) {
  const [now, setNow] = useState(Date.now());
  const isNb = locale === "nb";

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = getNextBooking(bookings);

  if (!next) {
    return (
      <div className="sticky top-4 w-64 shrink-0 rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {isNb ? "Neste kunde" : "Next customer"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground/70">
          {isNb ? "Ingen kommende bookinger" : "No upcoming bookings"}
        </p>
      </div>
    );
  }

  const startMs = new Date(next.start_time).getTime();
  const diff = startMs - now;

  return (
    <div className="sticky top-4 w-64 shrink-0 rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">
        {isNb ? "Neste kunde" : "Next customer"}
      </p>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold tabular-nums">
            {formatCountdown(diff, isNb, next.start_time)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatTimeStr(next.start_time, locale, timezone)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">
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
          <p className="text-xs text-muted-foreground">
            {next.employees.full_name}
          </p>
        )}
      </div>
    </div>
  );
}
