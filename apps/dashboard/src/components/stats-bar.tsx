"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatVariant = "default" | "success" | "warning" | "danger" | "info";

export type StatItem = {
  label: string;
  value: string | number;
  variant?: StatVariant;
  icon?: ReactNode;
};

interface StatsBarProps {
  items: StatItem[];
  className?: string;
}

const variantClasses: Record<StatVariant, string> = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function StatsBar({ items, className }: StatsBarProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border bg-card p-3 shadow-sm",
        items.length === 2 && "grid-cols-2",
        items.length === 3 && "grid-cols-3",
        items.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2"
        >
          {item.icon && (
            <span className="shrink-0 text-muted-foreground">{item.icon}</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                "text-lg font-semibold leading-tight",
                variantClasses[item.variant ?? "default"],
              )}
            >
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
