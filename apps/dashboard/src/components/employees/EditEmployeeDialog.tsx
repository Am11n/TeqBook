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
import { useEditEmployee } from "@/lib/hooks/employees/useEditEmployee";
import type { Employee, Service } from "@/lib/types";

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  employeeServices: Service[];
  allServices: Service[];
  onEmployeeUpdated: () => Promise<void>;
  translations: {
    editTitle: string;
    editDescription: string;
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
    save: string;
    saving: string;
  };
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  employeeServices,
  allServices,
  onEmployeeUpdated,
  translations,
}: EditEmployeeDialogProps) {
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
  } = useEditEmployee({
    employee,
    employeeServices,
    onEmployeeUpdated,
    onClose: () => onOpenChange(false),
  });

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{translations.editTitle}</DialogTitle>
          <DialogDescription>{translations.editDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={translations.nameLabel} htmlFor="edit_full_name" required>
            <input
              id="edit_full_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={translations.namePlaceholder}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={translations.emailLabel} htmlFor="edit_email">
              <input
                id="edit_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.emailPlaceholder}
              />
            </Field>
            <Field label={translations.phoneLabel} htmlFor="edit_phone">
              <input
                id="edit_phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={translations.phonePlaceholder}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={translations.roleLabel} htmlFor="edit_role">
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
            <Field label={translations.preferredLanguageLabel} htmlFor="edit_preferred_language">
              <DialogSelect
                value={preferredLanguage}
                onChange={setPreferredLanguage}
                options={[
                  { value: "nb", label: "Norsk" },
                  { value: "en", label: "English" },
                  { value: "ar", label: "العربية" },
                  { value: "so", label: "Soomaali" },
                  { value: "ti", label: "ትግርኛ" },
                  { value: "am", label: "አማርኛ" },
                  { value: "tr", label: "Türkçe" },
                  { value: "pl", label: "Polski" },
                  { value: "vi", label: "Tiếng Việt" },
                  { value: "tl", label: "Tagalog" },
                  { value: "zh", label: "中文" },
                  { value: "fa", label: "فارسی" },
                  { value: "dar", label: "دری" },
                  { value: "ur", label: "اردو" },
                  { value: "hi", label: "हिन्दी" },
                ]}
              />
            </Field>
          </div>

          <Field
            label={translations.servicesLabel}
            htmlFor="edit_services"
            description={translations.servicesPlaceholder}
          >
            <DialogMultiSelect
              value={selectedServices}
              onChange={setSelectedServices}
              options={allServices.map((service) => ({ value: service.id, label: service.name }))}
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
              {saving ? translations.saving : translations.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
