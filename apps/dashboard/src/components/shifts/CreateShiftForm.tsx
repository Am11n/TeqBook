"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form/Field";
import { DialogSelect } from "@/components/ui/dialog-select";
import { useCreateShift } from "@/lib/hooks/shifts/useCreateShift";
import { getWeekdays } from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface CreateShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Array<{ id: string; full_name: string }>;
  shifts: Shift[];
  locale: string;
  translations: {
    newShift: string;
    employeeLabel: string;
    employeePlaceholder: string;
    weekdayLabel: string;
    startLabel: string;
    endLabel: string;
    addButton: string;
    saving: string;
    needEmployeeHint: string;
    addError: string;
  };
  onShiftCreated: (shift: Shift) => void;
  /** Pre-select this employee when dialog opens (from quick-create CTA) */
  defaultEmployeeId?: string;
  /** Smart default start time from salon opening hours */
  defaultStartTime?: string;
  /** Smart default end time from salon opening hours */
  defaultEndTime?: string;
}

export function CreateShiftForm({
  open,
  onOpenChange,
  employees,
  shifts,
  locale,
  translations,
  onShiftCreated,
  defaultEmployeeId,
  defaultStartTime,
  defaultEndTime,
}: CreateShiftFormProps) {
  const {
    employeeId,
    setEmployeeId,
    weekday,
    setWeekday,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    saving,
    error,
    setError,
    handleSubmit,
    prefill,
  } = useCreateShift({
    shifts,
    onShiftCreated: (shift) => {
      onShiftCreated(shift);
      onOpenChange(false);
    },
    translations: {
      addError: translations.addError,
    },
    initialStartTime: defaultStartTime,
    initialEndTime: defaultEndTime,
  });

  // When the dialog opens with a pre-selected employee, apply it
  useEffect(() => {
    if (open && defaultEmployeeId) {
      prefill(defaultEmployeeId);
    }
  }, [open, defaultEmployeeId, prefill]);

  const weekdays = getWeekdays(locale);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.newShift}</DialogTitle>
          <DialogDescription>
            {translations.needEmployeeHint}
          </DialogDescription>
        </DialogHeader>

        <form
          id="shift-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Field label={translations.employeeLabel} htmlFor="employee">
            <DialogSelect
              value={employeeId}
              onChange={setEmployeeId}
              placeholder={translations.employeePlaceholder}
              options={employees.map((employee) => ({ value: employee.id, label: employee.full_name }))}
            />
          </Field>

          <Field label={translations.weekdayLabel} htmlFor="weekday">
            <DialogSelect
              value={String(weekday)}
              onChange={(v) => setWeekday(Number(v))}
              options={weekdays.map((w) => ({ value: String(w.value), label: w.label }))}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={translations.startLabel} htmlFor="start_time">
              <input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>
            <Field label={translations.endLabel} htmlFor="end_time">
              <input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button
            type="submit"
            form="shift-form"
            disabled={saving || !employees.length}
          >
            {saving ? translations.saving : translations.addButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

