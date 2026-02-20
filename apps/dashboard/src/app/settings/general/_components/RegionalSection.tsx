"use client";

import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { getCommonTimezones } from "@/lib/utils/timezone";
import { CURRENCIES } from "@/lib/utils/currencies";
import { formatPrice } from "@/lib/utils/services/services-utils";

interface RegionalSectionProps {
  currency: string;
  timezone: string;
  appLocale: string;
  t: Record<string, string | undefined>;
  onChangeField: (field: string, value: string) => void;
}

export function RegionalSection({
  currency,
  timezone,
  appLocale,
  t,
  onChangeField,
}: RegionalSectionProps) {
  return (
    <SettingsSection
      title={t.localizationTitle ?? "Localization"}
      description={t.localizationDescription ?? "Used across bookings, invoices and reports."}
      layout="rows"
    >
      <FormRow label={t.currencyLabel ?? "Currency"} htmlFor="currency">
        <DialogSelect
          value={currency}
          onChange={(v) => onChangeField("currency", v)}
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
        />
        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
          Preview: {formatPrice(125000, appLocale, currency)}
        </p>
      </FormRow>

      <FormRow label={t.timezoneLabel ?? "Timezone"} htmlFor="timezone">
        <DialogSelect
          value={timezone}
          onChange={(v) => onChangeField("timezone", v)}
          options={getCommonTimezones().map((tz) => ({ value: tz.value, label: tz.label }))}
        />
      </FormRow>
    </SettingsSection>
  );
}
