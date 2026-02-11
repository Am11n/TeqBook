"use client";

import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

type EntityLinkProps = {
  /** Entity type */
  type: "salon" | "user";
  /** Entity UUID */
  id: string | null | undefined;
  /** Display label (defaults to truncated ID) */
  label?: string | null;
  /** Additional classes */
  className?: string;
};

/**
 * Clickable link to navigate to a salon or user.
 * Navigates to the relevant list page with a highlight query param
 * so the page can auto-open the drawer for this entity.
 */
export function EntityLink({ type, id, label, className }: EntityLinkProps) {
  const router = useRouter();

  if (!id) {
    return <span className="text-muted-foreground">-</span>;
  }

  const displayLabel = label || `${id.slice(0, 8)}...`;
  const href = type === "salon" ? `/salons?highlight=${id}` : `/users?highlight=${id}`;
  const Icon = type === "salon" ? Building2 : User;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        router.push(href);
      }}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{displayLabel}</span>
    </button>
  );
}
