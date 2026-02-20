"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
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
import { ArrowRight, Info } from "lucide-react";
import { type DayForm, DEFAULT_DAYS, validateDay } from "./_components/types";
import { DayRow } from "./_components/DayRow";
import { ClosureEditor } from "./_components/ClosureEditor";
import { CopyDayPopover, type CopyOptions } from "./_components/CopyDayPopover";

export default function OpeningHoursPage() {
  const { locale } = useLocale();
  const { salon, loading: salonLoading } = useCurrentSalon();
  const { hasFeature } = useFeatures();
  const router = useRouter();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].onboarding;
  const { registerDirtyState } = useTabGuard();

  const [formState, setFormState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [serverState, setServerState] = useState<DayForm[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    registerDirtyState("opening-hours", isDirty);
  }, [isDirty, registerDirtyState]);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const copyMondayToWeekdays = (opts: CopyOptions) => {
    const monday = formState[0];
    setFormState((prev) => {
      const next = [...prev];
      for (let i = 1; i <= 4; i++) {
        if (opts.keepClosed && !next[i].isOpen) continue;
        const patch: Partial<DayForm> = { day_of_week: i };
        if (opts.overwriteTimes) {
          patch.isOpen = monday.isOpen;
          patch.openTime = monday.openTime;
          patch.closeTime = monday.closeTime;
        }
        if (!opts.keepBreaks) {
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

  const applyToAllOpenDays = (opts: CopyOptions) => {
    const firstOpen = formState.find((d) => d.isOpen);
    if (!firstOpen) return;
    setFormState((prev) =>
      prev.map((day) => {
        if (!day.isOpen && opts.keepClosed) return day;
        if (!day.isOpen) return day;
        const patch: Partial<DayForm> = {};
        if (opts.overwriteTimes) {
          patch.openTime = firstOpen.openTime;
          patch.closeTime = firstOpen.closeTime;
        }
        if (!opts.keepBreaks) {
          patch.hasBreak = firstOpen.hasBreak;
          patch.breakStart = firstOpen.breakStart;
          patch.breakEnd = firstOpen.breakEnd;
          patch.breakLabel = firstOpen.breakLabel;
        }
        return { ...day, ...patch };
      })
    );
  };

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

  return (
    <div className="space-y-6">
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
            <CopyDayPopover
              onCopyMondayToWeekdays={copyMondayToWeekdays}
              onApplyToAllOpenDays={applyToAllOpenDays}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {formState.map((day, index) => (
              <DayRow
                key={day.day_of_week}
                day={day}
                dayName={dayNames[day.day_of_week]}
                closedLabel={t.closedLabel}
                validationError={validationErrors[index]}
                onUpdate={(patch) => updateDay(index, patch)}
              />
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Opening hours and breaks are used to calculate available booking times when shift planning is not enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      <ClosureEditor salonId={salon.id} appLocale={appLocale} />

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
