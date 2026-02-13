"use client";

import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useBranding } from "@/lib/hooks/branding/useBranding";
import { LivePreviewCard } from "@/components/branding/LivePreviewCard";
import { BrandingForm } from "@/components/branding/BrandingForm";
import { FeatureGate } from "@/components/feature-gate";

export default function BrandingSettingsPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const branding = useBranding();

  return (
    <FeatureGate feature="BRANDING" wrapInShell={false}>
    <div className="space-y-6">
      {branding.showPreview && (
        <LivePreviewCard
          salon={salon}
          theme={{
            primary: branding.primaryColor,
            secondary: branding.secondaryColor,
            font: branding.fontFamily,
            logo_url: branding.logoUrl || undefined,
          }}
          onHide={() => branding.setShowPreview(false)}
        />
      )}

      <BrandingForm
        primaryColor={branding.primaryColor}
        setPrimaryColor={branding.setPrimaryColor}
        secondaryColor={branding.secondaryColor}
        setSecondaryColor={branding.setSecondaryColor}
        fontFamily={branding.fontFamily}
        setFontFamily={branding.setFontFamily}
        logoUrl={branding.logoUrl}
        setLogoUrl={branding.setLogoUrl}
        logoPreview={branding.logoPreview}
        setLogoPreview={branding.setLogoPreview}
        uploadingLogo={branding.uploadingLogo}
        fileInputRef={branding.fileInputRef}
        presets={branding.presets}
        onApplyPreset={branding.applyPreset}
        onLogoUpload={branding.handleLogoUpload}
        onSubmit={branding.handleSubmit}
        saving={branding.saving}
        error={branding.error}
        saved={branding.saved}
        showPreview={branding.showPreview}
        onShowPreview={() => branding.setShowPreview(true)}
        translations={{
          brandingTitle: t.brandingTitle,
          brandingDescription: t.brandingDescription,
          saved: t.saved,
          saving: t.saving,
          saveButton: t.saveButton,
        }}
      />
    </div>
    </FeatureGate>
  );
}
