"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { useTabActions } from "@teqbook/page";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { formatPrice } from "@/lib/utils/services/services-utils";
import {
  listPackages,
  createPackage,
  updatePackage,
  type Package,
} from "@/lib/services/package-service";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import type { Service } from "@/lib/types";

export default function PackagesPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const td = translations[appLocale].dashboard;
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [validityDays, setValidityDays] = useState("365");
  const [selectedServices, setSelectedServices] = useState<Array<{ service_id: string; quantity: number }>>([]);

  useEffect(() => {
    if (!salon?.id) return;
    Promise.all([
      listPackages(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
    ]).then(([pkgRes, svcRes]) => {
      setPackages(pkgRes.data ?? []);
      setServices((svcRes.data ?? []) as Service[]);
      if (pkgRes.error) setError(pkgRes.error);
      setLoading(false);
    });
  }, [salon?.id]);

  const handleAddService = (serviceId: string) => {
    if (selectedServices.find((s) => s.service_id === serviceId)) return;
    setSelectedServices((prev) => [...prev, { service_id: serviceId, quantity: 1 }]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.service_id !== serviceId));
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.service_id === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s))
    );
  };

  const handleCreate = async () => {
    if (!salon?.id || !name.trim()) return;
    setCreating(true);
    const cents = Math.round(parseFloat(priceCents) * 100);
    if (isNaN(cents) || cents <= 0) {
      setError("Invalid price");
      setCreating(false);
      return;
    }

    const { data, error } = await createPackage({
      salonId: salon.id,
      name: name.trim(),
      description: description.trim() || undefined,
      includedServices: selectedServices,
      priceCents: cents,
      validityDays: parseInt(validityDays, 10) || 365,
    });

    setCreating(false);
    if (error) {
      setError(error);
      return;
    }
    if (data) setPackages((prev) => [data, ...prev]);
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPriceCents("");
    setValidityDays("365");
    setSelectedServices([]);
  };

  const handleToggleActive = async (pkg: Package) => {
    if (!salon?.id) return;
    const { data } = await updatePackage(salon.id, pkg.id, { is_active: !pkg.is_active });
    if (data) {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? data : p)));
    }
  };

  const tabAction = useMemo(
    () => (
      <Button size="sm" onClick={() => setShowCreate(true)} disabled={services.length === 0}>
        <Plus className="h-3.5 w-3.5 mr-1" /> {td.salesNewPackage ?? "New Package"}
      </Button>
    ),
    [services.length]
  );

  useTabActions(tabAction);

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading packages...</p>
        ) : packages.length === 0 ? (
          <EmptyState
            title={td.salesNoPackagesTitle ?? "No packages yet"}
            description={td.salesNoPackagesDescription ?? "Create your first service package to get started."}
          />
        ) : (
          <div className="divide-y">
            {packages.map((pkg) => {
              const serviceNames = pkg.included_services
                .map((is) => {
                  const svc = services.find((s) => s.id === is.service_id);
                  return svc ? `${is.quantity}x ${svc.name}` : `${is.quantity}x Unknown`;
                })
                .join(", ");

              return (
                <div key={pkg.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{serviceNames}</p>
                    {pkg.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-medium">{fmtPrice(pkg.price_cents)}</p>
                    <span className="text-[10px] text-muted-foreground">{pkg.validity_days}d</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      pkg.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleToggleActive(pkg)}>
                      {pkg.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Package</DialogTitle>
            <DialogDescription>Create a bundle of services customers can purchase.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Package name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Haircut Membership (10x)"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Price ({salonCurrency})</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  placeholder="2500"
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Valid for (days)</label>
                <input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Included services</label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleAddService(e.target.value);
                  e.target.value = "";
                }}
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Add a service...</option>
                {services
                  .filter((s) => !selectedServices.find((ss) => ss.service_id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
              {selectedServices.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {selectedServices.map((ss) => {
                    const svc = services.find((s) => s.id === ss.service_id);
                    return (
                      <div key={ss.service_id} className="flex items-center gap-2 text-xs">
                        <input
                          type="number"
                          min={1}
                          value={ss.quantity}
                          onChange={(e) => handleQuantityChange(ss.service_id, parseInt(e.target.value, 10))}
                          className="h-7 w-14 rounded border bg-background px-1 text-center text-xs"
                        />
                        <span className="flex-1">{svc?.name ?? "Unknown"}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(ss.service_id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim() || selectedServices.length === 0}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
