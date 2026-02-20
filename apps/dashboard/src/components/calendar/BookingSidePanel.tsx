"use client";

import { useState, useEffect } from "react";
import { Phone, Clock, User, CreditCard, MessageSquare, AlertTriangle, UserPlus, CalendarPlus, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { updateBookingStatus, updateBooking } from "@/lib/services/bookings-service";
import { getNoShowInfo } from "@/lib/services/noshow-policy-service";
import { formatTimeInTimezone } from "@/lib/utils/timezone";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { getStatusBadgeClass, formatDuration, PROBLEM_BADGES } from "./booking-panel-helpers";
import { BookingQuickActions } from "./BookingQuickActions";

interface BookingSidePanelProps {
  booking: CalendarBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
  onReschedule?: (booking: CalendarBooking) => void;
  onChangeEmployee?: (booking: CalendarBooking) => void;
  onRebook?: (booking: CalendarBooking) => void;
}

export function BookingSidePanel({
  booking,
  open,
  onOpenChange,
  onBookingUpdated,
  onReschedule,
  onChangeEmployee,
  onRebook,
}: BookingSidePanelProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const hour12 = salon?.time_format === "12h" ? true : undefined;
  const salonCurrency = salon?.currency ?? "NOK";
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  const [updating, setUpdating] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noShowCount, setNoShowCount] = useState(0);
  const [customerBlocked, setCustomerBlocked] = useState(false);

  useEffect(() => {
    if (!booking?.customer_id || !salon?.id) {
      setNoShowCount(0);
      setCustomerBlocked(false);
      return;
    }
    getNoShowInfo(salon.id, booking.customer_id).then(({ data }) => {
      setNoShowCount(data?.no_show_count ?? 0);
      setCustomerBlocked(data?.is_blocked ?? false);
    });
  }, [booking?.customer_id, salon?.id]);

  if (!booking) return null;

  const formatTime = (isoString: string) => {
    try {
      return formatTimeInTimezone(isoString, timezone, appLocale, {
        hour: "numeric",
        minute: "2-digit",
      }, hour12);
    } catch {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat(appLocale === "nb" ? "nb-NO" : appLocale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: timezone,
      }).format(new Date(isoString));
    } catch {
      return new Date(isoString).toLocaleDateString();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!salon?.id) return;
    setUpdating(true);
    await updateBookingStatus(salon.id, booking.id, newStatus);
    setUpdating(false);
    onBookingUpdated();
  };

  const handleSaveNote = async () => {
    if (!salon?.id || !noteText.trim()) return;
    setSavingNote(true);
    const existingNotes = booking.notes || "";
    const newNotes = existingNotes
      ? `${existingNotes}\n---\n${noteText.trim()}`
      : noteText.trim();
    await updateBooking(salon.id, booking.id, { notes: newNotes });
    setSavingNote(false);
    setNoteText("");
    onBookingUpdated();
  };

  const problems = booking._problems || [];
  const isActive = !["cancelled", "no-show", "completed"].includes(booking.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-sm">Booking Details</DialogTitle>
          <DialogDescription className="text-xs">
            {booking.services?.name || "Booking"} &middot; {formatDate(booking.start_time)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Section 1: Customer */}
          <div className="border-b px-4 py-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Customer
            </h3>
            <p className="text-sm font-medium">
              {booking.customers?.full_name || "Unknown customer"}
              {problems.includes("new_customer") && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <UserPlus className="h-2.5 w-2.5" />
                  New
                </span>
              )}
            </p>
            {booking.customers?.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Phone className="h-3 w-3" />
                {booking.customers.phone}
              </p>
            )}
            {!booking.customers?.phone && problems.includes("missing_contact") && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-1">
                <AlertTriangle className="h-3 w-3" />
                No phone number
              </p>
            )}
            {customerBlocked && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1.5">
                <ShieldAlert className="h-3 w-3" />
                Blocked (no-show)
              </p>
            )}
            {!customerBlocked && noShowCount > 0 && (
              <p className="text-xs text-orange-600 flex items-center gap-1.5 mt-1.5">
                <AlertTriangle className="h-3 w-3" />
                {noShowCount} no-show{noShowCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Section 2: Booking details */}
          <div className="border-b px-4 py-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Details
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>
                  {formatDate(booking.start_time)} &middot;{" "}
                  {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>
                  {booking.services?.name || "No service"}
                  {booking.services && formatDuration(booking.services) && (
                    <span className="text-muted-foreground"> ({formatDuration(booking.services)})</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{booking.employees?.full_name || "No employee"}</span>
              </div>
              {booking.services?.price_cents != null && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span>{fmtPrice(booking.services.price_cents)}</span>
                  {problems.includes("unpaid") && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      Unpaid
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[10px]">
                  {booking.is_walk_in ? "Walk-in" : "Online booking"}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {isActive && (
            <BookingQuickActions
              booking={booking}
              updating={updating}
              onStatusChange={handleStatusChange}
              onReschedule={onReschedule}
              onChangeEmployee={onChangeEmployee}
            />
          )}

          {/* Section 5: Notes */}
          <div className="border-b px-4 py-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <MessageSquare className="h-3 w-3 inline mr-1" />
              Notes
            </h3>
            {booking.notes && (
              <div className="text-xs text-muted-foreground whitespace-pre-wrap mb-2 bg-muted/50 rounded-md p-2">
                {booking.notes}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add internal note..."
                className="flex-1 h-8 rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && noteText.trim()) handleSaveNote();
                }}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!noteText.trim() || savingNote} onClick={handleSaveNote}>
                Add
              </Button>
            </div>
          </div>

          {/* Section: Rebook (shown for completed bookings) */}
          {booking.status === "completed" && onRebook && (
            <div className="border-b px-4 py-3">
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={() => {
                  onRebook(booking);
                  onOpenChange(false);
                }}
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Book next appointment
              </Button>
              <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
                Same customer, service & employee — pick new date
              </p>
            </div>
          )}

          {/* Problem badges summary */}
          {problems.length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Issues</h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(PROBLEM_BADGES).map(([key, { label, className }]) =>
                  problems.includes(key as typeof problems[number]) ? <span key={key} className={`text-[10px] px-2 py-0.5 rounded-full ${className}`}>{label}</span> : null
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
