"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FormRow } from "@/components/settings/FormRow";
import { Copy, Check, ExternalLink } from "lucide-react";

interface SalonInfoSectionProps {
  salonName: string;
  salonType: string;
  businessAddress: string;
  orgNumber: string;
  description: string;
  coverImage: string;
  uploadingCoverImage: boolean;
  coverImageUploadError: string | null;
  instagramUrl: string;
  websiteUrl: string;
  publicProfileUrl: string | null;
  directBookingUrl: string | null;
  errors: Record<string, string>;
  t: Record<string, string | undefined>;
  onChangeField: (field: string, value: string) => void;
  onCoverImageUpload: (file: File) => void;
}

export function SalonInfoSection({
  salonName,
  salonType,
  businessAddress,
  orgNumber,
  description,
  coverImage,
  uploadingCoverImage,
  coverImageUploadError,
  instagramUrl,
  websiteUrl,
  publicProfileUrl,
  directBookingUrl,
  errors,
  t,
  onChangeField,
  onCoverImageUpload,
}: SalonInfoSectionProps) {
  const [copiedKey, setCopiedKey] = useState<"profile" | "booking" | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const trackDashboardLinkEvent = (eventName: string) => {
    const maybeGtag = (window as Window & { gtag?: (command: string, event: string, payload?: Record<string, unknown>) => void }).gtag;
    if (typeof maybeGtag === "function") {
      maybeGtag("event", eventName, {});
    }
  };

  const handleCopyUrl = async (url: string, key: "profile" | "booking") => {
    await navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (key === "profile") trackDashboardLinkEvent("copy_profile_link");
    if (key === "booking") trackDashboardLinkEvent("copy_direct_booking_link");
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

      <FormRow label="Public description" htmlFor="description">
        <textarea
          id="description"
          value={description}
          onChange={(e) => onChangeField("description", e.target.value)}
          rows={3}
          placeholder="Tell customers what makes your salon unique..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </FormRow>

      <FormRow label="Cover image" htmlFor="coverImage">
        <div className="space-y-3">
          {coverImage ? (
            <div className="relative h-28 w-full max-w-sm overflow-hidden rounded-md border bg-muted">
              <Image
                src={coverImage}
                alt="Cover preview"
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-28 w-full max-w-sm items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              No cover image uploaded
            </div>
          )}

          <input
            ref={coverInputRef}
            id="coverImage"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onCoverImageUpload(file);
              event.currentTarget.value = "";
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCoverImage}
            >
              {uploadingCoverImage ? "Uploading..." : "Upload cover image"}
            </Button>
            {coverImage ? (
              <Button type="button" variant="ghost" onClick={() => onChangeField("coverImage", "")}>
                Remove
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 10MB)</p>
          {coverImageUploadError ? (
            <p className="text-xs text-destructive">{coverImageUploadError}</p>
          ) : null}
        </div>
      </FormRow>

      <FormRow label="Instagram URL" htmlFor="instagramUrl">
        <Input
          id="instagramUrl"
          value={instagramUrl}
          onChange={(e) => onChangeField("instagramUrl", e.target.value)}
          placeholder="https://instagram.com/..."
        />
      </FormRow>

      <FormRow label="Website URL" htmlFor="websiteUrl">
        <Input
          id="websiteUrl"
          value={websiteUrl}
          onChange={(e) => onChangeField("websiteUrl", e.target.value)}
          placeholder="https://..."
        />
      </FormRow>

      {(publicProfileUrl || directBookingUrl) && (
        <FormRow label="Public links">
          <div className="space-y-3">
            {publicProfileUrl ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  Public profile
                  <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Recommended for Instagram bio
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                    {publicProfileUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={() => handleCopyUrl(publicProfileUrl, "profile")}
                  >
                    {copiedKey === "profile" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    asChild
                  >
                    <a
                      href={publicProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackDashboardLinkEvent("open_profile_link_from_dashboard")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}

            {directBookingUrl ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Direct booking</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                    {directBookingUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={() => handleCopyUrl(directBookingUrl, "booking")}
                  >
                    {copiedKey === "booking" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    asChild
                  >
                    <a
                      href={directBookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackDashboardLinkEvent("open_booking_link_from_dashboard")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">Suggested bio text: Book your next appointment here</p>
          </div>
        </FormRow>
      )}

    </SettingsSection>
  );
}
