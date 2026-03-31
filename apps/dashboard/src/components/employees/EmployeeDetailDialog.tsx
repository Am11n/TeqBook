"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SetupBadge } from "@/components/setup-badge";
import { getEmployeeSetupIssues, isEmployeeBookable } from "@/lib/setup/health";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateEmployee } from "@/lib/repositories/employees";
import { uploadEmployeeProfileImage } from "@/lib/services/storage-service";
import { Check, X, Edit } from "lucide-react";
import type { DialogMode } from "@/lib/hooks/useEntityDialogState";
import type { Employee, Service, Shift } from "@/lib/types";
import { EmployeeEditForm } from "./EmployeeEditForm";

export interface EmployeeDetailDialogTranslations {
  editTitle: string; detailDescription: string; editDescription: string;
  active: string; inactive: string; canBeBooked: string; notBookable: string;
  detailRole: string; detailContact: string; noContact: string;
  detailServices: string; noServices: string; shiftsLabel: string;
  shiftsRegistered: string; noShifts: string; close: string; edit: string;
  cancel: string; save: string; saving: string; nameLabel: string;
  emailLabel: string; phoneLabel: string; roleLabel: string;
  selectRole: string; roleOwner: string; roleManager: string;
  roleStaff: string; preferredLang: string; servicesLabel: string;
  saveChanges: string; editDescriptionRich: string; profileContextLine: string;
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
  validationTagTooLong: string;   validationImageInvalidType: string;
  validationImageTooLarge: string;
  profileImageUploadFailed: string;
}

interface EmployeeDetailDialogProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  onSwitchToEdit: () => void;
  onSwitchToView: () => void;
  employees: Employee[];
  services: Service[];
  employeeServicesMap: Record<string, Service[]>;
  employeeShiftsMap: Record<string, Shift[]>;
  hasShiftsFeature?: boolean;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  onEmployeeUpdated: () => Promise<void>;
  translations: EmployeeDetailDialogTranslations;
}

export function EmployeeDetailDialog({
  employeeId,
  open,
  onOpenChange,
  mode,
  onSwitchToEdit,
  onSwitchToView,
  employees,
  services,
  employeeServicesMap,
  employeeShiftsMap,
  hasShiftsFeature,
  onToggleActive,
  onEmployeeUpdated,
  translations: t,
}: EmployeeDetailDialogProps) {
  const { salon } = useCurrentSalon();
  const employee = employees.find((e) => e.id === employeeId) ?? null;

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("nb");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);
  const [publicTitle, setPublicTitle] = useState("");
  const [bio, setBio] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [publicSortOrder, setPublicSortOrder] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form state when employee or mode changes
  useEffect(() => {
    if (employee && mode === "edit") {
      setFullName(employee.full_name);
      setEmail(employee.email ?? "");
      setPhone(employee.phone ?? "");
      setRole(employee.role ?? "");
      setPreferredLanguage(employee.preferred_language ?? "nb");
      setPublicProfileVisible(employee.public_profile_visible ?? true);
      setPublicTitle(employee.public_title ?? "");
      setBio(employee.bio ?? "");
      setSpecialtiesInput((employee.specialties ?? []).join(", "));
      setPublicSortOrder(
        employee.public_sort_order === null || employee.public_sort_order === undefined
          ? ""
          : String(employee.public_sort_order)
      );
      setProfileImageUrl(employee.profile_image_url ?? "");
      setProfileImageFile(null);
      setSelectedServices(
        (employeeServicesMap[employee.id] ?? []).map((s) => s.id),
      );
      setError(null);
    }
  }, [employee, mode, employeeServicesMap]);

  if (!employee) return null;

  const empServices = employeeServicesMap[employee.id] ?? [];
  const empShifts = employeeShiftsMap[employee.id] ?? [];
  const issues = getEmployeeSetupIssues(employee, {
    services: empServices,
    shifts: empShifts,
    hasShiftsFeature,
  });
  const bookable = isEmployeeBookable(employee, {
    services: empServices,
    shifts: empShifts,
    hasShiftsFeature,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !employee) return;

    setSaving(true);
    setError(null);

    let nextProfileImageUrl: string | null = profileImageUrl.trim() || null;
    if (profileImageFile) {
      const { data: uploadData, error: uploadError } = await uploadEmployeeProfileImage(
        profileImageFile,
        salon.id,
        employee.id
      );

      if (uploadError || !uploadData?.url) {
        setError(uploadError ?? t.profileImageUploadFailed);
        setSaving(false);
        return;
      }
      nextProfileImageUrl = uploadData.url;
    }

    const { error: updateError } = await updateEmployee(
      salon.id,
      employee.id,
      {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        role: role.trim() || null,
        preferred_language: preferredLanguage,
        service_ids: selectedServices,
        public_profile_visible: publicProfileVisible,
        public_title: publicTitle.trim() || null,
        bio: bio.trim() || null,
        profile_image_url: nextProfileImageUrl,
        specialties: specialtiesInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        public_sort_order: publicSortOrder.trim()
          ? Number.parseInt(publicSortOrder.trim(), 10) || null
          : null,
      },
    );

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    await onEmployeeUpdated();
    setSaving(false);
    onSwitchToView();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader>
          <div className="border-b px-6 py-5">
            {mode === "edit" ? (
              <div className="flex items-start gap-3 pr-8">
                <Avatar className="h-11 w-11 border">
                  <AvatarImage src={profileImageUrl || undefined} alt={employee.full_name} />
                  <AvatarFallback>
                    {employee.full_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <DialogTitle>{t.editTitle}</DialogTitle>
                  <DialogDescription>{t.editDescriptionRich}</DialogDescription>
                  <p className="text-xs text-muted-foreground">
                    {employee.full_name} · {t.profileContextLine}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 pr-8">
                <Avatar className="h-11 w-11 border">
                  <AvatarImage src={employee.profile_image_url ?? undefined} alt={employee.full_name} />
                  <AvatarFallback>
                    {employee.full_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <DialogTitle>{employee.full_name}</DialogTitle>
                  <DialogDescription>{t.detailDescription}</DialogDescription>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {mode === "view" ? (
          <div className="space-y-6 px-6 pb-6 pt-4">
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-3">
              <Badge
                variant="outline"
                className={`cursor-pointer ${
                  employee.is_active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
                }`}
                onClick={() =>
                  onToggleActive(employee.id, employee.is_active)
                }
              >
                {employee.is_active ? t.active : t.inactive}
              </Badge>
              {bookable ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> {t.canBeBooked}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600">
                  <X className="h-3.5 w-3.5" /> {t.notBookable}
                </span>
              )}
              <div className="ml-auto">
                <SetupBadge issues={issues} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">{t.detailRole}</p>
                <p className="mt-1 text-sm font-medium">{employee.role || "-"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">{t.detailContact}</p>
                <p className="mt-1 text-sm">
                  {employee.email || employee.phone || t.noContact}
                </p>
                {employee.email && employee.phone && (
                  <p className="text-xs text-muted-foreground">
                    {employee.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.detailServices}
              </p>
              {empServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {empServices.map((s) => (
                    <Badge key={s.id} variant="outline" className="text-xs">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noServices}</p>
              )}
            </div>

            {hasShiftsFeature !== false && (
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">{t.shiftsLabel}</p>
                {empShifts.length > 0 ? (
                  <p className="mt-1 text-sm font-medium">
                    {empShifts.length} {t.shiftsRegistered}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">{t.noShifts}</p>
                )}
              </div>
            )}

            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.close}
              </Button>
              <Button onClick={onSwitchToEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {t.edit}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <EmployeeEditForm
            fullName={fullName} setFullName={setFullName}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            role={role} setRole={setRole}
            preferredLanguage={preferredLanguage} setPreferredLanguage={setPreferredLanguage}
            selectedServices={selectedServices} setSelectedServices={setSelectedServices}
            publicProfileVisible={publicProfileVisible} setPublicProfileVisible={setPublicProfileVisible}
            publicTitle={publicTitle} setPublicTitle={setPublicTitle}
            bio={bio} setBio={setBio}
            specialtiesInput={specialtiesInput} setSpecialtiesInput={setSpecialtiesInput}
            publicSortOrder={publicSortOrder} setPublicSortOrder={setPublicSortOrder}
            profileImageUrl={profileImageUrl} setProfileImageUrl={setProfileImageUrl}
            profileImageFile={profileImageFile}
            onProfileImageChange={setProfileImageFile}
            services={services} saving={saving} error={error}
            onSubmit={handleSubmit} onCancel={onSwitchToView}
            translations={t}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
