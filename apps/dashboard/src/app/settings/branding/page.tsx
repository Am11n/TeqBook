"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useBranding } from "@/lib/hooks/branding/useBranding";
import { LivePreviewCard } from "@/components/branding/LivePreviewCard";
import { BrandingForm } from "@/components/branding/BrandingForm";
import { supabase } from "@/lib/supabase-client";
import { Card, Button, Input } from "@teqbook/ui";

type PortfolioItem = {
  id: string;
  image_url: string;
  caption: string | null;
  is_featured: boolean;
  sort_order: number | null;
};

export default function BrandingSettingsPage() {
  const { locale } = useLocale();
  const { salon } = useCurrentSalon();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const branding = useBranding();
  const isStarterPlan = (salon?.plan || "starter") === "starter";
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const canEditPortfolio = useMemo(() => Boolean(salon?.id), [salon?.id]);

  useEffect(() => {
    async function loadPortfolio() {
      if (!salon?.id) return;
      setLoadingPortfolio(true);
      setPortfolioError(null);
      const { data, error } = await supabase
        .from("portfolio")
        .select("id, image_url, caption, is_featured, sort_order")
        .eq("salon_id", salon.id)
        .is("deleted_at", null)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) {
        setPortfolioError(error.message);
      } else {
        setPortfolioItems((data || []) as PortfolioItem[]);
      }
      setLoadingPortfolio(false);
    }

    void loadPortfolio();
  }, [salon?.id]);

  async function handlePortfolioUpload(file: File) {
    if (!salon?.id) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPortfolioError("Only JPG, PNG or WebP is allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPortfolioError("Image must be 10MB or smaller.");
      return;
    }

    setUploadingPortfolio(true);
    setPortfolioError(null);
    const extension = file.name.split(".").pop() || "jpg";
    const path = `portfolio/${salon.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("salon-assets")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setPortfolioError(uploadError.message);
      setUploadingPortfolio(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("salon-assets").getPublicUrl(path);
    const imageUrl = publicUrlData.publicUrl;
    const { data: inserted, error: insertError } = await supabase
      .from("portfolio")
      .insert({
        salon_id: salon.id,
        image_url: imageUrl,
        caption: null,
        is_published: true,
      })
      .select("id, image_url, caption, is_featured, sort_order")
      .single();
    if (insertError) {
      setPortfolioError(insertError.message);
      setUploadingPortfolio(false);
      return;
    }
    setPortfolioItems((current) => [inserted as PortfolioItem, ...current].slice(0, 24));
    setUploadingPortfolio(false);
  }

  async function handlePortfolioCaptionSave(itemId: string, caption: string) {
    const { error } = await supabase.from("portfolio").update({ caption }).eq("id", itemId);
    if (error) {
      setPortfolioError(error.message);
      return;
    }
    setPortfolioItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, caption } : item))
    );
  }

  async function handlePortfolioDelete(item: PortfolioItem) {
    const { error: updateError } = await supabase
      .from("portfolio")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", item.id);
    if (updateError) {
      setPortfolioError(updateError.message);
      return;
    }

    const marker = "/salon-assets/";
    const markerIndex = item.image_url.indexOf(marker);
    if (markerIndex >= 0) {
      const storagePath = item.image_url.slice(markerIndex + marker.length);
      await supabase.storage.from("salon-assets").remove([storagePath]);
    }
    setPortfolioItems((current) => current.filter((entry) => entry.id !== item.id));
  }

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
        gradientDirection={branding.gradientDirection}
        setGradientDirection={branding.setGradientDirection}
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

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Portfolio</h3>
            <p className="text-sm text-muted-foreground">
              Upload up to 24 showcase images (JPG/PNG/WebP, max 10MB).
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={!canEditPortfolio || uploadingPortfolio}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handlePortfolioUpload(file);
                event.currentTarget.value = "";
              }}
            />
            <span className="rounded-md border px-3 py-2 text-sm font-medium">
              {uploadingPortfolio ? "Uploading..." : "Upload image"}
            </span>
          </label>
        </div>

        {portfolioError ? (
          <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{portfolioError}</p>
        ) : null}

        {loadingPortfolio ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading portfolio...</p>
        ) : portfolioItems.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No portfolio images yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onSaveCaption={handlePortfolioCaptionSave}
                onDelete={handlePortfolioDelete}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PortfolioItemCard({
  item,
  onSaveCaption,
  onDelete,
}: {
  item: PortfolioItem;
  onSaveCaption: (itemId: string, caption: string) => Promise<void>;
  onDelete: (item: PortfolioItem) => Promise<void>;
}) {
  const [captionDraft, setCaptionDraft] = useState(item.caption || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="aspect-square overflow-hidden rounded-md bg-muted">
        <img src={item.image_url} alt={item.caption || "Portfolio item"} className="h-full w-full object-cover" />
      </div>
      <Input
        value={captionDraft}
        onChange={(event) => setCaptionDraft(event.target.value)}
        placeholder="Caption..."
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={saving || deleting}
          onClick={async () => {
            setSaving(true);
            await onSaveCaption(item.id, captionDraft.trim());
            setSaving(false);
          }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={saving || deleting}
          onClick={async () => {
            setDeleting(true);
            await onDelete(item);
            setDeleting(false);
          }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
