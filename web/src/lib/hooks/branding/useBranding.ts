import { useState, useEffect, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateSalon } from "@/lib/services/salons-service";
import { uploadLogo } from "@/lib/services/storage-service";
import { BRANDING_PRESETS, type BrandingPreset } from "@/lib/utils/branding/branding-utils";

export function useBranding() {
  const { salon, refreshSalon } = useCurrentSalon();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Default colors for user's custom theme (not design tokens)
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Load existing branding settings
  useEffect(() => {
    if (salon) {
      setPrimaryColor(salon.branding_primary_color || "#3b82f6");
      setSecondaryColor(salon.branding_secondary_color || "#8b5cf6");
      setFontFamily(salon.branding_font_family || "Inter");
      setLogoUrl(salon.branding_logo_url || "");
      setLogoPreview(salon.branding_logo_url || null);
    }
  }, [salon]);

  function applyPreset(preset: BrandingPreset) {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setFontFamily(preset.font);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !salon?.id) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const { data: uploadData, error: uploadError } = await uploadLogo(salon.id, file);
      if (uploadError || !uploadData) {
        setError(uploadError || "Failed to upload logo");
        setUploadingLogo(false);
        return;
      }

      setLogoUrl(uploadData.url);
      setLogoPreview(uploadData.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: updateError } = await updateSalon(salon.id, {
        branding_primary_color: primaryColor,
        branding_secondary_color: secondaryColor,
        branding_font_family: fontFamily,
        branding_logo_url: logoUrl || null,
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      await refreshSalon();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    saved,
    error,
    uploadingLogo,
    showPreview,
    setShowPreview,
    fileInputRef,
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
    applyPreset,
    handleLogoUpload,
    handleSubmit,
    setError,
    presets: BRANDING_PRESETS,
  };
}

