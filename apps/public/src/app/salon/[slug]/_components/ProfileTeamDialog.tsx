"use client";

import Link from "next/link";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@teqbook/ui";
import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { fallbackAvatar, formatPrice } from "../profile-helpers";
import type { PublicTeamMember } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  bookUrl: string;
  borderColor: string;
  selectedMember: PublicTeamMember | null;
  tab: "about" | "services";
  onTabChange: (tab: "about" | "services") => void;
  onOpenChange: (open: boolean) => void;
};

export function ProfileTeamDialog(props: Props) {
  return (
    <Dialog open={Boolean(props.selectedMember)} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        {props.selectedMember ? (
          <>
            <DialogHeader>
              <DialogTitle>{props.selectedMember.name}</DialogTitle>
            </DialogHeader>
            <Tabs
              value={props.tab}
              onValueChange={(value) => {
                props.onTabChange(value as "about" | "services");
                trackPublicEvent("switch_team_member_tab", {
                  salon_id: props.salonId,
                  slug: props.slug,
                  cta_location: "team_modal",
                  employee_id: props.selectedMember?.id,
                  tab: value,
                });
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-3">
                {props.selectedMember.imageUrl ? (
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-[var(--pb-surface)]">
                    <img src={props.selectedMember.imageUrl} alt={props.selectedMember.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--pb-surface)] text-lg font-semibold">
                    {fallbackAvatar(props.selectedMember.name)}
                  </div>
                )}
                <p className="text-sm text-[var(--pb-muted)]">{props.selectedMember.title || "Team member"}</p>
                <p className="text-sm text-[var(--pb-muted)]">
                  {props.selectedMember.bio || `${props.selectedMember.name} helps customers with modern cuts and grooming.`}
                </p>
                {props.selectedMember.specialties.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Specialties</p>
                    <p className="text-sm">{props.selectedMember.specialties.join(", ")}</p>
                  </div>
                ) : null}
                {props.selectedMember.languages.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--pb-muted)]">Languages</p>
                    <p className="text-sm">{props.selectedMember.languages.join(", ")}</p>
                  </div>
                ) : null}
              </TabsContent>
              <TabsContent value="services" className="space-y-2">
                {props.selectedMember.services.length > 0 ? (
                  props.selectedMember.services.map((service) => (
                    <Link
                      key={service.id}
                      href={`${props.bookUrl}?employeeId=${encodeURIComponent(props.selectedMember!.id)}&serviceId=${encodeURIComponent(service.id)}`}
                      className="block rounded-lg border px-3 py-2"
                      style={{ borderColor: props.borderColor }}
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
            <Link
              href={`${props.bookUrl}?employeeId=${encodeURIComponent(props.selectedMember.id)}`}
              onClick={() =>
                trackPublicEvent("click_book_from_team_modal", {
                  salon_id: props.salonId,
                  slug: props.slug,
                  cta_location: "team_modal",
                  employee_id: props.selectedMember?.id,
                })
              }
            >
              <Button className="mt-3 w-full">Book with {props.selectedMember.name}</Button>
            </Link>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
