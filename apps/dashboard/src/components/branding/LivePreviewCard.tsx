"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Salon } from "@/lib/types";

interface LivePreviewCardProps {
  salon: Salon | null;
  theme: {
    primary: string;
    secondary: string;
    font: string;
    logo_url?: string;
  };
  onHide: () => void;
  previewRefreshKey?: number;
}

function buildPublicBookingPreviewUrl(salonSlug: string, previewRefreshKey = 0): string {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (typeof window !== "undefined") {
    const current = new URL(window.location.href);
    const isCurrentLocal =
      current.hostname === "localhost" ||
      current.hostname === "127.0.0.1";

    // On non-local hosts (e.g. teqbook.com), always use same-origin /book route.
    // This avoids cross-origin iframe/CSP mismatch between proxied dashboard/public apps.
    if (!isCurrentLocal) {
      return `${current.origin}/book/${salonSlug}?preview=true&refresh=${previewRefreshKey}`;
    }

    if (configuredAppUrl) {
      try {
        const configured = new URL(configuredAppUrl);
        const isConfiguredLocal =
          configured.hostname === "localhost" ||
          configured.hostname === "127.0.0.1";

        // Ignore localhost app URL on non-local pages (e.g. teqbook.com/dashboard).
        if (!(isConfiguredLocal && !isCurrentLocal)) {
          return `${configured.origin}/book/${salonSlug}?preview=true&refresh=${previewRefreshKey}`;
        }
      } catch {
        // Fall through to runtime-derived origin below.
      }
    }

    // Local dev: dashboard runs on :3002 while public runs on :3001.
    if (current.port === "3002") current.port = "3001";
    return `${current.origin}/book/${salonSlug}?preview=true&refresh=${previewRefreshKey}`;
  }

  if (configuredAppUrl) {
    return `${configuredAppUrl.replace(/\/$/, "")}/book/${salonSlug}?preview=true&refresh=${previewRefreshKey}`;
  }

  return `/book/${salonSlug}?preview=true&refresh=${previewRefreshKey}`;
}

export function LivePreviewCard({ salon, theme, onHide, previewRefreshKey = 0 }: LivePreviewCardProps) {
  if (!salon?.slug) {
    return (
      <Card className="p-6">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Preview is not available. Your salon needs a slug to show the preview.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            If you just created your salon, please refresh the page. If the problem persists, contact support.
          </p>
        </div>
      </Card>
    );
  }

  const previewUrl = buildPublicBookingPreviewUrl(salon.slug, previewRefreshKey);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const previewWidth = previewDevice === "tablet" ? "768px" : previewDevice === "mobile" ? "390px" : "100%";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Booking Theme Preview</h3>
          <p className="text-sm text-muted-foreground">
            Preview uses current form values. Live page uses saved settings.
          </p>
          {salon.plan === "starter" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Starter plan is locked to TeqBook Standard Branding. Upgrade to customize branding.
            </p>
          )}
        </div>
        <Button type="button" variant="outline" onClick={onHide}>
          <Eye className="mr-2 h-4 w-4" />
          Hide Preview
        </Button>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Button type="button" variant={previewDevice === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("desktop")}>
          Desktop
        </Button>
        <Button type="button" variant={previewDevice === "tablet" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("tablet")}>
          Tablet
        </Button>
        <Button type="button" variant={previewDevice === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("mobile")}>
          Mobile
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-muted/50">
        <div className="mx-auto transition-all duration-200" style={{ width: previewWidth, maxWidth: "100%" }}>
          <iframe
            title="Public booking live preview"
            src={previewUrl}
            className="h-[820px] w-full bg-background"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>
          This preview renders the real public booking page. Save changes to refresh branding here.
        </span>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open live page (saved)
        </a>
      </div>
    </Card>
  );
}

