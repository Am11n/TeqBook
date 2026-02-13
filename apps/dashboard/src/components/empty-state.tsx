import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** @deprecated Use primaryAction / secondaryAction instead */
  action?: ReactNode;
  /** Primary call-to-action (e.g. "Legg til ansatt" button) */
  primaryAction?: ReactNode;
  /** Secondary call-to-action (e.g. "Les mer" link) */
  secondaryAction?: ReactNode;
  /** Optional illustration icon */
  illustration?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-5 py-8 text-sm text-muted-foreground",
        className,
      )}
    >
      {illustration && (
        <div className="text-muted-foreground/50">{illustration}</div>
      )}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs md:text-sm">{description}</p>}
      </div>
      {(primaryAction || secondaryAction || action) && (
        <div className="mt-1 flex items-center gap-2">
          {primaryAction ?? action ?? null}
          {secondaryAction ?? null}
        </div>
      )}
    </div>
  );
}
