"use client";

import { cn } from "@teqbook/ui";
import type { ChipDef } from "../types";

interface FilterChipsProps {
  chips: ChipDef[];
  value: string[];
  onChange: (nextValue: string[]) => void;
  className?: string;
}

export function FilterChips({ chips, value, onChange, className }: FilterChipsProps) {
  if (chips.length === 0) return null;

  const toggle = (chipId: string) => {
    if (value.includes(chipId)) {
      onChange(value.filter((v) => v !== chipId));
    } else {
      onChange([...value, chipId]);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {chips.map((chip) => {
        const isActive = value.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => toggle(chip.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span
                className={cn(
                  "ml-0.5 tabular-nums",
                  isActive ? "text-primary/70" : "text-muted-foreground/60",
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
