import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight, AlertTriangle, Check } from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import type { CopyStrategy, TargetAnalysis } from "@/lib/hooks/shifts/useCopyShifts";
import { getDayLabel, type CopyShiftsTranslations } from "./types";

interface StepTargetsProps {
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
  t: CopyShiftsTranslations;
  onToggleTarget: (id: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectWithoutShifts: () => void;
  onSearchChange: (query: string) => void;
  onStrategyChange: (s: CopyStrategy) => void;
  onToggleExpand: (id: string) => void;
}

export function StepTargets({
  filteredTargets, availableTargets, employees, selectedTargets,
  strategy, searchQuery, searchRef, analyses, summary, expandedTargets,
  locale, t,
  onToggleTarget, onSelectAll, onSelectNone, onSelectWithoutShifts,
  onSearchChange, onStrategyChange, onToggleExpand,
}: StepTargetsProps) {
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
              strategy === "additive" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <p className="text-sm font-medium">{t.copyStrategyAdditive}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.copyStrategyAdditiveDesc}</p>
          </button>
          <button
            type="button"
            onClick={() => onStrategyChange("replace")}
            className={`rounded-lg border p-3 text-left transition-colors ${
              strategy === "replace" ? "border-destructive bg-destructive/5" : "hover:bg-muted/50"
            }`}
          >
            <p className="text-sm font-medium">{t.copyStrategyReplace}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.copyStrategyReplaceDesc}</p>
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
            type="button" variant="outline" size="sm" className="h-7 text-xs"
            onClick={selectedTargets.size === availableTargets.length ? onSelectNone : onSelectAll}
          >
            {selectedTargets.size === availableTargets.length ? t.copySelectNone : t.copySelectAll}
          </Button>
          <Button
            type="button" variant="outline" size="sm" className="h-7 text-xs"
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
                <Checkbox checked={isSelected} onCheckedChange={() => onToggleTarget(emp.id)} />
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${accent.dot}`} />
                <span className="text-sm flex-1 min-w-0 truncate">{emp.full_name}</span>

                {isSelected && analysis && (
                  <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                    {analysis.toCreate > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">+{analysis.toCreate}</span>
                    )}
                    {analysis.toSkip > 0 && (
                      <span className="text-muted-foreground">{analysis.toSkip} skip</span>
                    )}
                    {analysis.conflicts > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {analysis.conflicts}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleExpand(emp.id); }}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {isSelected && isExpanded && analysis && (
                <div className="border-t px-3 py-2 bg-muted/30 text-xs space-y-1">
                  {analysis.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-muted-foreground">{getDayLabel(d.weekday, locale)}</span>
                      <span className="tabular-nums">
                        {d.intervals.map((iv) => `${iv.start}–${iv.end}`).join(", ")}
                      </span>
                      {d.action === "create" && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-auto">{t.copyPreviewCreate}</span>
                      )}
                      {d.action === "skip_dupe" && (
                        <span className="text-muted-foreground ml-auto">{t.copyPreviewSkip}</span>
                      )}
                      {d.action === "skip_overlap" && (
                        <span className="text-amber-600 dark:text-amber-400 ml-auto">{t.copyPreviewConflict}</span>
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
            <span className="font-medium tabular-nums">{t.copyPreviewCreate}: {summary.totalCreate}</span>
          </div>
          {summary.totalSkip > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="ml-6 tabular-nums">{t.copyPreviewSkip}: {summary.totalSkip}</span>
            </div>
          )}
          {summary.totalConflict > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4 ml-0.5" />
              <span className="tabular-nums">{t.copyPreviewConflict}: {summary.totalConflict}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
