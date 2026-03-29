"use client";

import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@teqbook/ui";
import { logInfo } from "@/lib/services/logger";
import { useEffect, useRef } from "react";

type ProductLockDialogProps = {
  open: boolean;
  title: string;
  description: string;
  ctaLabel: string;
};

export function ProductLockDialog({ open, title, description, ctaLabel }: ProductLockDialogProps) {
  const loggedRef = useRef(false);
  useEffect(() => {
    if (open && !loggedRef.current) {
      loggedRef.current = true;
      logInfo("dashboard_product_lock_dialog_shown", {});
    }
    if (!open) loggedRef.current = false;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild variant="default">
            <Link href="/settings/billing/">{ctaLabel}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
