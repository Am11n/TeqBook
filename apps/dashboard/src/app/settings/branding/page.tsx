"use client";

import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useBranding } from "@/lib/hooks/branding/useBranding";
import { LivePreviewCard } from "@/components/branding/LivePreviewCard";
import { BrandingForm } from "@/components/branding/BrandingForm";

export default function BrandingSettingsPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const branding = useBranding();
  const isStarterPlan = (salon?.plan || "starter") === "starter";

  return (
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
          previewRefreshKey={branding.previewRefreshKey}
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
        themePackId={branding.themePackId}
        setThemePackId={branding.setThemePackId}
        backgroundMode={branding.backgroundMode}
        setBackgroundMode={branding.setBackgroundMode}
        backgroundColor={branding.backgroundColor}
        setBackgroundColor={branding.setBackgroundColor}
        gradientStart={branding.gradientStart}
        setGradientStart={branding.setGradientStart}
        gradientEnd={branding.gradientEnd}
        setGradientEnd={branding.setGradientEnd}
        gradientAngle={branding.gradientAngle}
        setGradientAngle={branding.setGradientAngle}
        surfaceStyle={branding.surfaceStyle}
        setSurfaceStyle={branding.setSurfaceStyle}
        buttonStyle={branding.buttonStyle}
        setButtonStyle={branding.setButtonStyle}
        slotStyle={branding.slotStyle}
        setSlotStyle={branding.setSlotStyle}
        headerStyle={branding.headerStyle}
        setHeaderStyle={branding.setHeaderStyle}
        themePacks={branding.themePacks}
        isStarterPlan={isStarterPlan}
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
  );
}
