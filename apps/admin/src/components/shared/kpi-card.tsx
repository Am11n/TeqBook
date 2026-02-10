"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "./sparkline";
import { ArrowUp, ArrowDown } from "lucide-react";

type KpiCardProps = {
  /** Card title (e.g., "Active Salons") */
  title: string;
  /** Main numeric value */
  value: number | string;
  /** Percentage change vs previous period (positive = good, negative = bad) */
  change?: number | null;
  /** Which period the change covers */
  period?: "7d" | "30d" | "90d";
  /** Sparkline data points */
  trendData?: number[];
  /** Lucide icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Click handler for drill-down */
  onClick?: () => void;
  /** Format the value (e.g., add comma separators) */
  formatValue?: (value: number | string) => string;
  /** Whether change > 0 is good (default: true). Set false for metrics like "Billing Issues" where lower is better. */
  positiveIsGood?: boolean;
  /** Additional CSS classes */
  className?: string;
};

/**
 * KPI Card for the admin dashboard.
 * Shows: large number, change badge, sparkline, and optional drill-down.
 */
export const KpiCard = memo(function KpiCard({
  title,
  value,
  change,
  period = "7d",
  trendData,
  icon: Icon,
  onClick,
  formatValue,
  positiveIsGood = true,
  className,
}: KpiCardProps) {
  const displayValue = formatValue ? formatValue(value) : typeof value === "number" ? value.toLocaleString() : value;

  const hasChange = change !== null && change !== undefined;
  const isPositiveChange = hasChange && change > 0;
  const isNegativeChange = hasChange && change < 0;
  const isGood = positiveIsGood ? isPositiveChange : isNegativeChange;
  const isBad = positiveIsGood ? isNegativeChange : isPositiveChange;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-150",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header row: title + icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          )}
        </div>

        {/* Value + Change row */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-2xl font-bold tracking-tight truncate">
              {displayValue}
            </div>
            {hasChange && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                    isGood && "bg-emerald-50 text-emerald-700",
                    isBad && "bg-red-50 text-red-700",
                    !isGood && !isBad && "bg-muted text-muted-foreground"
                  )}
                >
                  {isPositiveChange ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : isNegativeChange ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : null}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs {period}
                </span>
              </div>
            )}
          </div>

          {/* Sparkline */}
          {trendData && trendData.length >= 2 && (
            <Sparkline
              data={trendData}
              width={72}
              height={28}
              className="opacity-80"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
});
