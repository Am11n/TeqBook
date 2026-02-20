"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ChevronRight, Loader2 } from "lucide-react";
import type { Shift } from "@/lib/types";
import type { CopyShiftsTranslations } from "./copy-shifts/types";
import { useCopyShiftsWizard } from "./copy-shifts/useCopyShiftsWizard";
import { StepSource } from "./copy-shifts/StepSource";
import { StepPattern } from "./copy-shifts/StepPattern";
import { StepTargets } from "./copy-shifts/StepTargets";
import { StepResult } from "./copy-shifts/StepResult";

interface CopyShiftsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: { id: string; full_name: string }[];
  shifts: Shift[];
  locale: string;
  getOpeningHoursForDay: (weekday: number) => { open_time: string; close_time: string } | null;
  loadShifts: () => Promise<void>;
  translations: CopyShiftsTranslations;
}

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
  const w = useCopyShiftsWizard({
    open, employees, shifts, getOpeningHoursForDay, loadShifts, translations: t,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={w.dialogRef} className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            {t.copyShifts}
            {w.step !== "result" && (
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {w.stepIndex}/3
              </span>
            )}
          </DialogTitle>
          {w.step !== "result" && (
            <DialogDescription>
              {w.step === "source" && t.copyStepSource}
              {w.step === "pattern" && t.copyStepPattern}
              {w.step === "targets" && t.copyStepTargets}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {w.step === "source" && (
            <StepSource
              employees={employees}
              employeeStats={w.employeeStats}
              locale={locale}
              t={t}
              onSelect={w.handleSelectSource}
            />
          )}

          {w.step === "pattern" && (
            <StepPattern
              pattern={w.pattern}
              locale={locale}
              patternHours={w.patternHours}
              t={t}
              onDayToggle={w.handlePatternDayToggle}
              onIntervalChange={w.handlePatternIntervalChange}
              onAddInterval={w.handleAddInterval}
              onRemoveInterval={w.handleRemoveInterval}
              onCopyMondayToRest={w.handleCopyMondayToRest}
            />
          )}

          {w.step === "targets" && (
            <StepTargets
              filteredTargets={w.filteredTargets}
              availableTargets={w.availableTargets}
              employees={employees}
              selectedTargets={w.selectedTargets}
              strategy={w.strategy}
              searchQuery={w.searchQuery}
              searchRef={w.searchRef}
              analyses={w.analyses}
              summary={w.summary}
              expandedTargets={w.expandedTargets}
              locale={locale}
              t={t}
              onToggleTarget={w.handleToggleTarget}
              onSelectAll={w.handleSelectAllTargets}
              onSelectNone={w.handleSelectNoneTargets}
              onSelectWithoutShifts={w.handleSelectWithoutShifts}
              onSearchChange={w.setSearchQuery}
              onStrategyChange={w.setStrategy}
              onToggleExpand={w.handleToggleExpand}
            />
          )}

          {w.step === "result" && w.applyResult && (
            <StepResult result={w.applyResult} employees={employees} t={t} />
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          {w.step === "source" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.copyResultClose}
            </Button>
          )}

          {w.step === "pattern" && (
            <>
              <Button variant="outline" onClick={() => w.setStep("source")}>
                {t.copyBack}
              </Button>
              <Button disabled={!w.hasValidPattern} onClick={() => w.setStep("targets")}>
                {t.copyNext}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}

          {w.step === "targets" && (
            <>
              <Button variant="outline" onClick={() => w.setStep("pattern")}>
                {t.copyBack}
              </Button>
              <Button
                disabled={w.summary.totalCreate === 0 || w.applying}
                onClick={w.handleApply}
                className="gap-1.5"
              >
                {w.applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.copyApplyingButton}
                  </>
                ) : (
                  t.copyApplyButton
                    .replace("{count}", String(w.summary.totalCreate))
                    .replace("{targets}", String(w.summary.targetCount))
                )}
              </Button>
            </>
          )}

          {w.step === "result" && (
            <Button onClick={() => onOpenChange(false)}>
              {t.copyResultClose}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
