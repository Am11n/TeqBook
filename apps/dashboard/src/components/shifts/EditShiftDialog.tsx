"use client";

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
import { getWeekdays } from "@/lib/utils/shifts/shifts-utils";

interface EditShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingShift: {
    employee_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
  } | null;
  employees: Array<{ id: string; full_name: string }>;
  locale: string;
  saving: boolean;
  error: string | null;
  translations: {
    employeeLabel: string;
    employeePlaceholder: string;
    weekdayLabel: string;
    startLabel: string;
    endLabel: string;
  };
  editEmployeeId: string;
  setEditEmployeeId: (id: string) => void;
  editWeekday: number;
  setEditWeekday: (weekday: number) => void;
  editStartTime: string;
  setEditStartTime: (time: string) => void;
  editEndTime: string;
  setEditEndTime: (time: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditShiftDialog({
  open,
  onOpenChange,
  editingShift,
  employees,
  locale,
  saving,
  error,
  translations,
  editEmployeeId,
  setEditEmployeeId,
  editWeekday,
  setEditWeekday,
  editStartTime,
  setEditStartTime,
  editEndTime,
  setEditEndTime,
  onSubmit,
}: EditShiftDialogProps) {
  const weekdays = getWeekdays(locale);

  if (!editingShift) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>Update shift details</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <Field label={translations.employeeLabel} htmlFor="edit_employee" required>
            <DialogSelect
              value={editEmployeeId}
              onChange={setEditEmployeeId}
              required
              placeholder={translations.employeePlaceholder}
              options={employees.map((employee) => ({ value: employee.id, label: employee.full_name }))}
            />
          </Field>

          <div className="grid gap-6 md:grid-cols-3">
            <Field label={translations.weekdayLabel} htmlFor="edit_weekday" required>
              <DialogSelect
                value={String(editWeekday)}
                onChange={(v) => setEditWeekday(Number(v))}
                required
                options={weekdays.map((w) => ({ value: String(w.value), label: w.label }))}
              />
            </Field>
            <Field label={translations.startLabel} htmlFor="edit_start_time" required>
              <input
                id="edit_start_time"
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              />
            </Field>
            <Field label={translations.endLabel} htmlFor="edit_end_time" required>
              <input
                id="edit_end_time"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
