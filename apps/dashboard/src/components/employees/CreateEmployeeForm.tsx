"use client";

import { FormEvent } from "react";
import { Field } from "@/components/form/Field";
import { DialogSelect, DialogMultiSelect } from "@/components/ui/dialog-select";
import { useCreateEmployee } from "@/lib/hooks/employees/useCreateEmployee";
import type { Service } from "@/lib/types";

interface CreateEmployeeFormProps {
  services: Service[];
  onEmployeeCreated: () => Promise<void>;
  translations: {
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
    addButton: string;
  };
}

export function CreateEmployeeForm({
  services,
  onEmployeeCreated,
  translations,
}: CreateEmployeeFormProps) {
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
  } = useCreateEmployee({ services, onEmployeeCreated });

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-card p-4 shadow-sm"
    >
      <h2 className="text-sm font-medium">{translations.addButton}</h2>

      <Field label={translations.nameLabel} htmlFor="full_name" required>
        <input
          id="full_name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder={translations.namePlaceholder}
        />
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label={translations.emailLabel} htmlFor="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder={translations.emailPlaceholder}
          />
        </Field>
        <Field label={translations.phoneLabel} htmlFor="phone">
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder={translations.phonePlaceholder}
          />
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label={translations.roleLabel} htmlFor="role">
          <DialogSelect
            value={role}
            onChange={setRole}
            placeholder={translations.rolePlaceholder}
            options={[
              { value: "", label: translations.rolePlaceholder },
              { value: "owner", label: "Owner" },
              { value: "manager", label: "Manager" },
              { value: "staff", label: "Staff" },
            ]}
          />
        </Field>
        <Field label={translations.preferredLanguageLabel} htmlFor="preferred_language">
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
        htmlFor="services"
        description={`${translations.servicesPlaceholder} (Hold Ctrl/Cmd for å velge flere)`}
      >
        <DialogMultiSelect
          value={selectedServices}
          onChange={setSelectedServices}
          options={services.map((service) => ({ value: service.id, label: service.name }))}
        />
      </Field>

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "…" : translations.addButton}
      </button>
    </form>
  );
}

