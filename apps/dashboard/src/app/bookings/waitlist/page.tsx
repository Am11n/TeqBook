"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Clock, Trash2, Bell, CheckCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { useRepoError } from "@/lib/hooks/useRepoError";
import { applyTemplate } from "@/i18n/apply-template";
import { supabase } from "@/lib/supabase-client";
import {
  listWaitlist,
  removeFromWaitlist,
  notifyWithClaimOffer,
  convertWaitlistToBooking,
  setPriorityOverride,
  cancelEntry,
  addToWaitlist,
  markAsCooldown,
  reactivateFromCooldown,
  type WaitlistEntry,
} from "@/lib/services/waitlist-service";

export default function WaitlistPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("bookings", translations[appLocale].bookings),
    [appLocale],
  );
  const m = useRepoError();

  const filterDefs = useMemo(
    () =>
      [
        { id: "waiting", label: t.waitlistFilterWaiting },
        { id: "notified", label: t.waitlistFilterNotified },
        { id: "booked", label: t.waitlistFilterBooked },
        { id: "cooldown", label: t.waitlistFilterCooldown },
        { id: "all", label: t.waitlistFilterAll },
      ] as const,
    [t],
  );

  const statusLabels = useMemo(
    () =>
      ({
        waiting: t.waitlistStatusWaiting,
        notified: t.waitlistStatusNotified,
        booked: t.waitlistStatusBooked,
        expired: t.waitlistStatusExpired,
        cancelled: t.waitlistStatusCancelled,
        cooldown: t.waitlistStatusCooldown,
      }) as Record<string, string>,
    [t],
  );

  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("waiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [createOpen, setCreateOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [notifyEntry, setNotifyEntry] = useState<WaitlistEntry | null>(null);
  const [notifySlotStart, setNotifySlotStart] = useState("");
  const [notifySlotEnd, setNotifySlotEnd] = useState("");
  const [notifyEmployeeId, setNotifyEmployeeId] = useState("");
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [overrideEntry, setOverrideEntry] = useState<WaitlistEntry | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideBusy, setOverrideBusy] = useState(false);
  const realtimeRetryRef = useRef(0);
  const realtimeRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventDedupRef = useRef<Map<string, string>>(new Map());
  const [createForm, setCreateForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    employeeId: "",
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTimeStart: "",
    preferredTimeEnd: "",
    preferenceMode: "specific_time" as "specific_time" | "day_flexible",
    flexWindowMinutes: "0",
  });

  const loadEntries = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    const { data, error } = await listWaitlist(salon.id, filter === "all" ? undefined : filter);
    setEntries(data ?? []);
    if (error) setError(m(error));
    setLoading(false);
  }, [salon?.id, filter, m]);

  const loadFormData = useCallback(async () => {
    if (!salon?.id) return;
    const [servicesRes, employeesRes] = await Promise.all([
      supabase
        .from("services")
        .select("id, name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("employees")
        .select("id, full_name")
        .eq("salon_id", salon.id)
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
    ]);

    if (!servicesRes.error) setServices((servicesRes.data ?? []) as Array<{ id: string; name: string }>);
    if (!employeesRes.error) {
      setEmployees((employeesRes.data ?? []) as Array<{ id: string; full_name: string }>);
    }
  }, [salon?.id]);

  useEffect(() => {
    loadEntries();
    loadFormData();
  }, [loadEntries, loadFormData]);

  useEffect(() => {
    if (!salon?.id) return;

    const channelName = `waitlist:salon:${salon.id}`;
    const maxRetries = 4;
    const baseRetryMs = 1000;

    const subscribe = () => {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waitlist_entries",
            filter: `salon_id=eq.${salon.id}`,
          },
          (payload) => {
            const rowId = String((payload.new as { id?: string } | null)?.id || (payload.old as { id?: string } | null)?.id || "");
            const stamp = payload.commit_timestamp || "";
            const dedupKey = `${payload.eventType}:${rowId}`;
            if (eventDedupRef.current.get(dedupKey) === stamp) {
              return;
            }
            eventDedupRef.current.set(dedupKey, stamp);
            loadEntries();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            realtimeRetryRef.current = 0;
          } else if (status === "CHANNEL_ERROR") {
            realtimeRetryRef.current += 1;
            if (realtimeRetryRef.current <= maxRetries) {
              const delay = Math.min(16000, baseRetryMs * 2 ** (realtimeRetryRef.current - 1));
              if (realtimeRetryTimerRef.current) clearTimeout(realtimeRetryTimerRef.current);
              realtimeRetryTimerRef.current = setTimeout(() => {
                supabase.removeChannel(channel);
                subscribe();
              }, delay);
            } else {
              console.warn("Waitlist realtime degraded; relying on polling fallback.");
            }
          }
        });

      return channel;
    };

    const channel = subscribe();
    pollingTimerRef.current = setInterval(() => {
      loadEntries();
    }, 60000);

    return () => {
      if (realtimeRetryTimerRef.current) {
        clearTimeout(realtimeRetryTimerRef.current);
        realtimeRetryTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [salon?.id, loadEntries]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

  const handleNotify = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    const initialStart =
      entry.preferred_time_start != null
        ? `${entry.preferred_date}T${entry.preferred_time_start.slice(0, 5)}`
        : "";
    const initialEnd =
      entry.preferred_time_end != null
        ? `${entry.preferred_date}T${entry.preferred_time_end.slice(0, 5)}`
        : "";
    setNotifyEntry(entry);
    setNotifySlotStart(initialStart);
    setNotifySlotEnd(initialEnd);
    setNotifyEmployeeId(entry.employee_id ?? "");
  };

  const submitNotify = async () => {
    if (!salon?.id || !notifyEntry) return;
    setNotice(null);
    if (!notifySlotStart) {
      setError(t.waitlistErrSlotStartRequired);
      return;
    }
    if (!notifyEmployeeId) {
      setError(t.waitlistErrEmployeeRequired);
      return;
    }
    setNotifyBusy(true);
    const slotStartDate = new Date(notifySlotStart);
    if (Number.isNaN(slotStartDate.getTime())) {
      setNotifyBusy(false);
      setError(t.waitlistErrSlotStartInvalid);
      return;
    }
    const slotEndDate = notifySlotEnd ? new Date(notifySlotEnd) : null;
    if (slotEndDate && Number.isNaN(slotEndDate.getTime())) {
      setNotifyBusy(false);
      setError(t.waitlistErrSlotEndInvalid);
      return;
    }
    const slotStartIso = slotStartDate.toISOString();
    const slotEndIso = slotEndDate ? slotEndDate.toISOString() : null;
    const { error: notifyError, warning } = await notifyWithClaimOffer({
      salonId: salon.id,
      entryId: notifyEntry.id,
      slotStart: slotStartIso,
      slotEnd: slotEndIso,
      employeeId: notifyEmployeeId,
      fallbackError: t.waitlistErrNotifyOfferFailed,
    });
    setNotifyBusy(false);
    if (notifyError) {
      setError(m(notifyError));
      return;
    }
    if (warning) {
      setNotice(warning);
    }
    setNotifyEntry(null);
    await loadEntries();
  };

  const handleConvertToBooking = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    const { error: convertError } = await convertWaitlistToBooking({
      salonId: salon.id,
      entryId: entry.id,
      fallbackError: t.waitlistErrConvertFailed,
    });
    if (convertError) {
      setError(m(convertError));
      return;
    }
    await loadEntries();
  };

  const handleOpenPriorityOverride = (entry: WaitlistEntry) => {
    setOverrideEntry(entry);
    setOverrideScore(
      typeof entry.priority_override_score === "number"
        ? String(entry.priority_override_score)
        : String(entry.priority_score_snapshot ?? 0)
    );
    setOverrideReason(entry.priority_override_reason ?? "");
  };

  const handleSavePriorityOverride = async () => {
    if (!salon?.id || !overrideEntry) return;
    const parsed = Number.parseInt(overrideScore, 10);
    if (Number.isNaN(parsed)) {
      setError(t.waitlistErrOverrideScoreInteger);
      return;
    }
    if (!overrideReason.trim()) {
      setError(t.waitlistErrOverrideReasonRequired);
      return;
    }
    setOverrideBusy(true);
    const { error: overrideError } = await setPriorityOverride({
      salonId: salon.id,
      entryId: overrideEntry.id,
      score: parsed,
      reason: overrideReason.trim(),
      fallbackError: t.waitlistErrPriorityOverrideFailed,
    });
    setOverrideBusy(false);
    if (overrideError) {
      setError(m(overrideError));
      return;
    }
    setOverrideEntry(null);
    await loadEntries();
  };

  const handleClearPriorityOverride = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    const { error: overrideError } = await setPriorityOverride({
      salonId: salon.id,
      entryId: entry.id,
      score: null,
      reason: null,
      fallbackError: t.waitlistErrPriorityOverrideFailed,
    });
    if (overrideError) {
      setError(m(overrideError));
      return;
    }
    await loadEntries();
  };

  const handleCancel = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await cancelEntry(salon.id, entry.id);
    await loadEntries();
  };

  const handleRemove = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await removeFromWaitlist(salon.id, entry.id);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  };

  const handleSetCooldown = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    const cooldownUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await markAsCooldown(salon.id, entry.id, cooldownUntil, "manual");
    await loadEntries();
  };

  const handleReactivate = async (entry: WaitlistEntry) => {
    if (!salon?.id) return;
    await reactivateFromCooldown(salon.id, entry.id);
    await loadEntries();
  };

  const statusColors: Record<string, string> = {
    waiting: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    notified: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    booked: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    expired: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    cooldown: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  };

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => {
      return (
        entry.customer_name.toLowerCase().includes(query) ||
        entry.customer_email?.toLowerCase().includes(query) ||
        entry.customer_phone?.toLowerCase().includes(query) ||
        entry.status.toLowerCase().includes(query) ||
        entry.preferred_date.includes(query) ||
        entry.service?.name?.toLowerCase().includes(query) ||
        entry.employee?.full_name?.toLowerCase().includes(query)
      );
    });
  }, [entries, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const pagedEntries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page]);

  const handleCreateEntry = async () => {
    if (!salon?.id) return;
    if (!createForm.customerName.trim() || !createForm.serviceId || !createForm.employeeId || !createForm.preferredDate) {
      setError(t.waitlistErrCreateFields);
      return;
    }
    if (!createForm.customerEmail.trim() && !createForm.customerPhone.trim()) {
      setError(t.waitlistErrContactRequired);
      return;
    }
    if (createForm.preferenceMode === "specific_time" && !createForm.preferredTimeStart) {
      setError(t.waitlistErrPreferredStartRequired);
      return;
    }

    setSavingCreate(true);
    const { error: createError } = await addToWaitlist({
      salonId: salon.id,
      customerName: createForm.customerName,
      customerEmail: createForm.customerEmail || undefined,
      customerPhone: createForm.customerPhone || undefined,
      serviceId: createForm.serviceId,
      employeeId: createForm.employeeId || undefined,
      preferredDate: createForm.preferredDate,
      preferredTimeStart: createForm.preferredTimeStart || undefined,
      preferredTimeEnd: createForm.preferredTimeEnd || undefined,
      preferenceMode: createForm.preferenceMode,
      flexWindowMinutes: Number.parseInt(createForm.flexWindowMinutes || "0", 10) || 0,
      validationMessages: {
        customerNameRequired: t.waitlistErrCustomerNameRequired,
        serviceRequired: t.waitlistErrServiceRequired,
        preferredDateRequired: t.waitlistErrPreferredDateRequired,
      },
    });

    setSavingCreate(false);
    if (createError) {
      setError(m(createError));
      return;
    }

    setCreateOpen(false);
    setCreateForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceId: "",
      employeeId: "",
      preferredDate: new Date().toISOString().slice(0, 10),
      preferredTimeStart: "",
      preferredTimeEnd: "",
      preferenceMode: "specific_time",
      flexWindowMinutes: "0",
    });
    await loadEntries();
  };

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}
      {notice && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {notice}
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            {t.waitlistBtnCreateEntry}
          </Button>
          {filterDefs.map(({ id, label }) => (
            <Button
              key={id}
              size="sm"
              variant={filter === id ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setFilter(id)}
            >
              {label}
            </Button>
          ))}
          <Input
            className="ml-auto h-8 w-full max-w-xs text-xs"
            placeholder={t.waitlistSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">{t.waitlistLoading}</p>
        ) : entries.length === 0 ? (
          <EmptyState title={t.waitlistEmptyTitle} description={t.waitlistEmptyDescription} />
        ) : (
          <div className="divide-y">
            {pagedEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{entry.customer_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{entry.preferred_date}</span>
                    {entry.preferred_time_start && (
                      <span>{entry.preferred_time_start}{entry.preferred_time_end ? `–${entry.preferred_time_end}` : ""}</span>
                    )}
                    <span>
                      &middot;{" "}
                      {entry.preference_mode === "specific_time"
                        ? t.waitlistPreferenceSpecificTime
                        : t.waitlistPreferenceFlexibleDay}
                    </span>
                    {entry.flex_window_minutes > 0 && (
                      <span>
                        &middot;{" "}
                        {applyTemplate(t.waitlistFlexMinutes, {
                          minutes: String(entry.flex_window_minutes),
                        })}
                      </span>
                    )}
                    {entry.service && <span>&middot; {entry.service.name}</span>}
                    {entry.employee && <span>&middot; {entry.employee.full_name}</span>}
                    {typeof entry.priority_override_score === "number" && (
                      <span>
                        &middot;{" "}
                        {applyTemplate(t.waitlistOverrideScoreLabel, {
                          score: String(entry.priority_override_score),
                        })}
                      </span>
                    )}
                  </div>
                  {entry.status === "cooldown" && entry.cooldown_until && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {applyTemplate(t.waitlistCooldownUntil, {
                        datetime: new Date(entry.cooldown_until).toLocaleString(appLocale),
                      })}
                    </p>
                  )}
                  {entry.customer_email && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{entry.customer_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[entry.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {statusLabels[entry.status] ?? entry.status}
                  </span>
                  {entry.status === "waiting" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleNotify(entry)}>
                      <Bell className="h-3 w-3" /> {t.waitlistNotify}
                    </Button>
                  )}
                  {entry.status === "notified" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleConvertToBooking(entry)}>
                      <CheckCircle className="h-3 w-3" /> {t.waitlistConvertBooking}
                    </Button>
                  )}
                  {(entry.status === "waiting" || entry.status === "notified" || entry.status === "cooldown") && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleOpenPriorityOverride(entry)}>
                      {t.waitlistOverridePriority}
                    </Button>
                  )}
                  {typeof entry.priority_override_score === "number" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleClearPriorityOverride(entry)}>
                      {t.waitlistClearOverride}
                    </Button>
                  )}
                  {(entry.status === "waiting" || entry.status === "notified") && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => handleCancel(entry)}>
                      {t.waitlistCancelEntry}
                    </Button>
                  )}
                  {(entry.status === "waiting" || entry.status === "notified") && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleSetCooldown(entry)}>
                      {t.waitlistCooldown}
                    </Button>
                  )}
                  {entry.status === "cooldown" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReactivate(entry)}>
                      {t.waitlistReactivate}
                    </Button>
                  )}
                  {(entry.status === "cancelled" || entry.status === "expired" || entry.status === "booked") && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" aria-label={t.waitlistRemove} onClick={() => handleRemove(entry)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>
                {applyTemplate(t.waitlistPagination, {
                  from: String((page - 1) * pageSize + 1),
                  to: String(Math.min(page * pageSize, filteredEntries.length)),
                  total: String(filteredEntries.length),
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  {t.waitlistPrevious}
                </Button>
                <span>
                  {applyTemplate(t.waitlistPageOf, {
                    current: String(page),
                    total: String(totalPages),
                  })}
                </span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  {t.waitlistNext}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.waitlistCreateDialogTitle}</DialogTitle>
            <DialogDescription>{t.waitlistCreateDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="waitlist-name">{t.waitlistLabelCustomerName}</Label>
              <Input
                id="waitlist-name"
                value={createForm.customerName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-email">{t.waitlistLabelCustomerEmail}</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={createForm.customerEmail}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-phone">{t.waitlistLabelCustomerPhone}</Label>
              <Input
                id="waitlist-phone"
                value={createForm.customerPhone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-service">{t.waitlistLabelService}</Label>
              <select
                id="waitlist-service"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={createForm.serviceId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, serviceId: e.target.value }))}
              >
                <option value="">{t.waitlistSelectService}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-employee">{t.waitlistLabelPreferredEmployee}</Label>
              <select
                id="waitlist-employee"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={createForm.employeeId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              >
                <option value="">{t.waitlistSelectEmployee}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="waitlist-date">{t.waitlistLabelPreferredDate}</Label>
              <Input
                id="waitlist-date"
                type="date"
                value={createForm.preferredDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="waitlist-mode">{t.waitlistLabelPreferenceMode}</Label>
                <select
                  id="waitlist-mode"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={createForm.preferenceMode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      preferenceMode: e.target.value as "specific_time" | "day_flexible",
                    }))
                  }
                >
                  <option value="specific_time">{t.waitlistModeSpecificTime}</option>
                  <option value="day_flexible">{t.waitlistModeFlexibleDay}</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="waitlist-flex-window">{t.waitlistLabelFlexWindow}</Label>
                <Input
                  id="waitlist-flex-window"
                  type="number"
                  min={0}
                  max={2880}
                  value={createForm.flexWindowMinutes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, flexWindowMinutes: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="waitlist-start">{t.waitlistLabelPreferredStart}</Label>
                <Input
                  id="waitlist-start"
                  type="time"
                  value={createForm.preferredTimeStart}
                  disabled={createForm.preferenceMode === "day_flexible"}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredTimeStart: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="waitlist-end">{t.waitlistLabelPreferredEnd}</Label>
                <Input
                  id="waitlist-end"
                  type="time"
                  value={createForm.preferredTimeEnd}
                  disabled={createForm.preferenceMode === "day_flexible"}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredTimeEnd: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t.cancelButton}
            </Button>
            <Button onClick={handleCreateEntry} disabled={savingCreate}>
              {savingCreate ? t.waitlistCreateSaving : t.waitlistCreateSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={notifyEntry !== null}
        onOpenChange={(open) => {
          if (!open) setNotifyEntry(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.waitlistNotifyDialogTitle}</DialogTitle>
            <DialogDescription>{t.waitlistNotifyDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="notify-slot-start">{t.waitlistLabelSlotStart}</Label>
              <Input
                id="notify-slot-start"
                type="datetime-local"
                value={notifySlotStart}
                onChange={(e) => setNotifySlotStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notify-slot-end">{t.waitlistLabelSlotEndOptional}</Label>
              <Input
                id="notify-slot-end"
                type="datetime-local"
                value={notifySlotEnd}
                onChange={(e) => setNotifySlotEnd(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notify-employee">{t.waitlistLabelNotifyEmployee}</Label>
              <select
                id="notify-employee"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={notifyEmployeeId}
                onChange={(e) => setNotifyEmployeeId(e.target.value)}
              >
                <option value="">{t.waitlistSelectEmployee}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyEntry(null)}>
              {t.cancelButton}
            </Button>
            <Button onClick={submitNotify} disabled={notifyBusy}>
              {notifyBusy ? t.waitlistNotifySending : t.waitlistNotifySendOffer}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={overrideEntry !== null}
        onOpenChange={(open) => {
          if (!open) setOverrideEntry(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.waitlistOverrideDialogTitle}</DialogTitle>
            <DialogDescription>{t.waitlistOverrideDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="override-score">{t.waitlistLabelOverrideScore}</Label>
              <Input
                id="override-score"
                type="number"
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="override-reason">{t.waitlistLabelOverrideReason}</Label>
              <Input
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideEntry(null)}>
              {t.cancelButton}
            </Button>
            <Button onClick={handleSavePriorityOverride} disabled={overrideBusy}>
              {overrideBusy ? t.waitlistOverrideSaving : t.waitlistOverrideSave}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
