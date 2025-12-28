"use client";

import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingPreview } from "@/components/booking-preview";
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
}

export function LivePreviewCard({ salon, theme, onHide }: LivePreviewCardProps) {
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
          <p className="text-sm text-muted-foreground">
            See how your booking page will look with the current theme settings
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onHide}>
          <Eye className="mr-2 h-4 w-4" />
          Hide Preview
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-muted/50">
        <BookingPreview salonSlug={salon.slug} theme={theme} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>Preview shows how your booking page will look with the current theme settings</span>
        <a
          href={`/book/${salon.slug}?preview=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open in new tab
        </a>
      </div>
    </Card>
  );
}

