"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { Copy, Check } from "lucide-react";

interface SalonInfoSectionProps {
  salonName: string;
  salonType: string;
  businessAddress: string;
  orgNumber: string;
  bookingUrl: string | null;
  errors: Record<string, string>;
  t: Record<string, string | undefined>;
  onChangeField: (field: string, value: string) => void;
}

export function SalonInfoSection({
  salonName,
  salonType,
  businessAddress,
  orgNumber,
  bookingUrl,
  errors,
  t,
  onChangeField,
}: SalonInfoSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!bookingUrl) return;
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SettingsSection
      title={t.salonSectionTitle ?? "Salon Info"}
      size="lg"
      layout="rows"
    >
      <FormRow label={t.salonNameLabel ?? "Salon name"} htmlFor="salonName" required>
        <Input
          id="salonName"
          value={salonName}
          onChange={(e) => onChangeField("salonName", e.target.value)}
          required
        />
        {errors.salonName && (
          <p className="text-xs text-destructive mt-1">{errors.salonName}</p>
        )}
      </FormRow>

      <FormRow label={t.salonTypeLabel ?? "Salon type"} htmlFor="salonType">
        <DialogSelect
          value={salonType}
          onChange={(v) => onChangeField("salonType", v)}
          placeholder="Select type..."
          options={[
            { value: "barber", label: "Barber" },
            { value: "nails", label: "Nails" },
            { value: "massage", label: "Massage" },
            { value: "other", label: "Other" },
          ]}
        />
      </FormRow>

      <FormRow label={t.businessAddressLabel ?? "Business address"} htmlFor="businessAddress">
        <textarea
          id="businessAddress"
          value={businessAddress}
          onChange={(e) => onChangeField("businessAddress", e.target.value)}
          rows={2}
          placeholder={t.businessAddressPlaceholder ?? "Street, City, Postal code"}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </FormRow>

      <FormRow label={t.orgNumberLabel ?? "Org number"} htmlFor="orgNumber">
        <Input
          id="orgNumber"
          value={orgNumber}
          onChange={(e) => onChangeField("orgNumber", e.target.value)}
          placeholder={t.orgNumberPlaceholder ?? "e.g. 123 456 789"}
        />
      </FormRow>

      {bookingUrl && (
        <FormRow label={t.bookingUrlLabel ?? "Booking URL"}>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
              {bookingUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 shrink-0"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </FormRow>
      )}
    </SettingsSection>
  );
}
