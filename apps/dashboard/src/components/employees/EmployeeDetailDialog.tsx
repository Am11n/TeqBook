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
import { Field } from "@/components/form/Field";
import { SetupBadge } from "@/components/setup-badge";
import { getEmployeeSetupIssues, isEmployeeBookable } from "@/lib/setup/health";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateEmployee } from "@/lib/repositories/employees";
import { Check, X, Edit } from "lucide-react";
import type { DialogMode } from "@/lib/hooks/useEntityDialogState";
import type { Employee, Service, Shift } from "@/lib/types";

export interface EmployeeDetailDialogTranslations {
  editTitle: string;
  detailDescription: string;
  editDescription: string;
  active: string;
  inactive: string;
  canBeBooked: string;
  notBookable: string;
  detailRole: string;
  detailContact: string;
  noContact: string;
  detailServices: string;
  noServices: string;
  shiftsLabel: string;
  shiftsRegistered: string;
  noShifts: string;
  close: string;
  edit: string;
  cancel: string;
  save: string;
  saving: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  roleLabel: string;
  selectRole: string;
  roleOwner: string;
  roleManager: string;
  roleStaff: string;
  preferredLang: string;
  servicesLabel: string;
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
  });
  const bookable = isEmployeeBookable(employee, {
    services: empServices,
    shifts: empShifts,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !employee) return;

    setSaving(true);
    setError(null);

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? t.editTitle : employee.full_name}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? t.editDescription : t.detailDescription}
          </DialogDescription>
        </DialogHeader>

        {mode === "view" ? (
          <div className="space-y-4">
            {/* Status row */}
            <div className="flex items-center gap-2">
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
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> {t.canBeBooked}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <X className="h-3.5 w-3.5" /> {t.notBookable}
                </span>
              )}
            </div>

            <SetupBadge issues={issues} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">{t.detailRole}</p>
                <p className="text-sm font-medium">{employee.role || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.detailContact}</p>
                <p className="text-sm">
                  {employee.email || employee.phone || t.noContact}
                </p>
                {employee.email && employee.phone && (
                  <p className="text-xs text-muted-foreground">
                    {employee.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.detailServices}</p>
              {empServices.length > 0 ? (
                <div className="flex flex-wrap gap-1">
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

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.shiftsLabel}</p>
              {empShifts.length > 0 ? (
                <p className="text-sm">
                  {empShifts.length} {t.shiftsRegistered}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noShifts}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.close}
              </Button>
              <Button onClick={onSwitchToEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t.nameLabel} htmlFor="detail_full_name" required>
              <input
                id="detail_full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.emailLabel} htmlFor="detail_email">
                <input
                  id="detail_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
              <Field label={t.phoneLabel} htmlFor="detail_phone">
                <input
                  id="detail_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.roleLabel} htmlFor="detail_role">
                <select
                  id="detail_role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                >
                  <option value="">{t.selectRole}</option>
                  <option value="owner">{t.roleOwner}</option>
                  <option value="manager">{t.roleManager}</option>
                  <option value="staff">{t.roleStaff}</option>
                </select>
              </Field>
              <Field label={t.preferredLang} htmlFor="detail_lang">
                <select
                  id="detail_lang"
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
                  <option value="tr">Turkce</option>
                  <option value="pl">Polski</option>
                  <option value="vi">Tieng Viet</option>
                  <option value="tl">Tagalog</option>
                  <option value="zh">中文</option>
                  <option value="fa">فارسی</option>
                  <option value="dar">دری</option>
                  <option value="ur">اردو</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </Field>
            </div>

            <Field label={t.servicesLabel} htmlFor="detail_services">
              <select
                id="detail_services"
                multiple
                value={selectedServices}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  );
                  setSelectedServices(values);
                }}
                className="h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
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
              <Button type="button" variant="outline" onClick={onSwitchToView}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.saving : t.save}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
