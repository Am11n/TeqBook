"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { SettingsLimitBar } from "@/components/settings/SettingsLimitBar";
import { Search } from "lucide-react";
import { LOCALE_FLAG_EMOJI, type AppLocalePickerValue } from "@teqbook/shared";
import { ALL_LANGUAGES, RECOMMENDED_CODES, langLabelFn, langLabelPlainFn } from "./types";
import {
  PROD_LOCALE_ALLOWLIST,
  clampToEnabledLocale,
} from "@/i18n/locale-policy";
import type { ResolvedSettingsMessages } from "../../_helpers/resolve-settings";

interface LanguageSectionProps {
  supportedLanguages: string[];
  defaultLanguage: string;
  languageLimit: number | null;
  t: ResolvedSettingsMessages;
  onToggleLanguage: (code: string, checked: boolean) => void;
  onChangeDefault: (code: string) => void;
  onUpgrade: () => void;
}

export function LanguageSection({
  supportedLanguages,
  defaultLanguage,
  languageLimit,
  t,
  onToggleLanguage,
  onChangeDefault,
  onUpgrade,
}: LanguageSectionProps) {
  const [langSearch, setLangSearch] = useState("");
  const [showMore, setShowMore] = useState(false);

  const enabledLanguageCodes = new Set(PROD_LOCALE_ALLOWLIST);
  const visibleLanguages = ALL_LANGUAGES.filter((l) => enabledLanguageCodes.has(clampToEnabledLocale(l.code)));
  const recommended = visibleLanguages.filter((l) => RECOMMENDED_CODES.includes(l.code));
  const others = visibleLanguages.filter((l) => !RECOMMENDED_CODES.includes(l.code));
  const effectiveSupported = supportedLanguages
    .map((code) => clampToEnabledLocale(code))
    .filter((code, index, arr) => arr.indexOf(code) === index);
  const effectiveDefaultLanguage = clampToEnabledLocale(defaultLanguage);

  const filter = (langs: readonly { code: string; label: string; flag: string }[]) => {
    if (!langSearch.trim()) return langs;
    const q = langSearch.toLowerCase();
    return langs.filter((l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  };

  const filteredRecommended = filter(recommended);
  const filteredOthers = filter(others);

  return (
    <SettingsSection
      title={t.bookingLanguagesTitle}
      description={t.bookingLanguagesDescription}
      size="lg"
      titleRight={
        languageLimit !== null ? (
          <Badge variant="outline" className="text-xs tabular-nums">
            {effectiveSupported.length}/{languageLimit}
          </Badge>
        ) : null
      }
    >
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={t.searchLanguages}
          value={langSearch}
          onChange={(e) => setLangSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {languageLimit !== null && (
        <SettingsLimitBar
          label={t.languagesUsed}
          current={effectiveSupported.length}
          limit={languageLimit}
          onAction={onUpgrade}
          actionLabel={t.upgradePlan}
        />
      )}

      {filteredRecommended.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            {t.recommendedLanguages}
          </p>
          <div className="space-y-1">
            {filteredRecommended.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={effectiveSupported.includes(clampToEnabledLocale(lang.code))}
                  onChange={(e) => onToggleLanguage(lang.code, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input"
                />
                <span className="text-sm">{lang.flag} {lang.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {(showMore || langSearch.trim()) && filteredOthers.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            {t.moreLanguages}
          </p>
          <div className="space-y-1">
            {filteredOthers.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={effectiveSupported.includes(clampToEnabledLocale(lang.code))}
                  onChange={(e) => onToggleLanguage(lang.code, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input"
                />
                <span className="text-sm">{lang.flag} {lang.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {!showMore && !langSearch.trim() && (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          {`${t.showMoreLanguages} (${others.length})`}
        </button>
      )}

      <div className="mt-4 pt-3 border-t">
        <FormRow label={t.defaultLanguageLabel} htmlFor="defaultLanguage">
          <DialogSelect
            value={effectiveDefaultLanguage}
            onChange={onChangeDefault}
            options={(effectiveSupported.length > 0
              ? effectiveSupported
              : ["en"]
            ).map((code) => {
              const flagEmoji =
                code in LOCALE_FLAG_EMOJI
                  ? LOCALE_FLAG_EMOJI[code as AppLocalePickerValue]
                  : undefined;
              return {
                value: code,
                label: langLabelPlainFn(code),
                ...(flagEmoji ? { flagEmoji } : {}),
              };
            })}
          />
        </FormRow>
      </div>
    </SettingsSection>
  );
}
