"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, CalendarClock } from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import type { Shift } from "@/lib/types";
import { readCollapsedIds, writeCollapsedIds, computeShiftData } from "./shifts-list/helpers";
import { ShiftRow } from "./shifts-list/ShiftRow";

interface ShiftsListViewProps {
  shifts: Shift[];
  employees: Array<{ id: string; full_name: string }>;
  locale: string;
  translations: {
    emptyTitle: string;
    emptyDescription: string;
    mobileUnknownEmployee: string;
    daysWorking: string;
    noShiftsForEmployee: string;
    addShiftCta: string;
    overlap: string;
    invalidTime: string;
    setupShiftsTitle?: string;
    setupShiftsDescription?: string;
    collapseAll?: string;
    expandAll?: string;
  };
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onQuickCreate: (employeeId: string) => void;
}

export function ShiftsListView({ shifts, employees, locale, translations: t, onEditShift, onDeleteShift, onQuickCreate }: ShiftsListViewProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => readCollapsedIds());

  useEffect(() => { writeCollapsedIds(collapsedIds); }, [collapsedIds]);

  const toggleCollapse = useCallback((empId: string) => {
    setCollapsedIds((prev) => { const next = new Set(prev); if (next.has(empId)) next.delete(empId); else next.add(empId); return next; });
  }, []);

  const collapseAll = useCallback(() => { setCollapsedIds(new Set(employees.map((e) => e.id))); }, [employees]);
  const expandAll = useCallback(() => { setCollapsedIds(new Set()); }, []);
  const allCollapsed = employees.length > 0 && collapsedIds.size >= employees.length;

  const { grouped, stats, overlapIds, invalidIds } = useMemo(
    () => computeShiftData(shifts, employees),
    [shifts, employees]
  );

  if (employees.length === 0) {
    return <div className="mt-4"><EmptyState title={t.emptyTitle} description={t.emptyDescription} /></div>;
  }

  if (shifts.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 px-8 py-12 text-center">
        <CalendarClock className="h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-base font-semibold text-foreground">{t.setupShiftsTitle ?? "Set up working hours"}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{t.setupShiftsDescription ?? "Define working hours for your employees so the system can calculate available booking slots."}</p>
        <Button type="button" size="sm" className="mt-5 gap-1.5" onClick={() => onQuickCreate(employees[0]!.id)}>
          <Plus className="h-4 w-4" /> {t.addShiftCta}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {employees.length > 1 && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={allCollapsed ? expandAll : collapseAll}>
            {allCollapsed ? (<><ChevronsUpDown className="h-3.5 w-3.5" />{t.expandAll ?? "Expand all"}</>) : (<><ChevronsDownUp className="h-3.5 w-3.5" />{t.collapseAll ?? "Collapse all"}</>)}
          </Button>
        </div>
      )}

      {employees.map((emp, empIndex) => {
        const accent = getEmployeeAccentFullByIndex(empIndex);
        const empShifts = grouped.get(emp.id) ?? [];
        const empStats = stats.get(emp.id) ?? { totalHours: 0, workingDays: 0 };
        const isCollapsed = collapsedIds.has(emp.id);

        return (
          <div key={emp.id} className={`rounded-lg border border-l-[3px] ${accent.borderLeft} ${accent.bg} overflow-hidden`}>
            <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/30" onClick={() => toggleCollapse(emp.id)} aria-expanded={!isCollapsed}>
              <div className="flex items-center gap-2.5">
                {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <span className="text-sm font-medium text-foreground">{emp.full_name}</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{empStats.totalHours}t &middot; {empStats.workingDays} {t.daysWorking}</span>
            </button>
            {!isCollapsed && (
              <>
                {empShifts.length === 0 ? (
                  <div className="mx-4 mb-4 flex items-center justify-between rounded-md border border-dashed border-muted-foreground/30 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{t.noShiftsForEmployee}</span>
                    <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => onQuickCreate(emp.id)}>
                      <Plus className="h-3.5 w-3.5" /> {t.addShiftCta}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {empShifts.map((shift) => (
                      <ShiftRow key={shift.id} shift={shift} locale={locale} hasOverlap={overlapIds.has(shift.id)} hasInvalid={invalidIds.has(shift.id)} overlapLabel={t.overlap} invalidLabel={t.invalidTime} onEdit={onEditShift} onDelete={onDeleteShift} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
