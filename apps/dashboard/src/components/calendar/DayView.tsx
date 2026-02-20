"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";
import { BookingEvent } from "./BookingEvent";
import { TimeBlockEvent } from "./TimeBlockEvent";
import { SlotContextMenu } from "./SlotContextMenu";
import {
  getSegmentClasses,
  getEmployeeAccentByIndex,
  getDensityConfig,
  type CalendarDensity,
} from "@/lib/ui/calendar-theme";
import { getHoursInTimezone, getTodayInTimezone } from "@/lib/utils/timezone";
import { buildTimeSlots, getNowLinePosition, getBookingPosition, getSegmentPosition, getClosedLabel } from "./day-view-helpers";

interface DayViewProps {
  selectedDate: string;
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  segments: ScheduleSegment[];
  gridRange: { startHour: number; endHour: number };
  timezone: string;
  onBookingClick?: (booking: CalendarBooking) => void;
  onSlotClick?: (employeeId: string, time: string) => void;
  onBlockTimeClick?: (employeeId: string, time: string) => void;
  density?: CalendarDensity;
  selectedBookingId?: string;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

export function DayView({
  selectedDate,
  employees,
  bookingsForDayByEmployee,
  segments,
  gridRange,
  timezone,
  onBookingClick,
  onSlotClick,
  onBlockTimeClick,
  density = "comfortable",
  selectedBookingId,
  translations,
}: DayViewProps) {
  const densityConfig = getDensityConfig(density);
  const SLOT_HEIGHT = densityConfig.slotHeight;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    employeeId: string;
    time: string;
  } | null>(null);

  const { startHour, endHour } = gridRange;
  const totalSlots = (endHour - startHour) * 2;
  const timeSlots = buildTimeSlots(startHour, endHour);
  const isToday = selectedDate === getTodayInTimezone(timezone);

  useEffect(() => {
    if (scrollContainerRef.current && isToday) {
      const nowIso = new Date().toISOString();
      const hours = getHoursInTimezone(nowIso, timezone);
      if (hours >= startHour && hours < endHour) {
        const pos = getNowLinePosition(selectedDate, timezone, startHour, endHour, SLOT_HEIGHT);
        if (pos !== null) scrollContainerRef.current.scrollTop = pos - 100;
      }
    }
  }, [selectedDate, isToday, startHour, endHour, SLOT_HEIGHT, timezone]);

  const nowLinePosition = getNowLinePosition(selectedDate, timezone, startHour, endHour, SLOT_HEIGHT);

  const handleSlotClick = useCallback(
    (e: React.MouseEvent, employeeId: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const slotIndex = Math.floor(relativeY / SLOT_HEIGHT);
      const hours = startHour + Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        employeeId,
        time,
      });
    },
    [startHour, SLOT_HEIGHT]
  );

  const totalHeight = totalSlots * SLOT_HEIGHT;
  const employeeWidth =
    employees.length > 0
      ? `calc((100% - 64px) / ${employees.length})`
      : "0";

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-background">
      {/* Sticky header with employee names + accent */}
      <div className="sticky top-0 z-20 flex border-b bg-background">
        <div className="w-16 shrink-0 border-r bg-muted/50 px-1 py-1.5 text-xs font-medium text-muted-foreground">
          Time
        </div>
        {employees.map((employee, empIndex) => {
          const accent = getEmployeeAccentByIndex(empIndex);
          return (
            <div
              key={employee.id}
              className={`relative flex-1 border-r last:border-r-0 border-t-2 ${accent.border}`}
              style={{ width: employeeWidth }}
            >
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${accent.dot}`} />
                <span className="text-sm font-medium truncate">
                  {employee.full_name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-auto"
        style={{ maxHeight: "calc(100vh - 260px)" }}
      >
        <div className="relative flex" style={{ height: `${totalHeight}px` }}>
          {/* Sticky time labels */}
          <div className="sticky left-0 z-10 w-16 shrink-0 border-r bg-muted/30">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="relative border-b border-dashed border-border/40"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                {slot.minutes === 0 && (
                  <span className="absolute left-1 top-0.5 text-xs font-semibold text-foreground">
                    {slot.time}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Employee lanes */}
          {employees.map((employee) => {
            const empSegments = segments.filter(
              (s) => s.employee_id === employee.id
            );
            const bookings = bookingsForDayByEmployee[employee.id] || [];

            return (
              <div
                key={employee.id}
                className="relative flex-1 border-r last:border-r-0 cursor-pointer"
                style={{ height: `${totalHeight}px` }}
                onClick={(e) => {
                  // Only trigger if clicking directly on the lane (not on a booking/block)
                  if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.slot === "true") {
                    handleSlotClick(e, employee.id);
                  }
                }}
              >
                {/* Grid lines */}
                {timeSlots.map((_, index) => (
                  <div
                    key={index}
                    data-slot="true"
                    className="absolute left-0 right-0 border-b border-dashed border-border/30"
                    style={{
                      top: `${index * SLOT_HEIGHT}px`,
                      height: `${SLOT_HEIGHT}px`,
                    }}
                  />
                ))}

                {/* Segment backgrounds (availability layer) */}
                {empSegments
                  .filter((s) => s.segment_type !== "booking")
                  .map((segment, i) => {
                    const { top, height } = getSegmentPosition(segment, timezone, startHour, endHour, SLOT_HEIGHT);
                    if (height <= 0) return null;

                    return (
                      <div
                        key={`seg-${i}`}
                        className={`absolute left-0 right-0 pointer-events-none ${getSegmentClasses(segment.segment_type)}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        {segment.segment_type === "time_block" && (
                          <TimeBlockEvent
                            title={segment.metadata.title || "Blocked"}
                            blockType={segment.metadata.block_type || "other"}
                            style={{ height: `${height}px` }}
                          />
                        )}
                        {segment.segment_type === "break" && height > 16 && (
                          <span className="absolute left-1 top-0.5 text-xs text-muted-foreground/70 pointer-events-none">
                            {segment.metadata.break_label || "Break"}
                          </span>
                        )}
                        {segment.segment_type === "closed" && height > 20 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground/50 pointer-events-none">
                            {getClosedLabel(segment.metadata.reason_code)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                {/* Booking events */}
                {bookings
                  .filter((b) => {
                    const h = getHoursInTimezone(b.start_time, timezone);
                    const eh = getHoursInTimezone(b.end_time, timezone);
                    return h < endHour && eh >= startHour;
                  })
                  .map((booking) => {
                    const { top, height } = getBookingPosition(booking, timezone, startHour, endHour, SLOT_HEIGHT, density);
                    return (
                      <BookingEvent
                        key={booking.id}
                        booking={booking}
                        isSelected={booking.id === selectedBookingId}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          height: `${height}px`,
                          width: "calc(100% - 4px)",
                          left: "2px",
                          zIndex: 5,
                        }}
                        onClick={onBookingClick}
                        translations={translations}
                      />
                    );
                  })}
              </div>
            );
          })}

          {/* Now line indicator (premium) */}
          {isToday && nowLinePosition !== null && (
            <div
              ref={nowLineRef}
              className="absolute left-16 right-0 z-10 flex items-center pointer-events-none"
              style={{ top: `${nowLinePosition}px` }}
            >
              {/* Glow dot */}
              <div className="absolute -left-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" />
              {/* Line */}
              <div className="h-[2px] w-full bg-red-500" />
              {/* Now badge */}
              <span className="absolute -left-16 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Now
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Context menu for empty slot click */}
      {contextMenu && (
        <SlotContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          employeeName={
            employees.find((e) => e.id === contextMenu.employeeId)?.full_name ||
            ""
          }
          time={contextMenu.time}
          onNewBooking={() => {
            onSlotClick?.(contextMenu.employeeId, contextMenu.time);
            setContextMenu(null);
          }}
          onBlockTime={() => {
            onBlockTimeClick?.(contextMenu.employeeId, contextMenu.time);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
