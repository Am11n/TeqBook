"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DialogSelect } from "@/components/ui/dialog-select";
import { ErrorBoundary } from "@/components/error-boundary";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { updateSalon } from "@/lib/services/salons-service";
import { updateProfile } from "@/lib/services/profiles-service";
import { getEffectiveLimit } from "@/lib/services/plan-limits-service";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { StickySaveBar } from "@/components/settings/StickySaveBar";
import { useSettingsForm } from "@/lib/hooks/useSettingsForm";
import { useTabGuard } from "../layout";
import { type GeneralFormValues, langLabelFn } from "./_components/types";
import { SalonInfoSection } from "./_components/SalonInfoSection";
import { LanguageSection } from "./_components/LanguageSection";
import { RegionalSection } from "./_components/RegionalSection";
import { BookingPolicySection } from "./_components/BookingPolicySection";
import { ContactSection } from "./_components/ContactSection";

export default function GeneralSettingsPage() {
  const { locale, setLocale } = useLocale();
  const { salon, profile, user, refreshSalon } = useCurrentSalon();
  const router = useRouter();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const { registerDirtyState, reportLastSaved } = useTabGuard();

  const [languageLimit, setLanguageLimit] = useState<number | null>(null);
  const userRole = profile?.role || "owner";

  useEffect(() => {
    async function loadLimit() {
      if (!salon?.id || !salon?.plan) return;
      const { limit } = await getEffectiveLimit(salon.id, salon.plan, "languages");
      setLanguageLimit(limit);
    }
    loadLimit();
  }, [salon?.id, salon?.plan]);

  const initialValues = useMemo<GeneralFormValues>(() => ({
    salonName: salon?.name || "",
    salonType: salon?.salon_type || "",
    whatsappNumber: salon?.whatsapp_number || "",
    currency: salon?.currency || "NOK",
    timezone: salon?.timezone || "UTC",
    timeFormat: salon?.time_format || "24h",
    supportedLanguages: salon?.supported_languages || ["en", "nb"],
    defaultLanguage: salon?.default_language || salon?.preferred_language || "en",
    userPreferredLanguage: profile?.preferred_language || salon?.preferred_language || "en",
    businessAddress: salon?.business_address || "",
    orgNumber: salon?.org_number || "",
    cancellationHours: salon?.cancellation_hours ?? 24,
    defaultBufferMinutes: salon?.default_buffer_minutes ?? 0,
  }), [salon, profile]);

  const validate = useCallback((v: GeneralFormValues) => {
    const errs: Record<string, string> = {};
    if (!v.salonName.trim()) errs.salonName = "Salon name is required";
    if (v.cancellationHours < 0) errs.cancellationHours = "Must be 0 or more";
    if (v.defaultBufferMinutes < 0) errs.defaultBufferMinutes = "Must be 0 or more";
    return errs;
  }, []);

  const handleSave = useCallback(async (v: GeneralFormValues) => {
    if (!salon?.id) throw new Error("No salon");

    const { error: updateError } = await updateSalon(salon.id, {
      name: v.salonName,
      salon_type: v.salonType || null,
      whatsapp_number: v.whatsappNumber || null,
      supported_languages: v.supportedLanguages.length > 0 ? v.supportedLanguages : null,
      default_language: v.defaultLanguage || null,
      timezone: v.timezone || "UTC",
      currency: v.currency || "NOK",
      time_format: v.timeFormat || "24h",
      business_address: v.businessAddress || null,
      org_number: v.orgNumber || null,
      cancellation_hours: v.cancellationHours,
      default_buffer_minutes: v.defaultBufferMinutes,
    }, salon.plan);

    if (updateError) throw new Error(updateError);

    if (user?.id && v.userPreferredLanguage !== profile?.preferred_language) {
      const { error: profileError } = await updateProfile(user.id, {
        preferred_language: v.userPreferredLanguage || null,
      });
      if (profileError) throw new Error(profileError);
    }

    await refreshSalon();

    if (v.userPreferredLanguage && v.userPreferredLanguage !== locale) {
      setLocale(v.userPreferredLanguage as AppLocale);
    }
  }, [salon, user, profile, locale, setLocale, refreshSalon]);

  const form = useSettingsForm<GeneralFormValues>({
    initialValues,
    onSave: handleSave,
    validate,
  });

  useEffect(() => {
    registerDirtyState("general", form.isDirty);
  }, [form.isDirty, registerDirtyState]);

  useEffect(() => {
    if (form.lastSavedAt) reportLastSaved(form.lastSavedAt);
  }, [form.lastSavedAt, reportLastSaved]);

  useEffect(() => {
    const supported = form.values.supportedLanguages;
    if (supported.length > 0 && !supported.includes(form.values.defaultLanguage)) {
      form.setValue("defaultLanguage", supported[0] || "en");
    }
    if (supported.length > 0 && !supported.includes(form.values.userPreferredLanguage)) {
      form.setValue("userPreferredLanguage", form.values.defaultLanguage || supported[0] || "en");
    }
  }, [form.values.supportedLanguages]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLanguage = (code: string, checked: boolean) => {
    const current = form.values.supportedLanguages;
    if (checked) {
      form.setValue("supportedLanguages", [...current, code]);
    } else {
      const next = current.filter((c) => c !== code);
      form.setValue("supportedLanguages", next);
      if (form.values.defaultLanguage === code) {
        form.setValue("defaultLanguage", next[0] || "en");
      }
    }
  };

  const bookingUrl = typeof window !== "undefined" && salon?.slug
    ? `${window.location.origin}/book/${salon.slug}`
    : null;

  const status = (() => {
    if (!form.values.salonName.trim()) return { ok: false, msg: t.missingSettingsName ?? "Salon name is required" };
    if (form.values.supportedLanguages.length === 0) return { ok: false, msg: t.missingBookingLanguage ?? "Missing booking language" };
    return { ok: true, msg: t.allSettingsConfigured ?? "All core settings configured" };
  })();

  if (!salon) {
    return (
      <ErrorBoundary>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            No salon found. Please complete onboarding first.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex items-center gap-1.5 mb-5">
        {status.ok ? (
          <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
        )}
        <span className={`text-xs ${status.ok ? "text-muted-foreground" : "text-yellow-600"}`}>
          {status.msg}
        </span>
      </div>

      <SettingsGrid
        aside={
          <LanguageSection
            supportedLanguages={form.values.supportedLanguages}
            defaultLanguage={form.values.defaultLanguage}
            languageLimit={languageLimit}
            t={t as Record<string, string | undefined>}
            onToggleLanguage={toggleLanguage}
            onChangeDefault={(v) => form.setValue("defaultLanguage", v)}
            onUpgrade={() => router.push("/settings/billing")}
          />
        }
        footer={
          <SettingsSection
            title={t.yourProfileTitle ?? "Your Profile"}
            layout="rows"
            className="bg-muted/20"
          >
            <FormRow
              label={t.dashboardLanguageLabel ?? "Dashboard language"}
              htmlFor="userPreferredLanguage"
            >
              <DialogSelect
                value={form.values.userPreferredLanguage}
                onChange={(v) => form.setValue("userPreferredLanguage", v)}
                options={(form.values.supportedLanguages.length > 0
                  ? form.values.supportedLanguages
                  : ["en"]
                ).map((code) => ({ value: code, label: langLabelFn(code) }))}
              />
            </FormRow>

            <FormRow label={t.yourRoleLabel ?? "Role"}>
              <Badge variant="outline" className="capitalize">{userRole}</Badge>
            </FormRow>

            <FormRow label={t.emailLabel ?? "Email"}>
              <span className="text-sm text-muted-foreground">{user?.email ?? "—"}</span>
            </FormRow>
          </SettingsSection>
        }
      >
        <div className="space-y-6">
          <SalonInfoSection
            salonName={form.values.salonName}
            salonType={form.values.salonType}
            businessAddress={form.values.businessAddress}
            orgNumber={form.values.orgNumber}
            bookingUrl={bookingUrl}
            errors={form.errors}
            t={t as Record<string, string | undefined>}
            onChangeField={(field, value) => form.setValue(field as keyof GeneralFormValues, value)}
          />

          <RegionalSection
            currency={form.values.currency}
            timezone={form.values.timezone}
            timeFormat={form.values.timeFormat}
            appLocale={appLocale}
            t={t as Record<string, string | undefined>}
            onChangeField={(field, value) => form.setValue(field as keyof GeneralFormValues, value)}
          />

          <ContactSection
            whatsappNumber={form.values.whatsappNumber}
            t={t as Record<string, string | undefined>}
            onChangeField={(field, value) => form.setValue(field as keyof GeneralFormValues, value)}
          />

          <BookingPolicySection
            cancellationHours={form.values.cancellationHours}
            defaultBufferMinutes={form.values.defaultBufferMinutes}
            errors={form.errors}
            t={t as Record<string, string | undefined>}
            onChangeField={(field, value) => form.setValue(field as keyof GeneralFormValues, value as unknown as string)}
          />
        </div>
      </SettingsGrid>

      <StickySaveBar
        isDirty={form.isDirty}
        isValid={form.isValid}
        saving={form.saving}
        saveError={form.saveError}
        lastSavedAt={form.lastSavedAt}
        onSave={form.save}
        onDiscard={form.discard}
        onRetry={form.retrySave}
      />
    </ErrorBoundary>
  );
}
