"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Edit, Trash2 } from "lucide-react";
import { formatWeekday, getWeekdays } from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface ShiftsListViewProps {
  shifts: Shift[];
  locale: string;
  translations: {
    emptyTitle: string;
    emptyDescription: string;
    mobileUnknownEmployee: string;
  };
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
}

export function ShiftsListView({
  shifts,
  locale,
  translations,
  onEditShift,
  onDeleteShift,
}: ShiftsListViewProps) {
  const weekdays = getWeekdays(locale);

  if (shifts.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState title={translations.emptyTitle} description={translations.emptyDescription} />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-4">
            <div className="font-medium">
              {shift.employee?.full_name ?? translations.mobileUnknownEmployee}
            </div>
            <div className="text-muted-foreground">
              {formatWeekday(shift.weekday, weekdays)}
            </div>
            <div className="text-muted-foreground">
              {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditShift(shift)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDeleteShift(shift.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

