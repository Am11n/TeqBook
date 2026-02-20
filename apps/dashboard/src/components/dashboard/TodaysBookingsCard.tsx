"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils/dashboard/dashboard-utils";
import { useCurrentSalon } from "@/components/salon-provider";

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
};

interface TodaysBookingsCardProps {
  loading: boolean;
  bookings: Booking[];
  bookingsCount: number;
  translations: {
    todaysBookings: string;
    noBookingsYet: string;
    noBookingsYetSubtitle: string;
    createFirstBooking: string;
    viewCalendar: string;
  };
}

export function TodaysBookingsCard({
  loading,
  bookings,
  bookingsCount,
  translations,
}: TodaysBookingsCardProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const hour12 = salon?.time_format === "12h" ? true : undefined;

  return (
    <div className="group rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '0ms' }}>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
          <Calendar className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{translations.todaysBookings}</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg animate-shimmer" />
            ))}
          </div>
        </div>
      ) : bookingsCount === 0 ? (
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground text-center">
            {translations.noBookingsYet}
          </p>
          <p className="mb-4 text-xs text-muted-foreground text-center">
            {translations.noBookingsYetSubtitle}
          </p>
          <Button asChild className="h-9 w-full">
            <Link href="/bookings">{translations.createFirstBooking}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {formatTime(booking.start_time, timezone, "en", hour12)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                      {booking.services?.name || "Service"}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {booking.customers?.full_name || "Customer"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" className="h-9 w-full">
            <Link href="/calendar">{translations.viewCalendar}</Link>
          </Button>
        </>
      )}
    </div>
  );
}

