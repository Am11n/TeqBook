import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import type { Shift } from "@/lib/types";
import { getShortWeekday } from "./helpers";

interface ShiftRowProps {
  shift: Shift;
  locale: string;
  hasOverlap: boolean;
  hasInvalid: boolean;
  overlapLabel: string;
  invalidLabel: string;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
}

export function ShiftRow({ shift, locale, hasOverlap, hasInvalid, overlapLabel, invalidLabel, onEdit, onDelete }: ShiftRowProps) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-accent/50"
      onClick={() => onEdit(shift)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(shift); } }}
    >
      <span className="inline-flex w-10 shrink-0 items-center justify-center rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        {getShortWeekday(shift.weekday, locale)}
      </span>
      <span className="text-sm tabular-nums text-foreground">
        {shift.start_time?.slice(0, 5)} &ndash; {shift.end_time?.slice(0, 5)}
      </span>
      {hasOverlap && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300" title={overlapLabel}>
          <AlertTriangle className="h-3 w-3" /> {overlapLabel}
        </span>
      )}
      {hasInvalid && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" title={invalidLabel}>
          <AlertTriangle className="h-3 w-3" /> {invalidLabel}
        </span>
      )}
      <span className="flex-1" />
      <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onEdit(shift); }}>
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(shift.id); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </span>
    </div>
  );
}
