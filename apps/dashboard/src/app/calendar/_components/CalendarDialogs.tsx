import { BookingSidePanel } from "@/components/calendar/BookingSidePanel";
import { QuickCreatePanel } from "@/components/calendar/QuickCreatePanel";
import { FindFirstAvailable } from "@/components/calendar/FindFirstAvailable";
import { RescheduleModal } from "@/components/calendar/RescheduleModal";
import { ChangeEmployeeModal } from "@/components/calendar/ChangeEmployeeModal";
import { CommandPalette } from "@/components/calendar/CommandPalette";
import type { CalendarPanelsState } from "../_hooks/useCalendarPanels";

interface CalendarDialogsProps {
  panels: CalendarPanelsState;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: "day" | "week") => void;
}

export function CalendarDialogs({
  panels,
  selectedDate,
  setSelectedDate,
  setViewMode,
}: CalendarDialogsProps) {
  return (
    <>
      <BookingSidePanel
        booking={panels.selectedBooking}
        open={!!panels.selectedBooking}
        onOpenChange={(open) => {
          if (!open) panels.setSelectedBooking(null);
        }}
        onBookingUpdated={panels.handleBookingUpdated}
        onReschedule={panels.handleReschedule}
        onChangeEmployee={panels.handleChangeEmployee}
        onRebook={panels.handleRebook}
      />

      <QuickCreatePanel
        open={panels.showQuickCreate}
        onOpenChange={(open) => {
          panels.setShowQuickCreate(open);
          if (!open) panels.setRebookPrefill({});
        }}
        prefillEmployeeId={panels.quickCreatePrefill.employeeId}
        prefillTime={panels.quickCreatePrefill.time}
        prefillDate={panels.quickCreatePrefill.date || selectedDate}
        prefillServiceId={panels.rebookPrefill.serviceId}
        prefillCustomerName={panels.rebookPrefill.customerName}
        prefillCustomerPhone={panels.rebookPrefill.customerPhone}
        prefillCustomerEmail={panels.rebookPrefill.customerEmail}
        onBookingCreated={panels.handleBookingCreated}
      />

      <FindFirstAvailable
        open={panels.showFindAvailable}
        onOpenChange={panels.setShowFindAvailable}
        onSlotSelected={panels.handleFindAvailableSlotSelected}
      />

      <RescheduleModal
        booking={panels.rescheduleBooking}
        open={!!panels.rescheduleBooking}
        onOpenChange={(open) => {
          if (!open) panels.setRescheduleBooking(null);
        }}
        onRescheduled={() => {
          panels.setRescheduleBooking(null);
          panels.handleBookingUpdated();
        }}
      />

      <ChangeEmployeeModal
        booking={panels.changeEmployeeBooking}
        open={!!panels.changeEmployeeBooking}
        onOpenChange={(open) => {
          if (!open) panels.setChangeEmployeeBooking(null);
        }}
        onChanged={() => {
          panels.setChangeEmployeeBooking(null);
          panels.handleBookingUpdated();
        }}
      />

      <CommandPalette
        open={panels.showCommandPalette}
        onClose={() => panels.setShowCommandPalette(false)}
        onNewBooking={panels.openNewBooking}
        onFindAvailable={() => panels.setShowFindAvailable(true)}
        onGoToDate={(date) => setSelectedDate(date)}
        onSwitchView={(view) => {
          if (view === "list") {
            setViewMode("day");
          } else {
            setViewMode(view as "day" | "week");
          }
        }}
        onSearchBooking={() => {}}
      />
    </>
  );
}
