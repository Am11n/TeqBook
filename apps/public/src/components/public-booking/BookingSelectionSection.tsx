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

const EMPLOYEE_SLOT_COLOR_PALETTE: Array<{
  bg: string;
  border: string;
  text: string;
  dot: string;
}> = [
  { bg: "#D9E8FF", border: "#4B7BFF", text: "#0E2F86", dot: "#2458E6" }, // blue
  { bg: "#DDF7E9", border: "#33B979", text: "#0D633E", dot: "#17945E" }, // green
  { bg: "#FFE2D1", border: "#F07A3C", text: "#8A330B", dot: "#D85D1D" }, // orange
  { bg: "#E8DCFF", border: "#8D63F6", text: "#46248F", dot: "#6B43DA" }, // purple
  { bg: "#FFDCEB", border: "#E55B98", text: "#8C1A4A", dot: "#C83877" }, // pink
  { bg: "#D9F3F5", border: "#2BA7B4", text: "#0D5E67", dot: "#1A8894" }, // cyan
  { bg: "#FFF0CC", border: "#D29B19", text: "#78590E", dot: "#B88212" }, // amber
  { bg: "#E3EBF2", border: "#6786A3", text: "#2D465D", dot: "#4E6D89" }, // slate
];

function getEmployeeSlotColors(employeeId: string): {
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  const colorIndex = hashString(employeeId) % EMPLOYEE_SLOT_COLOR_PALETTE.length;
  return EMPLOYEE_SLOT_COLOR_PALETTE[colorIndex];
}

function getSlotColorKey(slot: Slot): string | null {
  const fromEmployeeId = slot.employeeId?.trim();
  if (fromEmployeeId) return fromEmployeeId;

  // Fallback if employeeId is missing: labels are typically "HH:MM - HH:MM · Name".
  const parts = slot.label.split("·");
  if (parts.length < 2) return null;
  const fromLabelName = parts[parts.length - 1]?.trim();
  return fromLabelName || null;
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
              const colorKey = getSlotColorKey(slot) ?? `slot-${index}`;
              const employeeColors = getEmployeeSlotColors(colorKey);
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
                          backgroundColor: employeeColors.bg,
                          color: employeeColors.text,
                          borderColor: employeeColors.border,
                        }
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: isSelected ? tokens.colors.primaryText : employeeColors.dot }}
                    />
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
