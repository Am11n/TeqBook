import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useCopyShifts,
  buildPatternFromShifts,
  buildPatternFromOpeningHours,
  calcPatternHours,
  type WeekPattern,
  type CopyStrategy,
  type ApplyResult,
} from "@/lib/hooks/shifts/useCopyShifts";
import type { Shift } from "@/lib/types";
import type { Step, CopyShiftsTranslations } from "./types";

interface UseCopyShiftsWizardOptions {
  open: boolean;
  employees: { id: string; full_name: string }[];
  shifts: Shift[];
  getOpeningHoursForDay: (weekday: number) => { open_time: string; close_time: string } | null;
  loadShifts: () => Promise<void>;
  translations: CopyShiftsTranslations;
}

export function useCopyShiftsWizard({
  open,
  employees,
  shifts,
  getOpeningHoursForDay,
  loadShifts,
  translations: t,
}: UseCopyShiftsWizardOptions) {
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

  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset when dialog opens/closes
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

  // Autofocus per step
  useEffect(() => {
    if (step === "targets") {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [step]);

  // ── Derived data ──────────────────────────────────

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

  const targetIds = useMemo(() => Array.from(selectedTargets), [selectedTargets]);
  const analyses = useMemo(
    () => analyseAll(targetIds, pattern, strategy),
    [analyseAll, targetIds, pattern, strategy],
  );
  const summary = useMemo(() => getSummary(analyses), [getSummary, analyses]);

  const availableTargets = useMemo(
    () => employees.filter((e) => !(sourceType === "employee" && e.id === sourceEmployeeId)),
    [employees, sourceType, sourceEmployeeId],
  );

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return availableTargets;
    const q = searchQuery.toLowerCase();
    return availableTargets.filter((e) => e.full_name.toLowerCase().includes(q));
  }, [availableTargets, searchQuery]);

  const patternHours = useMemo(() => calcPatternHours(pattern), [pattern]);
  const hasValidPattern = useMemo(
    () => Object.values(pattern).some((d) => d.enabled && d.intervals.length > 0),
    [pattern],
  );
  const stepIndex = step === "source" ? 1 : step === "pattern" ? 2 : step === "targets" ? 3 : 3;

  // ── Handlers ──────────────────────────────────────

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
    [shifts, getOpeningHoursForDay],
  );

  const handlePatternDayToggle = useCallback((isoDay: number) => {
    setPattern((prev) => ({
      ...prev,
      [isoDay]: { ...prev[isoDay], enabled: !prev[isoDay]?.enabled },
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
    [],
  );

  const handleAddInterval = useCallback((isoDay: number) => {
    setPattern((prev) => {
      const day = prev[isoDay] ?? { enabled: true, intervals: [] };
      return {
        ...prev,
        [isoDay]: { ...day, enabled: true, intervals: [...day.intervals, { start: "09:00", end: "17:00" }] },
      };
    });
  }, []);

  const handleRemoveInterval = useCallback((isoDay: number, index: number) => {
    setPattern((prev) => {
      const day = prev[isoDay];
      if (!day) return prev;
      const intervals = day.intervals.filter((_, i) => i !== index);
      return { ...prev, [isoDay]: { ...day, intervals, enabled: intervals.length > 0 } };
    });
  }, []);

  const handleCopyMondayToRest = useCallback(() => {
    setPattern((prev) => {
      const monday = prev[1];
      if (!monday || monday.intervals.length === 0) return prev;
      const updated = { ...prev };
      for (let d = 2; d <= 7; d++) {
        if (updated[d]?.enabled) {
          updated[d] = { enabled: true, intervals: monday.intervals.map((iv) => ({ ...iv })) };
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
    const ids = availableTargets
      .filter((e) => { const s = employeeStats.get(e.id); return !s || s.hours === 0; })
      .map((e) => e.id);
    setSelectedTargets(new Set(ids));
  }, [availableTargets, employeeStats]);

  const handleApply = useCallback(async () => {
    if (strategy === "replace") {
      const totalExisting = targetIds.reduce(
        (sum, id) => sum + shifts.filter((s) => s.employee_id === id).length, 0,
      );
      if (totalExisting > 0) {
        const names = targetIds.map((id) => employees.find((e) => e.id === id)?.full_name ?? id).join(", ");
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

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedTargets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && step === "targets") {
        e.preventDefault();
        if (summary.totalCreate > 0 && !applying) handleApply();
        return;
      }
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        if (step === "pattern" && hasValidPattern) setStep("targets");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, step, hasValidPattern, summary.totalCreate, applying, handleApply]);

  return {
    step, setStep, pattern, selectedTargets, strategy, setStrategy,
    searchQuery, setSearchQuery, expandedTargets, applyResult, applying,
    searchRef, dialogRef,
    employeeStats, analyses, summary, availableTargets, filteredTargets,
    patternHours, hasValidPattern, stepIndex,
    handleSelectSource, handlePatternDayToggle, handlePatternIntervalChange,
    handleAddInterval, handleRemoveInterval, handleCopyMondayToRest,
    handleToggleTarget, handleSelectAllTargets, handleSelectNoneTargets,
    handleSelectWithoutShifts, handleApply, handleToggleExpand,
  };
}
