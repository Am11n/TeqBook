"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

type PerformanceData = {
  bookingsCount: number;
  newCustomersCount: number;
  topService: string | null;
  mostBookedStaff: string | null;
  chartData: { day: string; bookings: number }[];
};

interface PerformanceSnapshotCardProps {
  loading: boolean;
  performanceData: PerformanceData | null;
  translations: {
    totalBookingsThisWeek: string;
    returningCustomers: string;
    revenueEstimate: string;
    noInsightsYet: string;
  };
}

export function PerformanceSnapshotCard({
  loading,
  performanceData,
  translations,
}: PerformanceSnapshotCardProps) {
  if (loading) {
    return (
      <div className="group mt-8 rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border min-h-[240px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-lg animate-shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl animate-shimmer" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-lg animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!performanceData || performanceData.bookingsCount === 0) {
    return (
      <div className="group mt-8 rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border min-h-[240px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        {/* KPI Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{translations.totalBookingsThisWeek}</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{translations.returningCustomers}</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{translations.revenueEstimate}</p>
            <p className="text-2xl font-bold text-foreground">$0</p>
          </div>
        </div>

        {/* Placeholder Chart */}
        <div className="mb-4">
          <div className="h-32 w-full rounded-lg bg-muted/50 border border-border flex items-end justify-between gap-1 px-2 py-2">
            {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
              <div key={index} className="flex-1 h-full flex items-end">
                <div
                  className="w-full rounded-t bg-muted-foreground/20"
                  style={{ height: "25%", minHeight: "8px" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Empty State Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{translations.noInsightsYet}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group mt-8 rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border min-h-[240px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '150ms' }}>
      {/* KPI Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">{translations.totalBookingsThisWeek}</p>
          <p className="text-2xl font-bold text-foreground">{performanceData.bookingsCount}</p>
        </div>
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">{translations.returningCustomers}</p>
          <p className="text-2xl font-bold text-foreground">{performanceData.newCustomersCount}</p>
        </div>
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">{translations.revenueEstimate}</p>
          <p className="text-2xl font-bold text-foreground">$0</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 w-full rounded-lg bg-muted/50 border border-border flex items-end justify-between gap-1 px-2 py-2">
        {performanceData.chartData.map((data, index) => {
          const maxBookings = Math.max(
            ...performanceData.chartData.map((d) => d.bookings),
            1
          );
          const height = (data.bookings / maxBookings) * 100;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 h-full justify-end gap-1"
            >
              <div
                className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-blue-700 to-blue-500 opacity-80 hover:opacity-100"
                style={{ height: `${height}%`, minHeight: "8px" }}
              />
              <span className="text-[10px] text-muted-foreground">{data.day}</span>
              <span className="text-[10px] font-medium text-foreground">{data.bookings}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

