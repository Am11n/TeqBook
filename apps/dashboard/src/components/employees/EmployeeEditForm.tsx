"use client";

import { type FormEvent } from "react";
import Image from "next/image";
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
  publicProfileVisible: boolean; setPublicProfileVisible: (v: boolean) => void;
  publicTitle: string; setPublicTitle: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  specialtiesInput: string; setSpecialtiesInput: (v: string) => void;
  publicSortOrder: string; setPublicSortOrder: (v: string) => void;
  profileImageUrl: string; setProfileImageUrl: (v: string) => void;
  onProfileImageChange: (file: File | null) => void;
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
  publicProfileVisible, setPublicProfileVisible, publicTitle, setPublicTitle,
  bio, setBio, specialtiesInput, setSpecialtiesInput, publicSortOrder, setPublicSortOrder,
  profileImageUrl, setProfileImageUrl, onProfileImageChange,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Public title" htmlFor="detail_public_title">
          <input
            id="detail_public_title"
            type="text"
            value={publicTitle}
            onChange={(e) => setPublicTitle(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder="Senior Barber"
          />
        </Field>
        <Field label="Public sort order" htmlFor="detail_public_sort_order">
          <input
            id="detail_public_sort_order"
            type="number"
            value={publicSortOrder}
            onChange={(e) => setPublicSortOrder(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Profile image" htmlFor="detail_profile_image" description="JPG, PNG, or WebP up to 5MB">
        <div className="space-y-2">
          {profileImageUrl ? (
            <div className="flex items-center gap-3">
              <Image
                src={profileImageUrl}
                alt={fullName || "Employee"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProfileImageUrl("");
                  onProfileImageChange(null);
                }}
              >
                Remove image
              </Button>
            </div>
          ) : null}
          <input
            id="detail_profile_image"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => onProfileImageChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        </div>
      </Field>

      <Field label="Specialties" htmlFor="detail_specialties" description="Comma-separated values">
        <input
          id="detail_specialties"
          type="text"
          value={specialtiesInput}
          onChange={(e) => setSpecialtiesInput(e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          placeholder="Fade, Beard, Scissor cut"
        />
      </Field>

      <Field label="Bio" htmlFor="detail_bio">
        <textarea
          id="detail_bio"
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
