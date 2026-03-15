"use client";

import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { BASE_CARD_CLASS, fallbackAvatar } from "../profile-helpers";
import type { CardStyle, PublicTeamMember } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  members: PublicTeamMember[];
  cardStyle: CardStyle;
  primaryColor: string;
  onOpenMember: (memberId: string) => void;
};

export function ProfileTeamSection({ salonId, slug, members, cardStyle, primaryColor, onOpenMember }: Props) {
  if (!members.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Team</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            className={`${BASE_CARD_CLASS} group flex h-full flex-col gap-3 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--pb-shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2`}
            style={cardStyle}
            onClick={() => {
              onOpenMember(member.id);
              trackPublicEvent("click_team_member", {
                salon_id: salonId,
                slug,
                cta_location: "team_grid",
                employee_id: member.id,
              });
              trackPublicEvent("open_team_member_modal", {
                salon_id: salonId,
                slug,
                cta_location: "team_grid",
                employee_id: member.id,
              });
            }}
          >
            <div className="flex items-center gap-3">
              {member.imageUrl ? (
                <div className="h-12 w-12 overflow-hidden rounded-full bg-[var(--pb-surface)]">
                  <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                  {fallbackAvatar(member.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{member.name}</p>
                <p className="truncate text-sm capitalize text-[var(--pb-muted)]">{member.title || "Team member"}</p>
              </div>
            </div>

            <p className="line-clamp-2 text-sm text-[var(--pb-muted)]">
              {member.bio || "Experienced barber focused on precision cuts and clean grooming."}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5">
              {(member.specialties.length ? member.specialties : ["Haircut", "Grooming"]).slice(0, 2).map((tag) => (
                <span key={`${member.id}-${tag}`} className="rounded-full border px-2 py-0.5 text-xs text-[var(--pb-muted)]">
                  {tag}
                </span>
              ))}
            </div>
            <p className="inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium text-slate-700 transition group-hover:bg-slate-50">
              <span>View profile</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
