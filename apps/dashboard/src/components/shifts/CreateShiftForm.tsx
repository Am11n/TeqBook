"use client";

import { Field } from "@/components/form/Field";
import { useCreateShift } from "@/lib/hooks/shifts/useCreateShift";
import { getWeekdays } from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface CreateShiftFormProps {
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
}

export function CreateShiftForm({
  employees,
  shifts,
  locale,
  translations,
  onShiftCreated,
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
  } = useCreateShift({
    shifts,
    onShiftCreated,
    translations: {
      addError: translations.addError,
    },
  });

  const weekdays = getWeekdays(locale);

  return (
    <form
      id="shift-form"
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-4 shadow-sm"
    >
      <h2 className="text-sm font-medium">{translations.newShift}</h2>

      <Field label={translations.employeeLabel} htmlFor="employee">
        <select
          id="employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
        >
          <option value="">{translations.employeePlaceholder}</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label={translations.weekdayLabel} htmlFor="weekday">
          <select
            id="weekday"
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          >
            {weekdays.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </Field>
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

      <button
        type="submit"
        disabled={saving || !employees.length}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? translations.saving : translations.addButton}
      </button>

      {!employees.length && (
        <p className="mt-2 text-xs text-muted-foreground">
          {translations.needEmployeeHint}
        </p>
      )}
    </form>
  );
}

