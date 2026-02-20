"use client";

import { useRef, useEffect } from "react";
import {
  getHoursInTimezone,
  getMinutesInTimezone,
} from "@/lib/utils/timezone";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { getEmployeeAccentByIndex } from "@/lib/ui/calendar-theme";
import { useMobileCalendarData } from "./mobile-view/useMobileCalendarData";
import { MobileDateHeader } from "./mobile-view/MobileDateHeader";
import { ChipButton } from "./mobile-view/ChipButton";
import { MobileBookingCard } from "./mobile-view/MobileBookingCard";
import { MobileSkeleton } from "./mobile-view/MobileSkeleton";

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const {
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
  } = useMobileCalendarData({
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
    hour12Override: salon?.time_format === "12h" ? true : undefined,
  });

  // Autoscroll to "now" on mount
  useEffect(() => {
    if (!scrollContainerRef.current || !isToday || loading) return;
    const nowIso = new Date().toISOString();
    const hours = getHoursInTimezone(nowIso, timezone);
    if (hours >= gridRange.startHour && hours < gridRange.endHour) {
      const minutes = getMinutesInTimezone(nowIso, timezone);
      const slotsPerHour = 2;
      const slotIndex = (hours - gridRange.startHour) * slotsPerHour + Math.floor(minutes / 30);
      const offset = slotIndex * SLOT_HEIGHT - 60;
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({ top: Math.max(0, offset), behavior: "instant" });
      });
    }
  }, [selectedDate, isToday, loading, timezone, gridRange.startHour, gridRange.endHour, SLOT_HEIGHT]);

  // Auto-scroll selected chip to center
  useEffect(() => {
    const key = filterEmployeeId || "all";
    const el = chipRefs.current.get(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [filterEmployeeId]);

  const showChips = employees.length > 1;

  return (
    <div
      className="flex flex-col md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <MobileDateHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isToday={isToday}
        dateHeading={dateHeading}
        onGoToToday={onGoToToday}
        onFindAvailable={onFindAvailable}
        onSwitchToWeek={onSwitchToWeek}
      />

      {showChips && (
        <div className="sticky top-[57px] z-20 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none">
            <ChipButton
              ref={(el) => { if (el) chipRefs.current.set("all", el); }}
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
                  ref={(el) => { if (el) chipRefs.current.set(emp.id, el); }}
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
                  className={`relative flex border-b ${isHourMark ? "border-border/60 bg-muted/5" : "border-border/15"} ${segBg}`}
                  style={{ minHeight: `${SLOT_HEIGHT}px` }}
                  onClick={() => { if (slotBookings.length === 0) handleSlotClick(idx); }}
                >
                  <div className="w-12 shrink-0 pt-0.5 pr-2 text-right">
                    {isHourMark && (
                      <span className="text-xs font-semibold text-foreground">{slot.time}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {slotBookings.length > 0 && (
                      <div className="flex flex-col gap-1 py-0.5 pr-2">
                        {slotBookings.map((booking) => {
                          const empIdx = employees.findIndex((e) => e.id === booking.employees?.id);
                          return (
                            <MobileBookingCard
                              key={booking.id}
                              booking={booking}
                              height={getBookingHeight(booking)}
                              showEmployee={filterEmployeeId === "all"}
                              employeeIndex={empIdx >= 0 ? empIdx : undefined}
                              formatTime={formatBookingTime}
                              onClick={onBookingClick}
                              translations={translations}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {nowSlotOffset !== null && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${nowSlotOffset}px` }}
              >
                <span className="ml-1 rounded bg-primary px-1.5 py-px text-[10px] font-semibold text-primary-foreground">
                  Nå
                </span>
                <div className="h-[2px] flex-1 bg-primary/50" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
