import type { PublicProfileClientProps } from "../profile-types";
import type { AppLocale } from "@/i18n/translations";
import { getProfilePageMessages } from "../profile-i18n";

type Props = {
  reviewsSummary: PublicProfileClientProps["reviewsSummary"];
  borderColor: string;
  cardBackground: string;
  locale: AppLocale;
};

export function ProfileReviewsSection({ reviewsSummary, borderColor, cardBackground, locale }: Props) {
  const m = getProfilePageMessages(locale);
  if (!reviewsSummary) return null;

  return (
    <section className="space-y-3 rounded-xl border border-[var(--pb-border-soft)] p-5" style={{ borderColor, background: cardBackground }}>
      <h2 className="text-xl font-semibold">{m.reviewsHeading}</h2>
      <p className="text-sm text-[var(--pb-muted)]">
        ⭐ {reviewsSummary.ratingAverage.toFixed(1)} / 5 ({reviewsSummary.ratingCount} {m.reviewsWord})
      </p>
      <div className="space-y-3">
        {reviewsSummary.latest.map((review) => (
          <article key={review.id} className="rounded-lg border border-[var(--pb-border-soft)] p-3" style={{ borderColor }}>
            <p className="text-sm font-medium">⭐ {review.rating}/5</p>
            {review.comment ? <p className="mt-1 text-sm text-[var(--pb-muted)]">{review.comment}</p> : null}
            <p className="mt-2 text-xs text-[var(--pb-muted)]">- {review.customerName}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
