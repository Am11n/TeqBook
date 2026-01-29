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
              <select
                id="edit_role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                <option value="">{translations.rolePlaceholder}</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </Field>
            <Field label={translations.preferredLanguageLabel} htmlFor="edit_preferred_language">
              <select
                id="edit_preferred_language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                <option value="nb">🇳🇴 Norsk</option>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="so">🇸🇴 Soomaali</option>
                <option value="ti">🇪🇷 ትግርኛ</option>
                <option value="am">🇪🇹 አማርኛ</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="pl">🇵🇱 Polski</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="tl">🇵🇭 Tagalog</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="fa">🇮🇷 فارسی</option>
                <option value="dar">🇦🇫 دری</option>
                <option value="ur">🇵🇰 اردو</option>
                <option value="hi">🇮🇳 हिन्दी</option>
              </select>
            </Field>
          </div>

          <Field
            label={translations.servicesLabel}
            htmlFor="edit_services"
            description={`${translations.servicesPlaceholder} (Hold Ctrl/Cmd for å velge flere)`}
          >
            <select
              id="edit_services"
              multiple
              value={selectedServices}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedServices(values);
              }}
              className="h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              {allServices.map((service) => (
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
              {saving ? translations.saving : translations.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
