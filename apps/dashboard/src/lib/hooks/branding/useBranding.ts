import { useState, useEffect, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { updateSalon } from "@/lib/services/salons-service";
import { uploadLogo } from "@/lib/services/storage-service";
import { BRANDING_PRESETS, type BrandingPreset } from "@/lib/utils/branding/branding-utils";
import {
  THEME_PACKS,
  createThemePackSnapshot,
  type ThemePackDefinition,
  findThemePackById,
  sanitizeLogoUrl,
  validateThemeOverrides,
} from "@teqbook/shared/branding";

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
  const [themePackId, setThemePackId] = useState(THEME_PACKS[0]?.id || "");

  function resolvePackForSalon(nextSalon: typeof salon): ThemePackDefinition | null {
    const snapshotPackId = (nextSalon?.theme_pack_snapshot as { id?: string } | null)?.id;
    return (
      findThemePackById(snapshotPackId || nextSalon?.theme_pack_id || "") ||
      THEME_PACKS[0] ||
      null
    );
  }

  // Load existing branding settings
  useEffect(() => {
    if (salon) {
      const pack = resolvePackForSalon(salon);
      const overrides = (salon.theme_overrides || {}) as {
        logoUrl?: string;
        colors?: { primary?: string; secondary?: string };
        typography?: { fontFamily?: string };
      };

      setPrimaryColor(
        overrides.colors?.primary ||
        pack?.tokens.primaryColor ||
        salon.theme?.primary ||
        "#3b82f6"
      );
      setSecondaryColor(
        overrides.colors?.secondary ||
        pack?.tokens.secondaryColor ||
        salon.theme?.secondary ||
        "#8b5cf6"
      );
      setFontFamily(
        overrides.typography?.fontFamily ||
        pack?.tokens.fontFamily ||
        salon.theme?.font ||
        "Inter"
      );
      const resolvedLogo = overrides.logoUrl || salon.theme?.logo_url || "";
      setLogoUrl(resolvedLogo);
      setLogoPreview(resolvedLogo || null);
      setThemePackId(pack?.id || THEME_PACKS[0]?.id || "");
    }
  }, [salon]);

  function handleThemePackChange(nextPackId: string) {
    const pack = findThemePackById(nextPackId);
    setThemePackId(nextPackId);
    if (!pack) return;
    // Selecting a pack should show the pack baseline immediately.
    setPrimaryColor(pack.tokens.primaryColor);
    setSecondaryColor(pack.tokens.secondaryColor);
    setFontFamily(pack.tokens.fontFamily);
    setError(null);
  }

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
      const { data: uploadData, error: uploadError } = await uploadLogo(file, salon.id);
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
    if (salon.plan === "starter") {
      setError("Upgrade to Pro or Business to customize branding.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const selectedPack = findThemePackById(themePackId) || THEME_PACKS[0] || null;
      if (!selectedPack) {
        setError("No theme packs available.");
        setSaving(false);
        return;
      }

      const validatedLogoUrl = logoUrl.trim().length === 0 ? undefined : sanitizeLogoUrl(logoUrl);
      if (logoUrl.trim().length > 0 && !validatedLogoUrl) {
        setError("Logo URL must be a valid https URL.");
        setSaving(false);
        return;
      }

      const overrides = {
        logoUrl: validatedLogoUrl || undefined,
        colors: {
          primary: primaryColor !== selectedPack.tokens.primaryColor ? primaryColor : undefined,
          secondary:
            salon.plan === "business" && secondaryColor !== selectedPack.tokens.secondaryColor
              ? secondaryColor
              : undefined,
        },
        typography: {
          fontFamily: fontFamily !== selectedPack.tokens.fontFamily ? fontFamily : undefined,
        },
      };

      const overrideValidation = validateThemeOverrides(salon.plan === "business" ? "business" : "pro", overrides);
      if (!overrideValidation.ok) {
        setError(overrideValidation.issues?.join(" ") || "Invalid branding overrides.");
        setSaving(false);
        return;
      }

      const snapshot = createThemePackSnapshot(selectedPack);
      const { error: updateError } = await updateSalon(salon.id, {
        theme_pack_id: selectedPack.id,
        theme_pack_version: snapshot?.version || selectedPack.version,
        theme_pack_hash: snapshot?.hash || null,
        theme_pack_snapshot: snapshot,
        theme_overrides: overrideValidation.value || {},
        // Keep legacy theme synced for compatibility, but runtime uses snapshot + overrides.
        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          font: fontFamily,
          logo_url: validatedLogoUrl || undefined,
        },
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
    themePackId,
    setThemePackId: handleThemePackChange,
    applyPreset,
    handleLogoUpload,
    handleSubmit,
    setError,
    presets: BRANDING_PRESETS,
    themePacks: THEME_PACKS,
  };
}

