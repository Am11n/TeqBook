"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/form/Field";
import { useCurrentSalon } from "@/components/salon-provider";
import { createCustomer } from "@/lib/repositories/customers";
import type { Customer } from "@/lib/types";

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customer: Customer) => void;
  translations: {
    dialogTitle: string;
    dialogDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    gdprLabel: string;
    cancel: string;
    addButton: string;
    saving: string;
  };
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCustomerCreated,
  translations,
}: CreateCustomerDialogProps) {
  const { salon } = useCurrentSalon();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setGdprConsent(false);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id) return;
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await createCustomer({
      salon_id: salon.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
      gdpr_consent: gdprConsent,
    });

    if (insertError || !data) {
      setError(insertError ?? "Could not add customer.");
      setSaving(false);
      return;
    }

    onCustomerCreated(data);
    resetForm();
    setSaving(false);
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.dialogTitle}</DialogTitle>
          <DialogDescription>{translations.dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={translations.nameLabel} htmlFor="create_customer_name" required>
            <input
              id="create_customer_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={translations.namePlaceholder}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={translations.emailLabel} htmlFor="create_customer_email">
              <input
                id="create_customer_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.emailPlaceholder}
              />
            </Field>
            <Field label={translations.phoneLabel} htmlFor="create_customer_phone">
              <input
                id="create_customer_phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.phonePlaceholder}
              />
            </Field>
          </div>

          <Field label={translations.notesLabel} htmlFor="create_customer_notes">
            <Textarea
              id="create_customer_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm"
              placeholder={translations.notesPlaceholder}
            />
          </Field>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-[2px] h-3.5 w-3.5 rounded border bg-background"
            />
            <span>{translations.gdprLabel}</span>
          </label>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={saving || !salon?.id}>
              {saving ? translations.saving : translations.addButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
