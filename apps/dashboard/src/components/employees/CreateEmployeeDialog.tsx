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
              <select
                id="create_role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                <option value="">{translations.rolePlaceholder}</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </Field>
            <Field label={translations.preferredLanguageLabel} htmlFor="create_preferred_language">
              <select
                id="create_preferred_language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                <option value="nb">Norsk</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="so">Soomaali</option>
                <option value="ti">ትግርኛ</option>
                <option value="am">አማርኛ</option>
                <option value="tr">Türkçe</option>
                <option value="pl">Polski</option>
                <option value="vi">Tiếng Việt</option>
                <option value="tl">Tagalog</option>
                <option value="zh">中文</option>
                <option value="fa">فارسی</option>
                <option value="dar">دری</option>
                <option value="ur">اردو</option>
                <option value="hi">हिन्दी</option>
              </select>
            </Field>
          </div>

          <Field
            label={translations.servicesLabel}
            htmlFor="create_services"
            description={`${translations.servicesPlaceholder} (Hold Ctrl/Cmd for å velge flere)`}
          >
            <select
              id="create_services"
              multiple
              value={selectedServices}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedServices(values);
              }}
              className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
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
