import { ReactNode } from "react";
import { cn } from "@teqbook/ui";

type TimePeriod = "7d" | "30d" | "90d";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  showPeriodSelector?: boolean;
  period?: TimePeriod;
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
  const hasActions = !!(actions || (showPeriodSelector && onPeriodChange));

  return (
    <div>
      {breadcrumbs && (
        <nav className="mb-2 text-xs text-muted-foreground">{breadcrumbs}</nav>
      )}

      <h1 className="text-lg font-semibold tracking-tight md:text-xl">
        {title}
      </h1>

      {(description || hasActions) && (
        <div className="mt-1 flex items-center gap-4">
          {description && (
            <p className="text-xs text-muted-foreground md:text-sm">
              {description}
            </p>
          )}

          {hasActions && (
            <div className="flex items-center gap-2 shrink-0 ml-auto">
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
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
