import { type ReactNode } from "react";
import { cn } from "@teqbook/ui";

type EmptyStateProps = {
  title: string;
  description?: string;
  /** @deprecated Use primaryAction / secondaryAction instead */
  action?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  illustration?: ReactNode;
  quickStartItems?: { label: string; onClick: () => void }[];
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  illustration,
  quickStartItems,
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
      {quickStartItems && quickStartItems.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {quickStartItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="text-left text-xs text-primary hover:underline"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
