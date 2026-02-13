"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/error-boundary";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { updateSalon } from "@/lib/services/salons-service";
import { updateProfile } from "@/lib/services/profiles-service";
import { getEffectiveLimit } from "@/lib/services/plan-limits-service";
import { useRouter } from "next/navigation";
import { logError } from "@/lib/services/logger";
import { getCommonTimezones } from "@/lib/utils/timezone";
import { CURRENCIES, getCurrencyGroups } from "@/lib/utils/currencies";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { Search } from "lucide-react";

// Shared settings components
import { SettingsGrid } from "@/components/settings/SettingsGrid";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { StickySaveBar } from "@/components/settings/StickySaveBar";
import { SettingsLimitBar } from "@/components/settings/SettingsLimitBar";
import { useSettingsForm } from "@/lib/hooks/useSettingsForm";
import { useTabGuard } from "../layout";

// ─── Language data ───────────────────────────────────

const ALL_LANGUAGES = [
  { code: "nb", label: "Norsk", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "en", label: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "so", label: "Soomaali", flag: "\u{1F1F8}\u{1F1F4}" },
  { code: "tr", label: "T\u00FCrk\u00E7e", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "ti", label: "\u1275\u130D\u122D\u129B", flag: "\u{1F1EA}\u{1F1F7}" },
  { code: "am", label: "\u12A0\u121B\u122D\u129B", flag: "\u{1F1EA}\u{1F1F9}" },
  { code: "pl", label: "Polski", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "vi", label: "Ti\u1EBFng Vi\u1EC7t", flag: "\u{1F1FB}\u{1F1F3}" },
  { code: "zh", label: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "tl", label: "Tagalog", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "fa", label: "\u0641\u0627\u0631\u0633\u06CC", flag: "\u{1F1EE}\u{1F1F7}" },
  { code: "dar", label: "\u062F\u0631\u06CC (Dari)", flag: "\u{1F1E6}\u{1F1EB}" },
  { code: "ur", label: "\u0627\u0631\u062F\u0648", flag: "\u{1F1F5}\u{1F1F0}" },
  { code: "hi", label: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
] as const;

const RECOMMENDED_CODES = ["nb", "en", "ar", "so", "tr"];

// ─── Form values type ────────────────────────────────

type GeneralFormValues = {
  salonName: string;
  salonType: string;
  whatsappNumber: string;
  currency: string;
  timezone: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  userPreferredLanguage: string;
};

// ─── Select class (reused) ───────────────────────────

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

// ─── Component ───────────────────────────────────────

export default function GeneralSettingsPage() {
  const { locale, setLocale } = useLocale();
  const { salon, profile, user, refreshSalon } = useCurrentSalon();
  const router = useRouter();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const { registerDirtyState } = useTabGuard();

  // Language limit
  const [languageLimit, setLanguageLimit] = useState<number | null>(null);

  // Language search & show-more
  const [langSearch, setLangSearch] = useState("");
  const [showMoreLangs, setShowMoreLangs] = useState(false);

  // User role (read-only display)
  const userRole = profile?.role || "owner";

  // Load language limit
  useEffect(() => {
    async function loadLimit() {
      if (!salon?.id || !salon?.plan) return;
      const { limit } = await getEffectiveLimit(salon.id, salon.plan, "languages");
      setLanguageLimit(limit);
    }
    loadLimit();
  }, [salon?.id, salon?.plan]);

  // Build initial values from salon/profile
  const initialValues = useMemo<GeneralFormValues>(() => ({
    salonName: salon?.name || "",
    salonType: salon?.salon_type || "",
    whatsappNumber: salon?.whatsapp_number || "",
    currency: salon?.currency || "NOK",
    timezone: salon?.timezone || "UTC",
    supportedLanguages: salon?.supported_languages || ["en", "nb"],
    defaultLanguage: salon?.default_language || salon?.preferred_language || "en",
    userPreferredLanguage: profile?.preferred_language || salon?.preferred_language || "en",
  }), [salon, profile]);

  // Validation
  const validate = useCallback((v: GeneralFormValues) => {
    const errs: Record<string, string> = {};
    if (!v.salonName.trim()) errs.salonName = "Salon name is required";
    return errs;
  }, []);

  // Save handler
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
    }, salon.plan);

    if (updateError) throw new Error(updateError);

    // Update user preferred language if changed
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

  // Register dirty state with tab guard
  useEffect(() => {
    registerDirtyState("general", form.isDirty);
  }, [form.isDirty, registerDirtyState]);

  // Reset default language if removed from supported
  useEffect(() => {
    const supported = form.values.supportedLanguages;
    if (supported.length > 0 && !supported.includes(form.values.defaultLanguage)) {
      form.setValue("defaultLanguage", supported[0] || "en");
    }
    if (supported.length > 0 && !supported.includes(form.values.userPreferredLanguage)) {
      form.setValue("userPreferredLanguage", form.values.defaultLanguage || supported[0] || "en");
    }
  }, [form.values.supportedLanguages]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Language list filtering ───────────────────────

  const recommended = ALL_LANGUAGES.filter((l) => RECOMMENDED_CODES.includes(l.code));
  const others = ALL_LANGUAGES.filter((l) => !RECOMMENDED_CODES.includes(l.code));

  const filterLangs = (langs: readonly { code: string; label: string; flag: string }[]) => {
    if (!langSearch.trim()) return langs;
    const q = langSearch.toLowerCase();
    return langs.filter(
      (l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
    );
  };

  const filteredRecommended = filterLangs(recommended);
  const filteredOthers = filterLangs(others);

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

  const isLangDisabled = (code: string) => {
    if (languageLimit === null) return false;
    return (
      form.values.supportedLanguages.length >= languageLimit &&
      !form.values.supportedLanguages.includes(code)
    );
  };

  // ─── Render ────────────────────────────────────────

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

  const langLabelFn = (code: string) => {
    const lang = ALL_LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.flag} ${lang.label}` : code;
  };

  return (
    <ErrorBoundary>
      <SettingsGrid
        aside={
          <div className="space-y-6">
            {/* ─── Booking Languages ──────────────── */}
            <SettingsSection
              title={t.bookingLanguagesTitle ?? "Booking Languages"}
              description={t.bookingLanguagesDescription ?? "Languages customers can use when booking."}
              titleRight={
                languageLimit !== null ? (
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {form.values.supportedLanguages.length}/{languageLimit}
                  </Badge>
                ) : null
              }
            >
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t.searchLanguages ?? "Search languages..."}
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {/* Limit bar */}
              {languageLimit !== null && (
                <SettingsLimitBar
                  label={t.languagesUsed ?? "Languages used"}
                  current={form.values.supportedLanguages.length}
                  limit={languageLimit}
                  onAction={() => router.push("/settings/billing")}
                  actionLabel={t.upgradePlan ?? "Upgrade plan"}
                />
              )}

              {/* Limit reached text */}
              {languageLimit !== null &&
                form.values.supportedLanguages.length >= languageLimit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.languageLimitReached ?? "Language limit reached. Upgrade to add more."}
                  </p>
                )}

              {/* Recommended */}
              {filteredRecommended.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    {t.recommendedLanguages ?? "Recommended"}
                  </p>
                  <div className="space-y-1">
                    {filteredRecommended.map((lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center gap-2 py-0.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.values.supportedLanguages.includes(lang.code)}
                          disabled={isLangDisabled(lang.code)}
                          onChange={(e) => toggleLanguage(lang.code, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-input disabled:opacity-40"
                        />
                        <span className="text-sm">
                          {lang.flag} {lang.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* More languages */}
              {(showMoreLangs || langSearch.trim()) && filteredOthers.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    {t.moreLanguages ?? "More languages"}
                  </p>
                  <div className="space-y-1">
                    {filteredOthers.map((lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center gap-2 py-0.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.values.supportedLanguages.includes(lang.code)}
                          disabled={isLangDisabled(lang.code)}
                          onChange={(e) => toggleLanguage(lang.code, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-input disabled:opacity-40"
                        />
                        <span className="text-sm">
                          {lang.flag} {lang.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {!showMoreLangs && !langSearch.trim() && (
                <button
                  type="button"
                  onClick={() => setShowMoreLangs(true)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  {t.showMoreLanguages ?? `Show ${others.length} more languages`}
                </button>
              )}

              {/* Default Language */}
              <div className="mt-4 pt-3 border-t">
                <FormRow label={t.defaultLanguageLabel} htmlFor="defaultLanguage">
                  <select
                    id="defaultLanguage"
                    value={form.values.defaultLanguage}
                    onChange={(e) => form.setValue("defaultLanguage", e.target.value)}
                    className={selectClass}
                  >
                    {(form.values.supportedLanguages.length > 0
                      ? form.values.supportedLanguages
                      : ["en"]
                    ).map((code) => (
                      <option key={code} value={code}>
                        {langLabelFn(code)}
                      </option>
                    ))}
                  </select>
                </FormRow>
              </div>
            </SettingsSection>

            {/* ─── Your Profile ───────────────────── */}
            <SettingsSection
              title={t.yourProfileTitle ?? "Your Profile"}
              layout="rows"
            >
              <FormRow
                label={t.dashboardLanguageLabel ?? "Dashboard language"}
                htmlFor="userPreferredLanguage"
                description={t.dashboardLanguageHint ?? "Language used in your dashboard. Can differ from the booking language."}
              >
                <select
                  id="userPreferredLanguage"
                  value={form.values.userPreferredLanguage}
                  onChange={(e) => form.setValue("userPreferredLanguage", e.target.value)}
                  className={selectClass}
                >
                  {(form.values.supportedLanguages.length > 0
                    ? form.values.supportedLanguages
                    : ["en"]
                  ).map((code) => (
                    <option key={code} value={code}>
                      {langLabelFn(code)}
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label={t.yourRoleLabel ?? "Your Role"}>
                <Badge variant="outline" className="capitalize">
                  {userRole}
                </Badge>
              </FormRow>
            </SettingsSection>
          </div>
        }
      >
        {/* ─── Left column: Salon + Localization ───── */}
        <div className="space-y-6">
          {/* Salon section */}
          <SettingsSection
            title={t.salonSectionTitle ?? "Salon"}
            description={t.salonSectionDescription ?? "Basic information about your salon."}
            layout="rows"
          >
            <FormRow
              label={t.salonNameLabel}
              htmlFor="salonName"
              required
            >
              <Input
                id="salonName"
                value={form.values.salonName}
                onChange={(e) => form.setValue("salonName", e.target.value)}
                required
              />
              {form.errors.salonName && (
                <p className="text-xs text-destructive mt-1">{form.errors.salonName}</p>
              )}
            </FormRow>

            <FormRow label={t.salonTypeLabel} htmlFor="salonType">
              <select
                id="salonType"
                value={form.values.salonType}
                onChange={(e) => form.setValue("salonType", e.target.value)}
                className={selectClass}
              >
                <option value="">Select type...</option>
                <option value="barber">Barber</option>
                <option value="nails">Nails</option>
                <option value="massage">Massage</option>
                <option value="other">Other</option>
              </select>
            </FormRow>

            <FormRow
              label={t.whatsappNumberLabel}
              htmlFor="whatsappNumber"
              description={t.whatsappNumberHint}
            >
              <Input
                id="whatsappNumber"
                type="tel"
                value={form.values.whatsappNumber}
                onChange={(e) => form.setValue("whatsappNumber", e.target.value)}
                placeholder={t.whatsappNumberPlaceholder}
              />
            </FormRow>
          </SettingsSection>

          {/* Localization section */}
          <SettingsSection
            title={t.localizationTitle ?? "Localization"}
            description={t.localizationDescription ?? "Currency and timezone for your salon."}
            layout="rows"
          >
            <FormRow
              label={t.currencyLabel ?? "Currency"}
              htmlFor="currency"
              description={t.currencyDescription ?? "Prices across your salon will be displayed in this currency."}
            >
              <select
                id="currency"
                value={form.values.currency}
                onChange={(e) => form.setValue("currency", e.target.value)}
                className={selectClass}
              >
                {getCurrencyGroups().map((group) => (
                  <optgroup key={group} label={group}>
                    {CURRENCIES.filter((c) => c.group === group).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Preview: {formatPrice(125000, appLocale, form.values.currency)}
              </p>
            </FormRow>

            <FormRow
              label={t.timezoneLabel ?? "Salon Timezone"}
              htmlFor="timezone"
              description={t.timezoneDescription ?? "All times in your salon (bookings, calendar, emails) use this timezone."}
            >
              <select
                id="timezone"
                value={form.values.timezone}
                onChange={(e) => form.setValue("timezone", e.target.value)}
                className={selectClass}
              >
                {getCommonTimezones().map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </FormRow>
          </SettingsSection>
        </div>
      </SettingsGrid>

      {/* Sticky save bar */}
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
