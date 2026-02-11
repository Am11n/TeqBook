"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { validateBookingChange } from "@/lib/repositories/schedule-segments";
import { updateBooking } from "@/lib/services/bookings-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { CalendarBooking, ConflictResponse, SuggestedSlot } from "@/lib/types";

interface RescheduleModalProps {
  booking: CalendarBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduled: () => void;
}

export function RescheduleModal({ booking, open, onOpenChange, onRescheduled }: RescheduleModalProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [validation, setValidation] = useState<ConflictResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract current date/time when dialog opens
  useEffect(() => {
    if (!open || !booking) return;
    setValidation(null);
    setError(null);
    const start = new Date(booking.start_time);
    try {
      const formatted = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", timeZone: timezone,
      }).format(start);
      const [datePart, timePart] = formatted.split(" ");
      setNewDate(datePart);
      setNewTime(timePart);
    } catch {
      setNewDate(start.toISOString().slice(0, 10));
      setNewTime(start.toISOString().slice(11, 16));
    }
  }, [open, booking, timezone]);

  if (!booking) return null;

  const handleValidate = async () => {
    if (!newDate || !newTime) return;
    setValidating(true);
    setError(null);

    const localIso = `${newDate}T${newTime}:00`;
    let startTimeUTC = localIso;
    if (timezone !== "UTC") {
      try { startTimeUTC = localISOStringToUTC(localIso, timezone); } catch { /* fallback */ }
    }

    const { data, error: valError } = await validateBookingChange(booking.id, null, startTimeUTC, null);
    if (valError) { setError(valError); setValidating(false); return; }
    setValidation(data);
    setValidating(false);
  };

  const handleConfirm = async () => {
    if (!salon?.id || !newDate || !newTime) return;
    setSaving(true);
    setError(null);

    const localIso = `${newDate}T${newTime}:00`;
    let startTimeUTC = localIso;
    if (timezone !== "UTC") {
      try { startTimeUTC = localISOStringToUTC(localIso, timezone); } catch { /* fallback */ }
    }

    const durationMs = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
    const newEndTime = new Date(new Date(startTimeUTC).getTime() + durationMs).toISOString();

    const { error: updateError } = await updateBooking(salon.id, booking.id, { start_time: startTimeUTC, end_time: newEndTime });
    if (updateError) { setError(updateError); setSaving(false); return; }
    setSaving(false);
    onRescheduled();
  };

  const handleSelectSuggestion = (slot: SuggestedSlot) => {
    try {
      const formatted = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", timeZone: timezone,
      }).format(new Date(slot.start));
      const [datePart, timePart] = formatted.split(" ");
      setNewDate(datePart);
      setNewTime(timePart);
      setValidation(null);
    } catch { /* fallback */ }
  };

  const formatSlotTime = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(isoString));
    } catch {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            {booking.services?.name} with {booking.employees?.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          Current: {formatSlotTime(booking.start_time)} – {formatSlotTime(booking.end_time)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">New date</label>
            <input type="date" value={newDate} onChange={(e) => { setNewDate(e.target.value); setValidation(null); }} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">New time</label>
            <input type="time" value={newTime} onChange={(e) => { setNewTime(e.target.value); setValidation(null); }} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
          </div>
        </div>

        {validation && !validation.is_valid && (
          <div>
            <div className="rounded-md bg-red-50 border border-red-200 p-2 text-xs dark:bg-red-950 dark:border-red-800">
              <div className="flex items-center gap-1 text-red-700 dark:text-red-300 font-medium mb-1">
                <AlertTriangle className="h-3 w-3" /> Conflicts found
              </div>
              {validation.conflicts.map((c, i) => (
                <p key={i} className="text-red-600 dark:text-red-400">
                  {c.message_code === "overlaps_booking" && `Overlaps with ${c.customer_name || "booking"} (${c.service_name || ""})`}
                  {c.message_code === "overlaps_time_block" && `Overlaps with block: ${c.title || c.block_type}`}
                  {c.message_code === "overlaps_break" && `Overlaps with ${c.break_label || "break"}`}
                </p>
              ))}
            </div>
            {validation.suggested_slots.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Suggested alternatives:</p>
                <div className="space-y-1">
                  {validation.suggested_slots.map((slot, i) => (
                    <button key={i} onClick={() => handleSelectSuggestion(slot)} className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-xs hover:bg-accent transition-colors">
                      <span>{formatSlotTime(slot.start)} – {formatSlotTime(slot.end)}</span>
                      <span className="text-muted-foreground">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {validation?.is_valid && (
          <div className="rounded-md bg-green-50 border border-green-200 p-2 text-xs text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
            Time slot is available
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!validation ? (
            <Button onClick={handleValidate} disabled={validating || !newDate || !newTime}>
              {validating ? "Checking..." : "Check availability"}
            </Button>
          ) : validation.is_valid ? (
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Saving..." : "Confirm reschedule"}
            </Button>
          ) : (
            <Button onClick={handleValidate} disabled={validating}>Re-check</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
