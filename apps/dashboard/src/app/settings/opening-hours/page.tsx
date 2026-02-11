"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Check,
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

  if (!day.openTime || !day.closeTime) {
    return "Open and close times are required.";
  }
  if (day.openTime === "00:00" && day.closeTime === "00:00") {
    return "Both times cannot be 00:00.";
  }
  if (day.closeTime <= day.openTime) {
    return "Close time must be after open time.";
  }

  if (day.hasBreak) {
    if (!day.breakStart || !day.breakEnd) {
      return "Break start and end times are required.";
    }
    if (day.breakEnd <= day.breakStart) {
      return "Break end must be after break start.";
    }
    if (day.breakStart < day.openTime || day.breakEnd > day.closeTime) {
      return "Break must be within opening hours.";
    }
  }

  return null;
}

// ─── Component ──────────────────────────────────────

export default function OpeningHoursPage() {
  const { locale } = useLocale();
  const { salon, loading: salonLoading } = useCurrentSalon();
  const { hasFeature } = useFeatures();
  const router = useRouter();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].onboarding;

  // Form state
  const [formState, setFormState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [serverState, setServerState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Closures state
  const [closures, setClosures] = useState<ClosureRow[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(true);
  const [newClosureDate, setNewClosureDate] = useState("");
  const [newClosureReason, setNewClosureReason] = useState("");
  const [addingClosure, setAddingClosure] = useState(false);

  const dayNames = useMemo(
    () => [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday],
    [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday]
  );

  // Dirty state check
  const isDirty = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(serverState),
    [formState, serverState]
  );

  // Validation errors
  const validationErrors = useMemo(
    () => formState.map(validateDay),
    [formState]
  );

  const hasErrors = validationErrors.some((e) => e !== null);

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
        const dbRow = hoursResult.data!.find(
          (h) => h.day_of_week === defaultDay.day_of_week
        );
        if (!dbRow) return defaultDay;
        return {
          ...defaultDay,
          isOpen: !dbRow.is_closed,
          openTime: dbRow.open_time?.substring(0, 5) ?? defaultDay.openTime,
          closeTime: dbRow.close_time?.substring(0, 5) ?? defaultDay.closeTime,
        };
      });
    }

    // Merge breaks
    if (breaksResult.data && breaksResult.data.length > 0) {
      days = days.map((day) => {
        const brk = breaksResult.data!.find(
          (b) => b.day_of_week === day.day_of_week
        );
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

    if (!error && data) {
      setClosures(data as ClosureRow[]);
    }
    setClosuresLoading(false);
  }, [salon?.id]);

  useEffect(() => {
    loadData();
    loadClosures();
  }, [loadData, loadClosures]);

  // ─── Dirty-state guard ──────────────────────────────

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ─── Handlers ───────────────────────────────────────

  const updateDay = (index: number, patch: Partial<DayForm>) => {
    setFormState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      // If closing the day, remove the break
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
    updateDay(index, {
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "12:30",
      breakLabel: "Lunch",
    });
  };

  const removeBreak = (index: number) => {
    updateDay(index, {
      hasBreak: false,
      breakStart: "",
      breakEnd: "",
      breakLabel: "",
    });
  };

  const copyMondayToWeekdays = () => {
    const monday = formState[0];
    setFormState((prev) => {
      const next = [...prev];
      for (let i = 1; i <= 4; i++) {
        next[i] = { ...monday, day_of_week: i };
      }
      return next;
    });
  };

  const applyToAllOpenDays = () => {
    const firstOpen = formState.find((d) => d.isOpen);
    if (!firstOpen) return;
    setFormState((prev) =>
      prev.map((day) =>
        day.isOpen ? { ...firstOpen, day_of_week: day.day_of_week } : day
      )
    );
  };

  // ─── Save ───────────────────────────────────────────

  const handleSave = async () => {
    if (!salon?.id || hasErrors || !isDirty) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    // 1. Upsert opening hours
    const hoursInput = formState.map((d) => ({
      day_of_week: d.day_of_week,
      open_time: d.isOpen ? d.openTime : "00:00",
      close_time: d.isOpen ? d.closeTime : "00:00",
      is_closed: !d.isOpen,
    }));

    const { error: hoursError } = await upsertOpeningHours(salon.id, hoursInput);
    if (hoursError) {
      setSaveError(hoursError);
      setSaving(false);
      return;
    }

    // 2. Upsert/delete breaks
    const breakOps = formState.map(async (d) => {
      if (d.isOpen && d.hasBreak && d.breakStart && d.breakEnd) {
        return upsertBreak(salon.id, d.day_of_week, d.breakStart, d.breakEnd, d.breakLabel || undefined);
      } else {
        return deleteBreakForDay(salon.id, d.day_of_week);
      }
    });

    const breakResults = await Promise.all(breakOps);
    const breakError = breakResults.find((r) => r.error)?.error;
    if (breakError) {
      setSaveError(breakError);
      setSaving(false);
      return;
    }

    // 3. Audit log
    const changedDays = formState
      .filter((d, i) => JSON.stringify(d) !== JSON.stringify(serverState[i]))
      .map((d) => dayNames[d.day_of_week]);

    await createAuditLog({
      salon_id: salon.id,
      action: "opening_hours_updated",
      resource_type: "salon",
      resource_id: salon.id,
      metadata: {
        changed_days: changedDays,
        has_breaks: formState.some((d) => d.hasBreak),
      },
    });

    // 4. Refetch to confirm server state
    await loadData();

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

  // ─── Upgrade banner click ──────────────────────────

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
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        No salon found. Complete onboarding first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Opening Hours Card ─────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {translations[appLocale].settings.openingHoursTab}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-500">
                Set your salon&apos;s weekly opening hours and breaks.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyMondayToWeekdays}
                className="text-xs"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Mon to Tue–Fri
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={applyToAllOpenDays}
                className="text-xs"
              >
                <CopyCheck className="mr-1.5 h-3.5 w-3.5" />
                Apply to all open days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {formState.map((day, index) => (
              <div key={day.day_of_week}>
                {/* Main row */}
                <div
                  className={`grid items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50/50 ${
                    day.isOpen
                      ? "grid-cols-[20px_100px_1fr_18px_1fr_auto]"
                      : "grid-cols-[20px_100px_1fr] opacity-50"
                  }`}
                >
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) => updateDay(index, { isOpen: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />
                  </label>

                  {/* Day name */}
                  <span className="text-sm font-medium text-slate-700">
                    {dayNames[day.day_of_week]}
                  </span>

                  {day.isOpen ? (
                    <>
                      {/* Open time */}
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => updateDay(index, { openTime: e.target.value })}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                      />
                      <span className="text-center text-sm text-slate-400">
                        <ArrowRight className="mx-auto h-3.5 w-3.5" />
                      </span>
                      {/* Close time */}
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateDay(index, { closeTime: e.target.value })}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                      />
                      {/* Add lunch break button */}
                      {!day.hasBreak && (
                        <button
                          type="button"
                          onClick={() => addLunchBreak(index)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                        >
                          <Coffee className="h-3.5 w-3.5" />
                          Add lunch break
                        </button>
                      )}
                      {day.hasBreak && <div />}
                    </>
                  ) : (
                    <span className="text-right text-sm text-slate-400 col-span-1">
                      {t.closedLabel}
                    </span>
                  )}
                </div>

                {/* Break row */}
                {day.isOpen && day.hasBreak && (
                  <div className="ml-[124px] flex items-center gap-2 px-3 pb-2">
                    <Coffee className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <input
                      type="time"
                      value={day.breakStart}
                      onChange={(e) => updateDay(index, { breakStart: e.target.value })}
                      className="h-8 w-[110px] rounded-md border border-slate-200 bg-white px-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <span className="text-xs text-slate-400">–</span>
                    <input
                      type="time"
                      value={day.breakEnd}
                      onChange={(e) => updateDay(index, { breakEnd: e.target.value })}
                      className="h-8 w-[110px] rounded-md border border-slate-200 bg-white px-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <input
                      type="text"
                      value={day.breakLabel}
                      onChange={(e) => updateDay(index, { breakLabel: e.target.value })}
                      placeholder="Label"
                      className="h-8 w-[90px] rounded-md border border-slate-200 bg-white px-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeBreak(index)}
                      className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Validation error */}
                {validationErrors[index] && (
                  <p className="ml-[124px] px-3 pb-1 text-xs text-red-500">
                    {validationErrors[index]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* System notice */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">
              Opening hours and breaks are used to calculate available booking
              times when shift planning is not enabled.
            </p>
          </div>

          {/* Save button */}
          <div className="mt-4 flex items-center justify-end gap-3">
            {saveError && (
              <p className="text-sm text-red-500">{saveError}</p>
            )}
            {saved && (
              <Badge variant="secondary" className="gap-1 text-green-700 bg-green-50 border-green-200">
                <Check className="h-3.5 w-3.5" />
                Saved
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={!isDirty || hasErrors || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Upcoming Closures Card ─────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-500" />
            Upcoming closures
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
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
                <p className="mb-4 text-sm text-slate-400">
                  No upcoming closures scheduled.
                </p>
              )}
              {closures.length > 0 && (
                <div className="mb-4 space-y-2">
                  {closures.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">
                          {new Date(c.closed_date + "T00:00:00").toLocaleDateString(
                            locale === "nb" ? "nb-NO" : "en-US",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </span>
                        {c.reason && (
                          <span className="text-sm text-slate-500">
                            — &ldquo;{c.reason}&rdquo;
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteClosure(c.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
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
                  <label className="text-xs font-medium text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newClosureDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setNewClosureDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={newClosureReason}
                    onChange={(e) => setNewClosureReason(e.target.value)}
                    placeholder="e.g. 17. mai, Christmas"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addClosure}
                  disabled={!newClosureDate || addingClosure}
                >
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
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Need different schedules per employee?
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Advanced shift planning is available on Pro.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgradeClick}
            >
              View plans
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
