"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { SettingsLimitBar } from "@/components/settings/SettingsLimitBar";
import { Search } from "lucide-react";
import { ALL_LANGUAGES, RECOMMENDED_CODES, langLabelFn } from "./types";

interface LanguageSectionProps {
  supportedLanguages: string[];
  defaultLanguage: string;
  languageLimit: number | null;
  t: Record<string, string | undefined>;
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

  const recommended = ALL_LANGUAGES.filter((l) => RECOMMENDED_CODES.includes(l.code));
  const others = ALL_LANGUAGES.filter((l) => !RECOMMENDED_CODES.includes(l.code));

  const filter = (langs: readonly { code: string; label: string; flag: string }[]) => {
    if (!langSearch.trim()) return langs;
    const q = langSearch.toLowerCase();
    return langs.filter((l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  };

  const filteredRecommended = filter(recommended);
  const filteredOthers = filter(others);

  const isDisabled = (code: string) => {
    if (languageLimit === null) return false;
    return supportedLanguages.length >= languageLimit && !supportedLanguages.includes(code);
  };

  return (
    <SettingsSection
      title={t.bookingLanguagesTitle ?? "Booking Languages"}
      description={t.bookingLanguagesDescription ?? "Languages customers can use when booking."}
      size="lg"
      titleRight={
        languageLimit !== null ? (
          <Badge variant="outline" className="text-xs tabular-nums">
            {supportedLanguages.length}/{languageLimit}
          </Badge>
        ) : null
      }
    >
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={t.searchLanguages ?? "Search languages..."}
          value={langSearch}
          onChange={(e) => setLangSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {languageLimit !== null && (
        <SettingsLimitBar
          label={t.languagesUsed ?? "Languages used"}
          current={supportedLanguages.length}
          limit={languageLimit}
          onAction={onUpgrade}
          actionLabel={t.upgradePlan ?? "Upgrade to add more"}
        />
      )}

      {filteredRecommended.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            {t.recommendedLanguages ?? "Recommended"}
          </p>
          <div className="space-y-1">
            {filteredRecommended.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportedLanguages.includes(lang.code)}
                  disabled={isDisabled(lang.code)}
                  onChange={(e) => onToggleLanguage(lang.code, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input disabled:opacity-40"
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
            {t.moreLanguages ?? "More languages"}
          </p>
          <div className="space-y-1">
            {filteredOthers.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportedLanguages.includes(lang.code)}
                  disabled={isDisabled(lang.code)}
                  onChange={(e) => onToggleLanguage(lang.code, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input disabled:opacity-40"
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
          {t.showMoreLanguages ?? `Show more (${others.length})`}
        </button>
      )}

      <div className="mt-4 pt-3 border-t">
        <FormRow label={t.defaultLanguageLabel ?? "Default language"} htmlFor="defaultLanguage">
          <DialogSelect
            value={defaultLanguage}
            onChange={onChangeDefault}
            options={(supportedLanguages.length > 0
              ? supportedLanguages
              : ["en"]
            ).map((code) => ({ value: code, label: langLabelFn(code) }))}
          />
        </FormRow>
      </div>
    </SettingsSection>
  );
}
