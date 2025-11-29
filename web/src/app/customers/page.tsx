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
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getCustomersForCurrentSalon,
  createCustomer,
  deleteCustomer,
} from "@/lib/repositories/customers";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
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
  const t = translations[appLocale].customers;
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [saving, setSaving] = useState(false);

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

    async function loadCustomers() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const { data: customersData, error: customersError } = await getCustomersForCurrentSalon(salon.id);

      if (customersError) {
        setError(customersError);
        setLoading(false);
        return;
      }

      setCustomers(customersData ?? []);
      setLoading(false);
    }

    loadCustomers();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon, t.loadError]);

  async function handleAddCustomer(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await createCustomer({
      salon_id: salon.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
      gdpr_consent: gdprConsent,
    });

    if (insertError || !data) {
      setError(insertError ?? t.addError);
      setSaving(false);
      return;
    }

    setCustomers((prev) => [data, ...prev]);
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setGdprConsent(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!salon?.id) return;

    const { error: deleteError } = await deleteCustomer(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
        <form
          onSubmit={handleAddCustomer}
          className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-medium">{t.newCustomer}</h2>

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

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-2 text-sm">
            <label htmlFor="notes" className="font-medium">
              {t.notesLabel}
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm"
              placeholder={t.notesPlaceholder}
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-[2px] h-3.5 w-3.5 rounded border bg-background"
            />
            <span>
              {t.gdprLabel}
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={saving || !salon?.id}
            className="h-9 w-full sm:w-auto"
          >
            {saving ? t.saving : t.addButton}
          </Button>
        </form>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar title={t.tableTitle} />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t.loading}
            </p>
          ) : customers.length === 0 ? (
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
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs"
                  >
                    <div className="flex items-start justify_between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {customer.full_name}
                        </div>
                        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && <div>{customer.phone}</div>}
                        </div>
                      </div>
                    </div>
                    {customer.notes && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {customer.notes}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {customer.gdpr_consent
                          ? t.mobileConsentYes
                          : t.mobileConsentNo}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(customer.id)}
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
                      <TableHead className="pr-4">{t.colContact}</TableHead>
                      <TableHead className="pr-4">{t.colNotes}</TableHead>
                      <TableHead className="pr-4">{t.colGdpr}</TableHead>
                      <TableHead className="text-right">
                        {t.colActions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="pr-4">
                          <div className="font-medium">
                            {customer.full_name}
                          </div>
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && <div>{customer.phone}</div>}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {customer.notes}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {customer.gdpr_consent
                            ? t.consentYes
                            : t.consentNo}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(customer.id)}
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


