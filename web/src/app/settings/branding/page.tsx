"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { updateSalon } from "@/lib/services/salons-service";
import { uploadLogo } from "@/lib/services/storage-service";
import { Upload, X, Eye } from "lucide-react";
import Image from "next/image";
import { BookingPreview } from "@/components/booking-preview";

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default colors for user's custom theme (not design tokens)
  // These are customizable by the user for their salon branding
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Preset themes
  const presets = [
    {
      name: "Default",
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      font: "Inter",
    },
    {
      name: "Elegant",
      primary: "#1f2937",
      secondary: "#6b7280",
      font: "Montserrat",
    },
    {
      name: "Vibrant",
      primary: "#f59e0b",
      secondary: "#ef4444",
      font: "Poppins",
    },
    {
      name: "Calm",
      primary: "#10b981",
      secondary: "#3b82f6",
      font: "Open Sans",
    },
    {
      name: "Modern",
      primary: "#6366f1",
      secondary: "#8b5cf6",
      font: "Roboto",
    },
  ];

  // Load current theme data
  useEffect(() => {
    if (salon?.theme) {
      // Use default colors if theme not set (these are user-customizable, not design tokens)
      setPrimaryColor(salon.theme.primary || "#3b82f6");
      setSecondaryColor(salon.theme.secondary || "#8b5cf6");
      setFontFamily(salon.theme.font || "Inter");
      setLogoUrl(salon.theme.logo_url || "");
      if (salon.theme.logo_url) {
        setLogoPreview(salon.theme.logo_url);
      }
    }
  }, [salon]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !salon?.id) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const { data, error: uploadError } = await uploadLogo(file, salon.id);

      if (uploadError || !data) {
        setError(uploadError || "Failed to upload logo");
        setUploadingLogo(false);
        return;
      }

      setLogoUrl(data.url);
      setLogoPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  function applyPreset(preset: typeof presets[0]) {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setFontFamily(preset.font);
  }

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
    <div className="space-y-6">
      {/* Live Preview - shown first when active */}
      {showPreview && salon?.slug && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Hide Preview
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden bg-muted/50">
            <BookingPreview
              salonSlug={salon.slug}
              theme={{
                primary: primaryColor,
                secondary: secondaryColor,
                font: fontFamily,
                logo_url: logoUrl || undefined,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>
              Preview shows how your booking page will look with the current theme settings
            </span>
            <a
              href={`/book/${salon.slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open in new tab
            </a>
          </div>
        </Card>
      )}

      {/* Branding Settings Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t.brandingTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t.brandingDescription}
            </p>
          </div>
          {!showPreview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Show Preview
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Themes */}
          <div className="space-y-2">
            <Label>Preset Themes</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
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
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-3">
              {logoPreview && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-2"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => {
                      setLogoUrl("");
                      setLogoPreview(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                <span className="text-xs text-muted-foreground">or</span>
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoPreview(e.target.value || null);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="max-w-md"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a logo file or enter a URL (max 5MB, PNG/JPG recommended)
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

      {/* Show error message if preview requested but no slug */}
      {showPreview && !salon?.slug && (
        <Card className="p-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Preview is not available. Your salon needs a slug to show the preview.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              If you just created your salon, please refresh the page. If the problem persists, 
              contact support.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
