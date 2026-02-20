"use client";

import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";

interface BookingPolicySectionProps {
  cancellationHours: number;
  defaultBufferMinutes: number;
  errors: Record<string, string>;
  t: Record<string, string | undefined>;
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
      title={t.bookingPolicyTitle ?? "Booking Policy"}
      description={t.bookingPolicyDescription ?? "Defaults for your booking engine."}
      layout="rows"
    >
      <FormRow
        label={t.cancellationHoursLabel ?? "Cancellation window"}
        htmlFor="cancellationHours"
        description={t.cancellationHoursHint ?? "Hours before appointment that customers can cancel."}
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
          <span className="text-sm text-muted-foreground">hours</span>
        </div>
        {errors.cancellationHours && (
          <p className="text-xs text-destructive mt-1">{errors.cancellationHours}</p>
        )}
      </FormRow>

      <FormRow
        label={t.defaultBufferLabel ?? "Buffer time"}
        htmlFor="defaultBufferMinutes"
        description={t.defaultBufferHint ?? "Global prep/cleanup time between appointments."}
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
          <span className="text-sm text-muted-foreground">min</span>
        </div>
        {errors.defaultBufferMinutes && (
          <p className="text-xs text-destructive mt-1">{errors.defaultBufferMinutes}</p>
        )}
      </FormRow>
    </SettingsSection>
  );
}
