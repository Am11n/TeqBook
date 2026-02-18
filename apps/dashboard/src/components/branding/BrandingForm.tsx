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

interface BrandingFormProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
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
  logoUrl,
  setLogoUrl,
  logoPreview,
  setLogoPreview,
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
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{translations.brandingTitle}</h3>
          <p className="text-sm text-muted-foreground">{translations.brandingDescription}</p>
        </div>
        {!showPreview && (
          <Button type="button" variant="outline" onClick={onShowPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Show Preview
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
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
                onClick={() => onApplyPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
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
            <p className="text-xs text-muted-foreground mt-1">Secondary accent color</p>
          </Field>

          <Field label="Font Family" htmlFor="fontFamily">
            <DialogSelect
              value={fontFamily}
              onChange={setFontFamily}
              className="max-w-md"
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

          <Field label="Logo" htmlFor="logo">
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
                  onChange={onLogoUpload}
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
            <p className="text-xs text-muted-foreground mt-1">
              Upload a logo file or enter a URL (max 5MB, PNG/JPG recommended)
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

        <Button type="submit" disabled={saving} className="w-full max-w-md">
          {saving ? translations.saving : translations.saveButton}
        </Button>
      </form>
    </Card>
  );
}

