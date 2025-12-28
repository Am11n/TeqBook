"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils/reports/reports-utils";

interface CapacityUtilisationChartProps {
  loading: boolean;
  capacityUtilisation: number;
  totalBookings: number;
  averageBookingDuration: number;
}

export function CapacityUtilisationChart({
  loading,
  capacityUtilisation,
  totalBookings,
  averageBookingDuration,
}: CapacityUtilisationChartProps) {
  return (
    <Card className="mt-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Capacity Utilisation</h3>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Utilisation</span>
            <span className="text-2xl font-bold">{capacityUtilisation.toFixed(1)}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityUtilisation >= 80
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : capacityUtilisation >= 50
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : "bg-gradient-to-r from-yellow-500 to-yellow-600"
              }`}
              style={{ width: `${Math.min(capacityUtilisation, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Hours Booked</p>
              <p className="font-semibold">
                {capacityUtilisation > 0
                  ? ((capacityUtilisation / 100) * (totalBookings * averageBookingDuration) / 60).toFixed(1)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Bookings</p>
              <p className="font-semibold">{totalBookings}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Duration</p>
              <p className="font-semibold">{formatDuration(averageBookingDuration)}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

