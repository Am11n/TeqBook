import { useState, useEffect, useCallback } from "react";
import { getHoursInTimezone, getMinutesInTimezone } from "@/lib/utils/timezone";
import type { CalendarBooking, Booking, AvailableSlotBatch } from "@/lib/types";

interface UseCalendarPanelsOptions {
  selectedDate: string;
  salonTimezone: string;
  refreshBookings: () => void;
  invalidateSegments: (date: string) => void;
}

export function useCalendarPanels({
  selectedDate,
  salonTimezone,
  refreshBookings,
  invalidateSegments,
}: UseCalendarPanelsOptions) {
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreatePrefill, setQuickCreatePrefill] = useState<{
    employeeId?: string;
    time?: string;
    date?: string;
  }>({});
  const [showFindAvailable, setShowFindAvailable] = useState(false);
  const [rebookPrefill, setRebookPrefill] = useState<{
    serviceId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }>({});
  const [rescheduleBooking, setRescheduleBooking] = useState<CalendarBooking | null>(null);
  const [changeEmployeeBooking, setChangeEmployeeBooking] = useState<CalendarBooking | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // ─── Keyboard shortcuts ────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (e.key === "n" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickCreatePrefill({ date: selectedDate });
        setShowQuickCreate(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        if (showCommandPalette) setShowCommandPalette(false);
        else if (showQuickCreate) setShowQuickCreate(false);
        else if (showFindAvailable) setShowFindAvailable(false);
        else if (selectedBooking) setSelectedBooking(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate, showCommandPalette, showQuickCreate, showFindAvailable, selectedBooking]);

  // ─── Handlers ──────────────────────────────────────

  const handleBookingClick = useCallback((booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setShowQuickCreate(false);
    setShowFindAvailable(false);
  }, []);

  const handleSlotClick = useCallback(
    (employeeId: string, time: string) => {
      setQuickCreatePrefill({ employeeId, time, date: selectedDate });
      setShowQuickCreate(true);
      setSelectedBooking(null);
      setShowFindAvailable(false);
    },
    [selectedDate],
  );

  const handleBlockTimeClick = useCallback(
    (employeeId: string, time: string) => {
      setQuickCreatePrefill({ employeeId, time, date: selectedDate });
    },
    [selectedDate],
  );

  const handleBookingCreated = useCallback(
    (_booking: Booking) => {
      setShowQuickCreate(false);
      refreshBookings();
      invalidateSegments(selectedDate);
    },
    [refreshBookings, invalidateSegments, selectedDate],
  );

  const handleBookingUpdated = useCallback(() => {
    setSelectedBooking(null);
    refreshBookings();
    invalidateSegments(selectedDate);
  }, [refreshBookings, invalidateSegments, selectedDate]);

  const handleReschedule = useCallback((booking: CalendarBooking) => {
    setRescheduleBooking(booking);
  }, []);

  const handleChangeEmployee = useCallback((booking: CalendarBooking) => {
    setChangeEmployeeBooking(booking);
  }, []);

  const handleRebook = useCallback((booking: CalendarBooking) => {
    const bookingDate = new Date(booking.start_time);
    const suggestedDate = new Date(bookingDate);
    suggestedDate.setDate(suggestedDate.getDate() + 28);
    const suggestedDateStr = suggestedDate.toISOString().slice(0, 10);

    setQuickCreatePrefill({
      employeeId: booking.employees?.id,
      date: suggestedDateStr,
    });
    setRebookPrefill({
      serviceId: booking.service_id || undefined,
      customerName: booking.customers?.full_name || undefined,
      customerPhone: booking.customers?.phone || undefined,
      customerEmail: booking.customers?.email || undefined,
    });
    setShowQuickCreate(true);
    setSelectedBooking(null);
  }, []);

  const handleFindAvailableSlotSelected = useCallback(
    (slot: AvailableSlotBatch) => {
      const slotDate = new Date(slot.slot_start).toISOString().slice(0, 10);
      const hours = getHoursInTimezone(slot.slot_start, salonTimezone);
      const minutes = getMinutesInTimezone(slot.slot_start, salonTimezone);
      const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      setQuickCreatePrefill({ employeeId: slot.employee_id, time, date: slotDate });
      setShowFindAvailable(false);
      setShowQuickCreate(true);
    },
    [salonTimezone],
  );

  const openNewBooking = useCallback(() => {
    setQuickCreatePrefill({ date: selectedDate });
    setShowQuickCreate(true);
  }, [selectedDate]);

  return {
    selectedBooking,
    setSelectedBooking,
    showQuickCreate,
    setShowQuickCreate,
    quickCreatePrefill,
    showFindAvailable,
    setShowFindAvailable,
    rebookPrefill,
    setRebookPrefill,
    rescheduleBooking,
    setRescheduleBooking,
    changeEmployeeBooking,
    setChangeEmployeeBooking,
    showCommandPalette,
    setShowCommandPalette,
    handleBookingClick,
    handleSlotClick,
    handleBlockTimeClick,
    handleBookingCreated,
    handleBookingUpdated,
    handleReschedule,
    handleChangeEmployee,
    handleRebook,
    handleFindAvailableSlotSelected,
    openNewBooking,
  };
}

export type CalendarPanelsState = ReturnType<typeof useCalendarPanels>;
