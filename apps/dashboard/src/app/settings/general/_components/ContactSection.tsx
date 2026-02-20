"use client";

import { Input } from "@/components/ui/input";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { Smartphone } from "lucide-react";

interface ContactSectionProps {
  whatsappNumber: string;
  t: Record<string, string | undefined>;
  onChangeField: (field: string, value: string) => void;
}

export function ContactSection({
  whatsappNumber,
  t,
  onChangeField,
}: ContactSectionProps) {
  return (
    <SettingsSection
      title={t.contactSectionTitle ?? "Contact"}
      description={t.contactSectionDescription ?? "Shown on your booking page."}
      layout="rows"
    >
      <FormRow
        label={t.whatsappNumberLabel ?? "WhatsApp number"}
        htmlFor="whatsappNumber"
      >
        <div className="relative">
          <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => onChangeField("whatsappNumber", e.target.value)}
            placeholder={t.whatsappNumberPlaceholder ?? "+47 123 45 678"}
            className="pl-9"
          />
        </div>
      </FormRow>
    </SettingsSection>
  );
}
