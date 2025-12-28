"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionTimeoutDialogProps {
  open: boolean;
  timeRemaining: string | null;
  onExtendSession: () => void;
  onLogout: () => void;
}

export function SessionTimeoutDialog({
  open,
  timeRemaining,
  onExtendSession,
  onLogout,
}: SessionTimeoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire in {timeRemaining || "a moment"}. Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onLogout}>
            Log Out
          </Button>
          <Button onClick={onExtendSession}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

