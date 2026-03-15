"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@teqbook/ui";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { fallbackAvatar, formatPrice } from "../profile-helpers";
import type { PublicTeamMember } from "../profile-types";

const LANGUAGE_LABELS: Record<string, string> = {
  nb: "Norwegian",
  no: "Norwegian",
  en: "English",
  ar: "Arabic",
  so: "Somali",
  tr: "Turkish",
  ti: "Tigrinya",
  am: "Amharic",
  pl: "Polish",
  vi: "Vietnamese",
  zh: "Chinese",
  tl: "Tagalog",
  fa: "Persian",
  dar: "Dari",
  ur: "Urdu",
  hi: "Hindi",
};

function formatLanguageLabel(codeOrName: string): string {
  const value = codeOrName.trim();
  if (!value) return "Language";
  const normalized = value.toLowerCase();
  return LANGUAGE_LABELS[normalized] || value;
}

type Props = {
  salonId: string;
  slug: string;
  bookUrl: string;
  borderColor: string;
  selectedMember: PublicTeamMember | null;
  tab: "about" | "services";
  onTabChange: (tab: "about" | "services") => void;
  onOpenChange: (open: boolean) => void;
  themeStyle: CSSProperties;
};

export function ProfileTeamDialog(props: Props) {
  const selectedMember = props.selectedMember;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedMember) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMember, props]);

  if (!selectedMember) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${selectedMember.name} profile`}
      style={props.themeStyle}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 70,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />
      <div
        className="rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] p-6 text-[var(--pb-text)] shadow-lg"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 80,
          width: "calc(100% - 2rem)",
          maxWidth: "28rem",
          maxHeight: "min(85vh, 42rem)",
          overflowY: "auto",
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-md border px-2 py-1 text-sm text-[var(--pb-muted)] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
          onClick={() => props.onOpenChange(false)}
        >
          X
        </button>

        <div className="space-y-3 pr-8">
          <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
          {selectedMember.imageUrl ? (
            <div className="h-16 w-16 overflow-hidden rounded-full bg-[var(--pb-surface)]">
              <img src={selectedMember.imageUrl} alt={selectedMember.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pb-surface)] text-lg font-semibold">
              {fallbackAvatar(selectedMember.name)}
            </div>
          )}
          <p className="text-sm text-[var(--pb-muted)]">{selectedMember.title || "Team member"}</p>
        </div>

        <Tabs
          value={props.tab}
          onValueChange={(value) => {
            props.onTabChange(value as "about" | "services");
            trackPublicEvent("switch_team_member_tab", {
              salon_id: props.salonId,
              slug: props.slug,
              cta_location: "team_modal",
              employee_id: selectedMember.id,
              tab: value,
            });
          }}
          className="mt-4"
        >
          <TabsList
            className="grid w-full grid-cols-2 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface-muted)] p-1"
            aria-label="Team member details tabs"
          >
            <TabsTrigger
              value="about"
              className="rounded-lg px-3 py-2 font-medium text-[var(--pb-muted)] transition data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
              style={
                props.tab === "about"
                  ? { backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }
                  : undefined
              }
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-lg px-3 py-2 font-medium text-[var(--pb-muted)] transition data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
              style={
                props.tab === "services"
                  ? { backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }
                  : undefined
              }
            >
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-3">
            <p className="text-sm text-[var(--pb-muted)]">
              {selectedMember.bio || `${selectedMember.name} helps customers with modern cuts and grooming.`}
            </p>
            {selectedMember.specialties.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Specialties</p>
                <p className="text-sm">{selectedMember.specialties.join(", ")}</p>
              </div>
            ) : null}
            {selectedMember.languages.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Languages</p>
                <p className="text-sm">{selectedMember.languages.map(formatLanguageLabel).join(", ")}</p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="services" className="space-y-2 pb-24 sm:pb-2">
            {selectedMember.services.length > 0 ? (
              selectedMember.services.map((service) => (
                <Link
                  key={service.id}
                  href={`${props.bookUrl}?employeeId=${encodeURIComponent(selectedMember.id)}&serviceId=${encodeURIComponent(service.id)}`}
                  className="block rounded-lg border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2"
                  style={{ borderColor: props.borderColor }}
                  onClick={() =>
                    trackPublicEvent("click_service_from_team_modal", {
                      salon_id: props.salonId,
                      slug: props.slug,
                      cta_location: "team_modal",
                      employee_id: selectedMember.id,
                      service_id: service.id,
                      tab: "services",
                    })
                  }
                >
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-[var(--pb-muted)]">
                    {service.durationMinutes ? `${service.durationMinutes} min` : "Duration on request"}
                    {formatPrice(service.priceCents) ? ` · ${formatPrice(service.priceCents)}` : ""}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--pb-muted)]">Services will be shown here.</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 -mx-6 mt-4 border-t bg-[var(--pb-surface)] px-6 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <Button
            asChild
            className="w-full"
            style={{ backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }}
          >
            <Link
              href={`${props.bookUrl}?employeeId=${encodeURIComponent(selectedMember.id)}`}
              onClick={() =>
                trackPublicEvent("click_book_from_team_modal", {
                  salon_id: props.salonId,
                  slug: props.slug,
                  cta_location: "team_modal",
                  employee_id: selectedMember.id,
                })
              }
            >
              Book with {selectedMember.name}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
