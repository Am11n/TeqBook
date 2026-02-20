"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAN_TYPES, type PlanType } from "@/lib/config/feature-limits";
import { ChevronDown } from "lucide-react";
import type { MatrixState } from "./types";

interface PlanColumnHeaderProps {
  plan: PlanType;
  matrix: MatrixState;
  featureCount: number;
  salonCount: number;
  onEnableAll: (plan: PlanType) => void;
  onDisableAll: (plan: PlanType) => void;
  onCopyFrom: (source: PlanType, target: PlanType) => void;
}

export function PlanColumnHeader({
  plan,
  matrix,
  featureCount,
  salonCount,
  onEnableAll,
  onDisableAll,
  onCopyFrom,
}: PlanColumnHeaderProps) {
  const enabledCount = Object.values(matrix).filter(
    (cells) => cells[plan]?.enabled
  ).length;

  return (
    <div className="flex flex-col items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 text-sm font-semibold capitalize hover:text-primary transition-colors">
            {plan}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => onEnableAll(plan)}>
            Enable all
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDisableAll(plan)}>
            Disable all
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PLAN_TYPES.filter((p) => p !== plan).map((source) => (
            <DropdownMenuItem
              key={source}
              onClick={() => onCopyFrom(source, plan)}
            >
              Copy from {source}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-[10px] text-muted-foreground">
        {enabledCount}/{featureCount} ·{" "}
        {salonCount} salon{salonCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
