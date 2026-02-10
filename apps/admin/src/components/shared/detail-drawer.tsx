"use client";

import { type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DetailDrawerProps = {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the drawer should close */
  onOpenChange: (open: boolean) => void;
  /** Drawer title */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Main content */
  children: ReactNode;
  /** Footer actions (buttons) */
  footer?: ReactNode;
  /** Width class (default: w-[480px]) */
  widthClass?: string;
  /** Additional CSS classes for the content panel */
  className?: string;
};

/**
 * Slide-over drawer panel, anchored to the right.
 * Used for: salon detail, user detail, audit event detail, support case detail.
 * Built on Radix Dialog for accessibility (focus trap, Escape to close).
 */
export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClass = "w-[480px]",
  className,
}: DetailDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Drawer panel */}
        <DialogPrimitive.Content
          aria-describedby={description ? undefined : undefined}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex flex-col",
            "bg-background border-l border-border shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300 ease-in-out",
            widthClass,
            "max-w-[calc(100vw-2rem)]",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 shrink-0">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-lg font-semibold truncate">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="border-t border-border px-6 py-4 shrink-0">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
