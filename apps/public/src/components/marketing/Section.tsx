type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`px-4 py-16 sm:px-6 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
};

export function SectionHeader({ title, description, badge }: SectionHeaderProps) {
  return (
    <div className="text-center">
      {badge && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600">
          {badge}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
