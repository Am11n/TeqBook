"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Booking, Shift } from "@/lib/types";
import { formatDate, formatTime, statusColor, statusLabel, hasEmployeeAvailable } from "@/lib/utils/bookings/bookings-utils";

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
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="pr-4">{translations.colDate}</TableHead>
            <TableHead className="pr-4">{translations.colTime}</TableHead>
            <TableHead className="pr-4">{translations.colService}</TableHead>
            <TableHead className="pr-4">{translations.colEmployee}</TableHead>
            <TableHead className="pr-4">{translations.colCustomer}</TableHead>
            <TableHead className="pr-4">{translations.colStatus}</TableHead>
            <TableHead className="pr-4">{translations.colType}</TableHead>
            <TableHead className="pr-4">{translations.colNotes}</TableHead>
            <TableHead className="pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {formatDate(booking.start_time, locale)}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {formatTime(booking.start_time, locale)} –{" "}
                {formatTime(booking.end_time, locale)}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {booking.services?.name ?? translations.unknownService}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {booking.employees?.full_name ?? translations.unknownEmployee}
                  {!hasEmployeeAvailable(booking, employees, shifts) && (
                    <span
                      className="text-destructive"
                      title="Employee not available at this time"
                    >
                      ⚠️
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {booking.customers?.full_name ?? translations.unknownCustomer}
              </TableCell>
              <TableCell className="pr-4 text-xs">
                <Badge
                  variant="outline"
                  className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
                >
                  {statusLabel(booking.status, translations)}
                </Badge>
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                {booking.is_walk_in ? translations.typeWalkIn : translations.typeOnline}
              </TableCell>
              <TableCell className="pr-4 text-xs text-muted-foreground">
                <div className="space-y-1">
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
                  {!booking.notes &&
                    (!booking.products || booking.products.length === 0) &&
                    "-"}
                </div>
              </TableCell>
              <TableCell className="pr-4 text-xs">
                {booking.status !== "cancelled" &&
                  booking.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancelBooking(booking)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

