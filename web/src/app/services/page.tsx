"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
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
  getServicesForCurrentSalon,
  createService,
  toggleServiceActive,
  deleteService,
} from "@/lib/repositories/services";
import type { Service } from "@/lib/types";

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
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(800); // NOK, shown as currency
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    async function loadServices() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const { data: servicesData, error: servicesError } = await getServicesForCurrentSalon(salon.id);

      if (servicesError) {
        setError(servicesError);
        setLoading(false);
        return;
      }

      setServices(servicesData ?? []);
      setLoading(false);
    }

    loadServices();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon]);

  async function handleAddService(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await createService({
      salon_id: salon.id,
        name: name.trim(),
      category: category || null,
        duration_minutes: duration,
        price_cents: price * 100,
      sort_order: sortOrder,
    });

    if (insertError || !data) {
      setError(insertError ?? t.addError);
      setSaving(false);
      return;
    }

    setServices((prev) => [...prev, data]);
    setName("");
    setCategory("");
    setDuration(45);
    setPrice(800);
    setSortOrder(0);
    setSaving(false);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    if (!salon?.id) return;

    const { data, error: updateError } = await toggleServiceActive(salon.id, id, isActive);

    if (updateError || !data) {
      setError(updateError ?? t.updateError);
      return;
    }

    setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
  }

  async function handleDelete(id: string) {
    if (!salon?.id) return;

    const { error: deleteError } = await deleteService(salon.id, id);

    if (deleteError) {
      setError(deleteError);
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

          <div className="space-y-2 text-sm">
            <label htmlFor="category" className="font-medium">
              {t.categoryLabel}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              <option value="">{t.categoryOther}</option>
              <option value="cut">{t.categoryCut}</option>
              <option value="beard">{t.categoryBeard}</option>
              <option value="color">{t.categoryColor}</option>
              <option value="nails">{t.categoryNails}</option>
              <option value="massage">{t.categoryMassage}</option>
            </select>
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

          <div className="space-y-2 text-sm">
            <label htmlFor="sort_order" className="font-medium">
              {t.sortOrderLabel}
            </label>
            <input
              id="sort_order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              placeholder="0"
            />
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
                          {service.category === "cut" ? t.categoryCut :
                           service.category === "beard" ? t.categoryBeard :
                           service.category === "color" ? t.categoryColor :
                           service.category === "nails" ? t.categoryNails :
                           service.category === "massage" ? t.categoryMassage :
                           t.categoryOther} • {service.duration_minutes} min
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
                      <TableHead className="pr-4">{t.colCategory}</TableHead>
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
                          {service.category === "cut" ? t.categoryCut :
                           service.category === "beard" ? t.categoryBeard :
                           service.category === "color" ? t.categoryColor :
                           service.category === "nails" ? t.categoryNails :
                           service.category === "massage" ? t.categoryMassage :
                           t.categoryOther}
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


