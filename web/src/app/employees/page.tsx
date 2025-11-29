"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getEmployeesWithServicesMap,
  createEmployee,
  toggleEmployeeActive,
  deleteEmployee,
} from "@/lib/repositories/employees";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import type { Employee, Service } from "@/lib/types";

export default function EmployeesPage() {
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].employees;
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employeeServicesMap, setEmployeeServicesMap] = useState<Record<string, Service[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
      setLoading(true);
      setError(null);

    if (!salon?.id) {
      setError(t.noSalon);
        setLoading(false);
        return;
      }

    const [
      { data: employeesData, error: employeesError },
      { data: servicesData, error: servicesError },
    ] = await Promise.all([
      getEmployeesWithServicesMap(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
    ]);

    if (employeesError || servicesError) {
      setError(employeesError ?? servicesError ?? "Kunne ikke laste data");
        setLoading(false);
        return;
      }

    if (!employeesData || !servicesData) {
      setError("Kunne ikke laste data");
        setLoading(false);
        return;
      }

    setEmployees(employeesData.employees);
    setServices(servicesData);
    setEmployeeServicesMap(employeesData.servicesMap);
      setLoading(false);
    }

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    loadEmployees();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon]);

  async function handleAddEmployee(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);

    const { data: employeeData, error: insertError } = await createEmployee({
      salon_id: salon.id,
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      role: role.trim() || null,
      preferred_language: preferredLanguage || "nb",
      service_ids: selectedServices.length > 0 ? selectedServices : undefined,
    });

    if (insertError || !employeeData) {
      setError(insertError ?? t.addError);
      setSaving(false);
      return;
    }

    // Reload to get updated services map
    await loadEmployees();
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("");
    setPreferredLanguage("nb");
    setSelectedServices([]);
    setSaving(false);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    if (!salon?.id) return;

    const { data, error: updateError } = await toggleEmployeeActive(salon.id, id, isActive);

    if (updateError || !data) {
      setError(updateError ?? t.updateError);
      return;
    }

    setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)));
  }

  async function handleDelete(id: string) {
    if (!salon?.id) return;

    const { error: deleteError } = await deleteEmployee(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          onSubmit={handleAddEmployee}
          className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-medium">{t.newEmployee}</h2>
          <div className="space-y-2 text-sm">
            <label htmlFor="full_name" className="font-medium">
              {t.nameLabel}
            </label>
            <input
              id="full_name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder={t.namePlaceholder}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <label htmlFor="email" className="font-medium">
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="phone" className="font-medium">
                {t.phoneLabel}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={t.phonePlaceholder}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <label htmlFor="role" className="font-medium">
                {t.roleLabel}
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={t.rolePlaceholder}
              />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="preferred_language" className="font-medium">
                {t.preferredLanguageLabel}
              </label>
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
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <label htmlFor="services" className="font-medium">
              {t.servicesLabel}
            </label>
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
            <p className="text-xs text-muted-foreground">
              {t.servicesPlaceholder} (Hold Ctrl/Cmd for å velge flere)
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !salon?.id}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "…" : t.addButton}
          </button>
        </form>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar title={t.tableTitle} />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t.loading}
            </p>
          ) : employees.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
              />
            </div>
          ) : (
            <>
              {/* Mobil: kortvisning uten horisontal scrolling */}
              <div className="mt-4 space-y-3 md:hidden">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {employee.full_name}
                        </div>
                        {employee.role && (
                          <div className="text-[11px] text-muted-foreground">
                            {employee.role}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={
                          employee.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-100 text-zinc-600"
                        }
                        onClick={() =>
                          handleToggleActive(employee.id, employee.is_active)
                        }
                        >
                          {employee.is_active ? t.active : t.inactive}
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                      {employee.email && <div>{employee.email}</div>}
                      {employee.phone && <div>{employee.phone}</div>}
                      {employeeServicesMap[employee.id]?.length > 0 && (
                        <div className="mt-1">
                          <span className="font-medium">Tjenester: </span>
                          {employeeServicesMap[employee.id].map((s) => s.name).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(employee.id)}
                      >
                        {t.delete}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabellvisning */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pr-4">
                        {t.colName}
                      </TableHead>
                      <TableHead className="pr-4">
                        {t.colRole}
                      </TableHead>
                      <TableHead className="pr-4">
                        {t.colContact}
                      </TableHead>
                      <TableHead className="pr-4">
                        {t.colServices}
                      </TableHead>
                      <TableHead className="pr-4">
                        {t.colStatus}
                      </TableHead>
                      <TableHead className="text-right">
                        {t.colActions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="pr-4">
                          <div className="font-medium">
                            {employee.full_name}
                          </div>
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {employee.role || "-"}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {employee.email && <div>{employee.email}</div>}
                          {employee.phone && <div>{employee.phone}</div>}
                          {!employee.email && !employee.phone && "-"}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {employeeServicesMap[employee.id]?.length > 0
                            ? employeeServicesMap[employee.id].map((s) => s.name).join(", ")
                            : "-"}
                        </TableCell>
                        <TableCell className="pr-4 text-xs">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={
                              employee.is_active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                            }
                            onClick={() =>
                              handleToggleActive(employee.id, employee.is_active)
                            }
                          >
                            {employee.is_active ? t.active : t.inactive}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(employee.id)}
                          >
                            {t.delete}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}


