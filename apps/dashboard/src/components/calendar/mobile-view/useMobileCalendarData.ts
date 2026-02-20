import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { getSegmentClasses, getDensityConfig, getEmployeeAccentByIndex } from "@/lib/ui/calendar-theme";
import {
  getHoursInTimezone,
  getMinutesInTimezone,
  getTodayInTimezone,
  formatTimeInTimezone,
} from "@/lib/utils/timezone";
import { changeDate } from "@/lib/utils/calendar/calendar-utils";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";
import { normalizeLocale } from "@/i18n/normalizeLocale";

const SLOT_MINUTES = 30;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_MIN = 0.3;

interface UseMobileCalendarDataParams {
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  segments: ScheduleSegment[];
  gridRange: { startHour: number; endHour: number };
  timezone: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterEmployeeId: string;
  locale: string;
  onSlotClick?: (employeeId: string, time: string) => void;
  hour12Override?: boolean;
}

export function useMobileCalendarData({
  employees,
  bookingsForDayByEmployee,
  segments,
  gridRange,
  timezone,
  selectedDate,
  setSelectedDate,
  filterEmployeeId,
  locale,
  onSlotClick,
  hour12Override,
}: UseMobileCalendarDataParams) {
  const appLocale = normalizeLocale(locale);
  const resolvedLocale = appLocale === "nb" ? "nb-NO" : appLocale;

  const densityConfig = getDensityConfig("mobile");
  const SLOT_HEIGHT = densityConfig.slotHeight;

  const { startHour, endHour } = gridRange;
  const slotsPerHour = 60 / SLOT_MINUTES;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const isToday = selectedDate === getTodayInTimezone(timezone);

  const timeSlots = useMemo(() => {
    return Array.from({ length: totalSlots }, (_, i) => {
      const hours = startHour + Math.floor(i / slotsPerHour);
      const minutes = (i % slotsPerHour) * SLOT_MINUTES;
      return {
        hours,
        minutes,
        time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
      };
    });
  }, [totalSlots, startHour, slotsPerHour]);

  const allBookings = useMemo(() => {
    const flat: CalendarBooking[] = [];
    for (const list of Object.values(bookingsForDayByEmployee)) {
      flat.push(...list);
    }
    flat.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    return flat;
  }, [bookingsForDayByEmployee]);

  const bookingsBySlot = useMemo(() => {
    const map: Record<number, CalendarBooking[]> = {};
    for (const b of allBookings) {
      const h = getHoursInTimezone(b.start_time, timezone);
      const m = getMinutesInTimezone(b.start_time, timezone);
      const slotIndex = (h - startHour) * slotsPerHour + Math.floor(m / SLOT_MINUTES);
      if (slotIndex < 0 || slotIndex >= totalSlots) continue;
      if (!map[slotIndex]) map[slotIndex] = [];
      map[slotIndex].push(b);
    }
    return map;
  }, [allBookings, timezone, startHour, slotsPerHour, totalSlots]);

  const slotSegmentType = useMemo(() => {
    const map: Record<number, string> = {};
    const nonBookingSegments = segments.filter((s) => s.segment_type !== "booking");
    for (const seg of nonBookingSegments) {
      const segStartH = getHoursInTimezone(seg.start_time, timezone);
      const segStartM = getMinutesInTimezone(seg.start_time, timezone);
      const segEndH = getHoursInTimezone(seg.end_time, timezone);
      const segEndM = getMinutesInTimezone(seg.end_time, timezone);

      const firstSlot = Math.max(
        0,
        (segStartH - startHour) * slotsPerHour + Math.floor(segStartM / SLOT_MINUTES)
      );
      const lastSlot = Math.min(
        totalSlots - 1,
        (segEndH - startHour) * slotsPerHour + Math.floor(segEndM / SLOT_MINUTES) - (segEndM % SLOT_MINUTES === 0 && segEndM > 0 ? 1 : 0)
      );

      for (let i = firstSlot; i <= lastSlot; i++) {
        if (!map[i] || seg.segment_type === "closed" || seg.segment_type === "break") {
          map[i] = seg.segment_type;
        }
      }
    }
    return map;
  }, [segments, timezone, startHour, slotsPerHour, totalSlots]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const nowSlotOffset = useMemo(() => {
    if (!isToday) return null;
    const nowIso = new Date().toISOString();
    const h = getHoursInTimezone(nowIso, timezone);
    if (h < startHour || h >= endHour) return null;
    const m = getMinutesInTimezone(nowIso, timezone);
    const slotIndex = (h - startHour) * slotsPerHour + Math.floor(m / SLOT_MINUTES);
    const withinSlotFraction = (m % SLOT_MINUTES) / SLOT_MINUTES;
    return slotIndex * SLOT_HEIGHT + withinSlotFraction * SLOT_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, timezone, startHour, endHour, slotsPerHour, SLOT_HEIGHT, tick]);

  const dateHeading = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    const day = new Intl.DateTimeFormat(resolvedLocale, { day: "numeric", month: "short", timeZone: timezone }).format(d);
    const weekday = new Intl.DateTimeFormat(resolvedLocale, { weekday: "long", timeZone: timezone }).format(d);
    return { day, weekday };
  }, [selectedDate, resolvedLocale, timezone]);

  const formatBookingTime = useCallback(
    (iso: string) => {
      try {
        return formatTimeInTimezone(iso, timezone, resolvedLocale, { hour: "numeric", minute: "2-digit" }, hour12Override);
      } catch {
        const h = getHoursInTimezone(iso, timezone);
        const m = getMinutesInTimezone(iso, timezone);
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
    },
    [timezone, resolvedLocale]
  );

  const getBookingHeight = useCallback(
    (booking: CalendarBooking) => {
      const durationMin = booking.services?.duration_minutes ?? SLOT_MINUTES;
      const slots = Math.max(durationMin / SLOT_MINUTES, 1);
      return Math.max(slots * SLOT_HEIGHT, densityConfig.minCardHeight);
    },
    [SLOT_HEIGHT, densityConfig.minCardHeight]
  );

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      const hours = startHour + Math.floor(slotIndex / slotsPerHour);
      const minutes = (slotIndex % slotsPerHour) * SLOT_MINUTES;
      const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      const empId = filterEmployeeId !== "all" ? filterEmployeeId : employees[0]?.id;
      if (empId && onSlotClick) onSlotClick(empId, time);
    },
    [startHour, slotsPerHour, filterEmployeeId, employees, onSlotClick]
  );

  // Swipe gesture
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const swipeLocked = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    swipeLocked.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchRef.current.x);
    const dy = Math.abs(touch.clientY - touchRef.current.y);
    if (!swipeLocked.current && dy > dx && dy > 10) {
      touchRef.current = null;
    }
    if (dx > 10) swipeLocked.current = true;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchRef.current.x;
      const dt = Date.now() - touchRef.current.t;
      const velocity = Math.abs(dx) / dt;
      touchRef.current = null;
      if (Math.abs(dx) > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_MIN) {
        setSelectedDate(changeDate(selectedDate, dx > 0 ? -1 : 1));
      }
    },
    [selectedDate, setSelectedDate]
  );

  return {
    SLOT_HEIGHT,
    totalSlots,
    isToday,
    timeSlots,
    bookingsBySlot,
    slotSegmentType,
    nowSlotOffset,
    dateHeading,
    formatBookingTime,
    getBookingHeight,
    handleSlotClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getSegmentClasses,
    getEmployeeAccentByIndex,
  };
}
