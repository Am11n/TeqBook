"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, XCircle, AlertTriangle, RotateCcw, User, Send, ChevronRight } from "lucide-react";
import type { CalendarBooking } from "@/lib/types";

interface BookingQuickActionsProps {
  booking: CalendarBooking;
  updating: boolean;
  onStatusChange: (status: string) => void;
  onReschedule?: (booking: CalendarBooking) => void;
  onChangeEmployee?: (booking: CalendarBooking) => void;
}

export function BookingQuickActions({
  booking, updating, onStatusChange, onReschedule, onChangeEmployee,
}: BookingQuickActionsProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <>
      <div className="border-b px-4 py-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {booking.status !== "confirmed" && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => onStatusChange("confirmed")}>
              <Check className="h-3 w-3" /> Confirm
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => onStatusChange("completed")}>
            <Check className="h-3 w-3 text-green-600" /> Done
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={updating} onClick={() => onStatusChange("no-show")}>
            <AlertTriangle className="h-3 w-3 text-orange-500" /> No-show
          </Button>
          {!confirmCancel ? (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 hover:text-red-700" disabled={updating} onClick={() => setConfirmCancel(true)}>
              <XCircle className="h-3 w-3" /> Cancel
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-600">Sure?</span>
              <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={updating} onClick={() => onStatusChange("cancelled")}>Yes</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmCancel(false)}>No</Button>
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
