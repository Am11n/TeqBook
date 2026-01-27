"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSalon } from "@/components/salon-provider";
import type { ReportsFilters } from "@/lib/services/reports-service";
import { useReportsData } from "@/lib/hooks/reports/useReportsData";
import { ReportsFilters as ReportsFiltersComponent } from "@/components/reports/ReportsFilters";
import { ReportsStatsGrid } from "@/components/reports/ReportsStatsGrid";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { BookingsPerServiceChart } from "@/components/reports/BookingsPerServiceChart";
import { CapacityUtilisationChart } from "@/components/reports/CapacityUtilisationChart";

export default function ReportsPage() {
  const { isReady } = useCurrentSalon();
  const [filters, setFilters] = useState<ReportsFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const {
    loading,
    error,
    employees,
    services,
    totalBookings,
    totalRevenue,
    capacityUtilisation,
    averageBookingDuration,
    revenueByMonth,
    bookingsPerService,
  } = useReportsData(filters);

  if (!isReady) {
    return (
      <DashboardShell>
        <PageHeader title="Reports" description="Analytics and insights" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Reports & Analytics" description="View insights and performance metrics" />

      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <ReportsFiltersComponent
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        employees={employees}
        services={services}
      />

      <ReportsStatsGrid
        loading={loading}
        totalBookings={totalBookings}
        totalRevenue={totalRevenue}
        capacityUtilisation={capacityUtilisation}
        averageBookingDuration={averageBookingDuration}
        revenueByMonth={revenueByMonth}
      />

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart loading={loading} revenueByMonth={revenueByMonth} />
        <BookingsPerServiceChart loading={loading} bookingsPerService={bookingsPerService} />
      </div>

      <CapacityUtilisationChart
        loading={loading}
        capacityUtilisation={capacityUtilisation}
        totalBookings={totalBookings}
        averageBookingDuration={averageBookingDuration}
      />
    </DashboardShell>
  );
}
