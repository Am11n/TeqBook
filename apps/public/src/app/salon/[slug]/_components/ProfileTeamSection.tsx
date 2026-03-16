"use client";

import { trackPublicEvent } from "@/components/public-booking/publicBookingTelemetry";
import { BASE_CARD_CLASS, fallbackAvatar } from "../profile-helpers";
import { getProfilePageMessages } from "../profile-i18n";
import type { AppLocale } from "@/i18n/translations";
import type { CardStyle, PublicTeamMember } from "../profile-types";

type Props = {
  salonId: string;
  slug: string;
  members: PublicTeamMember[];
  cardStyle: CardStyle;
  primaryColor: string;
  primaryTextColor: string;
  openMemberId: string | null;
  locale: AppLocale;
  onOpenMember: (member: PublicTeamMember, trigger: HTMLButtonElement) => void;
};

export function ProfileTeamSection({
  salonId,
  slug,
  members,
  cardStyle,
  primaryColor,
  primaryTextColor,
  openMemberId,
  locale,
  onOpenMember,
}: Props) {
  const m = getProfilePageMessages(locale);
  if (!members.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{m.teamHeading}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openMemberId === member.id}
            aria-label={`${m.openProfileFor} ${member.name}`}
            className={`${BASE_CARD_CLASS} group flex h-full min-h-[220px] flex-col gap-3 p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-out)] hover:-translate-y-[3px] hover:border-[var(--pb-border-strong)] hover:shadow-[var(--pb-shadow-card)] active:translate-y-px focus-visible:outline-none focus-visible:ring-[var(--pb-focus-width)] focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transform-none motion-reduce:transition-none`}
            style={cardStyle}
            onClick={(event) => {
              onOpenMember(member, event.currentTarget);
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
                <div className="h-12 w-12 overflow-hidden rounded-full border border-[var(--pb-border-soft)] bg-[var(--pb-surface)] shadow-[var(--pb-shadow-1)]">
                  <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--pb-border-soft)] font-semibold shadow-[var(--pb-shadow-1)]"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  {fallbackAvatar(member.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-5 text-[var(--pb-text-primary)]">{member.name}</p>
                <p className="mt-0.5 inline-flex w-fit rounded-full border border-[var(--pb-secondary-border)] bg-[var(--pb-secondary-bg)] px-2 py-0.5 text-[11px] font-medium capitalize tracking-[0.01em] text-[var(--pb-secondary-text)]">
                  {member.title || m.teamMember}
                </p>
              </div>
            </div>

            <p className="line-clamp-2 text-sm leading-[1.45] text-[var(--pb-muted)]">
              {member.bio || m.teamBioFallback}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-[var(--pb-divider)] pt-2.5">
              {(member.specialties.length ? member.specialties : [m.defaultSpecialty1, m.defaultSpecialty2]).slice(0, 2).map((tag) => (
                <span key={`${member.id}-${tag}`} className="rounded-full border border-[var(--pb-chip-border)] bg-[var(--pb-chip-bg)] px-2.5 py-1 text-xs font-medium text-[var(--pb-chip-text)] transition-colors duration-[var(--pb-motion-fast)] group-hover:border-[var(--pb-border-strong)]">
                  {tag}
                </span>
              ))}
            </div>
            <p
              className="inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:-translate-y-px group-hover:shadow-[var(--pb-shadow-1)]"
              style={{
                borderColor: "color-mix(in srgb, var(--pb-primary) 22%, var(--pb-secondary-border) 78%)",
                backgroundColor: "color-mix(in srgb, var(--pb-primary) 10%, var(--pb-secondary-bg) 90%)",
                color: "color-mix(in srgb, var(--pb-text-primary) 84%, var(--pb-primary) 16%)",
              }}
            >
              <span>{m.viewProfile}</span>
              <span aria-hidden="true" className="transition-transform duration-[var(--pb-motion-fast)] ease-[var(--pb-ease-out)] group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none">→</span>
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
