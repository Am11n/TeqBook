"use client";

import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightTextProps = {
  /** Insight message */
  message: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Subtle annotation text for charts and analytics.
 * Provides the "why" beneath numbers.
 */
export function InsightText({ message, className }: InsightTextProps) {
  return (
    <div className={cn("flex items-start gap-1.5 mt-3 text-xs text-muted-foreground", className)}>
      <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
      <span>{message}</span>
    </div>
  );
}
