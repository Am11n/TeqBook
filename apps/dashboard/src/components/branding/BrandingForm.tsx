"use client";

import { FormEvent } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/form/Field";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Upload, X, Eye } from "lucide-react";
import type { BrandingPreset } from "@/lib/utils/branding/branding-utils";
import type { ThemePackDefinition } from "@teqbook/shared/branding";

interface BrandingFormProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  setLogoUrl: (url: string) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  themePackId: string;
  setThemePackId: (value: string) => void;
  backgroundMode: "default" | "solid" | "soft_gradient";
  setBackgroundMode: (value: "default" | "solid" | "soft_gradient") => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  gradientStart: string;
  setGradientStart: (value: string) => void;
  gradientEnd: string;
  setGradientEnd: (value: string) => void;
  gradientAngle: string;
  setGradientAngle: (value: string) => void;
  gradientDirection: "top_bottom" | "left_right" | "diagonal" | "custom";
  setGradientDirection: (value: "top_bottom" | "left_right" | "diagonal" | "custom") => void;
  surfaceStyle: "soft" | "elevated" | "flat";
  setSurfaceStyle: (value: "soft" | "elevated" | "flat") => void;
  buttonStyle: "rounded" | "soft" | "sharp";
  setButtonStyle: (value: "rounded" | "soft" | "sharp") => void;
  slotStyle: "minimal" | "pill" | "card";
  setSlotStyle: (value: "minimal" | "pill" | "card") => void;
  headerStyle: "compact" | "standard" | "branded";
  setHeaderStyle: (value: "compact" | "standard" | "branded") => void;
  themePacks: readonly ThemePackDefinition[];
  isStarterPlan: boolean;
  uploadingLogo: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  presets: BrandingPreset[];
  onApplyPreset: (preset: BrandingPreset) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  saving: boolean;
  error: string | null;
  saved: boolean;
  showPreview: boolean;
  onShowPreview: () => void;
  translations: {
    brandingTitle: string;
    brandingDescription: string;
    saved: string;
    saving: string;
    saveButton: string;
  };
}

export function BrandingForm({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  fontFamily,
  setFontFamily,
  setLogoUrl,
  logoPreview,
  setLogoPreview,
  themePackId,
  setThemePackId,
  backgroundMode,
  setBackgroundMode,
  backgroundColor,
  setBackgroundColor,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  gradientAngle,
  setGradientAngle,
  gradientDirection,
  setGradientDirection,
  surfaceStyle,
  setSurfaceStyle,
  buttonStyle,
  setButtonStyle,
  slotStyle,
  setSlotStyle,
  headerStyle,
  setHeaderStyle,
  themePacks,
  isStarterPlan,
  uploadingLogo,
  fileInputRef,
  presets,
  onApplyPreset,
  onLogoUpload,
  onSubmit,
  saving,
  error,
  saved,
  showPreview,
  onShowPreview,
  translations,
}: BrandingFormProps) {
  function isPresetSelected(preset: BrandingPreset): boolean {
    return (
      preset.primary.toLowerCase() === primaryColor.toLowerCase()
      && preset.secondary.toLowerCase() === secondaryColor.toLowerCase()
      && preset.font === fontFamily
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{translations.brandingTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {isStarterPlan
              ? "TeqBook Standard Branding is active. Upgrade to customize branding."
              : translations.brandingDescription}
          </p>
        </div>
        {!showPreview && (
          <Button type="button" variant="outline" onClick={onShowPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Show Preview
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Field label="Theme Pack" htmlFor="themePack">
          <DialogSelect
            value={themePackId}
            onChange={setThemePackId}
            className="max-w-md"
            disabled={isStarterPlan}
            options={themePacks.map((pack) => ({
              value: pack.id,
              label: pack.name,
            }))}
          />
        </Field>

        {isStarterPlan && (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            Upgrade to Pro or Business to unlock Theme Packs and branding overrides.
          </div>
        )}

        {/* Preset Themes */}
        <div className="space-y-2">
          <Label>Preset Themes</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onApplyPreset(preset)}
                disabled={isStarterPlan}
                className="rounded-lg border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: isPresetSelected(preset) ? "hsl(var(--primary))" : "hsl(var(--border))",
                  backgroundColor: isPresetSelected(preset) ? "color-mix(in srgb, hsl(var(--primary)) 8%, white)" : "hsl(var(--card))",
                  boxShadow: isPresetSelected(preset) ? "0 0 0 1px color-mix(in srgb, hsl(var(--primary)) 55%, transparent)" : "none",
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{preset.name}</span>
                  {isPresetSelected(preset) ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Selected</span>
                  ) : null}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-4 w-8 rounded-sm border" style={{ backgroundColor: preset.primary }} />
                  <span className="h-4 w-8 rounded-sm border" style={{ backgroundColor: preset.secondary }} />
                </div>
                <p className="text-xs text-muted-foreground">{preset.font}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Primary Color" htmlFor="primaryColor">
            <div className="flex items-center gap-3">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={isStarterPlan}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
                disabled={isStarterPlan}
                className="max-w-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Main brand color used throughout the booking page
            </p>
          </Field>

          <Field label="Secondary Color" htmlFor="secondaryColor">
            <div className="flex items-center gap-3">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={isStarterPlan}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#8b5cf6"
                disabled={isStarterPlan}
                className="max-w-xs"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Secondary accent color</p>
          </Field>

          <Field label="Font Family" htmlFor="fontFamily">
            <DialogSelect
              value={fontFamily}
              onChange={setFontFamily}
              className="max-w-md"
              disabled={isStarterPlan}
              options={[
                { value: "Inter", label: "Inter" },
                { value: "Roboto", label: "Roboto" },
                { value: "Open Sans", label: "Open Sans" },
                { value: "Lato", label: "Lato" },
                { value: "Montserrat", label: "Montserrat" },
                { value: "Poppins", label: "Poppins" },
              ]}
            />
            <p className="text-xs text-muted-foreground mt-1">Font family for the booking page</p>
          </Field>

          <Field label="Page Background" htmlFor="backgroundMode">
            <div className="space-y-3">
              <DialogSelect
                value={backgroundMode}
                onChange={(value) => setBackgroundMode(value as "default" | "solid" | "soft_gradient")}
                className="max-w-md"
                disabled={isStarterPlan}
                options={[
                  { value: "default", label: "Default" },
                  { value: "solid", label: "Solid color" },
                  { value: "soft_gradient", label: "Soft gradient" },
                ]}
              />
              {backgroundMode === "solid" && (
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    disabled={isStarterPlan}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    disabled={isStarterPlan}
                    className="max-w-xs"
                  />
                </div>
              )}
              {backgroundMode === "soft_gradient" && (
                <div className="space-y-3">
                  <DialogSelect
                    value={gradientDirection}
                    onChange={(value) => setGradientDirection(value as "top_bottom" | "left_right" | "diagonal" | "custom")}
                    className="max-w-md"
                    disabled={isStarterPlan}
                    options={[
                      { value: "top_bottom", label: "Top -> Bottom" },
                      { value: "left_right", label: "Left -> Right" },
                      { value: "diagonal", label: "Diagonal" },
                      { value: "custom", label: "Custom" },
                    ]}
                  />
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      disabled={isStarterPlan}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      disabled={isStarterPlan}
                      className="max-w-xs"
                      placeholder="#dbeafe"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      disabled={isStarterPlan}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      disabled={isStarterPlan}
                      className="max-w-xs"
                      placeholder="#f5f6f8"
                    />
                  </div>
                  {gradientDirection === "custom" && (
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(e.target.value)}
                      disabled={isStarterPlan}
                      className="max-w-xs"
                      placeholder="180"
                    />
                  )}
                </div>
              )}
            </div>
          </Field>

          <Field label="Surface Style" htmlFor="surfaceStyle">
            <DialogSelect
              value={surfaceStyle}
              onChange={(value) => setSurfaceStyle(value as "soft" | "elevated" | "flat")}
              className="max-w-md"
              disabled={isStarterPlan}
              options={[
                { value: "soft", label: "Soft" },
                { value: "elevated", label: "Elevated" },
                { value: "flat", label: "Flat" },
              ]}
            />
          </Field>

          <Field label="Button Style" htmlFor="buttonStyle">
            <DialogSelect
              value={buttonStyle}
              onChange={(value) => setButtonStyle(value as "rounded" | "soft" | "sharp")}
              className="max-w-md"
              disabled={isStarterPlan}
              options={[
                { value: "rounded", label: "Rounded" },
                { value: "soft", label: "Soft" },
                { value: "sharp", label: "Sharp" },
              ]}
            />
          </Field>

          <Field label="Slot Style" htmlFor="slotStyle">
            <DialogSelect
              value={slotStyle}
              onChange={(value) => setSlotStyle(value as "minimal" | "pill" | "card")}
              className="max-w-md"
              disabled={isStarterPlan}
              options={[
                { value: "minimal", label: "Minimal" },
                { value: "pill", label: "Pill" },
                { value: "card", label: "Card" },
              ]}
            />
          </Field>

          <Field label="Header Style" htmlFor="headerStyle">
            <DialogSelect
              value={headerStyle}
              onChange={(value) => setHeaderStyle(value as "compact" | "standard" | "branded")}
              className="max-w-md"
              disabled={isStarterPlan}
              options={[
                { value: "compact", label: "Compact" },
                { value: "standard", label: "Standard" },
                { value: "branded", label: "Branded" },
              ]}
            />
          </Field>

          <Field label="Logo" htmlFor="logo">
            <div className="space-y-3">
              {logoPreview && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    sizes="128px"
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
                  onChange={onLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo || isStarterPlan}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a logo file (max 5MB, PNG/JPG recommended)
            </p>
          </Field>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {saved && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {translations.saved}
          </div>
        )}

        <Button type="submit" disabled={saving || isStarterPlan} className="w-full max-w-md">
          {saving ? translations.saving : translations.saveButton}
        </Button>
      </form>
    </Card>
  );
}

