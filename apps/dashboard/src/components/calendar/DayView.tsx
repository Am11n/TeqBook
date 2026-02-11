"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CalendarBooking, ScheduleSegment } from "@/lib/types";
import { BookingEvent } from "./BookingEvent";
import { TimeBlockEvent } from "./TimeBlockEvent";
import { SlotContextMenu } from "./SlotContextMenu";

interface DayViewProps {
  selectedDate: string;
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  segments: ScheduleSegment[];
  gridRange: { startHour: number; endHour: number };
  onBookingClick?: (booking: CalendarBooking) => void;
  onSlotClick?: (employeeId: string, time: string) => void;
  onBlockTimeClick?: (employeeId: string, time: string) => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

const SLOT_HEIGHT = 40; // px per 30-minute slot

export function DayView({
  selectedDate,
  employees,
  bookingsForDayByEmployee,
  segments,
  gridRange,
  onBookingClick,
  onSlotClick,
  onBlockTimeClick,
  translations,
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    employeeId: string;
    time: string;
  } | null>(null);

  const { startHour, endHour } = gridRange;
  const totalSlots = (endHour - startHour) * 2; // 30-min slots

  const timeSlots = Array.from({ length: totalSlots }, (_, i) => {
    const hours = startHour + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? 0 : 30;
    return {
      hours,
      minutes,
      time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    };
  });

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current && isToday) {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= startHour && hours < endHour) {
        const minutes = now.getMinutes();
        const slotIndex = (hours - startHour) * 2 + Math.floor(minutes / 30);
        scrollContainerRef.current.scrollTop = slotIndex * SLOT_HEIGHT - 100;
      }
    }
  }, [selectedDate, isToday, startHour, endHour]);

  // Now line position
  const getNowLinePosition = () => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    if (hours < startHour || hours >= endHour) return null;
    const minutes = now.getMinutes();
    const slotIndex = (hours - startHour) * 2 + Math.floor(minutes / 30);
    return slotIndex * SLOT_HEIGHT + (minutes % 30) * (SLOT_HEIGHT / 30);
  };

  const nowLinePosition = getNowLinePosition();

  // Booking position calculation
  const getBookingPosition = (booking: CalendarBooking) => {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const startH = start.getHours();
    const startM = start.getMinutes();
    const endH = end.getHours();
    const endM = end.getMinutes();

    const clampedStartH = Math.max(startH, startHour);
    const clampedStartM = startH < startHour ? 0 : startM;
    const clampedEndH = Math.min(endH, endHour);
    const clampedEndM = endH > endHour ? 0 : endM;

    const startSlot = (clampedStartH - startHour) * 2 + Math.floor(clampedStartM / 30);
    const endSlot = (clampedEndH - startHour) * 2 + Math.floor(clampedEndM / 30);
    const durationSlots = Math.max(endSlot - startSlot, 1);

    const top =
      startSlot * SLOT_HEIGHT + (clampedStartM % 30) * (SLOT_HEIGHT / 30);
    const height =
      durationSlots * SLOT_HEIGHT +
      (clampedEndM % 30) * (SLOT_HEIGHT / 30) -
      (clampedStartM % 30) * (SLOT_HEIGHT / 30);

    return { top, height: Math.max(height, SLOT_HEIGHT * 0.5) };
  };

  // Segment position calculation
  const getSegmentPosition = (segment: ScheduleSegment) => {
    const start = new Date(segment.start_time);
    const end = new Date(segment.end_time);
    const startH = Math.max(start.getHours(), startHour);
    const startM = start.getHours() < startHour ? 0 : start.getMinutes();
    const endH = Math.min(end.getHours(), endHour);
    const endM = end.getHours() >= endHour ? 0 : end.getMinutes();

    const startPx =
      ((startH - startHour) * 2 + startM / 30) * SLOT_HEIGHT;
    const endPx =
      ((endH - startHour) * 2 + endM / 30) * SLOT_HEIGHT;

    return { top: startPx, height: Math.max(endPx - startPx, 2) };
  };

  // Handle click on empty slot
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
    [startHour]
  );

  const totalHeight = totalSlots * SLOT_HEIGHT;
  const employeeWidth =
    employees.length > 0
      ? `calc((100% - 64px) / ${employees.length})`
      : "0";

  // Get segment bg class
  const getSegmentBg = (type: string) => {
    switch (type) {
      case "working":
        return "bg-green-50/40 dark:bg-green-950/20";
      case "break":
        return "bg-gray-100 dark:bg-gray-800/50 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.04)_4px,rgba(0,0,0,0.04)_8px)]";
      case "time_block":
        return "bg-gray-200/70 dark:bg-gray-700/50";
      case "buffer":
        return "bg-amber-50/50 dark:bg-amber-950/20 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.03)_3px,rgba(0,0,0,0.03)_6px)]";
      case "closed":
        return "bg-gray-100 dark:bg-gray-800/60 bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(0,0,0,0.06)_6px,rgba(0,0,0,0.06)_12px)]";
      default:
        return "";
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-background">
      {/* Sticky header with employee names */}
      <div className="sticky top-0 z-20 flex border-b bg-background">
        <div className="w-16 shrink-0 border-r bg-muted/50 px-1 py-1.5 text-[10px] font-medium text-muted-foreground">
          Time
        </div>
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex-1 border-r px-2 py-1.5 text-xs font-medium truncate last:border-r-0"
            style={{ width: employeeWidth }}
          >
            {employee.full_name}
          </div>
        ))}
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
                  <span className="absolute left-1 top-0.5 text-[10px] font-medium text-muted-foreground">
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
                    const { top, height } = getSegmentPosition(segment);
                    if (height <= 0) return null;

                    return (
                      <div
                        key={`seg-${i}`}
                        className={`absolute left-0 right-0 pointer-events-none ${getSegmentBg(segment.segment_type)}`}
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
                          <span className="absolute left-1 top-0.5 text-[9px] text-muted-foreground/70 pointer-events-none">
                            {segment.metadata.break_label || "Break"}
                          </span>
                        )}
                        {segment.segment_type === "closed" && height > 20 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground/50 pointer-events-none">
                            {segment.metadata.reason_code === "salon_closed"
                              ? "Closed"
                              : segment.metadata.reason_code === "no_shifts"
                                ? "No shifts"
                                : segment.metadata.reason_code === "no_opening_hours"
                                  ? "No hours"
                                  : "Closed"}
                          </span>
                        )}
                      </div>
                    );
                  })}

                {/* Booking events */}
                {bookings
                  .filter((b) => {
                    const h = new Date(b.start_time).getHours();
                    const eh = new Date(b.end_time).getHours();
                    return h < endHour && eh >= startHour;
                  })
                  .map((booking) => {
                    const { top, height } = getBookingPosition(booking);
                    return (
                      <BookingEvent
                        key={booking.id}
                        booking={booking}
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

          {/* Now line indicator */}
          {isToday && nowLinePosition !== null && (
            <div
              ref={nowLineRef}
              className="absolute left-16 right-0 z-10 flex items-center pointer-events-none"
              style={{ top: `${nowLinePosition}px` }}
            >
              <div className="absolute -left-1 h-2 w-2 rounded-full bg-red-500" />
              <div className="h-[2px] w-full bg-red-500/80" />
              <span className="absolute -left-16 text-[9px] font-medium text-red-500 bg-background px-1 rounded">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
