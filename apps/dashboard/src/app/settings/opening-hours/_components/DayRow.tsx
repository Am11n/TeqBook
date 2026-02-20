"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, Coffee } from "lucide-react";
import type { DayForm } from "./types";

interface DayRowProps {
  day: DayForm;
  dayName: string;
  closedLabel: string;
  validationError: string | null;
  onUpdate: (patch: Partial<DayForm>) => void;
}

export function DayRow({ day, dayName, closedLabel, validationError, onUpdate }: DayRowProps) {
  const [editingBreak, setEditingBreak] = useState(false);

  const addLunchBreak = () => {
    onUpdate({ hasBreak: true, breakStart: "12:00", breakEnd: "12:30", breakLabel: "Lunch" });
  };

  const removeBreak = () => {
    onUpdate({ hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" });
    setEditingBreak(false);
  };

  return (
    <div>
      <div
        className={`grid items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30 ${
          day.isOpen
            ? "grid-cols-[20px_100px_1fr_18px_1fr_auto]"
            : "grid-cols-[20px_100px_1fr] opacity-50"
        }`}
      >
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={day.isOpen}
            onChange={(e) => onUpdate({ isOpen: e.target.checked })}
            className="h-4 w-4 rounded border-input"
          />
        </label>

        <span className="text-sm font-medium">{dayName}</span>

        {day.isOpen ? (
          <>
            <input
              type="time"
              step="300"
              value={day.openTime}
              onChange={(e) => onUpdate({ openTime: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
            />
            <span className="text-center text-muted-foreground">
              <ArrowRight className="mx-auto h-3.5 w-3.5" />
            </span>
            <input
              type="time"
              step="300"
              value={day.closeTime}
              onChange={(e) => onUpdate({ closeTime: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
            />
            <div className="flex items-center gap-1.5">
              {day.hasBreak ? (
                <Popover open={editingBreak} onOpenChange={setEditingBreak}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <Coffee className="h-3 w-3" />
                      <span className="tabular-nums">{day.breakStart}-{day.breakEnd}</span>
                      {day.breakLabel && <span>{day.breakLabel}</span>}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Edit break</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          step="300"
                          value={day.breakStart}
                          onChange={(e) => onUpdate({ breakStart: e.target.value })}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-xs text-muted-foreground">-</span>
                        <input
                          type="time"
                          step="300"
                          value={day.breakEnd}
                          onChange={(e) => onUpdate({ breakEnd: e.target.value })}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <input
                        type="text"
                        value={day.breakLabel}
                        onChange={(e) => onUpdate({ breakLabel: e.target.value })}
                        placeholder="Label"
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                      <div className="flex justify-between pt-1">
                        <Button variant="ghost" size="sm" onClick={removeBreak} className="text-destructive hover:text-destructive text-xs">
                          Remove
                        </Button>
                        <Button size="sm" onClick={() => setEditingBreak(false)} className="text-xs">
                          Done
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={addLunchBreak}
                >
                  <Coffee className="h-3 w-3 mr-1" />
                  + Break
                </Button>
              )}
            </div>
          </>
        ) : (
          <span className="text-right text-sm text-muted-foreground">{closedLabel}</span>
        )}
      </div>

      {validationError && (
        <p className="ml-[124px] px-3 pb-1 text-xs text-destructive">
          {validationError}
        </p>
      )}
    </div>
  );
}
