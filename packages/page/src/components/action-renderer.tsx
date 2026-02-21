"use client";

import { Button } from "@teqbook/ui";
import type { PageAction } from "../types";

function isVisible(action: PageAction): boolean {
  if (action.visible === undefined) return true;
  if (typeof action.visible === "function") return action.visible();
  return action.visible;
}

export function renderActions(actions: PageAction[] | undefined) {
  if (!actions || actions.length === 0) return null;

  const visible = actions.filter(isVisible);
  const sorted = [...visible].sort((a, b) => {
    if (a.priority === "primary" && b.priority !== "primary") return 1;
    if (a.priority !== "primary" && b.priority === "primary") return -1;
    return 0;
  });

  return (
    <div className="flex items-center gap-2">
      {sorted.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant={action.variant ?? "default"}
            size="sm"
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {Icon && <Icon className="h-4 w-4 mr-1.5" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
