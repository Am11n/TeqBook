"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { updateSalon } from "@/lib/services/salons-service";

export default function GeneralSettingsPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [salonName, setSalonName] = useState("");
  const [salonType, setSalonType] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

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
  const t = translations[appLocale].settings;

  // Load current salon data
  useEffect(() => {
    if (salon) {
      setSalonName(salon.name || "");
      setSalonType(salon.salon_type || "");
      setWhatsappNumber(salon.whatsapp_number || "");
    }
  }, [salon]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: updateError } = await updateSalon(salon.id, {
        name: salonName,
        salon_type: salonType || null,
        whatsapp_number: whatsappNumber || null,
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      setSaved(true);
      // Refresh salon data by reloading the page or refetching
      window.location.reload();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }

  if (!salon) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          No salon found. Please complete onboarding first.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="salonName" className="text-sm font-medium">
            {t.salonNameLabel}
          </label>
          <Input
            id="salonName"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            required
            className="max-w-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="salonType" className="text-sm font-medium">
            {t.salonTypeLabel}
          </label>
          <select
            id="salonType"
            value={salonType}
            onChange={(e) => setSalonType(e.target.value)}
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select type...</option>
            <option value="barber">Barber</option>
            <option value="nails">Nails</option>
            <option value="massage">Massage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="whatsappNumber" className="text-sm font-medium">
            {t.whatsappNumberLabel}
          </label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder={t.whatsappNumberPlaceholder}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            {t.whatsappNumberHint}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {t.saved}
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full max-w-md">
          {saving ? t.saving : t.saveButton}
        </Button>
      </form>
    </Card>
  );
}

