"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorBoundary } from "@/components/error-boundary";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatures } from "@/lib/hooks/use-features";
import { useDashboardData } from "@/lib/hooks/dashboard/useDashboardData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TodaysBookingsCard } from "@/components/dashboard/TodaysBookingsCard";
import { StaffOverviewCard } from "@/components/dashboard/StaffOverviewCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { PerformanceSnapshotCard } from "@/components/dashboard/PerformanceSnapshotCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";

type TimeRange = "daily" | "weekly" | "monthly";

// With basePath /dashboard, app root is at teqbook.com/dashboard – only one route to avoid /dashboard/dashboard/
export default function DashboardHomePage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].home;
  const { hasFeature } = useFeatures();
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const {
    mounted,
    todaysBookings,
    bookingsCount,
    employees,
    loading,
    ownerName,
    performanceData,
  } = useDashboardData(timeRange);

  const featuresMounted = mounted;

  if (!mounted) {
    return (
      <ErrorBoundary>
        <DashboardShell>
          <div className="mb-10">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </DashboardShell>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardShell>
        <DashboardHeader ownerName={ownerName} translations={t} />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TodaysBookingsCard
            loading={loading}
            bookings={todaysBookings}
            bookingsCount={bookingsCount}
            translations={{
              todaysBookings: t.todaysBookings,
              noBookingsYet: t.noBookingsYet,
              noBookingsYetSubtitle: t.noBookingsYetSubtitle,
              createFirstBooking: t.createFirstBooking,
              viewCalendar: t.viewCalendar,
            }}
          />

          <StaffOverviewCard
            loading={loading}
            employees={employees}
            translations={{
              yourStaff: t.yourStaff,
              manageStaffPermissions: t.manageStaffPermissions,
              inviteNewStaff: t.inviteNewStaff,
              online: t.online,
              offline: t.offline,
              manageStaff: t.manageStaff,
            }}
          />

          <QuickActionsCard
            translations={{
              quickActions: t.quickActions,
              addNewBooking: t.addNewBooking,
              addNewCustomer: t.addNewCustomer,
              addNewService: t.addNewService,
              inviteNewStaff: t.inviteNewStaff,
            }}
          />
        </div>

        {featuresMounted && hasFeature("ADVANCED_REPORTS") && (
          <PerformanceSnapshotCard
            loading={loading}
            performanceData={performanceData}
            onTimeRangeChange={(range) => setTimeRange(range)}
            translations={{
              totalBookingsThisWeek: t.totalBookingsThisWeek,
              returningCustomers: t.returningCustomers,
              newCustomers: t.newCustomers || "Nye kunder",
              noInsightsYet: t.noInsightsYet,
            }}
          />
        )}

        <AnnouncementsCard
          translations={{
            announcements: t.announcements,
            announcementWalkIn: t.announcementWalkIn,
            announcementLanguages: t.announcementLanguages,
            announcementDashboardUpdate: t.announcementDashboardUpdate,
            viewAllUpdates: t.viewAllUpdates,
          }}
        />
      </DashboardShell>
    </ErrorBoundary>
  );
}
