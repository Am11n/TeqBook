"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FieldVariant = "default" | "inline";

export interface FieldProps {
  /**
   * Label text displayed above the input (default) or to the left (inline variant)
   */
  label?: string;
  
  /**
   * HTML for attribute - connects label to input
   */
  htmlFor?: string;
  
  /**
   * Whether the field is required (shows asterisk)
   */
  required?: boolean;
  
  /**
   * Help text/description shown below the input
   */
  description?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * The input/control element
   */
  children: ReactNode;
  
  /**
   * Layout variant - "default" (stacked) or "inline" (label left, input right)
   * @default "default"
   */
  variant?: FieldVariant;
  
  /**
   * Additional className for the field container
   */
  className?: string;
  
  /**
   * Test ID for testing purposes
   */
  "data-testid"?: string;
}

/**
 * Field component for consistent form layout and spacing
 * 
 * Spacing tokens:
 * - Label → Input: gap-2 (8px)
 * - Input → Help text: pt-1 (4px)
 * - Field → Field: space-y-6 (24px) - applied by parent form
 * 
 * @example
 * ```tsx
 * <Field
 *   label="Salon Name"
 *   htmlFor="salonName"
 *   required
 *   description="This name appears on your booking page"
 *   error={errors.salonName}
 * >
 *   <Input id="salonName" />
 * </Field>
 * ```
 */
export function Field({
  label,
  htmlFor,
  required = false,
  description,
  error,
  children,
  variant = "default",
  className,
  "data-testid": dataTestId,
}: FieldProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4", className)} data-testid={dataTestId}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="text-sm font-medium text-foreground min-w-[120px] flex-shrink-0"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="flex-1 flex flex-col gap-1">
          {children}
          {description && (
            <p className="text-xs text-muted-foreground pt-1">
              {description}
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive pt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant: stacked layout
  return (
    <div className={cn("flex flex-col gap-2", className)} data-testid={dataTestId}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {description && (
        <p className="text-xs text-muted-foreground pt-1">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive pt-1">
          {error}
        </p>
      )}
    </div>
  );
}

