"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarBooking } from "@/lib/types";
import { formatTimeRange, getStatusColor } from "@/lib/utils/calendar/calendar-utils";
import { BookingEvent } from "./BookingEvent";

interface DayViewProps {
  selectedDate: string;
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  openingHours?: { open_time: string; close_time: string } | null;
  onBookingClick?: (booking: CalendarBooking) => void;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

// Generate time slots (30-minute intervals from 9:00 to 21:00)
// 9:00 to 21:00 = 12 hours = 24 slots
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hours = 9 + Math.floor(i / 2);
  const minutes = i % 2 === 0 ? 0 : 30;
  return { hours, minutes, time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}` };
});

// Height per 30-minute slot in pixels (reduced from 60px to 32px for compact view)
const SLOT_HEIGHT = 32;

export function DayView({
  selectedDate,
  employees,
  bookingsForDayByEmployee,
  openingHours,
  onBookingClick,
  translations,
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);

  // Check if current time is within selected date
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const selectedDateObj = new Date(selectedDate + "T00:00:00");

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount (only if within 9-21 range)
  useEffect(() => {
    if (scrollContainerRef.current && nowLineRef.current && isToday) {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= 9 && hours < 21) {
        const minutes = now.getMinutes();
        // Calculate slot index relative to 9:00 (slot 0)
        const slotIndex = (hours - 9) * 2 + Math.floor(minutes / 30);
        const scrollPosition = slotIndex * SLOT_HEIGHT;
        scrollContainerRef.current.scrollTop = scrollPosition - 100; // Offset to show some context
      }
    }
  }, [selectedDate, isToday]);

  // Calculate position of "now line" (only if within 9-21 range)
  const getNowLinePosition = () => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    if (hours < 9 || hours >= 21) return null; // Outside visible range
    const minutes = now.getMinutes();
    // Calculate slot index relative to 9:00 (slot 0)
    const slotIndex = (hours - 9) * 2 + Math.floor(minutes / 30);
    const position = slotIndex * SLOT_HEIGHT + (minutes % 30) * (SLOT_HEIGHT / 30); // Proportional position within slot
    return position;
  };

  const nowLinePosition = getNowLinePosition();

  // Calculate booking position and height (relative to 9:00)
  const getBookingPosition = (booking: CalendarBooking) => {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const startHours = start.getHours();
    const startMinutes = start.getMinutes();
    const endHours = end.getHours();
    const endMinutes = end.getMinutes();

    // Clamp to visible range (9-21)
    const visibleStartHours = Math.max(startHours, 9);
    const visibleStartMinutes = startHours < 9 ? 0 : startMinutes;
    const visibleEndHours = Math.min(endHours, 21);
    const visibleEndMinutes = endHours > 21 ? 0 : endMinutes;

    // Calculate slot indices relative to 9:00
    const startSlot = (visibleStartHours - 9) * 2 + Math.floor(visibleStartMinutes / 30);
    const endSlot = (visibleEndHours - 9) * 2 + Math.floor(visibleEndMinutes / 30);
    const durationSlots = Math.max(endSlot - startSlot, 1); // At least 1 slot

    const top = startSlot * SLOT_HEIGHT + (visibleStartMinutes % 30) * (SLOT_HEIGHT / 30);
    const height = durationSlots * SLOT_HEIGHT + (visibleEndMinutes % 30) * (SLOT_HEIGHT / 30) - (visibleStartMinutes % 30) * (SLOT_HEIGHT / 30);

    return { top, height, isVisible: startHours < 21 && endHours >= 9 };
  };

  const employeeWidth = employees.length > 0 ? `calc((100% - 80px) / ${employees.length})` : "0";

  const totalHeight = TIME_SLOTS.length * SLOT_HEIGHT;

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-background">
      {/* Header with employee names */}
      <div className="sticky top-0 z-20 flex border-b bg-background">
        <div className="w-[80px] border-r bg-muted/50 px-2 py-1.5 text-[10px] font-medium text-muted-foreground">Time</div>
        {employees.map((employee) => (
          <div key={employee.id} className="flex-1 border-r px-2 py-1.5 text-xs font-medium last:border-r-0">
            {employee.full_name}
          </div>
        ))}
      </div>

      {/* Time grid - no scrolling needed, fits 9-21 in view */}
      <div ref={scrollContainerRef} className="relative overflow-hidden">
        <div className="relative flex" style={{ height: `${totalHeight}px` }}>
          {/* Time labels */}
          <div className="sticky left-0 z-10 w-[80px] border-r bg-muted/30">
            {TIME_SLOTS.map((slot, index) => (
              <div
                key={index}
                className="relative border-b border-dashed border-border/50"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                {slot.minutes === 0 && (
                  <span className="absolute left-1 top-0.5 text-[10px] text-muted-foreground">{slot.time}</span>
                )}
              </div>
            ))}
          </div>

          {/* Employee lanes */}
          {employees.map((employee, empIndex) => {
            const bookings = bookingsForDayByEmployee[employee.id] || [];
            return (
              <div
                key={employee.id}
                className="relative border-r last:border-r-0"
                style={{
                  width: employeeWidth,
                  height: `${totalHeight}px`,
                }}
              >
                {/* Business hours shading - all slots 9-21 are business hours, so no shading needed */}

                {/* Bookings - only show if within visible range (9-21) */}
                {bookings
                  .filter((booking) => {
                    const start = new Date(booking.start_time);
                    const end = new Date(booking.end_time);
                    return start.getHours() < 21 && end.getHours() >= 9;
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
                          height: `${Math.max(height, SLOT_HEIGHT * 0.5)}px`, // Minimum height
                          width: "calc(100% - 4px)",
                          left: "2px",
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
              className="absolute left-[80px] right-0 z-10 flex items-center pointer-events-none"
              style={{ top: `${nowLinePosition}px` }}
            >
              <div className="h-0.5 w-full bg-red-500" />
              <div className="absolute left-0 h-1.5 w-1.5 rounded-full bg-red-500" style={{ marginLeft: "-3px", marginTop: "-3px" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
