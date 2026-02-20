import type { DayForm } from "../_components/types";
import type { CopyOptions } from "../_components/CopyDayPopover";

export function updateDayInState(
  prev: DayForm[], index: number, patch: Partial<DayForm>
): DayForm[] {
  const next = [...prev];
  next[index] = { ...next[index], ...patch };
  if (patch.isOpen === false) {
    next[index].hasBreak = false;
    next[index].breakStart = "";
    next[index].breakEnd = "";
    next[index].breakLabel = "";
  }
  return next;
}

export function copyMondayToWeekdays(prev: DayForm[], opts: CopyOptions): DayForm[] {
  const monday = prev[0];
  const next = [...prev];
  for (let i = 1; i <= 4; i++) {
    if (opts.keepClosed && !next[i].isOpen) continue;
    const patch: Partial<DayForm> = { day_of_week: i };
    if (opts.overwriteTimes) {
      patch.isOpen = monday.isOpen;
      patch.openTime = monday.openTime;
      patch.closeTime = monday.closeTime;
    }
    if (!opts.keepBreaks) {
      patch.hasBreak = monday.hasBreak;
      patch.breakStart = monday.breakStart;
      patch.breakEnd = monday.breakEnd;
      patch.breakLabel = monday.breakLabel;
    }
    next[i] = { ...next[i], ...patch };
  }
  return next;
}

export function applyToAllOpenDays(prev: DayForm[], opts: CopyOptions): DayForm[] {
  const firstOpen = prev.find((d) => d.isOpen);
  if (!firstOpen) return prev;
  return prev.map((day) => {
    if (!day.isOpen && opts.keepClosed) return day;
    if (!day.isOpen) return day;
    const patch: Partial<DayForm> = {};
    if (opts.overwriteTimes) {
      patch.openTime = firstOpen.openTime;
      patch.closeTime = firstOpen.closeTime;
    }
    if (!opts.keepBreaks) {
      patch.hasBreak = firstOpen.hasBreak;
      patch.breakStart = firstOpen.breakStart;
      patch.breakEnd = firstOpen.breakEnd;
      patch.breakLabel = firstOpen.breakLabel;
    }
    return { ...day, ...patch };
  });
}
