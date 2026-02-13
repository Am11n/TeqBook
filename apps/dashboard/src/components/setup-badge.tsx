"use client";

import { cn } from "@/lib/utils";
import type { Issue, IssueSeverity } from "@/lib/setup/health";

interface SetupBadgeProps {
  issues: Issue[];
  className?: string;
  /** Show only the first N issues (default: all) */
  limit?: number;
}

const severityDot: Record<IssueSeverity, string> = {
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-zinc-400",
};

const severityText: Record<IssueSeverity, string> = {
  error: "text-red-700 dark:text-red-400",
  warning: "text-yellow-700 dark:text-yellow-400",
  info: "text-muted-foreground",
};

export function SetupBadge({ issues, className, limit }: SetupBadgeProps) {
  if (issues.length === 0) return null;

  const visible = limit ? issues.slice(0, limit) : issues;
  const remaining = limit ? issues.length - limit : 0;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((issue) => (
        <span
          key={issue.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight",
            severityText[issue.severity],
          )}
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
              severityDot[issue.severity],
            )}
          />
          {issue.label}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}
