import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusPillProps = {
  status: "verified" | "unverified" | "enabled" | "disabled" | "active" | "inactive";
  label: string;
  className?: string;
};

/**
 * Reusable component for displaying status badges
 * Used in profile and security pages
 */
export function StatusPill({ status, label, className }: StatusPillProps) {
  const isPositive = status === "verified" || status === "enabled" || status === "active";
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        isPositive
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isPositive ? (
        <CheckCircle className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

