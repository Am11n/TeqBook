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

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
};

export default function ServicesPage() {
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
  const t = translations[appLocale].services;

  const [salonId, setSalonId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(800); // NOK, shown as currency
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

      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, duration_minutes, price_cents, is_active")
        .eq("salon_id", profile.salon_id)
        .order("created_at", { ascending: true });

      if (servicesError) {
        setError(servicesError.message);
        setLoading(false);
        return;
      }

      setServices(servicesData ?? []);
      setLoading(false);
    }

    loadInitial();
  }, []);

  async function handleAddService(e: FormEvent) {
    e.preventDefault();
    if (!salonId) return;
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("services")
      .insert({
        salon_id: salonId,
        name: name.trim(),
        duration_minutes: duration,
        price_cents: price * 100,
      })
      .select("id, name, duration_minutes, price_cents, is_active")
      .maybeSingle();

    if (insertError || !data) {
      setError(insertError?.message ?? t.addError);
      setSaving(false);
      return;
    }

    setServices((prev) => [...prev, data]);
    setName("");
    setDuration(45);
    setPrice(800);
    setSaving(false);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const { data, error: updateError } = await supabase
      .from("services")
      .update({ is_active: !isActive })
      .eq("id", id)
      .select("id, name, duration_minutes, price_cents, is_active")
      .maybeSingle();

    if (updateError || !data) {
      setError(updateError?.message ?? t.updateError);
      return;
    }

    setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <form
          onSubmit={handleAddService}
          className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-medium">{t.newService}</h2>

          <div className="space-y-2 text-sm">
              <label htmlFor="name" className="font-medium">
                {t.nameLabel}
            </label>
            <input
              id="name"
              type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={t.namePlaceholder}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
                <label htmlFor="duration" className="font-medium">
                  {t.durationLabel}
              </label>
              <input
                id="duration"
                type="number"
                min={10}
                max={300}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2 text-sm">
                <label htmlFor="price" className="font-medium">
                  {t.priceLabel}
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step={50}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
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
            {saving ? "…" : t.newService}
          </button>
        </form>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar title={t.tableTitle} />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t.loading}
            </p>
          ) : services.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
              />
            </div>
          ) : (
            <>
              {/* Mobil: kortvisning */}
              <div className="mt-4 space-y-3 md:hidden">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {service.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {service.duration_minutes} min
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={
                          service.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-100 text-zinc-600"
                        }
                        onClick={() =>
                          handleToggleActive(
                            service.id,
                            service.is_active ?? true,
                          )
                        }
                      >
                        {service.is_active ? t.active : t.inactive}
                      </Button>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {(service.price_cents / 100).toLocaleString(
                        locale === "nb" ? "nb-NO" : "en-US",
                        {
                          style: "currency",
                          currency: "NOK",
                          maximumFractionDigits: 0,
                        },
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(service.id)}
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
                      <TableHead className="pr-4">{t.colName}</TableHead>
                      <TableHead className="pr-4">{t.colDuration}</TableHead>
                      <TableHead className="pr-4">{t.colPrice}</TableHead>
                      <TableHead className="pr-4">{t.colStatus}</TableHead>
                      <TableHead className="text-right">
                        {t.colActions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="pr-4">
                          <div className="font-medium">{service.name}</div>
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {service.duration_minutes} min
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {(service.price_cents / 100).toLocaleString(
                            locale === "nb" ? "nb-NO" : "en-US",
                            {
                              style: "currency",
                              currency: "NOK",
                              maximumFractionDigits: 0,
                            },
                          )}
                        </TableCell>
                        <TableCell className="pr-4 text-xs">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={
                              service.is_active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                            }
                            onClick={() =>
                              handleToggleActive(
                                service.id,
                                service.is_active ?? true,
                              )
                            }
                          >
                            {service.is_active ? t.active : t.inactive}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(service.id)}
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


