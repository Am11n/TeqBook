"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { XIcon } from "lucide-react";
import { Button, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@teqbook/ui";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { fallbackAvatar, formatPrice } from "../profile-helpers";
import type { PublicTeamMember } from "../profile-types";
import type { AppLocale } from "@/i18n/translations";
import { formatProfileLanguageLabel, getProfilePageMessages, PROFILE_TEAM_DIALOG_MESSAGES } from "../profile-i18n";

type Props = {
  salonId: string;
  slug: string;
  bookUrl: string;
  borderColor: string;
  selectedMember: PublicTeamMember | null;
  locale: AppLocale;
  tab: "about" | "services";
  onTabChange: (tab: "about" | "services") => void;
  onOpenChange: (open: boolean) => void;
  themeStyle: CSSProperties;
};

export function ProfileTeamDialog(props: Props) {
  const selectedMember = props.selectedMember;
  const m = PROFILE_TEAM_DIALOG_MESSAGES[props.locale] || PROFILE_TEAM_DIALOG_MESSAGES.en;
  const pageMessages = getProfilePageMessages(props.locale);
  const open = Boolean(selectedMember);
  const metaLine = useMemo(() => {
    if (!selectedMember) return "";
    const pieces: string[] = [];
    if (selectedMember.services.length > 0) pieces.push(`${selectedMember.services.length} ${m.services.toLowerCase()}`);
    if (selectedMember.languages.length > 0) pieces.push(`${selectedMember.languages.length} ${m.languages.toLowerCase()}`);
    return pieces.join(" · ");
  }, [m.languages, m.services, selectedMember]);
  const shouldScrollServices = Boolean(
    selectedMember && props.tab === "services" && selectedMember.services.length > 4
  );

  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      {selectedMember ? (
        <DialogContent
          aria-label={`${selectedMember.name} profile`}
          showCloseButton={false}
          style={props.themeStyle}
          className="!top-auto !bottom-0 !translate-y-0 !w-[calc(100%-0.75rem)] !max-w-[760px] !rounded-b-none rounded-t-3xl border-[var(--pb-border)] bg-[var(--pb-surface)] p-0 text-[var(--pb-text)] shadow-[var(--pb-shadow-card)] data-[state=open]:duration-[var(--pb-motion-standard)] data-[state=closed]:duration-[var(--pb-motion-fast)] sm:!top-[50%] sm:!bottom-auto sm:!translate-y-[-50%] sm:!rounded-3xl sm:!max-w-[760px]"
        >
          <div className="flex max-h-[92vh] flex-col sm:max-h-[86vh]">
            <DialogClose asChild>
              <button
                type="button"
                aria-label={m.closeDialog}
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--pb-text-secondary)] transition-colors duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:bg-[var(--pb-secondary-bg)] focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </DialogClose>

            <DialogHeader className="items-center border-b border-[var(--pb-divider)] px-6 pb-5 pt-9 text-center sm:px-8">
              {selectedMember.imageUrl ? (
                <div className="h-24 w-24 overflow-hidden rounded-full border border-[var(--pb-border-soft)] bg-[var(--pb-surface-muted)] shadow-[var(--pb-shadow-1)]">
                  <img src={selectedMember.imageUrl} alt={selectedMember.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold shadow-[var(--pb-shadow-1)]" style={{ backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }}>
                  {fallbackAvatar(selectedMember.name)}
                </div>
              )}
              <div className="space-y-1.5">
                <DialogTitle className="text-[1.7rem] font-semibold tracking-tight">{selectedMember.name}</DialogTitle>
                <p className="text-[0.95rem] capitalize text-[var(--pb-text-secondary)]">{selectedMember.title || m.teamMember}</p>
                {metaLine ? (
                  <p className="text-xs font-medium text-[var(--pb-text-secondary)]">{metaLine}</p>
                ) : null}
              </div>
            </DialogHeader>

            <div
              className={`px-6 pt-4 pb-24 sm:px-8 sm:pb-6 ${
                shouldScrollServices
                  ? "overflow-y-auto max-h-[min(46vh,22rem)] sm:max-h-[min(48vh,24rem)]"
                  : ""
              }`}
            >
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
                className="space-y-4"
              >
                <TabsList
                  className="grid h-auto w-full grid-cols-2 items-stretch rounded-2xl border border-[var(--pb-border-soft)] bg-[var(--pb-surface-muted)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  aria-label={m.teamMember}
                >
                  <TabsTrigger
                    value="about"
                    className="h-10 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-[var(--pb-text-secondary)] transition-[transform,background-color,color,box-shadow,border-color] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] data-[state=active]:border-[var(--pb-border-strong)] data-[state=active]:shadow-[var(--pb-shadow-1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none"
                    style={
                      props.tab === "about"
                        ? { backgroundColor: "var(--pb-bg-surface)", color: "var(--pb-text-primary)" }
                        : undefined
                    }
                  >
                    {m.about}
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="h-10 rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-[var(--pb-text-secondary)] transition-[transform,background-color,color,box-shadow,border-color] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] data-[state=active]:border-[var(--pb-border-strong)] data-[state=active]:shadow-[var(--pb-shadow-1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none"
                    style={
                      props.tab === "services"
                        ? { backgroundColor: "var(--pb-bg-surface)", color: "var(--pb-text-primary)" }
                        : undefined
                    }
                  >
                    {m.services}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-5">
                  <section className="rounded-2xl border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] p-4 sm:p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--pb-muted)]">{m.about}</p>
                    <p className="text-sm leading-6 text-[var(--pb-text-secondary)]">
                      {selectedMember.bio || `${selectedMember.name} ${m.bioFallback}`}
                    </p>
                  </section>

                  {selectedMember.specialties.length > 0 ? (
                    <section className="space-y-2.5 rounded-2xl border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pb-muted)]">{m.specialties}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.specialties.map((tag) => (
                          <span key={`${selectedMember.id}-${tag}`} className="rounded-full border border-[var(--pb-chip-border)] bg-[var(--pb-chip-bg)] px-3 py-1.5 text-xs font-medium text-[var(--pb-chip-text)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {selectedMember.languages.length > 0 ? (
                    <section className="space-y-2.5 rounded-2xl border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pb-muted)]">{m.languages}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.languages.map((language) => (
                          <span key={`${selectedMember.id}-${language}`} className="rounded-full border border-[var(--pb-chip-border)] bg-[var(--pb-chip-bg)] px-3 py-1.5 text-xs font-medium text-[var(--pb-chip-text)]">
                            {formatProfileLanguageLabel(language, props.locale)}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </TabsContent>

                <TabsContent value="services" className="space-y-2.5">
                  {selectedMember.services.length > 0 ? (
                    selectedMember.services.map((service) => (
                      <Link
                        key={service.id}
                        href={`${props.bookUrl}?employeeId=${encodeURIComponent(selectedMember.id)}&serviceId=${encodeURIComponent(service.id)}`}
                        className="group block rounded-xl border border-[var(--pb-border-soft)] bg-[var(--pb-bg-surface)] px-4 py-3.5 transition-[transform,border-color,box-shadow] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:-translate-y-0.5 hover:border-[var(--pb-border-strong)] hover:shadow-[var(--pb-shadow-1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none motion-reduce:transition-none"
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{service.name}</p>
                            <p className="text-xs text-[var(--pb-muted)]">
                              {service.durationMinutes ? `${service.durationMinutes} ${pageMessages.minuteShort}` : pageMessages.durationOnRequest}
                              {formatPrice(service.priceCents, props.locale) ? ` · ${formatPrice(service.priceCents, props.locale)}` : ""}
                            </p>
                          </div>
                          <p className="inline-flex items-center gap-1 rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2 py-1 text-xs font-medium text-[var(--pb-text-secondary)] transition-colors duration-[var(--pb-motion-fast)] group-hover:bg-[var(--pb-bg-surface)]">
                            {pageMessages.book}
                            <span aria-hidden="true" className="transition-transform duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transform-none">→</span>
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--pb-muted)]">{m.servicesEmpty}</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="sticky bottom-0 border-t border-[var(--pb-divider)] bg-[var(--pb-surface)]/95 px-6 py-4 backdrop-blur-sm sm:static sm:bg-[color-mix(in_srgb,var(--pb-bg-surface)_80%,var(--pb-surface)_20%)] sm:px-8">
              <p className="mb-2 text-center text-xs text-[var(--pb-muted)]">{pageMessages.book} {m.services.toLowerCase()}</p>
              <Button
                asChild
                className="h-11 w-full text-sm font-semibold transition-transform duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] hover:translate-y-[var(--pb-button-hover-lift)] active:translate-y-px motion-reduce:transform-none"
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
                  {m.bookWith} {selectedMember.name}
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
