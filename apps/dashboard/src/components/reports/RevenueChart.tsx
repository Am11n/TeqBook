"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

interface RevenueChartProps {
  loading: boolean;
  revenueByMonth: { month: string; revenue_cents: number; booking_count: number }[];
}

export function RevenueChart({ loading, revenueByMonth }: RevenueChartProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : revenueByMonth.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No revenue data available</p>
      ) : (
        <div className="h-64 w-full rounded-lg bg-muted/50 border border-border flex items-end justify-between gap-1 px-2 py-2">
          {revenueByMonth.map((data, index) => {
            const maxRevenue = Math.max(...revenueByMonth.map((d) => d.revenue_cents), 1);
            const height = (data.revenue_cents / maxRevenue) * 100;
            const monthLabel = new Date(data.month).toLocaleDateString("en-US", {
              month: "short",
            });

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 h-full justify-end gap-1 group relative"
              >
                <div
                  className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-green-600 to-green-500 opacity-80 hover:opacity-100 cursor-pointer"
                  style={{ height: `${height}%`, minHeight: "8px" }}
                  title={`${monthLabel}: ${fmtPrice(data.revenue_cents)}`}
                />
                <span className="text-[10px] text-muted-foreground">{monthLabel}</span>
                <span className="text-[10px] font-medium text-foreground">
                  {fmtPrice(data.revenue_cents)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

