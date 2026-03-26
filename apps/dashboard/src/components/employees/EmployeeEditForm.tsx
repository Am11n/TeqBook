"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/form/Field";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogSelect, DialogMultiSelect } from "@/components/ui/dialog-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  profileImageFile: File | null;
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
    saveChanges: string;
    basicInfoSectionTitle: string; basicInfoSectionDescription: string;
    publicProfileSectionTitle: string; publicProfileSectionDescription: string;
    servicesSectionTitle: string; servicesSectionDescription: string;
    publicTitleLabel: string; publicTitlePlaceholder: string;
    publicSortOrderLabel: string; publicSortOrderPlaceholder: string;
    publicSortOrderHint: string; profileImageLabel: string; profileImageHint: string;
    uploadImage: string; removeImage: string; uploadingImage: string; retryUploadImage: string;
    specialtiesLabel: string; specialtiesHint: string; specialtiesPlaceholder: string;
    bioLabel: string; bioHint: string; bioPlaceholder: string;
    publicProfileVisibleLabel: string; selectedServicesCount: string;
    validationNameRequired: string; validationNameMin: string;
    validationEmailInvalid: string; validationSortOrderInvalid: string;
    validationTagTooLong: string; validationImageInvalidType: string;
    validationImageTooLarge: string;
  };
}

export function EmployeeEditForm({
  fullName, setFullName, email, setEmail, phone, setPhone,
  role, setRole, preferredLanguage, setPreferredLanguage,
  selectedServices, setSelectedServices, services,
  publicProfileVisible, setPublicProfileVisible, publicTitle, setPublicTitle,
  bio, setBio, specialtiesInput, setSpecialtiesInput, publicSortOrder, setPublicSortOrder,
  profileImageUrl, setProfileImageUrl, profileImageFile, onProfileImageChange,
  saving, error, onSubmit, onCancel, translations: t,
}: EmployeeEditFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");
  const [specialties, setSpecialties] = useState<string[]>(
    specialtiesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSpecialties(
      specialtiesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }, [specialtiesInput]);

  const initials = useMemo(
    () =>
      (fullName || "Employee")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [fullName],
  );

  const selectedServicesCountLabel = t.selectedServicesCount.replace(
    "{count}",
    String(selectedServices.length),
  );

  const syncSpecialties = (next: string[]) => {
    setSpecialties(next);
    setSpecialtiesInput(next.join(", "));
  };

  const pushTag = (raw: string) => {
    const nextTag = raw.trim();
    if (!nextTag) return;
    if (nextTag.length > 32) {
      setFieldErrors((prev) => ({ ...prev, specialties: t.validationTagTooLong }));
      return;
    }
    if (specialties.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
      setTagDraft("");
      return;
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.specialties;
      return next;
    });
    syncSpecialties([...specialties, nextTag]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    syncSpecialties(specialties.filter((item) => item !== tag));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      pushTag(tagDraft);
    }
    if (event.key === "Backspace" && !tagDraft && specialties.length > 0) {
      removeTag(specialties[specialties.length - 1]);
    }
  };

  const validateField = (name: "fullName" | "email" | "publicSortOrder") => {
    if (name === "fullName") {
      const value = fullName.trim();
      if (!value) return t.validationNameRequired;
      if (value.length < 2) return t.validationNameMin;
      return "";
    }
    if (name === "email") {
      const value = email.trim();
      if (!value) return "";
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return isValidEmail ? "" : t.validationEmailInvalid;
    }
    const value = publicSortOrder.trim();
    if (!value) return "";
    const numeric = Number.parseInt(value, 10);
    return Number.isInteger(numeric) && numeric >= 0
      ? ""
      : t.validationSortOrderInvalid;
  };

  const setOrClearFieldError = (key: string, value: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const handleImageFileChange = (file: File | null) => {
    if (!file) {
      onProfileImageChange(null);
      setOrClearFieldError("profileImage", "");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      onProfileImageChange(null);
      setOrClearFieldError("profileImage", t.validationImageInvalidType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onProfileImageChange(null);
      setOrClearFieldError("profileImage", t.validationImageTooLarge);
      return;
    }
    setOrClearFieldError("profileImage", "");
    onProfileImageChange(file);
    setProfileImageUrl(URL.createObjectURL(file));
  };

  const runValidation = () => {
    const nextErrors: Record<string, string> = {};
    const nameError = validateField("fullName");
    const emailError = validateField("email");
    const sortError = validateField("publicSortOrder");
    if (nameError) nextErrors.fullName = nameError;
    if (emailError) nextErrors.email = emailError;
    if (sortError) nextErrors.publicSortOrder = sortError;
    if (specialties.some((tag) => tag.length > 32)) {
      nextErrors.specialties = t.validationTagTooLong;
    }
    setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!runValidation()) return;
    onSubmit(event);
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-28 pt-2">
        <section className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t.basicInfoSectionTitle}</h3>
            <p className="text-xs text-muted-foreground">{t.basicInfoSectionDescription}</p>
          </div>
          <Field label={t.nameLabel} htmlFor="detail_full_name" required error={fieldErrors.fullName}>
            <Input
              id="detail_full_name"
              type="text"
              required
              value={fullName}
              onBlur={() => setOrClearFieldError("fullName", validateField("fullName"))}
              onChange={(e) => {
                setFullName(e.target.value);
                setOrClearFieldError("fullName", validateField("fullName"));
              }}
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.emailLabel} htmlFor="detail_email" error={fieldErrors.email}>
              <Input
                id="detail_email"
                type="email"
                value={email}
                onBlur={() => setOrClearFieldError("email", validateField("email"))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOrClearFieldError("email", validateField("email"));
                }}
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </Field>
            <Field label={t.phoneLabel} htmlFor="detail_phone">
              <Input
                id="detail_phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.roleLabel} htmlFor="detail_role">
              <DialogSelect
                value={role}
                onChange={setRole}
                placeholder={t.selectRole}
                options={[
                  { value: "owner", label: t.roleOwner },
                  { value: "manager", label: t.roleManager },
                  { value: "staff", label: t.roleStaff },
                ]}
              />
            </Field>
            <Field label={t.preferredLang} htmlFor="detail_lang">
              <DialogSelect
                value={preferredLanguage}
                onChange={setPreferredLanguage}
                options={[...LANGUAGE_OPTIONS]}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t.publicProfileSectionTitle}</h3>
            <p className="text-xs text-muted-foreground">{t.publicProfileSectionDescription}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)]">
            <Field label={t.publicTitleLabel} htmlFor="detail_public_title">
              <Input
                id="detail_public_title"
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                placeholder={t.publicTitlePlaceholder}
              />
            </Field>
            <Field
              label={t.publicSortOrderLabel}
              htmlFor="detail_public_sort_order"
              description={t.publicSortOrderHint}
              error={fieldErrors.publicSortOrder}
            >
              <Input
                id="detail_public_sort_order"
                type="number"
                inputMode="numeric"
                min={0}
                value={publicSortOrder}
                onBlur={() =>
                  setOrClearFieldError("publicSortOrder", validateField("publicSortOrder"))
                }
                onChange={(e) => {
                  setPublicSortOrder(e.target.value);
                  setOrClearFieldError("publicSortOrder", validateField("publicSortOrder"));
                }}
                placeholder={t.publicSortOrderPlaceholder}
                aria-invalid={Boolean(fieldErrors.publicSortOrder)}
              />
            </Field>
          </div>

          <Field
            label={t.profileImageLabel}
            htmlFor="detail_profile_image"
            description={t.profileImageHint}
            error={fieldErrors.profileImage}
          >
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border">
                    <AvatarImage src={profileImageUrl || undefined} alt={fullName || "Employee"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    {profileImageFile ? (
                      <p className="text-sm font-medium">{profileImageFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.profileImageHint}</p>
                    )}
                    {saving && profileImageFile ? (
                      <p className="text-xs text-muted-foreground">{t.uploadingImage}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    id="detail_profile_image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageFileChange(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fieldErrors.profileImage ? t.retryUploadImage : t.uploadImage}
                  </Button>
                  {(profileImageUrl || profileImageFile) && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => {
                        setProfileImageUrl("");
                        onProfileImageChange(null);
                        setOrClearFieldError("profileImage", "");
                      }}
                    >
                      {t.removeImage}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Field>

          <Field
            label={t.specialtiesLabel}
            htmlFor="detail_specialties"
            description={t.specialtiesHint}
            error={fieldErrors.specialties}
          >
            <div className="space-y-2">
              <Input
                id="detail_specialties"
                type="text"
                value={tagDraft}
                onKeyDown={handleTagKeyDown}
                onChange={(e) => setTagDraft(e.target.value)}
                onBlur={() => {
                  if (tagDraft.trim()) pushTag(tagDraft);
                }}
                placeholder={t.specialtiesPlaceholder}
              />
              <div className="flex min-h-7 flex-wrap gap-2">
                {specialties.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1 text-xs">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      x
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Field>

          <Field label={t.bioLabel} htmlFor="detail_bio" description={t.bioHint}>
            <Textarea
              id="detail_bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[120px]"
              placeholder={t.bioPlaceholder}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publicProfileVisible}
              onChange={(e) => setPublicProfileVisible(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            {t.publicProfileVisibleLabel}
          </label>
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t.servicesSectionTitle}</h3>
            <p className="text-xs text-muted-foreground">{t.servicesSectionDescription}</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">{selectedServicesCountLabel}</p>
          <Field label={t.servicesLabel} htmlFor="detail_services">
            <DialogMultiSelect
              value={selectedServices}
              onChange={setSelectedServices}
              options={services.map((svc) => ({ value: svc.id, label: svc.name }))}
            />
          </Field>
        </section>

        {error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {error}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <DialogFooter className="justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t.saving : t.saveChanges || t.save}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
}
