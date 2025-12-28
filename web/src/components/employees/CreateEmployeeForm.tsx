"use client";

import { FormEvent } from "react";
import { Field } from "@/components/form/Field";
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
          <select
            id="role"
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
        <Field label={translations.preferredLanguageLabel} htmlFor="preferred_language">
          <select
            id="preferred_language"
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
        htmlFor="services"
        description={`${translations.servicesPlaceholder} (Hold Ctrl/Cmd for å velge flere)`}
      >
        <select
          id="services"
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

