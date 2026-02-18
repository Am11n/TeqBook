"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogSelect } from "@/components/ui/dialog-select";
import { createPersonallisteEntry } from "@/lib/services/personalliste-service";
import type { Employee } from "@/lib/types";

interface RegisterPersonallisteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  employees: Employee[];
  defaultDate: string;
  onSuccess: () => void;
  translations: {
    registerDialogTitle: string;
    registerDialogDescription: string;
    colDate: string;
    colEmployee: string;
    employeePlaceholder: string;
    colCheckIn: string;
    colCheckOut: string;
    cancel: string;
    save: string;
    saving: string;
  };
}

function toDateTimeLocal(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  return `${dateStr}T${timeStr}:00`;
}

function toISO(dateStr: string, timeStr: string): string {
  const local = toDateTimeLocal(dateStr, timeStr);
  if (!local) return "";
  return new Date(local).toISOString();
}

export function RegisterPersonallisteDialog({
  open,
  onOpenChange,
  salonId,
  employees,
  defaultDate,
  onSuccess,
  translations: t,
}: RegisterPersonallisteDialogProps) {
  const [date, setDate] = useState(defaultDate);
  const [employeeId, setEmployeeId] = useState("");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setSaving(true);
    setError(null);
    const check_in = toISO(date, checkInTime);
    const check_out = checkOutTime ? toISO(date, checkOutTime) : undefined;
    const { data, error: err } = await createPersonallisteEntry({
      salon_id: salonId,
      employee_id: employeeId,
      date,
      check_in,
      check_out: check_out ?? null,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    if (data) {
      onSuccess();
      onOpenChange(false);
      setEmployeeId("");
      setCheckInTime("09:00");
      setCheckOutTime("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.registerDialogTitle}</DialogTitle>
          <DialogDescription>{t.registerDialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Field label={t.colDate} htmlFor="reg-date">
              <Input
                id="reg-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>
            <div className="space-y-2">
              <Label htmlFor="reg-employee">{t.colEmployee}</Label>
              <DialogSelect
                value={employeeId}
                onChange={setEmployeeId}
                required
                placeholder={t.employeePlaceholder}
                options={employees.map((emp) => ({ value: emp.id, label: emp.full_name }))}
              />
            </div>
            <Field label={t.colCheckIn} htmlFor="reg-checkIn">
              <Input
                id="reg-checkIn"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                required
              />
            </Field>
            <Field label={t.colCheckOut} htmlFor="reg-checkOut">
              <Input
                id="reg-checkOut"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
