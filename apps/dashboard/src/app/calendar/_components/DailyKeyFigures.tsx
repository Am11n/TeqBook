import type { CalendarBooking } from "@/lib/types";

type EnrichedBooking = CalendarBooking & { _problems?: string[] };

interface DailyKeyFiguresProps {
  bookings: EnrichedBooking[];
  formatPrice: (cents: number) => string;
}

export function DailyKeyFigures({ bookings, formatPrice }: DailyKeyFiguresProps) {
  if (bookings.length === 0) return null;

  const unpaidCount = bookings.filter((b) => b._problems?.includes("unpaid")).length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.services?.price_cents ?? 0), 0);

  return (
    <div className="mt-3 hidden flex-wrap gap-3 md:flex">
      <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs">
        <span className="font-medium">{bookings.length}</span>
        <span className="text-muted-foreground">bookings</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs">
        <span className="font-medium">{formatPrice(totalRevenue)}</span>
        <span className="text-muted-foreground">revenue</span>
      </div>
      {unpaidCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 dark:bg-yellow-950/30 px-2.5 py-1 text-xs text-yellow-700 dark:text-yellow-300">
          <span className="font-medium">{unpaidCount}</span>
          <span>unpaid</span>
        </div>
      )}
      {cancelledCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-xs text-red-700 dark:text-red-300">
          <span className="font-medium">{cancelledCount}</span>
          <span>cancelled</span>
        </div>
      )}
    </div>
  );
}
