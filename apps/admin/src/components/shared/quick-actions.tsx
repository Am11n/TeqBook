"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuickAction = {
  /** Unique key */
  id: string;
  /** Action label */
  label: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost";
};

type QuickActionsProps = {
  /** List of actions to render */
  actions: QuickAction[];
  /** Additional CSS classes */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compact action button grid for the dashboard.
 * Replaces the old "Manage X" link cards with actionable buttons.
 */
export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant ?? "outline"}
            onClick={action.onClick}
            className="h-auto flex-col gap-1.5 py-3 px-3 text-xs font-medium"
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
