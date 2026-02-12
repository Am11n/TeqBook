"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Building2,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Search,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import {
  useCopyShifts,
  buildPatternFromShifts,
  buildPatternFromOpeningHours,
  calcPatternHours,
  type WeekPattern,
  type DayPattern,
  type CopyStrategy,
  type TargetAnalysis,
  type ApplyResult,
} from "@/lib/hooks/shifts/useCopyShifts";
import type { Shift } from "@/lib/types";
import type { ShiftsMessages } from "@/i18n/translations";

// ─── Weekday helpers ──────────────────────────────────

const ISO_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

const DAY_LABELS_NB: Record<number, string> = {
  1: "Man", 2: "Tir", 3: "Ons", 4: "Tor", 5: "Fre", 6: "Lør", 7: "Søn",
};
const DAY_LABELS_EN: Record<number, string> = {
  1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun",
};

function getDayLabel(isoDay: number, locale: string): string {
  return locale === "nb" ? (DAY_LABELS_NB[isoDay] ?? "") : (DAY_LABELS_EN[isoDay] ?? "");
}

// ─── Types ────────────────────────────────────────────

type Step = "source" | "pattern" | "targets" | "result";

interface CopyShiftsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: { id: string; full_name: string }[];
  shifts: Shift[];
  locale: string;
  getOpeningHoursForDay: (weekday: number) => { open_time: string; close_time: string } | null;
  loadShifts: () => Promise<void>;
  translations: Pick<
    ShiftsMessages,
    | "copyShifts" | "copyStepSource" | "copyStepPattern" | "copyStepTargets"
    | "copyFromEmployee" | "copyFromOpeningHours" | "copyNoShiftsHint"
    | "copyAddInterval" | "copyMondayToRest" | "copyTotalHours"
    | "copySelectTargets" | "copySearchEmployee"
    | "copySelectAll" | "copySelectNone" | "copySelectWithoutShifts"
    | "copyStrategyAdditive" | "copyStrategyAdditiveDesc"
    | "copyStrategyReplace" | "copyStrategyReplaceDesc" | "copyStrategyReplaceConfirm"
    | "copyPreviewCreate" | "copyPreviewSkip" | "copyPreviewConflict" | "copyPreviewDetails"
    | "copyApplyButton" | "copyApplyingButton"
    | "copyResultToast" | "copyResultSkipped" | "copyResultClose"
    | "copyBack" | "copyNext"
    | "daysWorking"
  >;
}

// ─── Component ────────────────────────────────────────

export function CopyShiftsDialog({
  open,
  onOpenChange,
  employees,
  shifts,
  locale,
  getOpeningHoursForDay,
  loadShifts,
  translations: t,
}: CopyShiftsDialogProps) {
  // ── State ────────────────────────────────────────
  const [step, setStep] = useState<Step>("source");
  const [sourceEmployeeId, setSourceEmployeeId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"employee" | "openingHours">("employee");
  const [pattern, setPattern] = useState<WeekPattern>({});
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [strategy, setStrategy] = useState<CopyStrategy>("additive");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set());
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  const { analyseAll, getSummary, apply, applying } = useCopyShifts(shifts, loadShifts);

  // ── Refs for autofocus ───────────────────────────
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ── Reset when dialog opens/closes ───────────────
  useEffect(() => {
    if (open) {
      setStep("source");
      setSourceEmployeeId(null);
      setSourceType("employee");
      setPattern({});
      setSelectedTargets(new Set());
      setStrategy("additive");
      setSearchQuery("");
      setExpandedTargets(new Set());
      setApplyResult(null);
    }
  }, [open]);

  // ── Autofocus per step ───────────────────────────
  useEffect(() => {
    if (step === "targets") {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [step]);

  // ── Employee stats helper ────────────────────────
  const employeeStats = useMemo(() => {
    const map = new Map<string, { hours: number; days: number }>();
    for (const emp of employees) {
      const empShifts = shifts.filter((s) => s.employee_id === emp.id);
      let totalMinutes = 0;
      const daysSet = new Set<number>();
      for (const s of empShifts) {
        const [sh, sm] = s.start_time.split(":").map(Number);
        const [eh, em] = s.end_time.split(":").map(Number);
        totalMinutes += (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
        daysSet.add(s.weekday);
      }
      map.set(emp.id, {
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        days: daysSet.size,
      });
    }
    return map;
  }, [employees, shifts]);

  // ── Target analysis ──────────────────────────────
  const targetIds = useMemo(() => Array.from(selectedTargets), [selectedTargets]);
  const analyses = useMemo(
    () => analyseAll(targetIds, pattern, strategy),
    [analyseAll, targetIds, pattern, strategy]
  );
  const summary = useMemo(() => getSummary(analyses), [getSummary, analyses]);

  // ── Available targets (exclude source) ───────────
  const availableTargets = useMemo(() => {
    return employees.filter(
      (e) => !(sourceType === "employee" && e.id === sourceEmployeeId)
    );
  }, [employees, sourceType, sourceEmployeeId]);

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return availableTargets;
    const q = searchQuery.toLowerCase();
    return availableTargets.filter((e) => e.full_name.toLowerCase().includes(q));
  }, [availableTargets, searchQuery]);

  // ── Handlers ─────────────────────────────────────

  const handleSelectSource = useCallback(
    (type: "employee" | "openingHours", employeeId?: string) => {
      setSourceType(type);
      if (type === "employee" && employeeId) {
        setSourceEmployeeId(employeeId);
        setPattern(buildPatternFromShifts(employeeId, shifts));
      } else {
        setSourceEmployeeId(null);
        setPattern(buildPatternFromOpeningHours(getOpeningHoursForDay));
      }
      setStep("pattern");
    },
    [shifts, getOpeningHoursForDay]
  );

  const handlePatternDayToggle = useCallback((isoDay: number) => {
    setPattern((prev) => ({
      ...prev,
      [isoDay]: {
        ...prev[isoDay],
        enabled: !prev[isoDay]?.enabled,
      },
    }));
  }, []);

  const handlePatternIntervalChange = useCallback(
    (isoDay: number, index: number, field: "start" | "end", value: string) => {
      setPattern((prev) => {
        const day = prev[isoDay];
        if (!day) return prev;
        const intervals = [...day.intervals];
        intervals[index] = { ...intervals[index], [field]: value };
        return { ...prev, [isoDay]: { ...day, intervals } };
      });
    },
    []
  );

  const handleAddInterval = useCallback((isoDay: number) => {
    setPattern((prev) => {
      const day = prev[isoDay] ?? { enabled: true, intervals: [] };
      return {
        ...prev,
        [isoDay]: {
          ...day,
          enabled: true,
          intervals: [...day.intervals, { start: "09:00", end: "17:00" }],
        },
      };
    });
  }, []);

  const handleRemoveInterval = useCallback((isoDay: number, index: number) => {
    setPattern((prev) => {
      const day = prev[isoDay];
      if (!day) return prev;
      const intervals = day.intervals.filter((_, i) => i !== index);
      return {
        ...prev,
        [isoDay]: { ...day, intervals, enabled: intervals.length > 0 },
      };
    });
  }, []);

  const handleCopyMondayToRest = useCallback(() => {
    setPattern((prev) => {
      const monday = prev[1];
      if (!monday || monday.intervals.length === 0) return prev;
      const updated = { ...prev };
      for (let d = 2; d <= 7; d++) {
        if (updated[d]?.enabled) {
          updated[d] = {
            enabled: true,
            intervals: monday.intervals.map((iv) => ({ ...iv })),
          };
        }
      }
      return updated;
    });
  }, []);

  const handleToggleTarget = useCallback((id: string) => {
    setSelectedTargets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAllTargets = useCallback(() => {
    setSelectedTargets(new Set(availableTargets.map((e) => e.id)));
  }, [availableTargets]);

  const handleSelectNoneTargets = useCallback(() => {
    setSelectedTargets(new Set());
  }, []);

  const handleSelectWithoutShifts = useCallback(() => {
    const idsWithoutShifts = availableTargets
      .filter((e) => {
        const stats = employeeStats.get(e.id);
        return !stats || stats.hours === 0;
      })
      .map((e) => e.id);
    setSelectedTargets(new Set(idsWithoutShifts));
  }, [availableTargets, employeeStats]);

  const handleApply = useCallback(async () => {
    // In replace mode, show confirmation
    if (strategy === "replace") {
      const totalExisting = targetIds.reduce((sum, id) => {
        return sum + shifts.filter((s) => s.employee_id === id).length;
      }, 0);
      if (totalExisting > 0) {
        const names = targetIds
          .map((id) => employees.find((e) => e.id === id)?.full_name ?? id)
          .join(", ");
        const msg = t.copyStrategyReplaceConfirm
          .replace("{count}", String(totalExisting))
          .replace("{name}", names);
        if (!confirm(msg)) return;
      }
    }

    const result = await apply(targetIds, pattern, strategy);
    setApplyResult(result);
    setStep("result");
  }, [strategy, targetIds, shifts, employees, t, apply, pattern]);

  // ── Keyboard shortcuts ───────────────────────────
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter = Apply in targets step
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && step === "targets") {
        e.preventDefault();
        if (summary.totalCreate > 0 && !applying) {
          handleApply();
        }
        return;
      }

      // Enter = Next step (if not in an input)
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        e.preventDefault();
        if (step === "pattern") {
          const hasAnyEnabled = Object.values(pattern).some((d) => d.enabled && d.intervals.length > 0);
          if (hasAnyEnabled) setStep("targets");
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, step, pattern, summary.totalCreate, applying, handleApply]);

  // ── Computed ─────────────────────────────────────
  const patternHours = useMemo(() => calcPatternHours(pattern), [pattern]);
  const hasValidPattern = useMemo(
    () => Object.values(pattern).some((d) => d.enabled && d.intervals.length > 0),
    [pattern]
  );

  const stepIndex = step === "source" ? 1 : step === "pattern" ? 2 : step === "targets" ? 3 : 3;

  // ── Render ───────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-2xl max-h-[85vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            {t.copyShifts}
            {step !== "result" && (
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {stepIndex}/3
              </span>
            )}
          </DialogTitle>
          {step !== "result" && (
            <DialogDescription>
              {step === "source" && t.copyStepSource}
              {step === "pattern" && t.copyStepPattern}
              {step === "targets" && t.copyStepTargets}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step content (scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {step === "source" && (
            <StepSource
              employees={employees}
              employeeStats={employeeStats}
              locale={locale}
              t={t}
              onSelect={handleSelectSource}
            />
          )}

          {step === "pattern" && (
            <StepPattern
              pattern={pattern}
              locale={locale}
              patternHours={patternHours}
              t={t}
              onDayToggle={handlePatternDayToggle}
              onIntervalChange={handlePatternIntervalChange}
              onAddInterval={handleAddInterval}
              onRemoveInterval={handleRemoveInterval}
              onCopyMondayToRest={handleCopyMondayToRest}
            />
          )}

          {step === "targets" && (
            <StepTargets
              filteredTargets={filteredTargets}
              availableTargets={availableTargets}
              employees={employees}
              selectedTargets={selectedTargets}
              strategy={strategy}
              searchQuery={searchQuery}
              searchRef={searchRef}
              analyses={analyses}
              summary={summary}
              expandedTargets={expandedTargets}
              locale={locale}
              t={t}
              onToggleTarget={handleToggleTarget}
              onSelectAll={handleSelectAllTargets}
              onSelectNone={handleSelectNoneTargets}
              onSelectWithoutShifts={handleSelectWithoutShifts}
              onSearchChange={setSearchQuery}
              onStrategyChange={setStrategy}
              onToggleExpand={(id) =>
                setExpandedTargets((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
            />
          )}

          {step === "result" && applyResult && (
            <StepResult
              result={applyResult}
              employees={employees}
              t={t}
            />
          )}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="border-t pt-4 mt-4">
          {step === "source" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.copyResultClose}
            </Button>
          )}

          {step === "pattern" && (
            <>
              <Button variant="outline" onClick={() => setStep("source")}>
                {t.copyBack}
              </Button>
              <Button
                disabled={!hasValidPattern}
                onClick={() => setStep("targets")}
              >
                {t.copyNext}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {step === "targets" && (
            <>
              <Button variant="outline" onClick={() => setStep("pattern")}>
                {t.copyBack}
              </Button>
              <Button
                disabled={summary.totalCreate === 0 || applying}
                onClick={handleApply}
                className="gap-1.5"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.copyApplyingButton}
                  </>
                ) : (
                  t.copyApplyButton
                    .replace("{count}", String(summary.totalCreate))
                    .replace("{targets}", String(summary.targetCount))
                )}
              </Button>
            </>
          )}

          {step === "result" && (
            <Button onClick={() => onOpenChange(false)}>
              {t.copyResultClose}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════
// Step 1: Source Selection
// ═══════════════════════════════════════════════════════

function StepSource({
  employees,
  employeeStats,
  locale,
  t,
  onSelect,
}: {
  employees: { id: string; full_name: string }[];
  employeeStats: Map<string, { hours: number; days: number }>;
  locale: string;
  t: CopyShiftsDialogProps["translations"];
  onSelect: (type: "employee" | "openingHours", employeeId?: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Opening hours source */}
      <button
        type="button"
        onClick={() => onSelect("openingHours")}
        className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{t.copyFromOpeningHours}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t.copyFromEmployee}
          </span>
        </div>
      </div>

      {/* Employee sources */}
      {employees.map((emp, empIndex) => {
        const accent = getEmployeeAccentFullByIndex(empIndex);
        const stats = employeeStats.get(emp.id);
        const hasShifts = stats && stats.hours > 0;

        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelect("employee", emp.id)}
            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring ${
              !hasShifts ? "opacity-60" : ""
            }`}
          >
            <div className={`h-3 w-3 rounded-full shrink-0 ${accent.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{emp.full_name}</p>
              {hasShifts ? (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {stats.hours}t &middot; {stats.days} {t.daysWorking}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {t.copyNoShiftsHint}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 2: Pattern Editor
// ═══════════════════════════════════════════════════════

function StepPattern({
  pattern,
  locale,
  patternHours,
  t,
  onDayToggle,
  onIntervalChange,
  onAddInterval,
  onRemoveInterval,
  onCopyMondayToRest,
}: {
  pattern: WeekPattern;
  locale: string;
  patternHours: number;
  t: CopyShiftsDialogProps["translations"];
  onDayToggle: (isoDay: number) => void;
  onIntervalChange: (isoDay: number, index: number, field: "start" | "end", value: string) => void;
  onAddInterval: (isoDay: number) => void;
  onRemoveInterval: (isoDay: number, index: number) => void;
  onCopyMondayToRest: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Day chips for quick toggle */}
      <div className="flex gap-1.5 flex-wrap">
        {ISO_DAYS.map((d) => {
          const day = pattern[d];
          const isEnabled = day?.enabled ?? false;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onDayToggle(d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {getDayLabel(d, locale)}
            </button>
          );
        })}
      </div>

      {/* Copy Monday shortcut */}
      {pattern[1]?.enabled && pattern[1]?.intervals.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopyMondayToRest}
          className="gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          {t.copyMondayToRest}
        </Button>
      )}

      {/* Day rows */}
      <div className="space-y-2">
        {ISO_DAYS.map((d) => {
          const day = pattern[d] ?? { enabled: false, intervals: [] };

          return (
            <div
              key={d}
              className={`rounded-lg border p-3 transition-colors ${
                day.enabled ? "bg-card" : "bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={day.enabled}
                  onCheckedChange={() => onDayToggle(d)}
                />
                <span className="text-sm font-medium w-10">
                  {getDayLabel(d, locale)}
                </span>
              </div>

              {day.enabled && (
                <div className="space-y-2 ml-6">
                  {day.intervals.map((iv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={iv.start}
                        onChange={(e) => onIntervalChange(d, idx, "start", e.target.value)}
                        className="h-8 w-[110px] rounded-md border bg-background px-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs text-muted-foreground">–</span>
                      <input
                        type="time"
                        value={iv.end}
                        onChange={(e) => onIntervalChange(d, idx, "end", e.target.value)}
                        className="h-8 w-[110px] rounded-md border bg-background px-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {day.intervals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveInterval(d, idx)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => onAddInterval(d)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {t.copyAddInterval}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total hours */}
      <div className="flex items-center justify-between text-sm border-t pt-3">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {t.copyTotalHours}
        </span>
        <span className="font-semibold tabular-nums">{patternHours}t</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 3: Targets + Strategy + Preview
// ═══════════════════════════════════════════════════════

function StepTargets({
  filteredTargets,
  availableTargets,
  employees,
  selectedTargets,
  strategy,
  searchQuery,
  searchRef,
  analyses,
  summary,
  expandedTargets,
  locale,
  t,
  onToggleTarget,
  onSelectAll,
  onSelectNone,
  onSelectWithoutShifts,
  onSearchChange,
  onStrategyChange,
  onToggleExpand,
}: {
  filteredTargets: { id: string; full_name: string }[];
  availableTargets: { id: string; full_name: string }[];
  employees: { id: string; full_name: string }[];
  selectedTargets: Set<string>;
  strategy: CopyStrategy;
  searchQuery: string;
  searchRef: React.RefObject<HTMLInputElement | null>;
  analyses: TargetAnalysis[];
  summary: { totalCreate: number; totalSkip: number; totalConflict: number; targetCount: number };
  expandedTargets: Set<string>;
  locale: string;
  t: CopyShiftsDialogProps["translations"];
  onToggleTarget: (id: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectWithoutShifts: () => void;
  onSearchChange: (query: string) => void;
  onStrategyChange: (s: CopyStrategy) => void;
  onToggleExpand: (id: string) => void;
}) {
  const analysisMap = useMemo(() => {
    const map = new Map<string, TargetAnalysis>();
    for (const a of analyses) map.set(a.employeeId, a);
    return map;
  }, [analyses]);

  return (
    <div className="space-y-4">
      {/* Copy strategy */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {locale === "nb" ? "Kopieringsstrategi" : "Copy strategy"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onStrategyChange("additive")}
            className={`rounded-lg border p-3 text-left transition-colors ${
              strategy === "additive"
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
          >
            <p className="text-sm font-medium">{t.copyStrategyAdditive}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.copyStrategyAdditiveDesc}
            </p>
          </button>
          <button
            type="button"
            onClick={() => onStrategyChange("replace")}
            className={`rounded-lg border p-3 text-left transition-colors ${
              strategy === "replace"
                ? "border-destructive bg-destructive/5"
                : "hover:bg-muted/50"
            }`}
          >
            <p className="text-sm font-medium">{t.copyStrategyReplace}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.copyStrategyReplaceDesc}
            </p>
          </button>
        </div>
      </div>

      {/* Search + quick filters */}
      <div className="space-y-2">
        <p className="text-sm font-medium">{t.copySelectTargets}</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.copySearchEmployee}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={selectedTargets.size === availableTargets.length ? onSelectNone : onSelectAll}
          >
            {selectedTargets.size === availableTargets.length
              ? t.copySelectNone
              : t.copySelectAll}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onSelectWithoutShifts}
          >
            {t.copySelectWithoutShifts}
          </Button>
        </div>
      </div>

      {/* Target list */}
      <div className="space-y-1 max-h-[240px] overflow-y-auto">
        {filteredTargets.map((emp) => {
          const empIndex = employees.findIndex((e) => e.id === emp.id);
          const accent = getEmployeeAccentFullByIndex(empIndex >= 0 ? empIndex : 0);
          const isSelected = selectedTargets.has(emp.id);
          const analysis = analysisMap.get(emp.id);
          const isExpanded = expandedTargets.has(emp.id);

          return (
            <div key={emp.id} className="rounded-lg border">
              <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onToggleTarget(emp.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleTarget(emp.id)}
                />
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${accent.dot}`} />
                <span className="text-sm flex-1 min-w-0 truncate">{emp.full_name}</span>

                {isSelected && analysis && (
                  <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                    {analysis.toCreate > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{analysis.toCreate}
                      </span>
                    )}
                    {analysis.toSkip > 0 && (
                      <span className="text-muted-foreground">
                        {analysis.toSkip} skip
                      </span>
                    )}
                    {analysis.conflicts > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {analysis.conflicts}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(emp.id);
                      }}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded detail view */}
              {isSelected && isExpanded && analysis && (
                <div className="border-t px-3 py-2 bg-muted/30 text-xs space-y-1">
                  {analysis.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-muted-foreground">
                        {getDayLabel(d.weekday, locale)}
                      </span>
                      <span className="tabular-nums">
                        {d.intervals.map((iv) => `${iv.start}–${iv.end}`).join(", ")}
                      </span>
                      {d.action === "create" && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-auto">
                          {t.copyPreviewCreate}
                        </span>
                      )}
                      {d.action === "skip_dupe" && (
                        <span className="text-muted-foreground ml-auto">
                          {t.copyPreviewSkip}
                        </span>
                      )}
                      {d.action === "skip_overlap" && (
                        <span className="text-amber-600 dark:text-amber-400 ml-auto">
                          {t.copyPreviewConflict}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedTargets.size > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="font-medium tabular-nums">
              {t.copyPreviewCreate}: {summary.totalCreate}
            </span>
          </div>
          {summary.totalSkip > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="ml-6 tabular-nums">
                {t.copyPreviewSkip}: {summary.totalSkip}
              </span>
            </div>
          )}
          {summary.totalConflict > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4 ml-0.5" />
              <span className="tabular-nums">
                {t.copyPreviewConflict}: {summary.totalConflict}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Result Screen
// ═══════════════════════════════════════════════════════

function StepResult({
  result,
  employees,
  t,
}: {
  result: ApplyResult;
  employees: { id: string; full_name: string }[];
  t: CopyShiftsDialogProps["translations"];
}) {
  const targetsWithCreated = result.perTarget.filter((r) => r.created > 0);

  return (
    <div className="space-y-4 py-2">
      {/* Success summary */}
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-sm font-medium">
          {t.copyResultToast
            .replace("{count}", String(result.created))
            .replace("{targets}", String(targetsWithCreated.length))}
        </p>
        {result.skipped > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {t.copyResultSkipped.replace("{count}", String(result.skipped))}
          </p>
        )}
      </div>

      {/* Per-target breakdown */}
      {result.perTarget.length > 0 && (
        <div className="space-y-1">
          {result.perTarget.map((r) => {
            const emp = employees.find((e) => e.id === r.employeeId);
            const empIndex = employees.findIndex((e) => e.id === r.employeeId);
            const accent = getEmployeeAccentFullByIndex(empIndex >= 0 ? empIndex : 0);

            return (
              <div
                key={r.employeeId}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              >
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${accent.dot}`} />
                <span className="flex-1 min-w-0 truncate">
                  {emp?.full_name ?? r.employeeId}
                </span>
                {r.error ? (
                  <span className="text-xs text-destructive">{r.error}</span>
                ) : (
                  <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{r.created}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive space-y-1">
          {result.errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
