"use client";

import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import type { ResolvedSettingsMessages } from "../../_helpers/resolve-settings";

interface BookingPolicySectionProps {
  cancellationHours: number;
  defaultBufferMinutes: number;
  errors: Record<string, string>;
  t: ResolvedSettingsMessages;
  onChangeField: (field: string, value: number) => void;
}

export function BookingPolicySection({
  cancellationHours,
  defaultBufferMinutes,
  errors,
  t,
  onChangeField,
}: BookingPolicySectionProps) {
  return (
    <SettingsSection
      title={t.bookingPolicyTitle}
      description={t.bookingPolicyDescription}
      layout="rows"
    >
      <FormRow
        label={t.cancellationHoursLabel}
        htmlFor="cancellationHours"
        description={t.cancellationHoursHint}
      >
        <div className="flex items-center gap-2">
          <Input
            id="cancellationHours"
            type="number"
            min={0}
            value={cancellationHours}
            onChange={(e) => onChangeField("cancellationHours", parseInt(e.target.value) || 0)}
            className="w-20 tabular-nums"
          />
          <span className="text-sm text-muted-foreground">{t.cancellationHoursUnit}</span>
        </div>
        {errors.cancellationHours && (
          <p className="text-xs text-destructive mt-1">{errors.cancellationHours}</p>
        )}
      </FormRow>

      <FormRow
        label={t.defaultBufferLabel}
        htmlFor="defaultBufferMinutes"
        description={t.defaultBufferHint}
      >
        <div className="flex items-center gap-2">
          <Input
            id="defaultBufferMinutes"
            type="number"
            min={0}
            step={5}
            value={defaultBufferMinutes}
            onChange={(e) => onChangeField("defaultBufferMinutes", parseInt(e.target.value) || 0)}
            className="w-20 tabular-nums"
          />
          <span className="text-sm text-muted-foreground">{t.bufferMinutesUnit}</span>
        </div>
        {errors.defaultBufferMinutes && (
          <p className="text-xs text-destructive mt-1">{errors.defaultBufferMinutes}</p>
        )}
      </FormRow>
    </SettingsSection>
  );
}
