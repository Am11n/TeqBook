"use client";

// =====================================================
// Error Message Component
// =====================================================
// Consistent way to display error messages throughout the app

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  title?: string;
  message: string;
  onDismiss?: () => void;
  variant?: "default" | "destructive" | "warning";
  className?: string;
};

export function ErrorMessage({
  title,
  message,
  onDismiss,
  variant = "destructive",
  className,
}: ErrorMessageProps) {
  const variantStyles = {
    destructive: "border-destructive bg-destructive/10 text-destructive",
    warning: "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500",
    default: "border-border bg-muted text-foreground",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className="font-semibold leading-none tracking-tight">
              {title}
            </h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 shrink-0 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

