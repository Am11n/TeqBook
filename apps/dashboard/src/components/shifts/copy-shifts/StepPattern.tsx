import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Copy, Plus, Trash2 } from "lucide-react";
import type { WeekPattern } from "@/lib/hooks/shifts/useCopyShifts";
import { ISO_DAYS, getDayLabel, type CopyShiftsTranslations } from "./types";

interface StepPatternProps {
  pattern: WeekPattern;
  locale: string;
  patternHours: number;
  t: CopyShiftsTranslations;
  onDayToggle: (isoDay: number) => void;
  onIntervalChange: (isoDay: number, index: number, field: "start" | "end", value: string) => void;
  onAddInterval: (isoDay: number) => void;
  onRemoveInterval: (isoDay: number, index: number) => void;
  onCopyMondayToRest: () => void;
}

export function StepPattern({
  pattern, locale, patternHours, t,
  onDayToggle, onIntervalChange, onAddInterval, onRemoveInterval, onCopyMondayToRest,
}: StepPatternProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {ISO_DAYS.map((d) => {
          const isEnabled = pattern[d]?.enabled ?? false;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onDayToggle(d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {getDayLabel(d, locale)}
            </button>
          );
        })}
      </div>

      {pattern[1]?.enabled && pattern[1]?.intervals.length > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={onCopyMondayToRest} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          {t.copyMondayToRest}
        </Button>
      )}

      <div className="space-y-2">
        {ISO_DAYS.map((d) => {
          const day = pattern[d] ?? { enabled: false, intervals: [] };
          return (
            <div
              key={d}
              className={`rounded-lg border p-3 transition-colors ${
                day.enabled ? "bg-card" : "bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Checkbox checked={day.enabled} onCheckedChange={() => onDayToggle(d)} />
                <span className="text-sm font-medium w-10">{getDayLabel(d, locale)}</span>
              </div>

              {day.enabled && (
                <div className="space-y-2 ml-6">
                  {day.intervals.map((iv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={iv.start}
                        onChange={(e) => onIntervalChange(d, idx, "start", e.target.value)}
                        className="h-8 w-[110px] rounded-md border bg-background px-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs text-muted-foreground">–</span>
                      <input
                        type="time"
                        value={iv.end}
                        onChange={(e) => onIntervalChange(d, idx, "end", e.target.value)}
                        className="h-8 w-[110px] rounded-md border bg-background px-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {day.intervals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveInterval(d, idx)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => onAddInterval(d)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {t.copyAddInterval}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm border-t pt-3">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {t.copyTotalHours}
        </span>
        <span className="font-semibold tabular-nums">{patternHours}t</span>
      </div>
    </div>
  );
}
