import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="text-sm font-medium tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-2 space-y-1">
          {title && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground sm:text-[13px]">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}


