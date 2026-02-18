"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Calendar, ArrowRight } from "lucide-react";
import { changeDate } from "@/lib/utils/calendar/calendar-utils";
import { getBookingClasses, getEmployeeAccentByIndex, getDensityConfig, getSegmentClasses } from "@/lib/ui/calendar-theme";
import {
  getHoursInTimezone,
  getMinutesInTimezone,
  getTodayInTimezone,
  formatTimeInTimezone,
} from "@/lib/utils/timezone";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SLOT_MINUTES = 30;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_MIN = 0.3; // px/ms

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarMobileViewProps {
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  segments: ScheduleSegment[];
  gridRange: { startHour: number; endHour: number };
  timezone: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterEmployeeId: string;
  setFilterEmployeeId: (id: string) => void;
  loading?: boolean;
  onBookingClick?: (booking: CalendarBooking) => void;
  onSlotClick?: (employeeId: string, time: string) => void;
  onFindAvailable?: () => void;
  onGoToToday?: () => void;
  onSwitchToWeek?: () => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
    filterEmployeeAll: string;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalendarMobileView({
  employees,
  bookingsForDayByEmployee,
  segments,
  gridRange,
  timezone,
  selectedDate,
  setSelectedDate,
  filterEmployeeId,
  setFilterEmployeeId,
  loading,
  onBookingClick,
  onSlotClick,
  onFindAvailable,
  onGoToToday,
  onSwitchToWeek,
  translations,
}: CalendarMobileViewProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const resolvedLocale = appLocale === "nb" ? "nb-NO" : appLocale;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [showOverflow, setShowOverflow] = useState(false);

  const densityConfig = getDensityConfig("mobile");
  const SLOT_HEIGHT = densityConfig.slotHeight;

  const { startHour, endHour } = gridRange;
  const slotsPerHour = 60 / SLOT_MINUTES;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const isToday = selectedDate === getTodayInTimezone(timezone);

  // ── Time slots array ──────────────────────────────────
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

  // ── All bookings flat, sorted by time ─────────────────
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

  // ── Map bookings to their slot index ──────────────────
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

  // ── Map segment type to each slot (for background) ────
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

  // ── Autoscroll to "now" on mount ──────────────────────
  useEffect(() => {
    if (!scrollContainerRef.current || !isToday || loading) return;
    const nowIso = new Date().toISOString();
    const hours = getHoursInTimezone(nowIso, timezone);
    if (hours >= startHour && hours < endHour) {
      const minutes = getMinutesInTimezone(nowIso, timezone);
      const slotIndex = (hours - startHour) * slotsPerHour + Math.floor(minutes / SLOT_MINUTES);
      const offset = slotIndex * SLOT_HEIGHT - 60;
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({ top: Math.max(0, offset), behavior: "instant" });
      });
    }
  }, [selectedDate, isToday, loading, timezone, startHour, endHour, slotsPerHour, SLOT_HEIGHT]);

  // ── Now-line position (re-computes every minute) ───────
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

  // ── Swipe gesture ─────────────────────────────────────
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
    // Lock to vertical scroll if mostly vertical movement
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

  // ── Auto-scroll selected chip to center ───────────────
  useEffect(() => {
    const key = filterEmployeeId || "all";
    const el = chipRefs.current.get(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [filterEmployeeId]);

  // ── Date formatting ───────────────────────────────────
  const dateHeading = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    const day = new Intl.DateTimeFormat(resolvedLocale, {
      day: "numeric",
      month: "short",
      timeZone: timezone,
    }).format(d);
    const weekday = new Intl.DateTimeFormat(resolvedLocale, {
      weekday: "long",
      timeZone: timezone,
    }).format(d);
    return { day, weekday };
  }, [selectedDate, resolvedLocale, timezone]);

  const formatBookingTime = useCallback(
    (iso: string) => {
      try {
        return formatTimeInTimezone(iso, timezone, resolvedLocale, {
          hour: "numeric",
          minute: "2-digit",
        });
      } catch {
        const h = getHoursInTimezone(iso, timezone);
        const m = getMinutesInTimezone(iso, timezone);
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
    },
    [timezone, resolvedLocale]
  );

  // ── Booking card height (duration-aware) ──────────────
  const getBookingHeight = useCallback(
    (booking: CalendarBooking) => {
      const durationMin = booking.services?.duration_minutes ?? SLOT_MINUTES;
      const slots = Math.max(durationMin / SLOT_MINUTES, 1);
      return Math.max(slots * SLOT_HEIGHT, densityConfig.minCardHeight);
    },
    [SLOT_HEIGHT, densityConfig.minCardHeight]
  );

  // ── Slot click handler ────────────────────────────────
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

  // ── Close overflow on outside tap ─────────────────────
  useEffect(() => {
    if (!showOverflow) return;
    const handler = () => setShowOverflow(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showOverflow]);

  const showChips = employees.length > 1;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div
      className="flex flex-col md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Sticky date header ─────────────────────────── */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedDate(changeDate(selectedDate, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="flex flex-col items-center"
          >
            <span className="text-base font-semibold leading-tight">{dateHeading.day}</span>
            <span className="text-xs text-muted-foreground capitalize">{dateHeading.weekday}</span>
          </button>

          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="invisible absolute h-0 w-0"
            tabIndex={-1}
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedDate(changeDate(selectedDate, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Overflow menu trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverflow((v) => !v);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {showOverflow && (
                <div
                  className="absolute right-0 top-10 z-50 w-44 rounded-lg border bg-popover py-1 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isToday && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent active:bg-accent"
                      onClick={() => {
                        onGoToToday?.();
                        setShowOverflow(false);
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      I dag
                    </button>
                  )}
                  {onFindAvailable && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent active:bg-accent"
                      onClick={() => {
                        onFindAvailable();
                        setShowOverflow(false);
                      }}
                    >
                      <Search className="h-4 w-4" />
                      Finn ledig tid
                    </button>
                  )}
                  {onSwitchToWeek && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent active:bg-accent"
                      onClick={() => {
                        onSwitchToWeek();
                        setShowOverflow(false);
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Ukevisning
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee chips ─────────────────────────────── */}
      {showChips && (
        <div className="sticky top-[57px] z-20 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none">
            <ChipButton
              ref={(el) => {
                if (el) chipRefs.current.set("all", el);
              }}
              active={filterEmployeeId === "all"}
              onClick={() => setFilterEmployeeId("all")}
            >
              {translations.filterEmployeeAll}
            </ChipButton>
            {employees.map((emp, idx) => {
              const accent = getEmployeeAccentByIndex(idx);
              return (
                <ChipButton
                  key={emp.id}
                  ref={(el) => {
                    if (el) chipRefs.current.set(emp.id, el);
                  }}
                  active={filterEmployeeId === emp.id}
                  accentDot={accent.dot}
                  onClick={() => setFilterEmployeeId(emp.id)}
                >
                  {emp.full_name.split(" ")[0]}
                </ChipButton>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Time stack ─────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto"
        style={{ maxHeight: `calc(100vh - ${showChips ? 130 : 73}px)` }}
      >
        {loading ? (
          <MobileSkeleton slotCount={Math.min(totalSlots, 16)} slotHeight={SLOT_HEIGHT} />
        ) : (
          <div className="relative" style={{ minHeight: `${totalSlots * SLOT_HEIGHT}px` }}>
            {timeSlots.map((slot, idx) => {
              const slotBookings = bookingsBySlot[idx] || [];
              const isHourMark = slot.minutes === 0;
              const segType = slotSegmentType[idx];
              const segBg = segType ? getSegmentClasses(segType) : "";

              return (
                <div
                  key={idx}
                  className={`relative flex border-b ${isHourMark ? "border-border/50" : "border-border/20"} ${segBg}`}
                  style={{ minHeight: `${SLOT_HEIGHT}px` }}
                  onClick={() => {
                    if (slotBookings.length === 0) handleSlotClick(idx);
                  }}
                >
                  {/* Time label */}
                  <div className="w-12 shrink-0 pt-0.5 pr-2 text-right">
                    {isHourMark && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {slot.time}
                      </span>
                    )}
                  </div>

                  {/* Booking cards or empty space */}
                  <div className="flex-1 min-w-0">
                    {slotBookings.length > 0 ? (
                      <div className="flex flex-col gap-1 py-0.5 pr-2">
                        {slotBookings.map((booking) => (
                          <MobileBookingCard
                            key={booking.id}
                            booking={booking}
                            height={getBookingHeight(booking)}
                            showEmployee={filterEmployeeId === "all"}
                            formatTime={formatBookingTime}
                            onClick={onBookingClick}
                            translations={translations}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* ── Subtle now-line ────────────────────────── */}
            {nowSlotOffset !== null && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${nowSlotOffset}px` }}
              >
                <span className="ml-1 rounded bg-foreground/80 px-1 py-px text-[9px] font-medium text-background">
                  Nå
                </span>
                <div className="h-px flex-1 bg-foreground/30" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

import { forwardRef, type ReactNode } from "react";

interface ChipButtonProps {
  active: boolean;
  accentDot?: string;
  onClick: () => void;
  children: ReactNode;
}

const ChipButton = forwardRef<HTMLButtonElement, ChipButtonProps>(
  ({ active, accentDot, onClick, children }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          active
            ? "border-foreground/30 bg-foreground/10 text-foreground"
            : "border-border bg-background text-muted-foreground active:bg-muted"
        }`}
      >
        {accentDot && <span className={`h-2 w-2 rounded-full ${accentDot}`} />}
        {children}
      </button>
    );
  }
);
ChipButton.displayName = "ChipButton";

// ─────────────────────────────────────────────────────────

interface MobileBookingCardProps {
  booking: CalendarBooking;
  height: number;
  showEmployee: boolean;
  formatTime: (iso: string) => string;
  onClick?: (booking: CalendarBooking) => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

function MobileBookingCard({
  booking,
  height,
  showEmployee,
  formatTime,
  onClick,
  translations,
}: MobileBookingCardProps) {
  const classes = getBookingClasses(booking.status);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(booking);
      }}
      className={`w-full text-left overflow-hidden rounded-lg px-2.5 py-1.5 ${classes.card}`}
      style={{ minHeight: `${Math.max(height, 36)}px` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[11px] font-medium tabular-nums ${classes.subtitle}`}>
          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
        </span>
        {booking.status && (
          <span className={`text-[9px] font-medium uppercase tracking-wide ${classes.subtitle}`}>
            {booking.status}
          </span>
        )}
      </div>
      <p className={`text-sm font-semibold leading-tight truncate ${classes.title}`}>
        {booking.customers?.full_name ?? translations.unknownCustomer}
      </p>
      <p className={`text-xs leading-tight truncate ${classes.subtitle}`}>
        {booking.services?.name ?? translations.unknownService}
      </p>
      {showEmployee && booking.employees?.full_name && (
        <p className={`text-[11px] leading-tight truncate ${classes.subtitle}`}>
          {booking.employees.full_name}
        </p>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────

function MobileSkeleton({ slotCount, slotHeight }: { slotCount: number; slotHeight: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: slotCount }, (_, i) => (
        <div
          key={i}
          className="flex border-b border-border/20"
          style={{ minHeight: `${slotHeight}px` }}
        >
          <div className="w-12 shrink-0 pt-1 pr-2 text-right">
            {i % 2 === 0 && (
              <div className="ml-auto h-3 w-8 rounded bg-muted" />
            )}
          </div>
          <div className="flex-1 py-0.5 pr-2">
            {i % 3 === 1 && (
              <div className="h-9 rounded-lg bg-muted/60" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
