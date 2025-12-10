"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { updateSalon } from "@/lib/services/salons-service";

export default function BrandingSettingsPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  
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

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");

  // Load current theme data
  useEffect(() => {
    if (salon?.theme) {
      setPrimaryColor(salon.theme.primary || "#3b82f6");
      setSecondaryColor(salon.theme.secondary || "#8b5cf6");
      setFontFamily(salon.theme.font || "Inter");
      setLogoUrl(salon.theme.logo_url || "");
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
        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          font: fontFamily,
          logo_url: logoUrl || undefined,
        },
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving branding settings:", err);
      setError(t.error || "Failed to save settings");
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
        <div>
          <h3 className="text-lg font-semibold mb-2">{t.brandingTitle}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t.brandingDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
                className="max-w-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Main brand color used throughout the booking page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#8b5cf6"
                className="max-w-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Secondary accent color
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <select
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Font family for the booking page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              URL to your salon logo (will be displayed on the booking page)
            </p>
          </div>
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
