"use client";

import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { Smartphone } from "lucide-react";
import type { ResolvedSettingsMessages } from "../../_helpers/resolve-settings";

interface ContactSectionProps {
  whatsappNumber: string;
  t: ResolvedSettingsMessages;
  onChangeField: (field: string, value: string) => void;
}

export function ContactSection({
  whatsappNumber,
  t,
  onChangeField,
}: ContactSectionProps) {
  return (
    <SettingsSection
      title={t.contactSectionTitle}
      description={t.contactSectionDescription}
      layout="rows"
    >
      <FormRow
        label={t.whatsappNumberLabel}
        htmlFor="whatsappNumber"
      >
        <div className="relative">
          <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => onChangeField("whatsappNumber", e.target.value)}
            placeholder={t.whatsappNumberPlaceholder}
            className="pl-9"
          />
        </div>
      </FormRow>
    </SettingsSection>
  );
}
