"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Salon } from "@/lib/types";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salon: Salon | null;
  actionLoading: boolean;
  onConfirm: () => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  salon,
  actionLoading,
  onConfirm,
}: CancelSubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Your subscription will remain active until the end of the current billing period. You
            will continue to have access to all features until{" "}
            {salon?.current_period_end
              ? new Date(salon.current_period_end).toLocaleDateString()
              : "the end of your billing period"}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Cancel Subscription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

