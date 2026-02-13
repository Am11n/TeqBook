"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { supabase } from "@/lib/supabase-client";
import {
  getOpeningHoursForSalon,
  upsertOpeningHours,
  getBreaksForSalon,
  upsertBreak,
  deleteBreakForDay,
} from "@/lib/repositories/opening-hours";
import { createAuditLog } from "@/lib/repositories/audit-log";
import { StickySaveBar } from "@/components/settings/StickySaveBar";
import { useTabGuard } from "../layout";
import {
  Plus,
  Trash2,
  Copy,
  CopyCheck,
  ArrowRight,
  Info,
  Calendar,
  X,
  Coffee,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────

type DayForm = {
  day_of_week: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
  breakLabel: string;
};

type ClosureRow = {
  id: string;
  salon_id: string;
  closed_date: string;
  reason: string | null;
};

// ─── Defaults ───────────────────────────────────────

const DEFAULT_DAYS: DayForm[] = [
  { day_of_week: 0, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 1, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 2, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 3, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 4, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 5, isOpen: false, openTime: "10:00", closeTime: "15:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 6, isOpen: false, openTime: "10:00", closeTime: "15:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
];

// ─── Validation ─────────────────────────────────────

function validateDay(day: DayForm): string | null {
  if (!day.isOpen) return null;
  if (!day.openTime || !day.closeTime) return "Open and close times are required.";
  if (day.openTime === "00:00" && day.closeTime === "00:00") return "Both times cannot be 00:00.";
  if (day.closeTime <= day.openTime) return "Close time must be after open time.";
  if (day.hasBreak) {
    if (!day.breakStart || !day.breakEnd) return "Break start and end times are required.";
    if (day.breakEnd <= day.breakStart) return "Break end must be after break start.";
    if (day.breakStart < day.openTime || day.breakEnd > day.closeTime) return "Break must be within opening hours.";
  }
  return null;
}

// ─── Closure suggestion dates ───────────────────────

function getClosureSuggestions(): { label: string; date: string }[] {
  const year = new Date().getFullYear();
  return [
    { label: "17. mai", date: `${year}-05-17` },
    { label: "24. dec", date: `${year}-12-24` },
    { label: "25. dec", date: `${year}-12-25` },
    { label: "1. jan", date: `${year + 1}-01-01` },
  ].filter((s) => new Date(s.date) >= new Date());
}

// ─── Component ──────────────────────────────────────

export default function OpeningHoursPage() {
  const { locale } = useLocale();
  const { salon, loading: salonLoading } = useCurrentSalon();
  const { hasFeature } = useFeatures();
  const router = useRouter();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].onboarding;
  const { registerDirtyState } = useTabGuard();

  // Form state
  const [formState, setFormState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [serverState, setServerState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Closures state
  const [closures, setClosures] = useState<ClosureRow[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(true);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [addingClosure, setAddingClosure] = useState(false);

  // Merge toggles for copy popovers
  const [copyOverwriteTimes, setCopyOverwriteTimes] = useState(true);
  const [copyKeepBreaks, setCopyKeepBreaks] = useState(true);
  const [copyKeepClosed, setCopyKeepClosed] = useState(true);

  // Break edit popover
  const [editingBreakIdx, setEditingBreakIdx] = useState<number | null>(null);

  const dayNames = useMemo(
    () => [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday],
    [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday]
  );

  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(serverState),
    [formState, serverState]
  );

  const validationErrors = useMemo(
    () => formState.map(validateDay),
    [formState]
  );

  const hasErrors = validationErrors.some((e) => e !== null);

  // Register dirty state with tab guard
  useEffect(() => {
    registerDirtyState("opening-hours", isDirty);
  }, [isDirty, registerDirtyState]);

  // ─── Load data ──────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    const [hoursResult, breaksResult] = await Promise.all([
      getOpeningHoursForSalon(salon.id),
      getBreaksForSalon(salon.id),
    ]);

    let days = [...DEFAULT_DAYS];
    if (hoursResult.data && hoursResult.data.length > 0) {
      days = DEFAULT_DAYS.map((defaultDay) => {
        const dbRow = hoursResult.data!.find((h) => h.day_of_week === defaultDay.day_of_week);
        if (!dbRow) return defaultDay;
        return {
          ...defaultDay,
          isOpen: !dbRow.is_closed,
          openTime: dbRow.open_time?.substring(0, 5) ?? defaultDay.openTime,
          closeTime: dbRow.close_time?.substring(0, 5) ?? defaultDay.closeTime,
        };
      });
    }
    if (breaksResult.data && breaksResult.data.length > 0) {
      days = days.map((day) => {
        const brk = breaksResult.data!.find((b) => b.day_of_week === day.day_of_week);
        if (!brk) return day;
        return {
          ...day,
          hasBreak: true,
          breakStart: brk.start_time?.substring(0, 5) ?? "",
          breakEnd: brk.end_time?.substring(0, 5) ?? "",
          breakLabel: brk.label ?? "Lunch",
        };
      });
    }
    setFormState(days);
    setServerState(days);
    setLoading(false);
  }, [salon?.id]);

  const loadClosures = useCallback(async () => {
    if (!salon?.id) return;
    setClosuresLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("salon_closures")
      .select("*")
      .eq("salon_id", salon.id)
      .gte("closed_date", today)
      .order("closed_date", { ascending: true });
    if (!error && data) setClosures(data as ClosureRow[]);
    setClosuresLoading(false);
  }, [salon?.id]);

  useEffect(() => {
    loadData();
    loadClosures();
  }, [loadData, loadClosures]);

  // ─── Handlers ───────────────────────────────────────

  const updateDay = (index: number, patch: Partial<DayForm>) => {
    setFormState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      if (patch.isOpen === false) {
        next[index].hasBreak = false;
        next[index].breakStart = "";
        next[index].breakEnd = "";
        next[index].breakLabel = "";
      }
      return next;
    });
  };

  const addLunchBreak = (index: number) => {
    updateDay(index, { hasBreak: true, breakStart: "12:00", breakEnd: "12:30", breakLabel: "Lunch" });
  };

  const removeBreak = (index: number) => {
    updateDay(index, { hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" });
    setEditingBreakIdx(null);
  };

  // Copy Monday to Tue-Fri with merge rules
  const copyMondayToWeekdays = () => {
    const monday = formState[0];
    setFormState((prev) => {
      const next = [...prev];
      for (let i = 1; i <= 4; i++) {
        // Skip closed days if toggle is on
        if (copyKeepClosed && !next[i].isOpen) continue;
        const patch: Partial<DayForm> = { day_of_week: i };
        if (copyOverwriteTimes) {
          patch.isOpen = monday.isOpen;
          patch.openTime = monday.openTime;
          patch.closeTime = monday.closeTime;
        }
        if (!copyKeepBreaks) {
          patch.hasBreak = monday.hasBreak;
          patch.breakStart = monday.breakStart;
          patch.breakEnd = monday.breakEnd;
          patch.breakLabel = monday.breakLabel;
        }
        next[i] = { ...next[i], ...patch };
      }
      return next;
    });
  };

  const applyToAllOpenDays = () => {
    const firstOpen = formState.find((d) => d.isOpen);
    if (!firstOpen) return;
    setFormState((prev) =>
      prev.map((day) => {
        if (!day.isOpen && copyKeepClosed) return day;
        if (!day.isOpen) return day;
        const patch: Partial<DayForm> = {};
        if (copyOverwriteTimes) {
          patch.openTime = firstOpen.openTime;
          patch.closeTime = firstOpen.closeTime;
        }
        if (!copyKeepBreaks) {
          patch.hasBreak = firstOpen.hasBreak;
          patch.breakStart = firstOpen.breakStart;
          patch.breakEnd = firstOpen.breakEnd;
          patch.breakLabel = firstOpen.breakLabel;
        }
        return { ...day, ...patch };
      })
    );
  };

  // ─── Save ───────────────────────────────────────────

  const handleSave = async () => {
    if (!salon?.id || hasErrors || !isDirty) return;
    setSaving(true);
    setSaveError(null);

    const hoursInput = formState.map((d) => ({
      day_of_week: d.day_of_week,
      open_time: d.isOpen ? d.openTime : "00:00",
      close_time: d.isOpen ? d.closeTime : "00:00",
      is_closed: !d.isOpen,
    }));

    const { error: hoursError } = await upsertOpeningHours(salon.id, hoursInput);
    if (hoursError) { setSaveError(hoursError); setSaving(false); return; }

    const breakOps = formState.map(async (d) => {
      if (d.isOpen && d.hasBreak && d.breakStart && d.breakEnd) {
        return upsertBreak(salon.id, d.day_of_week, d.breakStart, d.breakEnd, d.breakLabel || undefined);
      } else {
        return deleteBreakForDay(salon.id, d.day_of_week);
      }
    });

    const breakResults = await Promise.all(breakOps);
    const breakError = breakResults.find((r) => r.error)?.error;
    if (breakError) { setSaveError(breakError); setSaving(false); return; }

    const changedDays = formState
      .filter((d, i) => JSON.stringify(d) !== JSON.stringify(serverState[i]))
      .map((d) => dayNames[d.day_of_week]);

    await createAuditLog({
      salon_id: salon.id,
      action: "opening_hours_updated",
      resource_type: "salon",
      resource_id: salon.id,
      metadata: { changed_days: changedDays, has_breaks: formState.some((d) => d.hasBreak) },
    });

    await loadData();
    setSaving(false);
    setLastSavedAt(new Date());
  };

  const handleDiscard = () => {
    setFormState(serverState);
    setSaveError(null);
  };

  // ─── Closures handlers ─────────────────────────────

  const addClosure = async () => {
    if (!salon?.id || !newClosureDate) return;
    setAddingClosure(true);
    const { error } = await supabase.from("salon_closures").insert({
      salon_id: salon.id,
      closed_date: newClosureDate,
      reason: newClosureReason || null,
    });
    if (!error) {
      setNewClosureDate("");
      setNewClosureReason("");
      await loadClosures();
    }
    setAddingClosure(false);
  };

  const deleteClosure = async (id: string) => {
    await supabase.from("salon_closures").delete().eq("id", id);
    setClosures((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpgradeClick = async () => {
    if (salon?.id) {
      await createAuditLog({
        salon_id: salon.id,
        action: "upgrade_banner_clicked",
        resource_type: "salon",
        resource_id: salon.id,
        metadata: { source: "opening_hours" },
      });
    }
    router.push("/settings/billing");
  };

  // ─── Merge toggles popover content ─────────────────

  const MergeToggles = ({ onApply }: { onApply: () => void }) => (
    <div className="space-y-3 p-1">
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={copyOverwriteTimes} onChange={(e) => setCopyOverwriteTimes(e.target.checked)} className="h-3.5 w-3.5 rounded" />
        Overwrite opening times
      </label>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={copyKeepBreaks} onChange={(e) => setCopyKeepBreaks(e.target.checked)} className="h-3.5 w-3.5 rounded" />
        Keep existing breaks
      </label>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={copyKeepClosed} onChange={(e) => setCopyKeepClosed(e.target.checked)} className="h-3.5 w-3.5 rounded" />
        Keep closed days as closed
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" onClick={onApply}>Apply</Button>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────

  if (salonLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!salon) {
    return <div className="py-12 text-center text-sm text-muted-foreground">No salon found. Complete onboarding first.</div>;
  }

  const closureSuggestions = getClosureSuggestions();

  return (
    <div className="space-y-6">
      {/* ─── Opening Hours Card ─────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                {translations[appLocale].settings.openingHoursTab}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                Set your salon&apos;s weekly opening hours and breaks.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Copy Mon to Tue-Fri with confirm popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Mon to Tue-Fri
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <p className="text-xs font-medium mb-2">
                    This updates: Tue, Wed, Thu, Fri
                  </p>
                  <MergeToggles onApply={copyMondayToWeekdays} />
                </PopoverContent>
              </Popover>

              {/* Apply to all open days with confirm popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <CopyCheck className="mr-1.5 h-3.5 w-3.5" />
                    Apply to all open days
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <p className="text-xs font-medium mb-2">
                    Applies first open day&apos;s schedule to all open days.
                  </p>
                  <MergeToggles onApply={applyToAllOpenDays} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {formState.map((day, index) => (
              <div key={day.day_of_week}>
                {/* Main row */}
                <div
                  className={`grid items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30 ${
                    day.isOpen
                      ? "grid-cols-[20px_100px_1fr_18px_1fr_auto]"
                      : "grid-cols-[20px_100px_1fr] opacity-50"
                  }`}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) => updateDay(index, { isOpen: e.target.checked })}
                      className="h-4 w-4 rounded border-input"
                    />
                  </label>

                  <span className="text-sm font-medium">{dayNames[day.day_of_week]}</span>

                  {day.isOpen ? (
                    <>
                      <input
                        type="time"
                        step="300"
                        value={day.openTime}
                        onChange={(e) => updateDay(index, { openTime: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
                      />
                      <span className="text-center text-muted-foreground">
                        <ArrowRight className="mx-auto h-3.5 w-3.5" />
                      </span>
                      <input
                        type="time"
                        step="300"
                        value={day.closeTime}
                        onChange={(e) => updateDay(index, { closeTime: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
                      />
                      {/* Break chip or add break button */}
                      <div className="flex items-center gap-1.5">
                        {day.hasBreak ? (
                          <Popover open={editingBreakIdx === index} onOpenChange={(open) => setEditingBreakIdx(open ? index : null)}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                              >
                                <Coffee className="h-3 w-3" />
                                <span className="tabular-nums">{day.breakStart}-{day.breakEnd}</span>
                                {day.breakLabel && <span>{day.breakLabel}</span>}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                              <div className="space-y-2">
                                <p className="text-xs font-medium">Edit break</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    step="300"
                                    value={day.breakStart}
                                    onChange={(e) => updateDay(index, { breakStart: e.target.value })}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums outline-none focus:ring-1 focus:ring-ring"
                                  />
                                  <span className="text-xs text-muted-foreground">-</span>
                                  <input
                                    type="time"
                                    step="300"
                                    value={day.breakEnd}
                                    onChange={(e) => updateDay(index, { breakEnd: e.target.value })}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums outline-none focus:ring-1 focus:ring-ring"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={day.breakLabel}
                                  onChange={(e) => updateDay(index, { breakLabel: e.target.value })}
                                  placeholder="Label"
                                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                                />
                                <div className="flex justify-between pt-1">
                                  <Button variant="ghost" size="sm" onClick={() => removeBreak(index)} className="text-destructive hover:text-destructive text-xs">
                                    Remove
                                  </Button>
                                  <Button size="sm" onClick={() => setEditingBreakIdx(null)} className="text-xs">
                                    Done
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          /* X to quickly remove */
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addLunchBreak(index)}
                          >
                            <Coffee className="h-3 w-3 mr-1" />
                            + Break
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-right text-sm text-muted-foreground">{t.closedLabel}</span>
                  )}
                </div>

                {/* Validation error */}
                {validationErrors[index] && (
                  <p className="ml-[124px] px-3 pb-1 text-xs text-destructive">
                    {validationErrors[index]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* System notice */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Opening hours and breaks are used to calculate available booking times when shift planning is not enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Upcoming Closures Card ─────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Upcoming closures
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Holidays and closed days. Bookings will be blocked on these dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {closuresLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {closures.length === 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No closures planned. Add your first:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {closureSuggestions.map((s) => (
                      <button
                        key={s.date}
                        type="button"
                        onClick={() => { setNewClosureDate(s.date); setNewClosureReason(s.label); }}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {closures.length > 0 && (
                <div className="mb-4 space-y-2">
                  {closures.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {new Date(c.closed_date + "T00:00:00").toLocaleDateString(
                            appLocale === "nb" ? "nb-NO" : "en-US",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </span>
                        {c.reason && (
                          <span className="text-sm text-muted-foreground">
                            — &ldquo;{c.reason}&rdquo;
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteClosure(c.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add closure form */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Date</label>
                  <input
                    type="date"
                    value={newClosureDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setNewClosureDate(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums outline-none transition focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Reason (optional)</label>
                  <input
                    type="text"
                    value={newClosureReason}
                    onChange={(e) => setNewClosureReason(e.target.value)}
                    placeholder="e.g. 17. mai, Christmas"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addClosure} disabled={!newClosureDate || addingClosure}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {addingClosure ? "Adding..." : "Add closure"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Upgrade Banner ──────────────────────────── */}
      {!hasFeature("SHIFTS") && (
        <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm font-medium">
                Need different schedules per employee?
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Advanced shift planning is available on Pro.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpgradeClick}>
              View plans
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sticky save bar */}
      <StickySaveBar
        isDirty={isDirty}
        isValid={!hasErrors}
        saving={saving}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onRetry={handleSave}
      />
    </div>
  );
}
