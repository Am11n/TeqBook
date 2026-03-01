"use client";

import { FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import type { BookingMode, Employee, PublicBookingCopy, PublicBookingTokens, SelectionStatus, Service, Slot, WaitlistEntrySource } from "./types";

type BookingSelectionSectionProps = {
  t: PublicBookingCopy;
  tokens: PublicBookingTokens;
  selectionStatus: SelectionStatus;
  anyEmployeeValue: string;
  employeeAvailability: Record<string, "likely_available" | "no_times" | "unknown">;
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getEmployeeSlotColors(employeeId: string): {
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  const hue = hashString(employeeId) % 360;
  return {
    bg: `hsl(${hue} 90% 96%)`,
    border: `hsl(${hue} 55% 78%)`,
    text: `hsl(${hue} 55% 28%)`,
    dot: `hsl(${hue} 65% 45%)`,
  };
}

export function BookingSelectionSection({
  t,
  tokens,
  selectionStatus,
  anyEmployeeValue,
  employeeAvailability,
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
  const hasMissingSetup = selectionStatus === "missing_setup";
  const hasNoServices = selectionStatus === "no_active_services";
  const hasNoEmployees = selectionStatus === "no_active_employees";
  const isSelectionBlocked = hasMissingSetup || hasNoServices || hasNoEmployees;
  const renderedSlots = useMemo(() => {
    const seen = new Map<string, number>();
    return slots.map((slot) => {
      const fallbackBaseId = `${slot.employeeId}|${slot.start}|${slot.end}`;
      const baseId = slot.id?.trim() ? slot.id : fallbackBaseId;
      const duplicateCount = seen.get(baseId) ?? 0;
      seen.set(baseId, duplicateCount + 1);
      const safeId = duplicateCount === 0 ? baseId : `${baseId}#${duplicateCount}`;
      return safeId === slot.id ? slot : { ...slot, id: safeId };
    });
  }, [slots]);
  const employeeSlotColors = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getEmployeeSlotColors>>();
    for (const slot of renderedSlots) {
      if (!slot.employeeId || map.has(slot.employeeId)) continue;
      map.set(slot.employeeId, getEmployeeSlotColors(slot.employeeId));
    }
    return map;
  }, [renderedSlots]);

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
          {isSelectionBlocked && (
            <div
              className="rounded-xl border p-3 text-sm"
              style={{
                borderColor: tokens.colors.border,
                backgroundColor: tokens.colors.warningBg,
                color: tokens.colors.warningText,
              }}
            >
              {hasMissingSetup && (
                <p>{t.missingSetupDescription || "This salon exists, but public booking is not fully configured yet."}</p>
              )}
              {hasNoServices && (
                <p>{t.noActiveServicesDescription || "This salon has not published any services yet."}</p>
              )}
              {hasNoEmployees && (
                <p>{t.noActiveEmployeesDescription || "This salon has not published any employees yet."}</p>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="date">{t.dateLabel}</label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSelectionBlocked}
            />
          </div>

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="service">{t.serviceLabel}</label>
            <DialogSelect
              value={serviceId}
              onChange={setServiceId}
              required
              disabled={isSelectionBlocked || services.length === 0}
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
              disabled={isSelectionBlocked || employees.length === 0}
              placeholder={isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder}
              options={[
                { value: anyEmployeeValue, label: t.anyEmployeeRecommended || "Any employee (recommended)" },
                ...employees.map((emp) => {
                  const status = employeeAvailability[emp.id] ?? "unknown";
                  const statusLabel = status === "likely_available"
                    ? ` · ${t.likelyAvailable || "Likely available"}`
                    : status === "no_times"
                      ? ` · ${t.noTimesForSelectedDate || "No times found for selected date"}`
                      : "";
                  return { value: emp.id, label: `${emp.full_name}${statusLabel}` };
                }),
              ]}
            />
          </div>
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
          {!canShowStep2 && !loadingSlots && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.noSlotsYet}</p>
          )}
          {loadingSlots && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.checkingAvailability || t.loadingSlots}</p>
          )}
        </div>

        {canShowStep2 && renderedSlots.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {renderedSlots.map((slot, index) => {
              const isSelected = selectedSlot === slot.id;
              const employeeColors = slot.employeeId ? employeeSlotColors.get(slot.employeeId) : null;
              return (
                <button
                  key={`slot-${index}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className="rounded-lg border px-3 py-2 text-sm font-medium transition"
                  style={
                    isSelected
                      ? {
                          backgroundColor: tokens.colors.primary,
                          color: tokens.colors.primaryText,
                          borderColor: tokens.colors.primary,
                        }
                      : {
                          backgroundColor: employeeColors?.bg ?? tokens.colors.surface,
                          color: employeeColors?.text ?? tokens.colors.mutedText,
                          borderColor: employeeColors?.border ?? tokens.colors.border,
                        }
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {employeeColors ? (
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: isSelected ? tokens.colors.primaryText : employeeColors.dot }}
                      />
                    ) : null}
                    <span>{slot.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {canShowStep2 && !loadingSlots && renderedSlots.length === 0 && (
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
