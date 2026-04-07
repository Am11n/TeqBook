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
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { validateBookingChange } from "@/lib/repositories/schedule-segments";
import { directRescheduleBooking } from "@/lib/services/bookings-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import { dashboardApiPath } from "@/lib/dashboard-api-path";
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
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].calendar;
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [validation, setValidation] = useState<ConflictResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bypassOpen, setBypassOpen] = useState(false);
  const [bypassReason, setBypassReason] = useState("");

  useEffect(() => {
    if (!open || !booking) return;
    setValidation(null);
    setError(null);
    setBypassOpen(false);
    setBypassReason("");
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

  const proposedUtc = (): { start: string; end: string } | null => {
    if (!newDate || !newTime) return null;
    const localIso = `${newDate}T${newTime}:00`;
    let startTimeUTC = localIso;
    if (timezone !== "UTC") {
      try { startTimeUTC = localISOStringToUTC(localIso, timezone); } catch { /* fallback */ }
    }
    const durationMs = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
    const newEndTime = new Date(new Date(startTimeUTC).getTime() + durationMs).toISOString();
    return { start: startTimeUTC, end: newEndTime };
  };

  const handleValidate = async () => {
    if (!newDate || !newTime) return;
    setValidating(true);
    setError(null);

    const times = proposedUtc();
    if (!times) { setValidating(false); return; }

    const { data, error: valError } = await validateBookingChange(booking.id, null, times.start, null);
    if (valError) { setError(valError); setValidating(false); return; }
    setValidation(data);
    setValidating(false);
  };

  const handleSendToCustomer = async () => {
    if (!salon?.id) return;
    const times = proposedUtc();
    if (!times) return;
    setSendLoading(true);
    setError(null);
    try {
      const res = await fetch(dashboardApiPath("/api/bookings/reschedule-proposal/"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          bookingId: booking.id,
          salonId: salon.id,
          proposedStartUtc: times.start,
          proposedEndUtc: times.end,
          language: appLocale,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        pendingCustomer?: boolean;
        notificationFailed?: boolean;
        deliveryAttempts?: { channel: string; success: boolean; error?: string }[];
      };
      if (!res.ok) {
        setError(json.error || t.rescheduleProposalFailed);
        setSendLoading(false);
        return;
      }
      if (json.notificationFailed) {
        const detail = json.deliveryAttempts?.map((a) => `${a.channel}: ${a.success ? "ok" : a.error || "failed"}`).join("; ");
        setError(`${t.rescheduleProposalFailed}${detail ? ` (${detail})` : ""}`);
        setSendLoading(false);
        onRescheduled();
        return;
      }
      setSendLoading(false);
      onRescheduled();
      onOpenChange(false);
    } catch {
      setError(t.rescheduleProposalFailed);
      setSendLoading(false);
    }
  };

  const handleDirectReschedule = async () => {
    if (!salon?.id) return;
    const times = proposedUtc();
    if (!times) return;
    setSaving(true);
    setError(null);
    const { error: upErr } = await directRescheduleBooking(
      salon.id,
      booking.id,
      times.start,
      times.end,
      bypassReason.trim() || null,
    );
    if (upErr) {
      setError(upErr);
      setSaving(false);
      return;
    }
    setSaving(false);
    setBypassOpen(false);
    onRescheduled();
    onOpenChange(false);
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

  const h12 = salon?.time_format === "12h" ? true : undefined;
  const formatSlotTime = (isoString: string) => {
    try {
      const resolvedLocale = appLocale === "nb" ? "nb-NO" : appLocale;
      return new Intl.DateTimeFormat(resolvedLocale, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
        ...(h12 !== undefined ? { hour12: h12 } : appLocale === "nb" ? { hour12: false } : {}),
      }).format(new Date(isoString));
    } catch {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t.rescheduleModalTitle}
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
                      <button key={i} type="button" onClick={() => handleSelectSuggestion(slot)} className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-xs hover:bg-accent transition-colors">
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

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex w-full flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              {!validation ? (
                <Button onClick={handleValidate} disabled={validating || !newDate || !newTime}>
                  {validating ? "Checking..." : "Check availability"}
                </Button>
              ) : validation.is_valid ? (
                <>
                  <Button variant="outline" disabled={sendLoading || saving} onClick={() => setBypassOpen(true)}>
                    {t.rescheduleMoveNow}
                  </Button>
                  <Button onClick={handleSendToCustomer} disabled={sendLoading || saving}>
                    {sendLoading ? t.rescheduleSendingProposal : t.rescheduleSendToCustomer}
                  </Button>
                </>
              ) : (
                <Button onClick={handleValidate} disabled={validating}>Re-check</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bypassOpen} onOpenChange={setBypassOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.rescheduleBypassDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.rescheduleMoveNow}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t.rescheduleBypassReasonLabel}</label>
            <textarea
              value={bypassReason}
              onChange={(e) => setBypassReason(e.target.value)}
              className="mt-1 min-h-[72px] w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBypassOpen(false)}>Cancel</Button>
            <Button onClick={handleDirectReschedule} disabled={saving}>
              {saving ? "Saving..." : t.rescheduleBypassConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
