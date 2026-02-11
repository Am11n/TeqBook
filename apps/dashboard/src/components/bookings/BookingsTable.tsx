"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import type { Booking, Shift } from "@/lib/types";
import { formatDate, formatTime, statusColor, statusLabel, hasEmployeeAvailable } from "@/lib/utils/bookings/bookings-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { Trash2 } from "lucide-react";

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
    cancelButton?: string;
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

  const columns: ColumnDef<Booking>[] = [
    {
      id: "date",
      header: translations.colDate,
      cell: (booking) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(booking.start_time, locale, timezone)}
        </div>
      ),
      getValue: (booking) => booking.start_time,
    },
    {
      id: "time",
      header: translations.colTime,
      cell: (booking) => (
        <div className="text-xs text-muted-foreground">
          {formatTime(booking.start_time, locale, timezone)} – {formatTime(booking.end_time, locale, timezone)}
        </div>
      ),
      getValue: (booking) => booking.start_time,
      sortable: false,
    },
    {
      id: "service",
      header: translations.colService,
      cell: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.services?.name ?? translations.unknownService}
        </div>
      ),
      getValue: (booking) => booking.services?.name ?? "",
    },
    {
      id: "employee",
      header: translations.colEmployee,
      cell: (booking) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {booking.employees?.full_name ?? translations.unknownEmployee}
          {!hasEmployeeAvailable(booking, employees, shifts) && (
            <span className="text-destructive" title="Employee not available at this time">
              ⚠️
            </span>
          )}
        </div>
      ),
      getValue: (booking) => booking.employees?.full_name ?? "",
    },
    {
      id: "customer",
      header: translations.colCustomer,
      cell: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.customers?.full_name ?? translations.unknownCustomer}
        </div>
      ),
      getValue: (booking) => booking.customers?.full_name ?? "",
    },
    {
      id: "status",
      header: translations.colStatus,
      cell: (booking) => (
        <Badge
          variant="outline"
          className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
        >
          {statusLabel(booking.status, translations)}
        </Badge>
      ),
      getValue: (booking) => booking.status,
    },
    {
      id: "type",
      header: translations.colType,
      cell: (booking) => (
        <div className="text-xs text-muted-foreground">
          {booking.is_walk_in ? translations.typeWalkIn : translations.typeOnline}
        </div>
      ),
      getValue: (booking) => (booking.is_walk_in ? 1 : 0),
      defaultVisible: false,
    },
    {
      id: "notes",
      header: translations.colNotes,
      cell: (booking) => (
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
      sortable: false,
      defaultVisible: false,
    },
  ];

  const getRowActions = (booking: Booking): RowAction<Booking>[] => {
    if (booking.status === "cancelled" || booking.status === "completed") {
      return [];
    }
    return [
      {
        label: translations.cancelButton || (locale === "nb" ? "Avbryt" : "Cancel"),
        icon: Trash2,
        onClick: (b) => onCancelBooking(b),
        variant: "destructive",
      },
    ];
  };

  return (
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        data={bookings}
        rowKey={(b) => b.id}
        getRowActions={getRowActions}
        storageKey="dashboard-bookings"
        emptyMessage="No bookings available"
      />
    </div>
  );
}
