"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form/Field";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogSelect, DialogMultiSelect } from "@/components/ui/dialog-select";
import type { Service } from "@/lib/types";
import { LANGUAGE_OPTIONS } from "./language-options";

interface EmployeeEditFormProps {
  fullName: string; setFullName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  role: string; setRole: (v: string) => void;
  preferredLanguage: string; setPreferredLanguage: (v: string) => void;
  selectedServices: string[]; setSelectedServices: (v: string[]) => void;
  services: Service[];
  saving: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  translations: {
    nameLabel: string; emailLabel: string; phoneLabel: string;
    roleLabel: string; selectRole: string; roleOwner: string;
    roleManager: string; roleStaff: string; preferredLang: string;
    servicesLabel: string; cancel: string; save: string; saving: string;
  };
}

export function EmployeeEditForm({
  fullName, setFullName, email, setEmail, phone, setPhone,
  role, setRole, preferredLanguage, setPreferredLanguage,
  selectedServices, setSelectedServices, services,
  saving, error, onSubmit, onCancel, translations: t,
}: EmployeeEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={t.nameLabel} htmlFor="detail_full_name" required>
        <input id="detail_full_name" type="text" required value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.emailLabel} htmlFor="detail_email">
          <input id="detail_email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
        </Field>
        <Field label={t.phoneLabel} htmlFor="detail_phone">
          <input id="detail_phone" type="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.roleLabel} htmlFor="detail_role">
          <DialogSelect value={role} onChange={setRole} placeholder={t.selectRole}
            options={[
              { value: "owner", label: t.roleOwner },
              { value: "manager", label: t.roleManager },
              { value: "staff", label: t.roleStaff },
            ]} />
        </Field>
        <Field label={t.preferredLang} htmlFor="detail_lang">
          <DialogSelect value={preferredLanguage} onChange={setPreferredLanguage}
            options={[...LANGUAGE_OPTIONS]} />
        </Field>
      </div>

      <Field label={t.servicesLabel} htmlFor="detail_services">
        <DialogMultiSelect value={selectedServices} onChange={setSelectedServices}
          options={services.map((svc) => ({ value: svc.id, label: svc.name }))} />
      </Field>

      {error && <p className="text-sm text-destructive" aria-live="polite">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>{t.cancel}</Button>
        <Button type="submit" disabled={saving}>{saving ? t.saving : t.save}</Button>
      </DialogFooter>
    </form>
  );
}
