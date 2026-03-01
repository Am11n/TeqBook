"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import type { BookingMode, Employee, PublicBookingCopy, PublicBookingTokens, Service, Slot, WaitlistEntrySource } from "./types";

type BookingSelectionSectionProps = {
  t: PublicBookingCopy;
  tokens: PublicBookingTokens;
  activeStep: 1 | 2 | 3;
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
  handleModeChange: (mode: BookingMode, source?: WaitlistEntrySource) => void;
  handleLoadSlots: (e: FormEvent) => void;
  handleRetryLoadSlots: () => Promise<void>;
  hasAttemptedSlotLoad: boolean;
  error: string | null;
  slots: Slot[];
  selectedSlot: string;
  setSelectedSlot: (value: string) => void;
};

export function BookingSelectionSection({
  t,
  tokens,
  activeStep,
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
  handleModeChange,
  handleLoadSlots,
  handleRetryLoadSlots,
  hasAttemptedSlotLoad,
  error,
  slots,
  selectedSlot,
  setSelectedSlot,
}: BookingSelectionSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const selectedServiceName = services.find((service) => service.id === serviceId)?.name;
  const selectedEmployeeName = employees.find((employee) => employee.id === employeeId)?.full_name;
  const canShowStep2 = !isWaitlistMode && hasAttemptedSlotLoad;
  const step2IsActive = activeStep === 2;

  return (
    <section className="space-y-4">
      <article
        className="space-y-4 rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.border,
          boxShadow: tokens.shadow.card,
        }}
      >
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">{t.step1Title}</h2>
          <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.step1Description}</p>
        </div>

        {isWaitlistMode && (
          <div
            className="rounded-xl border p-3 text-xs"
            style={{
              borderColor: tokens.colors.border,
              backgroundColor: tokens.colors.surface2,
              color: tokens.colors.mutedText,
            }}
          >
            <p>{t.waitlistHowItWorks || "When a slot becomes available, we will send you a link by SMS or email."}</p>
            <p className="mt-1">{t.waitlistResponseWindow || "You typically have 15 minutes to confirm."}</p>
            <p className="mt-1">{t.waitlistDeadlineHint || "Confirm before the deadline to secure the appointment."}</p>
          </div>
        )}

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
              style={{ backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }}
            >
              {loadingSlots ? t.loadingSlots : t.loadSlots}
            </Button>
          )}
        </form>

        {(selectedServiceName || selectedEmployeeName || date) && (
          <div
            className="rounded-xl border p-3 text-xs"
            style={{
              borderColor: tokens.colors.border,
              backgroundColor: tokens.colors.surface2,
              color: tokens.colors.mutedText,
            }}
          >
            {selectedServiceName && <p>Service: {selectedServiceName}</p>}
            {selectedEmployeeName && <p className="mt-1">Employee: {selectedEmployeeName}</p>}
            {date && <p className="mt-1">Date: {date}</p>}
          </div>
        )}
      </article>

      <article
        id="book-mode-panel"
        role="tabpanel"
        aria-labelledby="book-mode-tab"
        className="space-y-3 rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: canShowStep2 ? tokens.colors.surface : tokens.colors.surface2,
          borderColor: tokens.colors.border,
          boxShadow: tokens.shadow.card,
          opacity: canShowStep2 ? 1 : 0.75,
        }}
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{t.step2Label}</h3>
          {!canShowStep2 && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.noSlotsYet}</p>
          )}
        </div>

        {canShowStep2 && slots.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.start;
              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSelectedSlot(slot.start)}
                  className="rounded-lg border px-3 py-2 text-sm font-medium transition"
                  style={
                    isSelected
                      ? {
                          backgroundColor: tokens.colors.primary,
                          color: tokens.colors.primaryText,
                          borderColor: tokens.colors.primary,
                        }
                      : {
                          backgroundColor: tokens.colors.surface,
                          color: tokens.colors.mutedText,
                          borderColor: tokens.colors.border,
                        }
                  }
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}

        {canShowStep2 && !loadingSlots && slots.length === 0 && (
          <div
            className="rounded-xl border p-3 text-sm"
            style={{
              borderColor: tokens.colors.border,
              backgroundColor: tokens.colors.warningBg,
              color: tokens.colors.warningText,
            }}
          >
            <p className="font-medium">{t.waitlistTitle || "No slots available right now"}</p>
            <p className="mt-1">{t.waitlistDescription || "Join the waitlist and the salon can contact you if something opens up."}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => handleModeChange("waitlist", "no-slots")}
              >
                {t.modeWaitlist || "Notify me when available"}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => {
                  void handleRetryLoadSlots();
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {step2IsActive && error && (
          <div
            className="rounded-xl border p-3 text-sm"
            style={{
              borderColor: tokens.colors.border,
              backgroundColor: tokens.colors.errorBg,
              color: tokens.colors.errorText,
            }}
          >
            <p>{error}</p>
            <Button
              type="button"
              className="mt-3 w-full"
              variant="outline"
              onClick={() => {
                void handleRetryLoadSlots();
              }}
            >
              Retry
            </Button>
          </div>
        )}
      </article>
    </section>
  );
}
