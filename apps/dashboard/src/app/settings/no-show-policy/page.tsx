"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { getPolicy, savePolicy } from "@/lib/services/noshow-policy-service";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { resolveSettings } from "@/app/settings/_helpers/resolve-settings";

const DEFAULT_POLICY = {
  max_strikes: 3,
  auto_block: false,
  warning_threshold: 2,
  reset_after_days: null as number | null,
};

export default function NoShowPolicyPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = resolveSettings(translations[appLocale].settings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [maxStrikes, setMaxStrikes] = useState(DEFAULT_POLICY.max_strikes);
  const [autoBlock, setAutoBlock] = useState(DEFAULT_POLICY.auto_block);
  const [warningThreshold, setWarningThreshold] = useState(DEFAULT_POLICY.warning_threshold);
  const [resetAfterDays, setResetAfterDays] = useState<string>("");

  useEffect(() => {
    if (!salon?.id) return;
    setLoading(true);
    getPolicy(salon.id).then(({ data }) => {
      if (data) {
        setMaxStrikes(data.max_strikes);
        setAutoBlock(data.auto_block);
        setWarningThreshold(data.warning_threshold);
        setResetAfterDays(data.reset_after_days != null ? String(data.reset_after_days) : "");
      }
      setLoading(false);
    });
  }, [salon?.id]);

  const handleSave = async () => {
    if (!salon?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: saveError } = await savePolicy(salon.id, {
      max_strikes: maxStrikes,
      auto_block: autoBlock,
      warning_threshold: warningThreshold,
      reset_after_days: resetAfterDays.trim() ? parseInt(resetAfterDays, 10) : null,
    });

    setSaving(false);
    if (saveError) {
      setError(saveError);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8">{t.noShowPolicyLoading}</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-sm font-semibold">{t.noShowPolicyPageTitle}</h3>
        <p className="text-xs text-muted-foreground mt-1">{t.noShowPolicyPageDescription}</p>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
      )}
      {success && <p className="text-sm text-green-600">{t.noShowPolicySaveSuccess}</p>}

      <div className="space-y-4">
        <div>
          <label htmlFor="maxStrikes" className="text-xs font-medium">
            {t.noShowPolicyMaxStrikesLabel}
          </label>
          <input
            id="maxStrikes"
            type="number"
            min={1}
            max={20}
            value={maxStrikes}
            onChange={(e) => setMaxStrikes(parseInt(e.target.value, 10) || 1)}
            className="mt-1 h-9 w-full max-w-[120px] rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t.noShowPolicyMaxStrikesHint}</p>
        </div>

        <div>
          <label htmlFor="warningThreshold" className="text-xs font-medium">
            {t.noShowPolicyWarningThresholdLabel}
          </label>
          <input
            id="warningThreshold"
            type="number"
            min={1}
            max={maxStrikes}
            value={warningThreshold}
            onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10) || 1)}
            className="mt-1 h-9 w-full max-w-[120px] rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            {t.noShowPolicyWarningThresholdHint}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="autoBlock"
            type="checkbox"
            checked={autoBlock}
            onChange={(e) => setAutoBlock(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="autoBlock" className="text-xs font-medium">
            {t.noShowPolicyAutoBlockLabel}
          </label>
        </div>

        <div>
          <label htmlFor="resetAfterDays" className="text-xs font-medium">
            {t.noShowPolicyResetDaysLabel}
          </label>
          <input
            id="resetAfterDays"
            type="number"
            min={1}
            placeholder={t.noShowPolicyResetNeverPlaceholder}
            value={resetAfterDays}
            onChange={(e) => setResetAfterDays(e.target.value)}
            className="mt-1 h-9 w-full max-w-[120px] rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t.noShowPolicyResetDaysHint}</p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? t.noShowPolicySaving : t.noShowPolicySaveButton}
      </Button>
    </div>
  );
}
