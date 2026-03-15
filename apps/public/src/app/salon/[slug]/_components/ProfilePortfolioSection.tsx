import type { PublicProfileClientProps } from "../profile-types";
import type { AppLocale } from "@/i18n/translations";
import { getProfilePageMessages } from "../profile-i18n";

type Props = {
  items: PublicProfileClientProps["portfolioPreview"];
  borderColor: string;
  locale: AppLocale;
};

export function ProfilePortfolioSection({ items, borderColor, locale }: Props) {
  const m = getProfilePageMessages(locale);
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{m.portfolioHeading}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-xl border" style={{ borderColor }}>
            <div className="aspect-square bg-[var(--pb-surface)]">
              <img src={item.imageUrl} alt={item.caption || m.portfolioAlt} className="h-full w-full object-cover" />
            </div>
            {item.caption ? <figcaption className="px-2 py-1.5 text-xs text-[var(--pb-muted)]">{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
