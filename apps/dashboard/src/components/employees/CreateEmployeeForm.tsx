"use client";

import { Field } from "@/components/form/Field";
import { DialogSelect, DialogMultiSelect } from "@/components/ui/dialog-select";
import { LANGUAGE_OPTIONS } from "@/components/employees/language-options";
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
    publicProfileVisible,
    setPublicProfileVisible,
    publicTitle,
    setPublicTitle,
    bio,
    setBio,
    specialtiesInput,
    setSpecialtiesInput,
    publicSortOrder,
    setPublicSortOrder,
    setProfileImageFile,
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
            options={LANGUAGE_OPTIONS}
          />
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Public title" htmlFor="public_title">
          <input
            id="public_title"
            type="text"
            value={publicTitle}
            onChange={(e) => setPublicTitle(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder="Senior Barber"
          />
        </Field>
        <Field label="Public sort order" htmlFor="public_sort_order">
          <input
            id="public_sort_order"
            type="number"
            value={publicSortOrder}
            onChange={(e) => setPublicSortOrder(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder="0"
          />
        </Field>
      </div>

      <Field
        label="Profile image"
        htmlFor="profile_image"
        description="JPG, PNG, or WebP up to 5MB"
      >
        <input
          id="profile_image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => setProfileImageFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      </Field>

      <Field
        label="Specialties"
        htmlFor="specialties"
        description="Comma-separated (e.g. Fade, Beard trim)"
      >
        <input
          id="specialties"
          type="text"
          value={specialtiesInput}
          onChange={(e) => setSpecialtiesInput(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder="Fade, Beard, Scissor cut"
        />
      </Field>

      <Field label="Bio" htmlFor="bio">
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder="Short intro shown on your public profile."
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={publicProfileVisible}
          onChange={(e) => setPublicProfileVisible(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        Visible on public profile
      </label>

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

