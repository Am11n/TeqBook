import { useState, useMemo, FormEvent } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useRepoError } from "@/lib/hooks/useRepoError";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { createEmployee, updateEmployee } from "@/lib/services/employees-service";
import { uploadEmployeeProfileImage } from "@/lib/services/storage-service";
import type { Service } from "@/lib/types";

interface UseCreateEmployeeOptions {
  services: Service[];
  onEmployeeCreated: () => Promise<void>;
}

export function useCreateEmployee({ services, onEmployeeCreated }: UseCreateEmployeeOptions) {
  const m = useRepoError();
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const te = useMemo(
    () => resolveNamespace("employees", translations[appLocale].employees),
    [appLocale],
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);
  const [publicTitle, setPublicTitle] = useState("");
  const [bio, setBio] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [publicSortOrder, setPublicSortOrder] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !fullName.trim()) {
      setError(te.validationNameRequired);
      return;
    }

    setSaving(true);
    setError(null);

    const { data: createdData, error: createdError } = await createEmployee({
      salon_id: salon.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role || null,
      preferred_language: preferredLanguage,
      service_ids: selectedServices,
      public_profile_visible: publicProfileVisible,
      public_title: publicTitle.trim() || null,
      bio: bio.trim() || null,
      specialties: specialtiesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      public_sort_order: publicSortOrder.trim()
        ? Number.parseInt(publicSortOrder.trim(), 10) || null
        : null,
    }, salon.plan);

    if (createdError || !createdData) {
      setError(createdError ? m(createdError) : te.createEmployeeFailed);
      setSaving(false);
      return;
    }

    if (profileImageFile) {
      const { data: uploadData, error: uploadError } = await uploadEmployeeProfileImage(
        profileImageFile,
        salon.id,
        createdData.id
      );
      if (uploadError || !uploadData?.url) {
        setError(uploadError ?? te.employeeCreatedImageUploadFailed);
        setSaving(false);
        await onEmployeeCreated();
        return;
      }

      const { error: imageUpdateError } = await updateEmployee(
        salon.id,
        createdData.id,
        { profile_image_url: uploadData.url },
        salon.plan
      );

      if (imageUpdateError) {
        setError(m(imageUpdateError));
        setSaving(false);
        await onEmployeeCreated();
        return;
      }
    }

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("");
    setPreferredLanguage("en");
    setSelectedServices([]);
    setPublicProfileVisible(true);
    setPublicTitle("");
    setBio("");
    setSpecialtiesInput("");
    setPublicSortOrder("");
    setProfileImageFile(null);
    setSaving(false);

    // Reload employees
    await onEmployeeCreated();
  };

  return {
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
    profileImageFile,
    setProfileImageFile,
    saving,
    error,
    handleSubmit,
  };
}

