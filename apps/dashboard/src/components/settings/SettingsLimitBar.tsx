"use client";

import { cn } from "@/lib/utils";

// =====================================================
// SettingsLimitBar -- inline capacity indicator
// =====================================================

interface SettingsLimitBarProps {
  label: string;
  current: number;
  limit: number | null;
  onAction?: () => void;
  actionLabel?: string;
}

export function SettingsLimitBar({
  label,
  current,
  limit,
  onAction,
  actionLabel,
}: SettingsLimitBarProps) {
  if (limit === null) return null;

  const percentage = Math.min((current / limit) * 100, 100);
  const isOverLimit = current > limit;
  const isAtLimit = current >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {label}: <span className="tabular-nums font-medium text-foreground">{current}/{limit}</span>
        </span>
        {onAction && actionLabel && isAtLimit && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs text-primary hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isOverLimit
              ? "bg-destructive"
              : isAtLimit
                ? "bg-muted-foreground/50"
                : "bg-primary/40",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
