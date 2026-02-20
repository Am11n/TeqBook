import type { CalendarBooking, ScheduleSegment } from "@/lib/types";

export function getClosedLabel(reasonCode?: string): string {
  if (reasonCode === "salon_closed") return "Closed";
  if (reasonCode === "no_shifts") return "No shifts";
  if (reasonCode === "no_opening_hours") return "No hours";
  return "Closed";
}
import { getDensityConfig, type CalendarDensity } from "@/lib/ui/calendar-theme";
import {
  getHoursInTimezone,
  getMinutesInTimezone,
  getTodayInTimezone,
} from "@/lib/utils/timezone";

export function buildTimeSlots(startHour: number, endHour: number) {
  const totalSlots = (endHour - startHour) * 2;
  return Array.from({ length: totalSlots }, (_, i) => {
    const hours = startHour + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? 0 : 30;
    return {
      hours,
      minutes,
      time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    };
  });
}

export function getNowLinePosition(
  selectedDate: string,
  timezone: string,
  startHour: number,
  endHour: number,
  slotHeight: number
): number | null {
  if (selectedDate !== getTodayInTimezone(timezone)) return null;
  const nowIso = new Date().toISOString();
  const hours = getHoursInTimezone(nowIso, timezone);
  if (hours < startHour || hours >= endHour) return null;
  const minutes = getMinutesInTimezone(nowIso, timezone);
  const slotIndex = (hours - startHour) * 2 + Math.floor(minutes / 30);
  return slotIndex * slotHeight + (minutes % 30) * (slotHeight / 30);
}

export function getBookingPosition(
  booking: CalendarBooking,
  timezone: string,
  startHour: number,
  endHour: number,
  slotHeight: number,
  density: CalendarDensity
) {
  const densityConfig = getDensityConfig(density);
  const startH = getHoursInTimezone(booking.start_time, timezone);
  const startM = getMinutesInTimezone(booking.start_time, timezone);
  const endH = getHoursInTimezone(booking.end_time, timezone);
  const endM = getMinutesInTimezone(booking.end_time, timezone);

  const clampedStartH = Math.max(startH, startHour);
  const clampedStartM = startH < startHour ? 0 : startM;
  const clampedEndH = Math.min(endH, endHour);
  const clampedEndM = endH > endHour ? 0 : endM;

  const startSlot = (clampedStartH - startHour) * 2 + Math.floor(clampedStartM / 30);
  const endSlot = (clampedEndH - startHour) * 2 + Math.floor(clampedEndM / 30);
  const durationSlots = Math.max(endSlot - startSlot, 1);

  const top = startSlot * slotHeight + (clampedStartM % 30) * (slotHeight / 30);
  const height =
    durationSlots * slotHeight +
    (clampedEndM % 30) * (slotHeight / 30) -
    (clampedStartM % 30) * (slotHeight / 30);

  return { top, height: Math.max(height, densityConfig.minCardHeight) };
}

export function getSegmentPosition(
  segment: ScheduleSegment,
  timezone: string,
  startHour: number,
  endHour: number,
  slotHeight: number
) {
  const rawStartH = getHoursInTimezone(segment.start_time, timezone);
  const rawStartM = getMinutesInTimezone(segment.start_time, timezone);
  const rawEndH = getHoursInTimezone(segment.end_time, timezone);
  const rawEndM = getMinutesInTimezone(segment.end_time, timezone);

  const sH = Math.max(rawStartH, startHour);
  const sM = rawStartH < startHour ? 0 : rawStartM;
  const eH = Math.min(rawEndH, endHour);
  const eM = rawEndH >= endHour ? 0 : rawEndM;

  const startPx = ((sH - startHour) * 2 + sM / 30) * slotHeight;
  const endPx = ((eH - startHour) * 2 + eM / 30) * slotHeight;

  return { top: startPx, height: Math.max(endPx - startPx, 2) };
}
