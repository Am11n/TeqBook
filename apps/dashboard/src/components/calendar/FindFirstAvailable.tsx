"use client";

import { useState, useEffect } from "react";
import { Search, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { findFirstAvailableSlots } from "@/lib/repositories/schedule-segments";
import { DialogSelect } from "@/components/ui/dialog-select";
import type { AvailableSlotBatch, Service } from "@/lib/types";

interface FindFirstAvailableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelected: (slot: AvailableSlotBatch) => void;
}

export function FindFirstAvailable({ open, onOpenChange, onSlotSelected }: FindFirstAvailableProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState("");
  const [slots, setSlots] = useState<AvailableSlotBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

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
      setDateFrom(new Date().toISOString().slice(0, 10));
      setDateTo("");
      setSlots([]);
      setSearched(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!salon?.id || !serviceId) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await findFirstAvailableSlots(salon.id, serviceId, {
      dateFrom,
      dateTo: dateTo || undefined,
      limit: 10,
    });

    if (!error && data) {
      setSlots(data);
    }
    setLoading(false);
  };

  const formatSlotDate = (isoString: string) => {
    const tz = salon?.timezone || "UTC";
    const resolvedLocale = appLocale === "nb" ? "nb-NO" : appLocale;
    try {
      return new Intl.DateTimeFormat(resolvedLocale, { weekday: "short", month: "short", day: "numeric", timeZone: tz }).format(new Date(isoString));
    } catch {
      return new Date(isoString).toLocaleDateString();
    }
  };

  const formatSlotTime = (isoString: string) => {
    const tz = salon?.timezone || "UTC";
    const resolvedLocale = appLocale === "nb" ? "nb-NO" : appLocale;
    try {
      return new Intl.DateTimeFormat(resolvedLocale, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
        ...(appLocale === "nb" ? { hour12: false } : {}),
      }).format(new Date(isoString));
    } catch {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find First Available
          </DialogTitle>
          <DialogDescription>Search for the next available time slot.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Service</label>
            <DialogSelect
              value={serviceId}
              onChange={setServiceId}
              disabled={loadingServices}
              placeholder="Select service..."
              className="mt-1"
              options={services.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.duration_minutes}min)`,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">To (optional)</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={!serviceId || loading} className="w-full">
            {loading ? "Searching..." : "Find slots"}
          </Button>
        </div>

        {/* Results */}
        {(searched || slots.length > 0) && (
          <div className="max-h-[40vh] overflow-y-auto -mx-6 px-6">
            {loading && <p className="text-sm text-muted-foreground text-center py-6">Searching...</p>}
            {searched && !loading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No available slots found.</p>
            )}
            {slots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{slots.length} slot{slots.length !== 1 ? "s" : ""} found</p>
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => onSlotSelected(slot)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors group"
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
                      <Button size="sm" variant="outline" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Book
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
