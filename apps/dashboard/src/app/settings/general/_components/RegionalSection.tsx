"use client";

import { useMemo } from "react";
import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { getCommonTimezones } from "@/lib/utils/timezone";
import { CURRENCIES } from "@/lib/utils/currencies";
import { formatPrice } from "@/lib/utils/services/services-utils";
import type { ResolvedSettingsMessages } from "../../_helpers/resolve-settings";

interface RegionalSectionProps {
  currency: string;
  timezone: string;
  timeFormat: string;
  appLocale: string;
  t: ResolvedSettingsMessages;
  onChangeField: (field: string, value: string) => void;
}

export function RegionalSection({
  currency,
  timezone,
  timeFormat,
  appLocale,
  t,
  onChangeField,
}: RegionalSectionProps) {
  const timeFormatOptions = useMemo(
    () => [
      { value: "24h", label: t.timeFormat24OptionLabel },
      { value: "12h", label: t.timeFormat12OptionLabel },
    ],
    [t.timeFormat24OptionLabel, t.timeFormat12OptionLabel],
  );

  return (
    <SettingsSection
      title={t.localizationTitle}
      description={t.localizationDescription}
      layout="rows"
    >
      <FormRow label={t.currencyLabel} htmlFor="currency">
        <DialogSelect
          value={currency}
          onChange={(v) => onChangeField("currency", v)}
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
        />
        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
          Preview: {formatPrice(125000, appLocale, currency)}
        </p>
      </FormRow>

      <FormRow label={t.timezoneLabel} htmlFor="timezone">
        <DialogSelect
          value={timezone}
          onChange={(v) => onChangeField("timezone", v)}
          options={getCommonTimezones().map((tz) => ({ value: tz.value, label: tz.label }))}
        />
      </FormRow>

      <FormRow label={t.timeFormatLabel} htmlFor="timeFormat">
        <DialogSelect
          value={timeFormat}
          onChange={(v) => onChangeField("timeFormat", v)}
          options={timeFormatOptions}
        />
      </FormRow>
    </SettingsSection>
  );
}
