"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// =====================================================
// FormRow -- label left, field right on desktop; stacked on mobile
// =====================================================

interface FormRowProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormRow({
  label,
  htmlFor,
  required,
  description,
  children,
  className,
}: FormRowProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground min-w-[140px] shrink-0 pt-2"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="flex-1 space-y-1">
        {children}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
