"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
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

type Employee = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  is_active: boolean;
};

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
  const [salonId, setSalonId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.mustBeLoggedIn);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("salon_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile?.salon_id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      setSalonId(profile.salon_id);

      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, full_name, email, phone, role, is_active")
        .eq("salon_id", profile.salon_id)
        .order("created_at", { ascending: true });

      if (employeesError) {
        setError(employeesError.message);
        setLoading(false);
        return;
      }

      setEmployees(employeesData ?? []);
      setLoading(false);
    }

    loadInitial();
  }, []);

  async function handleAddEmployee(e: FormEvent) {
    e.preventDefault();
    if (!salonId) return;
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("employees")
      .insert({
        salon_id: salonId,
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      })
      .select("id, full_name, email, phone, role, is_active")
      .maybeSingle();

    if (insertError || !data) {
      setError(insertError?.message ?? t.addError);
      setSaving(false);
      return;
    }

    setEmployees((prev) => [...prev, data]);
    setFullName("");
    setEmail("");
    setPhone("");
    setSaving(false);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const { data, error: updateError } = await supabase
      .from("employees")
      .update({ is_active: !isActive })
      .eq("id", id)
      .select("id, full_name, email, phone, role, is_active")
      .maybeSingle();

    if (updateError || !data) {
      setError(updateError?.message ?? t.updateError);
      return;
    }

    setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)));
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
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

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !salonId}
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
                        {t.colContact}
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
                          {employee.role && (
                            <div className="text-xs text-muted-foreground">
                              {employee.role}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {employee.email && <div>{employee.email}</div>}
                          {employee.phone && <div>{employee.phone}</div>}
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


