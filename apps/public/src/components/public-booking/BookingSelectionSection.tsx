"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import type { BookingMode, Employee, PublicBookingCopy, Service, Slot, WaitlistEntrySource } from "./types";

type BookingSelectionSectionProps = {
  t: PublicBookingCopy;
  mode: BookingMode;
  serviceId: string;
  setServiceId: (value: string) => void;
  employeeId: string;
  setEmployeeId: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  services: Service[];
  employees: Employee[];
  canLoadSlots: boolean;
  loadingSlots: boolean;
  primaryColor: string;
  handleModeChange: (mode: BookingMode, source?: WaitlistEntrySource) => void;
  handleLoadSlots: (e: FormEvent) => void;
  hasAttemptedSlotLoad: boolean;
  slots: Slot[];
  selectedSlot: string;
  setSelectedSlot: (value: string) => void;
};

function withPrimaryHover(primaryColor: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = primaryColor;
    },
  };
}

export function BookingSelectionSection({
  t,
  mode,
  serviceId,
  setServiceId,
  employeeId,
  setEmployeeId,
  date,
  setDate,
  services,
  employees,
  canLoadSlots,
  loadingSlots,
  primaryColor,
  handleModeChange,
  handleLoadSlots,
  hasAttemptedSlotLoad,
  slots,
  selectedSlot,
  setSelectedSlot,
}: BookingSelectionSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const hoverHandlers = withPrimaryHover(primaryColor);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-sm font-medium tracking-tight">{t.step1Title}</h2>
        <p className="text-xs text-muted-foreground">{t.step1Description}</p>
      </div>

      <div className="space-y-2">
        <div role="tablist" aria-label={t.modeSelectorLabel || "Booking mode"} className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            role="tab"
            id="book-mode-tab"
            aria-controls="book-mode-panel"
            aria-selected={mode === "book"}
            variant={mode === "book" ? "default" : "outline"}
            onClick={() => handleModeChange("book")}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") handleModeChange("waitlist");
            }}
          >
            {t.modeBookTime || "Book time"}
          </Button>
          <Button
            type="button"
            role="tab"
            id="waitlist-mode-tab"
            aria-controls="waitlist-mode-panel"
            aria-selected={mode === "waitlist"}
            variant={mode === "waitlist" ? "outline" : "ghost"}
            onClick={() => handleModeChange("waitlist")}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") handleModeChange("book");
            }}
          >
            {t.modeWaitlist || "Notify me when available"}
          </Button>
        </div>
        {isWaitlistMode && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
            <p>{t.waitlistHowItWorks || "When a slot becomes available, we will send you a link by SMS or email."}</p>
            <p className="mt-1">{t.waitlistResponseWindow || "You typically have 15 minutes to confirm."}</p>
            <p className="mt-1">{t.waitlistDeadlineHint || "Confirm before the deadline to secure the appointment."}</p>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          if (isWaitlistMode) {
            e.preventDefault();
            return;
          }
          handleLoadSlots(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-2 text-sm">
          <label className="font-medium" htmlFor="service">{t.serviceLabel}</label>
          <DialogSelect
            value={serviceId}
            onChange={setServiceId}
            required
            placeholder={t.servicePlaceholder}
            options={[
              { value: "", label: t.servicePlaceholder },
              ...services.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>

        <div className="space-y-2 text-sm">
          <label className="font-medium" htmlFor="employee">{t.employeeLabel}</label>
          <DialogSelect
            value={employeeId}
            onChange={setEmployeeId}
            required={!isWaitlistMode}
            placeholder={isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder}
            options={[
              { value: "", label: isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder },
              ...employees.map((emp) => ({ value: emp.id, label: emp.full_name })),
            ]}
          />
        </div>

        <div className="space-y-2 text-sm">
          <label className="font-medium" htmlFor="date">{t.dateLabel}</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {!isWaitlistMode && (
          <Button
            type="submit"
            className="w-full"
            disabled={!canLoadSlots || loadingSlots}
            style={{ backgroundColor: primaryColor, color: "white" }}
            {...hoverHandlers}
          >
            {loadingSlots ? t.loadingSlots : t.loadSlots}
          </Button>
        )}
      </form>

      {!isWaitlistMode && (
        <div id="book-mode-panel" role="tabpanel" aria-labelledby="book-mode-tab" className="space-y-2 text-sm">
          <label className="font-medium" htmlFor="slot">{t.step2Label}</label>
          <DialogSelect
            value={selectedSlot}
            onChange={setSelectedSlot}
            required
            placeholder={slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder}
            options={[
              { value: "", label: slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder },
              ...slots.map((slot) => ({ value: slot.start, label: slot.label })),
            ]}
          />
        </div>
      )}

      {!isWaitlistMode && hasAttemptedSlotLoad && !loadingSlots && slots.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">{t.waitlistTitle || "No slots available right now"}</p>
          <p className="mt-1 text-amber-800">{t.waitlistDescription || "Join the waitlist and the salon can contact you if something opens up."}</p>
          <Button
            type="button"
            className="mt-3 w-full"
            variant="outline"
            onClick={() => handleModeChange("waitlist", "no-slots")}
          >
            {t.modeWaitlist || "Notify me when available"}
          </Button>
        </div>
      )}
    </section>
  );
}
