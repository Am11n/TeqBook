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

function getEmployeeSecondaryText(employee: Employee): string | undefined {
  const publicTitle = employee.public_title?.trim();
  if (publicTitle) return publicTitle;
  const role = employee.role?.trim();
  if (role) return role;
  return undefined;
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
  const employeesById = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const groupedOrder: GroupKey[] = ["morning", "afternoon", "evening"];
  const groupedLabels: Record<GroupKey, string> = {
    morning: t.morningLabel ?? "",
    afternoon: t.afternoonLabel ?? "",
    evening: t.eveningLabel ?? "",
  };

  const onlyShowingForEmployeeText = selectedEmployeeIsSpecific && selectedEmployeeName
    ? (t.showingTimesForEmployee ?? "{employee}")
        .replace("{employee}", selectedEmployeeName)
    : null;

  const recommendedSlotId = slots[0]?.id || "";
  const likelyAvailableLabel = t.likelyAvailable ?? "Likely available";
  const noTimesLabel = t.noTimesForSelectedDate ?? "No times available";
  const bestAvailableLabel = t.bestAvailableRecommended ?? t.employeeAny ?? "Best available";
  const employeeOptions = useMemo(() => {
    return [
      {
        value: anyEmployeeValue,
        label: bestAvailableLabel,
        description: t.bestAvailableHint ?? undefined,
        isSpecial: true,
      },
      ...employees.map((employee) => {
        const status = employeeAvailability[employee.id] ?? "unknown";
        const availabilityBadge = status === "likely_available"
          ? likelyAvailableLabel
          : status === "no_times"
            ? noTimesLabel
            : undefined;
        return {
          value: employee.id,
          label: employee.full_name,
          description: getEmployeeSecondaryText(employee),
          avatarUrl: employee.profile_image_url ?? null,
          badge: availabilityBadge,
        };
      }),
    ];
  }, [
    anyEmployeeValue,
    bestAvailableLabel,
    employeeAvailability,
    employees,
    likelyAvailableLabel,
    noTimesLabel,
    t.bestAvailableHint,
  ]);
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
          {hasMissingSetup && <p>{t.missingSetupDescription}</p>}
          {hasNoServices && <p>{t.noActiveServicesDescription}</p>}
          {hasNoEmployees && <p>{t.noActiveEmployeesDescription}</p>}
        </div>
      )}

      <BookingFlowSection
        id="service-section"
        title={t.serviceLabel}
        subtitle={t.step1Description}
        isExpanded={sectionExpanded("service")}
        summary={selectedServiceName || undefined}
        onChange={() => updateSectionByInteraction("service")}
        changeLabel={t.editService}
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
              placeholder={t.searchServicesPlaceholder}
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
                ? t.noActiveServicesDescription
                : t.noServiceSearchResults}
            </p>
          )}
        </div>
      </BookingFlowSection>

      <BookingFlowSection
        id="date-section"
        title={t.dateLabel}
        subtitle={selectedEmployeeName ? `${t.employeeLabel}: ${selectedEmployeeName}` : undefined}
        isExpanded={sectionExpanded("date")}
        summary={date || undefined}
        onChange={() => updateSectionByInteraction("date")}
        changeLabel={t.editDate}
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
              placeholder={isWaitlistMode ? t.employeeAny : t.employeePlaceholder}
              options={employeeOptions}
            />
            <p className="text-xs text-[var(--pb-muted)]">
              {t.bestAvailableHint}
            </p>
          </div>
        </div>
      </BookingFlowSection>

      <article id="book-mode-panel" role="tabpanel" aria-labelledby="book-mode-tab" className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-[var(--pb-text)]">
              {canShowStep2 ? t.availableTimesLabel : t.step2Label}
            </h3>
            {canShowStep2 && !loadingSlots && slots.length > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-[var(--pb-muted)] underline underline-offset-2"
                onClick={() => {
                  if (!recommendedSlotId) return;
                  setHasInteracted(true);
                  triggerHaptic();
                  setSelectedSlot(recommendedSlotId);
                }}
              >
                {isToday ? t.nextAvailableToday : t.nextAvailable}
              </button>
            ) : null}
          </div>
          {onlyShowingForEmployeeText && (
            <p className="text-xs text-[var(--pb-muted)]">
              {onlyShowingForEmployeeText}
            </p>
          )}
          {!canShowStep2 && !loadingSlots && (
            <p className="text-xs text-[var(--pb-muted)]">
              {canAutoLoadTimes
                ? t.findingTimesLabel
                : t.noSlotsYet}
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
            {groupedOrder.map((groupKey, groupIndex) => {
              const groupSlots = groupedSlots[groupKey];
              if (groupSlots.length === 0) return null;
              const spacingClass = groupIndex === 0 ? "mt-0" : "mt-6";
              return (
                <div key={groupKey} className={`${spacingClass} space-y-2.5`}>
                  <div className="flex items-center gap-2">
                    <p className="mb-[10px] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pb-muted)]">
                      {groupedLabels[groupKey]}
                    </p>
                    <span className="mb-[10px] h-px flex-1" style={{ backgroundColor: "color-mix(in srgb, var(--pb-border) 85%, transparent)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {groupSlots.map((slot, index) => {
                      const isSelected = selectedSlot === slot.id;
                      const slotDisplay = parseSlotLabel(slot.label);
                      const slotEmployee = employeesById[slot.employeeId];
                      return (
                        <TimeSlotButton
                          key={`${groupKey}-${index}`}
                          id={slot.id}
                          timeRange={slotDisplay.timeRange}
                          employeeName={slotEmployee?.full_name ?? slotDisplay.employeeName}
                          employeeAvatarUrl={slotEmployee?.profile_image_url ?? null}
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
            <p className="font-medium">{t.waitlistTitle}</p>
            <p className="mt-1">{t.waitlistDescription}</p>
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
                {t.tryAnotherDay}
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
                {t.joinWaitlist}
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
