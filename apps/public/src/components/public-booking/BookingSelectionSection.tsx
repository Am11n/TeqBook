"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type GroupKey = "morning" | "afternoon" | "evening";

function parseSlotLabel(label: string): { timeRange: string; employeeName: string | null } {
  const parts = label.split("·").map((part) => part.trim());
  if (parts.length < 2) return { timeRange: parts[0] || label, employeeName: null };
  return {
    timeRange: parts[0] || label,
    employeeName: parts.slice(1).join(" · ") || null,
  };
}

function getGroupKey(slot: Slot): GroupKey {
  const hour = new Date(slot.start).getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
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
  const shouldShowServiceSearch = services.length > 8;
  const [serviceSearchValue, setServiceSearchValue] = useState("");
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
  const selectedEmployeeIsSpecific = !!employeeId && employeeId !== anyEmployeeValue;

  useEffect(() => {
    const debounceHandle = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearchValue.trim().toLowerCase());
    }, 180);
    return () => clearTimeout(debounceHandle);
  }, [serviceSearchValue]);

  const sortedServices = useMemo(() => {
    const copy = [...services];
    copy.sort((a, b) => {
      const aFeatured = Boolean(a.featured);
      const bFeatured = Boolean(b.featured);
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }, [services]);

  const visibleServices = useMemo(() => {
    if (!debouncedServiceSearch) return sortedServices;
    return sortedServices.filter((service) => service.name.toLowerCase().includes(debouncedServiceSearch));
  }, [debouncedServiceSearch, sortedServices]);

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

  const groupedSlots = useMemo(() => {
    const groups: Record<GroupKey, Slot[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const slot of renderedSlots) {
      groups[getGroupKey(slot)].push(slot);
    }
    return groups;
  }, [renderedSlots]);

  const groupedOrder: GroupKey[] = ["morning", "afternoon", "evening"];
  const groupedLabels: Record<GroupKey, string> = {
    morning: t.morningLabel || "Morning",
    afternoon: t.afternoonLabel || "Afternoon",
    evening: t.eveningLabel || "Evening",
  };

  const onlyShowingForEmployeeText = selectedEmployeeIsSpecific && selectedEmployeeName
    ? (t.showingTimesForEmployee || `Only showing times for ${selectedEmployeeName}`)
        .replace("{employee}", selectedEmployeeName)
    : null;

  return (
    <section className="space-y-4">
      <article
        id="service-section"
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
            <label className="font-medium">{t.serviceLabel}</label>
            {shouldShowServiceSearch && (
              <Input
                type="search"
                value={serviceSearchValue}
                onChange={(event) => setServiceSearchValue(event.target.value)}
                placeholder={t.searchServicesPlaceholder || "Search services"}
                disabled={isSelectionBlocked}
              />
            )}
            {loadingSlots && !hasAttemptedSlotLoad && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl border bg-muted/30" />
                ))}
              </div>
            )}
            {!loadingSlots || hasAttemptedSlotLoad ? (
              visibleServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {visibleServices.map((service) => {
                    const isSelected = service.id === serviceId;
                    const durationLabel = typeof service.duration_minutes === "number" && service.duration_minutes > 0
                      ? `${service.duration_minutes} min`
                      : (t.durationLabel ? `Approx. ${t.durationLabel.toLowerCase()}` : "Approx. duration");
                    const priceLabel = typeof service.price_cents === "number" && service.price_cents > 0
                      ? new Intl.NumberFormat("en-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(service.price_cents / 100)
                      : null;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setServiceId(service.id)}
                        disabled={isSelectionBlocked}
                        className="rounded-xl border px-3 py-3 text-left transition-all duration-150 hover:-translate-y-[1px] hover:shadow-sm"
                        style={
                          isSelected
                            ? {
                                borderColor: tokens.colors.primary,
                                boxShadow: tokens.shadow.card,
                                transform: "scale(1.02)",
                                backgroundColor: tokens.colors.surface,
                              }
                            : {
                                borderColor: tokens.colors.border,
                                backgroundColor: tokens.colors.surface,
                              }
                        }
                      >
                        <p className="text-sm font-medium">{service.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: tokens.colors.mutedText }}>
                          <span>{durationLabel}</span>
                          {priceLabel ? <span>• {priceLabel}</span> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl border p-3 text-sm"
                  style={{
                    borderColor: tokens.colors.border,
                    backgroundColor: tokens.colors.surface2,
                    color: tokens.colors.mutedText,
                  }}
                >
                  {t.noServiceSearchResults || "No services match your search."}
                </div>
              )
            ) : null}
          </div>

          <div id="date-section" className="space-y-2 text-sm">
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
            <label className="font-medium" htmlFor="employee">{t.employeeLabel}</label>
            <DialogSelect
              value={employeeId}
              onChange={setEmployeeId}
              required={!isWaitlistMode}
              disabled={isSelectionBlocked || employees.length === 0}
              placeholder={isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder}
              options={[
                { value: anyEmployeeValue, label: t.bestAvailableRecommended || "Best available (recommended)" },
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
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>
              {t.bestAvailableHint || "You'll get the first available barber at your chosen time."}
            </p>
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
          {onlyShowingForEmployeeText && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>
              {onlyShowingForEmployeeText}
            </p>
          )}
          {!canShowStep2 && !loadingSlots && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.noSlotsYet}</p>
          )}
          {loadingSlots && (
            <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.checkingAvailability || t.loadingSlots}</p>
          )}
        </div>

        {loadingSlots && canShowStep2 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-lg border bg-muted/30" />
            ))}
          </div>
        )}

        {canShowStep2 && !loadingSlots && renderedSlots.length > 0 && (
          <div className="space-y-4">
            {groupedOrder.map((groupKey) => {
              const groupSlots = groupedSlots[groupKey];
              if (groupSlots.length === 0) return null;
              return (
                <div key={groupKey} className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: tokens.colors.mutedText }}>
                    {groupedLabels[groupKey]}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {groupSlots.map((slot, index) => {
                      const isSelected = selectedSlot === slot.id;
                      const slotDisplay = parseSlotLabel(slot.label);
                      return (
                        <button
                          key={`${groupKey}-${index}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot.id)}
                          className="rounded-lg border px-3 py-2 text-left transition-all duration-150 hover:-translate-y-[1px] hover:bg-muted/30"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: tokens.colors.primary,
                                  color: tokens.colors.primaryText,
                                  borderColor: tokens.colors.primary,
                                  transform: "scale(1.01)",
                                }
                              : {
                                  backgroundColor: tokens.colors.surface,
                                  borderColor: tokens.colors.border,
                                  color: "#101828",
                                }
                          }
                        >
                          <span className="block text-xs font-semibold">{slotDisplay.timeRange}</span>
                          {slotDisplay.employeeName && (
                            <span
                              className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                border: `1px solid ${isSelected ? tokens.colors.primaryText : tokens.colors.border}`,
                                color: isSelected ? tokens.colors.primaryText : tokens.colors.mutedText,
                              }}
                            >
                              {slotDisplay.employeeName}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  const current = date ? new Date(`${date}T00:00:00`) : new Date();
                  current.setDate(current.getDate() + 1);
                  const year = current.getFullYear();
                  const month = `${current.getMonth() + 1}`.padStart(2, "0");
                  const day = `${current.getDate()}`.padStart(2, "0");
                  setDate(`${year}-${month}-${day}`);
                  void handleRetryLoadSlots();
                }}
              >
                {t.tryAnotherDay || "Try another day"}
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
