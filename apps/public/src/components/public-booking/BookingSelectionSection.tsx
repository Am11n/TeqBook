"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import { BookingFlowSection } from "./BookingFlowSection";
import { ServiceCard } from "./ServiceCard";
import { TimeSlotButton } from "./TimeSlotButton";
import type { BookingMode, Employee, PublicBookingCopy, SelectionStatus, Service, Slot, WaitlistEntrySource } from "./types";

type BookingSelectionSectionProps = {
  t: PublicBookingCopy;
  selectionStatus: SelectionStatus;
  anyEmployeeValue: string;
  employeeAvailability: Record<string, "likely_available" | "no_times" | "unknown">;
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
  handleRetryLoadSlots: () => Promise<void>;
  hasAttemptedSlotLoad: boolean;
  error: string | null;
  slots: Slot[];
  selectedSlot: string;
  setSelectedSlot: (value: string) => void;
  mobileRequestedSection?: "service" | "date" | "time" | null;
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
  selectionStatus,
  anyEmployeeValue,
  employeeAvailability,
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
  handleRetryLoadSlots,
  hasAttemptedSlotLoad,
  error,
  slots,
  selectedSlot,
  setSelectedSlot,
  mobileRequestedSection = null,
}: BookingSelectionSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const selectedService = services.find((service) => service.id === serviceId) || null;
  const selectedServiceName = selectedService?.name || null;
  const selectedEmployeeName = employees.find((employee) => employee.id === employeeId)?.full_name;
  const canShowStep2 = !isWaitlistMode && hasAttemptedSlotLoad;
  const step2IsActive = canShowStep2;
  const hasMissingSetup = selectionStatus === "missing_setup";
  const hasNoServices = selectionStatus === "no_active_services";
  const hasNoEmployees = selectionStatus === "no_active_employees";
  const isSelectionBlocked = hasMissingSetup || hasNoServices || hasNoEmployees;
  const canAutoLoadTimes = !isWaitlistMode && Boolean(serviceId && date) && !isSelectionBlocked;
  const shouldShowServiceSearch = services.length > 8;
  const [serviceSearchValue, setServiceSearchValue] = useState("");
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
  const selectedEmployeeIsSpecific = !!employeeId && employeeId !== anyEmployeeValue;
  const [manualSection, setManualSection] = useState<"service" | "date" | "time" | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const debounceHandle = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearchValue.trim().toLowerCase());
    }, 180);
    return () => clearTimeout(debounceHandle);
  }, [serviceSearchValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

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

  const groupedSlots = useMemo(() => {
    const groups: Record<GroupKey, Slot[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const slot of slots) {
      groups[getGroupKey(slot)].push(slot);
    }
    return groups;
  }, [slots]);

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

  const recommendedSlotId = slots[0]?.id || "";
  const localToday = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);
  const isToday = date === localToday;
  const canCompleteService = Boolean(serviceId);
  const canCompleteDate = Boolean(serviceId && date);

  const autoSection: "service" | "date" | "time" = canCompleteDate ? "time" : canCompleteService ? "date" : "service";
  const resolvedSection = (!isDesktop && mobileRequestedSection) ? mobileRequestedSection : (manualSection ?? autoSection);
  const sectionExpanded = (section: "service" | "date" | "time") => isDesktop || resolvedSection === section;
  const triggerHaptic = () => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    navigator.vibrate(8);
  };

  const updateSectionByInteraction = (section: "service" | "date" | "time") => {
    setHasInteracted(true);
    if (isDesktop) return;
    setManualSection(section);
  };

  useEffect(() => {
    if (typeof window === "undefined" || isDesktop || loadingSlots || !recommendedSlotId || !canShowStep2) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slotButton = document.getElementById(`slot-${recommendedSlotId}`);
    slotButton?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  }, [recommendedSlotId, canShowStep2, loadingSlots, isDesktop]);

  return (
    <section className="space-y-8">
      {isSelectionBlocked && (
        <div
          className="rounded-[var(--pb-radius-md)] border p-3 text-sm"
          style={{
            borderColor: "var(--pb-border)",
            backgroundColor: "var(--pb-warning-bg)",
            color: "var(--pb-warning-text)",
          }}
        >
          {hasMissingSetup && <p>{t.missingSetupDescription || "This salon exists, but public booking is not fully configured yet."}</p>}
          {hasNoServices && <p>{t.noActiveServicesDescription || "This salon has not published any services yet."}</p>}
          {hasNoEmployees && <p>{t.noActiveEmployeesDescription || "This salon has not published any employees yet."}</p>}
        </div>
      )}

      <BookingFlowSection
        id="service-section"
        title={t.serviceLabel || "Service"}
        subtitle={t.step1Description}
        isExpanded={sectionExpanded("service")}
        summary={selectedServiceName || undefined}
        onChange={() => updateSectionByInteraction("service")}
        changeLabel={t.editService || "Change service"}
        showInlineChange
      >
        <div className="space-y-4">
          {shouldShowServiceSearch && (
            <Input
              type="search"
              value={serviceSearchValue}
              onChange={(event) => {
                setHasInteracted(true);
                setServiceSearchValue(event.target.value);
              }}
              placeholder={t.searchServicesPlaceholder || "Search services"}
              disabled={isSelectionBlocked}
            />
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => {
              const durationLabel = typeof service.duration_minutes === "number" && service.duration_minutes > 0
                ? `${service.duration_minutes} min`
                : "Approx. duration";
              const priceLabel = typeof service.price_cents === "number" && service.price_cents > 0
                ? new Intl.NumberFormat("en-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(service.price_cents / 100)
                : null;
              return (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.name}
                  durationLabel={durationLabel}
                  priceLabel={priceLabel}
                  selected={service.id === serviceId}
                  disabled={isSelectionBlocked}
                  onSelect={(id) => {
                    setHasInteracted(true);
                    setServiceId(id);
                    if (!isDesktop) setManualSection("date");
                  }}
                />
              );
            })}
          </div>

          {visibleServices.length === 0 && (
            <p className="text-sm text-[var(--pb-muted)]">
              {services.length === 0
                ? (t.noActiveServicesDescription || "No services available right now.")
                : (t.noServiceSearchResults || "No services match your search.")}
            </p>
          )}
        </div>
      </BookingFlowSection>

      <BookingFlowSection
        id="date-section"
        title={t.dateLabel || "Date"}
        subtitle={selectedEmployeeName ? `${t.employeeLabel || "Employee"}: ${selectedEmployeeName}` : undefined}
        isExpanded={sectionExpanded("date")}
        summary={date || undefined}
        onChange={() => updateSectionByInteraction("date")}
        changeLabel={t.editDate || "Change date"}
        showInlineChange
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <label className="font-medium text-[var(--pb-text)]" htmlFor="date">{t.dateLabel}</label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setHasInteracted(true);
                setDate(e.target.value);
                if (!isDesktop && serviceId && e.target.value) setManualSection("time");
              }}
              required
              disabled={isSelectionBlocked}
            />
          </div>

          <div className="space-y-2 text-sm">
            <label className="font-medium text-[var(--pb-text)]" htmlFor="employee">{t.employeeLabel}</label>
            <DialogSelect
              value={employeeId}
              onChange={(value) => {
                setHasInteracted(true);
                setEmployeeId(value);
              }}
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
            <p className="text-xs text-[var(--pb-muted)]">
              {t.bestAvailableHint || "You'll get the first available barber at your chosen time."}
            </p>
          </div>
        </div>
      </BookingFlowSection>

      <article id="book-mode-panel" role="tabpanel" aria-labelledby="book-mode-tab" className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-[var(--pb-text)]">
            {canShowStep2 ? (t.availableTimesLabel || "Available times") : (t.step2Label || "Choose time")}
          </h3>
          {onlyShowingForEmployeeText && (
            <p className="text-xs text-[var(--pb-muted)]">
              {onlyShowingForEmployeeText}
            </p>
          )}
          {!canShowStep2 && !loadingSlots && (
            <p className="text-xs text-[var(--pb-muted)]">
              {canAutoLoadTimes
                ? (t.findingTimesLabel || "Finding available times...")
                : (t.noSlotsYet || "Choose a service and date to view available times.")}
            </p>
          )}
          {loadingSlots && (
            <p className="text-xs text-[var(--pb-muted)]">{t.checkingAvailability || t.loadingSlots}</p>
          )}
        </div>

        {loadingSlots && canShowStep2 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-[var(--pb-radius-sm)] border bg-[var(--pb-surface-muted)]" />
            ))}
          </div>
        )}

        {canShowStep2 && !loadingSlots && slots.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                className="h-11 px-4 text-sm font-semibold"
                style={{ borderRadius: "var(--pb-button-radius)", boxShadow: "var(--pb-button-shadow)" }}
                onClick={() => {
                  if (!recommendedSlotId) return;
                  setHasInteracted(true);
                  triggerHaptic();
                  setSelectedSlot(recommendedSlotId);
                }}
              >
                {isToday ? (t.nextAvailableToday || "Jump to next available today") : (t.nextAvailable || "Jump to next available")}
              </Button>
            </div>
            {groupedOrder.map((groupKey) => {
              const groupSlots = groupedSlots[groupKey];
              if (groupSlots.length === 0) return null;
              return (
                <div key={groupKey} className="space-y-3 rounded-[var(--pb-radius-sm)] border px-3 py-3" style={{ borderColor: "var(--pb-border)" }}>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--pb-muted)]">
                      {groupedLabels[groupKey]}
                    </p>
                    <span className="h-px flex-1" style={{ backgroundColor: "var(--pb-border)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {groupSlots.map((slot, index) => {
                      const isSelected = selectedSlot === slot.id;
                      const slotDisplay = parseSlotLabel(slot.label);
                      return (
                        <TimeSlotButton
                          key={`${groupKey}-${index}`}
                          id={slot.id}
                          timeRange={slotDisplay.timeRange}
                          employeeName={slotDisplay.employeeName}
                          selected={isSelected}
                          recommended={slot.id === recommendedSlotId}
                          onSelect={(id) => {
                            setHasInteracted(true);
                            triggerHaptic();
                            setSelectedSlot(id);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {canShowStep2 && !loadingSlots && slots.length === 0 && (
          <div
            className="rounded-[var(--pb-radius-md)] border p-3 text-sm"
            style={{
              borderColor: "var(--pb-border)",
              backgroundColor: "var(--pb-warning-bg)",
              color: "var(--pb-warning-text)",
            }}
          >
            <p className="font-medium">{t.waitlistTitle || "No slots available right now"}</p>
            <p className="mt-1">{t.waitlistDescription || "Join the waitlist and the salon can contact you if something opens up."}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="button"
                className="w-full"
                style={{ borderRadius: "var(--pb-button-radius)", boxShadow: "var(--pb-button-shadow)" }}
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
              <Button
                type="button"
                className="w-full"
                variant="outline"
                style={{ borderRadius: "var(--pb-button-radius)" }}
                onClick={() => {
                  const dateInput = document.getElementById("date") as HTMLInputElement | null;
                  dateInput?.focus();
                  dateInput?.showPicker?.();
                }}
              >
                Show more days
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                style={{ borderRadius: "var(--pb-button-radius)" }}
                onClick={() => handleModeChange("waitlist", "no-slots")}
              >
                {t.joinWaitlist || t.modeWaitlist || "Join waitlist"}
              </Button>
            </div>
          </div>
        )}

        {step2IsActive && error && (
          <div
            className="rounded-[var(--pb-radius-md)] border p-3 text-sm"
            style={{
              borderColor: "var(--pb-border)",
              backgroundColor: "var(--pb-error-bg)",
              color: "var(--pb-error-text)",
            }}
          >
            <p>{error}</p>
            <Button
              type="button"
              className="mt-3 w-full"
              variant="outline"
              style={{ borderRadius: "var(--pb-button-radius)" }}
              onClick={() => {
                void handleRetryLoadSlots();
              }}
            >
              Retry
            </Button>
          </div>
        )}
      </article>

      {/* Hidden progressive-state hint for reduced-motion/auto-scroll guards */}
      {!isDesktop && hasInteracted ? <span className="sr-only">Mobile guided mode enabled</span> : null}
    </section>
  );
}
