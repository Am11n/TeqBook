"use client";

import { useState, useEffect } from "react";
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
import { updatePersonallisteEntryForSalon } from "@/lib/services/personalliste-service";
import { supabase } from "@/lib/supabase-client";
import type { PersonallisteEntry } from "@/lib/types/domain";

function toTimeOnly(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toTimeString().slice(0, 5);
  } catch {
    return "09:00";
  }
}

function toISO(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

interface EditPersonallisteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  entry: PersonallisteEntry | null;
  onSuccess: () => void;
  translations: {
    editDialogTitle: string;
    editDialogDescription: string;
    colCheckIn: string;
    colCheckOut: string;
    cancel: string;
    save: string;
    saving: string;
  };
}

export function EditPersonallisteDialog({
  open,
  onOpenChange,
  salonId,
  entry,
  onSuccess,
  translations: t,
}: EditPersonallisteDialogProps) {
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setCheckInTime(toTimeOnly(entry.check_in));
      setCheckOutTime(entry.check_out ? toTimeOnly(entry.check_out) : "");
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      return;
    }
    setSaving(true);
    setError(null);
    const check_in = toISO(entry.date, checkInTime);
    const check_out = checkOutTime ? toISO(entry.date, checkOutTime) : null;
    const { data, error: err } = await updatePersonallisteEntryForSalon(
      salonId,
      entry.id,
      { check_in, check_out },
      user.id
    );
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    if (data) {
      onSuccess();
      onOpenChange(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.editDialogTitle}</DialogTitle>
          <DialogDescription>
            {t.editDialogDescription} {entry.employees?.full_name ?? ""} – {entry.date}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Field label={t.colCheckIn} htmlFor="edit-checkIn">
              <Input
                id="edit-checkIn"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                required
              />
            </Field>
            <Field label={t.colCheckOut} htmlFor="edit-checkOut">
              <Input
                id="edit-checkOut"
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
