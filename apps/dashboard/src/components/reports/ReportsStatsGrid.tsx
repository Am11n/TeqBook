"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils/reports/reports-utils";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

interface ReportsStatsGridProps {
  loading: boolean;
  totalBookings: number;
  totalRevenue: number;
  capacityUtilisation: number;
  averageBookingDuration: number;
  revenueByMonth: { month: string; revenue_cents: number; booking_count: number }[];
}

export function ReportsStatsGrid({
  loading,
  totalBookings,
  totalRevenue,
  capacityUtilisation,
  averageBookingDuration,
  revenueByMonth,
}: ReportsStatsGridProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <>
                <p className="text-3xl font-bold mt-2">{totalBookings.toLocaleString()}</p>
                {/* Sparkline chart */}
                {revenueByMonth.length > 0 && (
                  <div className="h-8 w-full mt-2 flex items-end gap-0.5">
                    {revenueByMonth.slice(-7).map((data, index) => {
                      const maxBookings = Math.max(
                        ...revenueByMonth.slice(-7).map((d) => d.booking_count),
                        1
                      );
                      const height = (data.booking_count / maxBookings) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-primary/20 rounded-t transition-all duration-300 hover:bg-primary/40"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`${data.booking_count} bookings`}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ml-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Total Revenue */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <>
                <p className="text-3xl font-bold mt-2">{fmtPrice(totalRevenue)}</p>
                {/* Sparkline chart */}
                {revenueByMonth.length > 0 && (
                  <div className="h-8 w-full mt-2 flex items-end gap-0.5">
                    {revenueByMonth.slice(-7).map((data, index) => {
                      const maxRevenue = Math.max(
                        ...revenueByMonth.slice(-7).map((d) => d.revenue_cents),
                        1
                      );
                      const height = (data.revenue_cents / maxRevenue) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-green-500/20 rounded-t transition-all duration-300 hover:bg-green-500/40"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={fmtPrice(data.revenue_cents)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center ml-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Capacity Utilisation */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Capacity Utilisation</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{capacityUtilisation.toFixed(1)}%</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Average Duration */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg. Booking Duration</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{formatDuration(averageBookingDuration)}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}

