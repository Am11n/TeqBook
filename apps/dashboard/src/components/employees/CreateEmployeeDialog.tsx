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
import { DialogSelect, DialogMultiSelect } from "@/components/ui/dialog-select";
import { LANGUAGE_OPTIONS } from "@/components/employees/language-options";
import { useCreateEmployee } from "@/lib/hooks/employees/useCreateEmployee";
import type { Service } from "@/lib/types";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onEmployeeCreated: () => Promise<void>;
  translations: {
    dialogTitle: string;
    dialogDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    preferredLanguageLabel: string;
    servicesLabel: string;
    servicesPlaceholder: string;
    cancel: string;
    addButton: string;
  };
}

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  services,
  onEmployeeCreated,
  translations,
}: CreateEmployeeDialogProps) {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    role,
    setRole,
    preferredLanguage,
    setPreferredLanguage,
    selectedServices,
    setSelectedServices,
    saving,
    error,
    handleSubmit,
  } = useCreateEmployee({
    services,
    onEmployeeCreated: async () => {
      await onEmployeeCreated();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.dialogTitle}</DialogTitle>
          <DialogDescription>{translations.dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={translations.nameLabel} htmlFor="create_full_name" required>
            <input
              id="create_full_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={translations.namePlaceholder}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={translations.emailLabel} htmlFor="create_email">
              <input
                id="create_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.emailPlaceholder}
              />
            </Field>
            <Field label={translations.phoneLabel} htmlFor="create_phone">
              <input
                id="create_phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.phonePlaceholder}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={translations.roleLabel} htmlFor="create_role">
              <DialogSelect
                value={role}
                onChange={setRole}
                placeholder={translations.rolePlaceholder}
                options={[
                  { value: "owner", label: "Owner" },
                  { value: "manager", label: "Manager" },
                  { value: "staff", label: "Staff" },
                ]}
              />
            </Field>
            <Field label={translations.preferredLanguageLabel} htmlFor="create_preferred_language">
              <DialogSelect
                value={preferredLanguage}
                onChange={setPreferredLanguage}
                options={LANGUAGE_OPTIONS}
              />
            </Field>
          </div>

          <Field
            label={translations.servicesLabel}
            htmlFor="create_services"
            description={translations.servicesPlaceholder}
          >
            <DialogMultiSelect
              value={selectedServices}
              onChange={setSelectedServices}
              options={services.map((service) => ({ value: service.id, label: service.name }))}
            />
          </Field>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "…" : translations.addButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
