"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import type { Booking, Shift } from "@/lib/types";
import { formatDate, formatTime, statusColor, statusLabel, hasEmployeeAvailable } from "@/lib/utils/bookings/bookings-utils";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { Trash2, CheckCircle, CheckCheck, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  onConfirmBooking?: (booking: Booking) => void;
  onCompleteBooking?: (booking: Booking) => void;
  getRowClassName?: (row: Booking) => string;
  filterContent?: React.ReactNode;
}

export function BookingsTable({
  bookings,
  employees,
  shifts,
  translations,
  locale,
  onCancelBooking,
  onConfirmBooking,
  onCompleteBooking,
  getRowClassName,
  filterContent,
}: BookingsTableProps) {
  const { salon } = useCurrentSalon();
  const { locale: localeCtx } = useLocale();
  const appLocale = normalizeLocale(localeCtx);
  const salonCurrency = salon?.currency ?? "NOK";
  const timezone = salon?.timezone || "UTC";
  const hour12 = salon?.time_format === "12h" ? true : undefined;
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  const isNb = locale === "nb";

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
          {formatTime(booking.start_time, locale, timezone, hour12)} – {formatTime(booking.end_time, locale, timezone, hour12)}
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
      id: "actions_inline",
      header: "",
      sortable: false,
      hideable: false,
      cell: (booking) => {
        const s = booking.status;
        if (s === "completed" || s === "cancelled") return null;
        return (
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {(s === "pending" || s === "scheduled") && onConfirmBooking && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => onConfirmBooking(booking)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isNb ? "Bekreft" : "Confirm"}</TooltipContent>
                </Tooltip>
              )}
              {s === "confirmed" && onCompleteBooking && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onCompleteBooking(booking)}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isNb ? "Fullfør" : "Complete"}</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onCancelBooking(booking)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isNb ? "Avbryt" : "Cancel"}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
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
                  {fmtPrice(bp.price_cents * bp.quantity)})
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
        getRowClassName={getRowClassName}
        storageKey="dashboard-bookings"
        emptyMessage="No bookings available"
        toolbarEndContent={filterContent}
      />
    </div>
  );
}
