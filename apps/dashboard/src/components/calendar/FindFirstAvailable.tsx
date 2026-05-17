"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { applyTemplate } from "@/i18n/apply-template";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { findFirstAvailableSlots } from "@/lib/repositories/schedule-segments";
import { DialogSelect } from "@/components/ui/dialog-select";
import { formatDateInTimezone, formatTimeInTimezone, getTodayInTimezone } from "@/lib/utils/timezone";
import type { AvailableSlotBatch, Service } from "@/lib/types";

/** Matches RPC default/limit cap in find_first_available_slots_batch. */
const FIND_SLOTS_RESULT_LIMIT = 25;

interface FindFirstAvailableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelected: (slot: AvailableSlotBatch) => void;
}

export function FindFirstAvailable({ open, onOpenChange, onSlotSelected }: FindFirstAvailableProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const tc = useMemo(
    () => resolveNamespace("calendar", translations[appLocale].calendar),
    [appLocale],
  );
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [dateFrom, setDateFrom] = useState(() => getTodayInTimezone("UTC"));
  const [dateTo, setDateTo] = useState("");
  const [slots, setSlots] = useState<AvailableSlotBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  const timezone = salon?.timezone || "UTC";
  const hour12 = salon?.time_format === "12h";

  useEffect(() => {
    if (!salon?.id) return;
    getActiveServicesForCurrentSalon(salon.id).then(({ data }) => {
      setServices((data ?? []) as Service[]);
      setLoadingServices(false);
    });
  }, [salon?.id]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setServiceId("");
      setDateFrom(getTodayInTimezone(timezone));
      setDateTo("");
      setSlots([]);
      setSearched(false);
    }
  }, [open, timezone]);

  const handleSearch = async () => {
    if (!salon?.id || !serviceId) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await findFirstAvailableSlots(salon.id, serviceId, {
      dateFrom,
      dateTo: dateTo || undefined,
      limit: FIND_SLOTS_RESULT_LIMIT,
    });

    if (!error && data) {
      setSlots(data);
    }
    setLoading(false);
  };

  const formatSlotDate = (isoString: string) =>
    formatDateInTimezone(isoString, timezone, appLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatSlotTime = (isoString: string) =>
    formatTimeInTimezone(isoString, timezone, appLocale, {
      hour: "2-digit",
      minute: "2-digit",
    }, hour12);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {tc.findFirstAvailableTitle}
          </DialogTitle>
          <DialogDescription>{tc.findFirstAvailableDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {tc.findFirstAvailableServiceLabel}
            </label>
            <DialogSelect
              value={serviceId}
              onChange={setServiceId}
              disabled={loadingServices}
              placeholder={tc.findFirstAvailableServicePlaceholder}
              className="mt-1"
              options={services.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.duration_minutes}min)`,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {tc.findFirstAvailableFromLabel}
              </label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {tc.findFirstAvailableToOptionalLabel}
              </label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={!serviceId || loading} className="w-full">
            {loading ? tc.findFirstAvailableSearching : tc.findFirstAvailableFindSlots}
          </Button>
        </div>

        {/* Results */}
        {(searched || slots.length > 0) && (
          <div className="max-h-[40vh] overflow-y-auto -mx-6 px-6">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {tc.findFirstAvailableSearching}
              </p>
            )}
            {searched && !loading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {tc.findFirstAvailableNoSlots}
              </p>
            )}
            {slots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {slots.length === 1
                    ? tc.findFirstAvailableSlotCountOne
                    : applyTemplate(tc.findFirstAvailableSlotCountOther, {
                        count: slots.length,
                      })}
                </p>
                {slots.map((slot) => (
                  <div
                    key={`${slot.slot_start}-${slot.employee_id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSlotSelected(slot)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSlotSelected(slot);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatSlotDate(slot.slot_start)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatSlotTime(slot.slot_start)} – {formatSlotTime(slot.slot_end)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {slot.employee_name}
                      </div>
                      <span
                        className={cn(
                          buttonVariants({ size: "sm", variant: "outline" }),
                          "pointer-events-none h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity",
                        )}
                      >
                        {tc.findFirstAvailableBook}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
