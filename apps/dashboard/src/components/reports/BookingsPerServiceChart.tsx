"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

interface BookingsPerServiceChartProps {
  loading: boolean;
  bookingsPerService: {
    service_id: string;
    service_name: string;
    booking_count: number;
    revenue_cents: number;
  }[];
}

export function BookingsPerServiceChart({
  loading,
  bookingsPerService,
}: BookingsPerServiceChartProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Bookings per Service</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : bookingsPerService.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No booking data available</p>
      ) : (
        <div className="space-y-3">
          {bookingsPerService.slice(0, 8).map((service) => {
            const maxBookings = Math.max(...bookingsPerService.map((s) => s.booking_count), 1);
            const width = (service.booking_count / maxBookings) * 100;

            return (
              <div key={service.service_id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate flex-1">{service.service_name}</span>
                  <span className="text-muted-foreground ml-2">{service.booking_count} bookings</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Revenue: {fmtPrice(service.revenue_cents)}
                </div>
              </div>
            );
          })}
          {bookingsPerService.length > 8 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{bookingsPerService.length - 8} more services
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

