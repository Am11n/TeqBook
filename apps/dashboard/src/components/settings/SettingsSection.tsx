"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// =====================================================
// SettingsSection -- card-like section with title, description, layout variants
// =====================================================

interface SettingsSectionProps {
  title: string;
  /** One-line help text below the title */
  description?: string;
  /** Optional badge/counter next to the title */
  titleRight?: ReactNode;
  /** "stack" = vertical fields, "rows" = FormRow label-left/field-right */
  layout?: "stack" | "rows";
  /** "sm" = default compact title, "lg" = larger primary section title */
  size?: "sm" | "lg";
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  titleRight,
  layout = "stack",
  size = "sm",
  children,
  className,
}: SettingsSectionProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={size === "lg" ? "text-base font-semibold" : "text-sm font-semibold"}>{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {titleRight && <div className="shrink-0">{titleRight}</div>}
      </div>
      <div className={layout === "rows" ? "space-y-4" : "space-y-4"}>
        {children}
      </div>
    </Card>
  );
}
