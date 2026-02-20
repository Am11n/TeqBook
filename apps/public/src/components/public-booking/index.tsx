"use client";

import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { BookingHeader } from "./BookingHeader";
import { usePublicBooking } from "./usePublicBooking";
import type { PublicBookingPageProps } from "./types";

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const {
    salon, services, employees, loading, error, successMessage,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    saving, locale, setLocale, t,
    handleLoadSlots, handleSubmitBooking,
  } = usePublicBooking(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loadingSalon}</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <EmptyState
            title={t.unavailableTitle}
            description={error ?? t.unavailableDescription}
          />
        </div>
      </div>
    );
  }

  const primaryColor = salon.theme?.primary || "#3b82f6";
  const fontFamily = salon.theme?.font || "Inter";

  return (
    <div 
      className="flex min-h-screen flex-col bg-background"
      style={{ fontFamily } as React.CSSProperties}
    >
      <BookingHeader
        salon={salon}
        locale={locale}
        setLocale={setLocale}
        headerSubtitle={t.headerSubtitle}
        payInSalonBadge={t.payInSalonBadge}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">{t.step1Title}</h2>
            <p className="text-xs text-muted-foreground">{t.step1Description}</p>
          </div>

          <form onSubmit={handleLoadSlots} className="space-y-4">
            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="service">{t.serviceLabel}</label>
              <DialogSelect
                value={serviceId}
                onChange={setServiceId}
                required
                placeholder={t.servicePlaceholder}
                options={[
                  { value: "", label: t.servicePlaceholder },
                  ...services.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="employee">{t.employeeLabel}</label>
              <DialogSelect
                value={employeeId}
                onChange={setEmployeeId}
                required
                placeholder={t.employeePlaceholder}
                options={[
                  { value: "", label: t.employeePlaceholder },
                  ...employees.map((emp) => ({ value: emp.id, label: emp.full_name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="date">{t.dateLabel}</label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canLoadSlots || loadingSlots}
              style={{ backgroundColor: primaryColor, color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}dd`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
            >
              {loadingSlots ? t.loadingSlots : t.loadSlots}
            </Button>
          </form>

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="slot">{t.step2Label}</label>
            <DialogSelect
              value={selectedSlot}
              onChange={setSelectedSlot}
              required
              placeholder={slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder}
              options={[
                { value: "", label: slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder },
                ...slots.map((slot) => ({ value: slot.start, label: slot.label })),
              ]}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">{t.step3Title}</h2>
            <p className="text-xs text-muted-foreground">{t.step3Description}</p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_name">{t.nameLabel}</label>
              <Input id="customer_name" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_email">{t.emailLabel}</label>
              <Input id="customer_email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder={t.emailPlaceholder} />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_phone">{t.phoneLabel}</label>
              <Input id="customer_phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t.phonePlaceholder} />
            </div>

            {error && <p className="text-sm text-red-500" aria-live="polite">{error}</p>}
            {successMessage && <p className="text-sm text-emerald-600" aria-live="polite">{successMessage}</p>}

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={!selectedSlot || !customerName || saving}
              style={{ backgroundColor: primaryColor, color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}dd`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
            >
              {saving ? t.submitSaving : t.submitLabel}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">{t.payInfo}</p>
        </section>
      </main>
    </div>
  );
}
