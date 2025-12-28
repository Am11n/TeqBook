"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementsCardProps {
  translations: {
    announcements: string;
    announcementWalkIn: string;
    announcementLanguages: string;
    announcementDashboardUpdate: string;
    viewAllUpdates: string;
  };
}

export function AnnouncementsCard({ translations }: AnnouncementsCardProps) {
  return (
    <div className="group mt-8 rounded-2xl bg-card/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shadow-[0_2px_8px_rgba(29,78,216,0.15)] transition-transform group-hover:scale-110">
          <Info className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{translations.announcements}</h2>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <p className="text-sm text-foreground">{translations.announcementWalkIn}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <p className="text-sm text-foreground">{translations.announcementLanguages}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <p className="text-sm text-foreground">{translations.announcementDashboardUpdate}</p>
        </div>
      </div>

      <Button asChild variant="outline" className="h-9 w-full">
        <Link href="#">{translations.viewAllUpdates}</Link>
      </Button>
    </div>
  );
}

