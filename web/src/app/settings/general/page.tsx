"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { updateSalon } from "@/lib/services/salons-service";
import { updateProfile } from "@/lib/services/profiles-service";

export default function GeneralSettingsPage() {
  const { locale, setLocale } = useLocale();
  const { salon, profile, user } = useCurrentSalon();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [salonName, setSalonName] = useState("");
  const [salonType, setSalonType] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>("en");
  const [userPreferredLanguage, setUserPreferredLanguage] = useState<string>("en");
  const [userRole, setUserRole] = useState<string>("owner");

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

  // Load current salon data
  useEffect(() => {
    if (salon) {
      setSalonName(salon.name || "");
      setSalonType(salon.salon_type || "");
      setWhatsappNumber(salon.whatsapp_number || "");
      setSupportedLanguages(salon.supported_languages || ["en", "nb"]);
      setDefaultLanguage(salon.default_language || salon.preferred_language || "en");
    }
    if (profile) {
      setUserPreferredLanguage(profile.preferred_language || salon?.preferred_language || "en");
      setUserRole(profile.role || "owner");
    }
  }, [salon, profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: updateError } = await updateSalon(salon.id, {
        name: salonName,
        salon_type: salonType || null,
        whatsapp_number: whatsappNumber || null,
        supported_languages: supportedLanguages.length > 0 ? supportedLanguages : null,
        default_language: defaultLanguage || null,
      });

      if (updateError) {
        setError(updateError);
        setSaving(false);
        return;
      }

      // Update user profile preferred_language if changed
      if (user?.id && userPreferredLanguage !== profile?.preferred_language) {
        const { error: profileError } = await updateProfile(user.id, {
          preferred_language: userPreferredLanguage || null,
        });

        if (profileError) {
          setError(profileError);
          setSaving(false);
          return;
        }

        // Update locale if user changed their preferred language
        if (userPreferredLanguage && userPreferredLanguage !== locale) {
          setLocale(userPreferredLanguage as AppLocale);
        }
      }

      setSaved(true);
      // Refresh salon data by reloading the page or refetching
      window.location.reload();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(t.error);
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="salonName" className="text-sm font-medium">
            {t.salonNameLabel}
          </label>
          <Input
            id="salonName"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            required
            className="max-w-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="salonType" className="text-sm font-medium">
            {t.salonTypeLabel}
          </label>
          <select
            id="salonType"
            value={salonType}
            onChange={(e) => setSalonType(e.target.value)}
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select type...</option>
            <option value="barber">Barber</option>
            <option value="nails">Nails</option>
            <option value="massage">Massage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="whatsappNumber" className="text-sm font-medium">
            {t.whatsappNumberLabel}
          </label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder={t.whatsappNumberPlaceholder}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            {t.whatsappNumberHint}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.supportedLanguagesLabel}
          </label>
          <div className="max-w-md space-y-2">
            {(["nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"] as const).map((lang) => {
              const langLabels: Record<typeof lang, string> = {
                nb: "🇳🇴 Norsk",
                en: "🇬🇧 English",
                ar: "🇸🇦 العربية",
                so: "🇸🇴 Soomaali",
                ti: "🇪🇷 ትግርኛ",
                am: "🇪🇹 አማርኛ",
                tr: "🇹🇷 Türkçe",
                pl: "🇵🇱 Polski",
                vi: "🇻🇳 Tiếng Việt",
                tl: "🇵🇭 Tagalog",
                zh: "🇨🇳 中文",
                fa: "🇮🇷 فارسی",
                dar: "🇦🇫 دری (Dari)",
                ur: "🇵🇰 اردو",
                hi: "🇮🇳 हिन्दी",
              };
              return (
                <label key={lang} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={supportedLanguages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSupportedLanguages([...supportedLanguages, lang]);
                      } else {
                        setSupportedLanguages(supportedLanguages.filter((l) => l !== lang));
                        // If unchecking default language, set to first remaining language or 'en'
                        if (defaultLanguage === lang) {
                          const remaining = supportedLanguages.filter((l) => l !== lang);
                          setDefaultLanguage(remaining.length > 0 ? remaining[0] : "en");
                        }
                      }
                    }}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{langLabels[lang]}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {t.supportedLanguagesHint}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="defaultLanguage" className="text-sm font-medium">
            {t.defaultLanguageLabel}
          </label>
          <select
            id="defaultLanguage"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {supportedLanguages.length === 0 ? (
              <option value="en">🇬🇧 English</option>
            ) : (
              supportedLanguages.map((lang) => {
                const langLabels: Record<string, string> = {
                  nb: "🇳🇴 Norsk",
                  en: "🇬🇧 English",
                  ar: "🇸🇦 العربية",
                  so: "🇸🇴 Soomaali",
                  ti: "🇪🇷 ትግርኛ",
                  am: "🇪🇹 አማርኛ",
                  tr: "🇹🇷 Türkçe",
                  pl: "🇵🇱 Polski",
                  vi: "🇻🇳 Tiếng Việt",
                  tl: "🇵🇭 Tagalog",
                  zh: "🇨🇳 中文",
                  fa: "🇮🇷 فارسی",
                  dar: "🇦🇫 دری (Dari)",
                  ur: "🇵🇰 اردو",
                  hi: "🇮🇳 हिन्दी",
                };
                return (
                  <option key={lang} value={lang}>
                    {langLabels[lang] || lang}
                  </option>
                );
              })
            )}
          </select>
          <p className="text-xs text-muted-foreground">
            {t.defaultLanguageHint}
          </p>
        </div>

        {/* User Profile Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-base font-semibold">Din profil</h3>
          
          <div className="space-y-2">
            <label htmlFor="userPreferredLanguage" className="text-sm font-medium">
              {t.userPreferredLanguageLabel}
            </label>
            <select
              id="userPreferredLanguage"
              value={userPreferredLanguage}
              onChange={(e) => setUserPreferredLanguage(e.target.value)}
              className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {(["nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi"] as const).map((lang) => {
                const langLabels: Record<typeof lang, string> = {
                  nb: "🇳🇴 Norsk",
                  en: "🇬🇧 English",
                  ar: "🇸🇦 العربية",
                  so: "🇸🇴 Soomaali",
                  ti: "🇪🇷 ትግርኛ",
                  am: "🇪🇹 አማርኛ",
                  tr: "🇹🇷 Türkçe",
                  pl: "🇵🇱 Polski",
                  vi: "🇻🇳 Tiếng Việt",
                  tl: "🇵🇭 Tagalog",
                  zh: "🇨🇳 中文",
                  fa: "🇮🇷 فارسی",
                  dar: "🇦🇫 دری (Dari)",
                  ur: "🇵🇰 اردو",
                  hi: "🇮🇳 हिन्दी",
                };
                return (
                  <option key={lang} value={lang}>
                    {langLabels[lang]}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-muted-foreground">
              {t.userPreferredLanguageHint}
            </p>
          </div>

          {/* User Role Section */}
          <div className="space-y-2">
            <label htmlFor="userRole" className="text-sm font-medium">
              Your Role
            </label>
            <select
              id="userRole"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Your role determines what features you can access in the dashboard.
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
  );
}

