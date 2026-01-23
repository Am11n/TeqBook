"use client";

import { Badge } from "@/components/ui/badge";
import { TableWithViews, type ColumnDefinition } from "@/components/tables/TableWithViews";
import type { Booking, Shift } from "@/lib/types";
import { formatDate, formatTime, statusColor, statusLabel, hasEmployeeAvailable } from "@/lib/utils/bookings/bookings-utils";
import { useCurrentSalon } from "@/components/salon-provider";

interface BookingsTableProps {
  bookings: Booking[];
  employees: Array<{ id: string; full_name: string }>;
  shifts: Shift[];
  translations: {
    colDate: string;
    colTime: string;
    colService: string;
    colEmployee: string;
    colCustomer: string;
    colStatus: string;
    colType: string;
    colNotes: string;
    unknownService: string;
    unknownEmployee: string;
    unknownCustomer: string;
    typeWalkIn: string;
    typeOnline: string;
    statusPending: string;
    statusConfirmed: string;
    statusNoShow: string;
    statusCompleted: string;
    statusCancelled: string;
    statusScheduled: string;
    cancelButton?: string; // Optional: label for cancel action
  };
  locale: string;
  onCancelBooking: (booking: Booking) => void;
}

export function BookingsTable({
  bookings,
  employees,
  shifts,
  translations,
  locale,
  onCancelBooking,
}: BookingsTableProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";

  const columns: ColumnDefinition<Booking>[] = [
    {
      id: "date",
      label: translations.colDate,
      render: (booking) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(booking.start_time, locale, timezone)}
        </div>
      ),
    },
    {
      id: "time",
      label: translations.colTime,
      render: (booking) => (
        <div className="text-xs text-muted-foreground">
          {formatTime(booking.start_time, locale, timezone)} – {formatTime(booking.end_time, locale, timezone)}
        </div>
      ),
    },
    {
      id: "service",
      label: translations.colService,
      render: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.services?.name ?? translations.unknownService}
        </div>
      ),
    },
    {
      id: "employee",
      label: translations.colEmployee,
      render: (booking) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {booking.employees?.full_name ?? translations.unknownEmployee}
          {!hasEmployeeAvailable(booking, employees, shifts) && (
            <span className="text-destructive" title="Employee not available at this time">
              ⚠️
            </span>
          )}
        </div>
      ),
    },
    {
      id: "customer",
      label: translations.colCustomer,
      render: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.customers?.full_name ?? translations.unknownCustomer}
        </div>
      ),
    },
    {
      id: "status",
      label: translations.colStatus,
      render: (booking) => (
        <Badge
          variant="outline"
          className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
        >
          {statusLabel(booking.status, translations)}
        </Badge>
      ),
    },
    {
      id: "type",
      label: translations.colType,
      render: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.is_walk_in ? translations.typeWalkIn : translations.typeOnline}
        </div>
      ),
    },
    {
      id: "notes",
      label: translations.colNotes,
      render: (booking) => (
        <div className="space-y-1 text-xs text-muted-foreground">
          {booking.notes && <div>{booking.notes}</div>}
          {booking.products && booking.products.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {booking.products.map((bp) => (
                <div key={bp.id} className="text-[11px]">
                  {bp.product.name} x{bp.quantity} (
                  {((bp.price_cents * bp.quantity) / 100).toFixed(2)} NOK)
                </div>
              ))}
            </div>
          )}
          {!booking.notes && (!booking.products || booking.products.length === 0) && "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="hidden md:block">
      <TableWithViews
        tableId="bookings"
        columns={columns}
        data={bookings}
        onDelete={(booking) => {
          onCancelBooking(booking);
        }}
        canDelete={(booking) => {
          // Only show cancel action for bookings that can be cancelled
          return booking.status !== "cancelled" && booking.status !== "completed";
        }}
        deleteLabel={translations.cancelButton || (locale === "nb" ? "Avbryt" : "Cancel")}
        renderDetails={(booking) => (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                {booking.services?.name ?? translations.unknownService}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(booking.start_time, locale, timezone)} at {formatTime(booking.start_time, locale, timezone)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-muted-foreground">
                  {booking.customers?.full_name ?? translations.unknownCustomer}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Employee</p>
                <p className="text-sm text-muted-foreground">
                  {booking.employees?.full_name ?? translations.unknownEmployee}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant="outline"
                  className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
                >
                  {statusLabel(booking.status, translations)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">
                  {booking.is_walk_in ? translations.typeWalkIn : translations.typeOnline}
                </p>
              </div>
              {booking.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
        emptyMessage="No bookings available"
        actionsLabel="Actions"
      />
    </div>
  );
}

