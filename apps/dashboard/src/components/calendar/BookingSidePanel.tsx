"use client";

import { useState } from "react";
import { Phone, Clock, User, CreditCard, MessageSquare, ChevronRight, Check, XCircle, AlertTriangle, RotateCcw, UserPlus, Send } from "lucide-react";
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
import { updateBookingStatus, updateBooking } from "@/lib/services/bookings-service";
import { formatTimeInTimezone } from "@/lib/utils/timezone";

interface BookingSidePanelProps {
  booking: CalendarBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
  onReschedule?: (booking: CalendarBooking) => void;
  onChangeEmployee?: (booking: CalendarBooking) => void;
}

export function BookingSidePanel({
  booking,
  open,
  onOpenChange,
  onBookingUpdated,
  onReschedule,
  onChangeEmployee,
}: BookingSidePanelProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  if (!booking) return null;

  const formatTime = (isoString: string) => {
    try {
      return formatTimeInTimezone(isoString, timezone, "en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
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
    setConfirmCancel(false);
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
                  {booking.services?.duration_minutes && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({booking.services.prep_minutes ? `${booking.services.prep_minutes}+` : ""}
                      {booking.services.duration_minutes}
                      {booking.services.cleanup_minutes ? `+${booking.services.cleanup_minutes}` : ""}
                      min)
                    </span>
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
                  <span>{(booking.services.price_cents / 100).toFixed(0)} kr</span>
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
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                  booking.status === "confirmed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                  booking.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                  booking.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  booking.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                  booking.status === "no-show" ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Fast status actions */}
          {isActive && (
            <div className="border-b px-4 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {booking.status !== "confirmed" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => handleStatusChange("confirmed")}>
                    <Check className="h-3 w-3" /> Confirm
                  </Button>
                )}
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => handleStatusChange("completed")}>
                  <Check className="h-3 w-3 text-green-600" /> Done
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => handleStatusChange("no-show")}>
                  <AlertTriangle className="h-3 w-3 text-orange-500" /> No-show
                </Button>
                {!confirmCancel ? (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 hover:text-red-700" disabled={updating} onClick={() => setConfirmCancel(true)}>
                    <XCircle className="h-3 w-3" /> Cancel
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-red-600">Sure?</span>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={updating} onClick={() => handleStatusChange("cancelled")}>Yes</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmCancel(false)}>No</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Actions */}
          {isActive && (
            <div className="border-b px-4 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Actions
              </h3>
              <div className="space-y-1">
                <button onClick={() => onReschedule?.(booking)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors">
                  <span className="flex items-center gap-2"><RotateCcw className="h-3 w-3" /> Reschedule</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
                <button onClick={() => onChangeEmployee?.(booking)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors">
                  <span className="flex items-center gap-2"><User className="h-3 w-3" /> Change employee</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors">
                  <span className="flex items-center gap-2"><Send className="h-3 w-3" /> Send confirmation</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
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

          {/* Problem badges summary */}
          {problems.length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Issues</h3>
              <div className="flex flex-wrap gap-1.5">
                {problems.includes("conflict") && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Conflict detected</span>}
                {problems.includes("unpaid") && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Unpaid</span>}
                {problems.includes("unconfirmed") && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Not confirmed</span>}
                {problems.includes("missing_contact") && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Missing phone</span>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
