import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TimePeriod = "7d" | "30d" | "90d";

type PageHeaderProps = {
  /** Page title (displayed as h1) */
  title: string;
  /** Optional page description */
  description?: string;
  /** Actions to display on the right (e.g., buttons) */
  actions?: ReactNode;
  /** Breadcrumbs slot (rendered above title) */
  breadcrumbs?: ReactNode;
  /** Show period selector (7d/30d/90d) */
  showPeriodSelector?: boolean;
  /** Current selected period */
  period?: TimePeriod;
  /** Callback when period changes */
  onPeriodChange?: (period: TimePeriod) => void;
};

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  showPeriodSelector = false,
  period = "7d",
  onPeriodChange,
}: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="text-xs text-muted-foreground">{breadcrumbs}</nav>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          {showPeriodSelector && onPeriodChange && (
            <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onPeriodChange(opt.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    period === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions}
        </div>
      </div>
    </div>
  );
}


