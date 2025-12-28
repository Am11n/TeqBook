"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils/bookings/bookings-utils";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  locale: string;
  onConfirm: (reason: string) => Promise<void>;
  error: string | null;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  booking,
  locale,
  onConfirm,
  error,
}: CancelBookingDialogProps) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await onConfirm(cancellationReason || "");
      setCancellationReason("");
      onOpenChange(false);
    } catch (err) {
      // Error is handled by parent
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCancellationReason("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {booking && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
              <p>
                <strong>Date:</strong> {formatDate(booking.start_time, locale)}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(booking.start_time, locale)} -{" "}
                {formatTime(booking.end_time, locale)}
              </p>
              <p>
                <strong>Service:</strong> {booking.services?.name || "Unknown"}
              </p>
              <p>
                <strong>Customer:</strong> {booking.customers?.full_name || "Unknown"}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
              placeholder="Please provide a reason for cancellation..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

