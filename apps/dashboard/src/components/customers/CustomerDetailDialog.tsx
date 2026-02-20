"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/form/Field";
import { SetupBadge } from "@/components/setup-badge";
import { getCustomerIssues } from "@/lib/setup/health";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateCustomer } from "@/lib/repositories/customers";
import { Edit, Copy, CheckCheck } from "lucide-react";
import type { DialogMode } from "@/lib/hooks/useEntityDialogState";
import type { Customer } from "@/lib/types";

export interface CustomerDetailDialogTranslations {
  editTitle: string; detailDescription: string; editDescription: string;
  emailLabel: string; phoneLabel: string; nameLabel: string;
  notesLabel: string; noNotes: string; gdprConsentLabel: string;
  consentOk: string; consentMissing: string; bookingHistory: string;
  noBookings: string; sendMessageCopyPhone: string; copied: string;
  close: string; edit: string; cancel: string; save: string; saving: string;
  gdprLabel: string;
}

interface CustomerDetailDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  onSwitchToEdit: () => void;
  onSwitchToView: () => void;
  customers: Customer[];
  onCustomerUpdated: () => Promise<void>;
  translations: CustomerDetailDialogTranslations;
}

export function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
  mode,
  onSwitchToEdit,
  onSwitchToView,
  customers,
  onCustomerUpdated,
  translations: t,
}: CustomerDetailDialogProps) {
  const { salon } = useCurrentSalon();
  const customer = customers.find((c) => c.id === customerId) ?? null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (customer && mode === "edit") {
      setFullName(customer.full_name);
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
      setNotes(customer.notes ?? "");
      setGdprConsent(customer.gdpr_consent);
      setError(null);
    }
  }, [customer, mode]);

  if (!customer) return null;

  const issues = getCustomerIssues(customer);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !customer) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await updateCustomer(
      salon.id,
      customer.id,
      {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        gdpr_consent: gdprConsent,
      },
    );

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    await onCustomerUpdated();
    setSaving(false);
    onSwitchToView();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? t.editTitle : customer.full_name}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? t.editDescription : t.detailDescription}
          </DialogDescription>
        </DialogHeader>

        {mode === "view" ? (
          <div className="space-y-4">
            <SetupBadge issues={issues} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">{t.emailLabel}</p>
                {customer.email ? (
                  <div className="flex items-center gap-1">
                    <p className="text-sm">{customer.email}</p>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(customer.email!, "email")}
                    >
                      {copiedField === "email" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.phoneLabel}</p>
                {customer.phone ? (
                  <div className="flex items-center gap-1">
                    <p className="text-sm">{customer.phone}</p>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(customer.phone!, "phone")}
                    >
                      {copiedField === "phone" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">{t.notesLabel}</p>
              <p className="text-sm">{customer.notes || t.noNotes}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.gdprConsentLabel}</p>
              {customer.gdpr_consent ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {t.consentOk}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
                  {t.consentMissing}
                </Badge>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.bookingHistory}</p>
              <p className="text-sm text-muted-foreground">{t.noBookings}</p>
            </div>

            {customer.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(customer.phone!, "phone-msg")}
              >
                {copiedField === "phone-msg" ? t.copied : t.sendMessageCopyPhone}
              </Button>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.close}
              </Button>
              <Button onClick={onSwitchToEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t.nameLabel} htmlFor="cust_name" required>
              <input
                id="cust_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.emailLabel} htmlFor="cust_email">
                <input
                  id="cust_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
              <Field label={t.phoneLabel} htmlFor="cust_phone">
                <input
                  id="cust_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
            </div>

            <Field label={t.notesLabel} htmlFor="cust_notes">
              <textarea
                id="cust_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>

            <div className="flex items-center gap-2">
              <input
                id="cust_gdpr"
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="cust_gdpr" className="text-sm">{t.gdprLabel}</label>
            </div>

            {error && (
              <p className="text-sm text-destructive" aria-live="polite">{error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onSwitchToView}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.saving : t.save}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
