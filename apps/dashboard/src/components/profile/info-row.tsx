import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfoRowProps = {
  label: string;
  value: ReactNode;
  action?: ReactNode;
  className?: string;
};

/**
 * Reusable component for displaying label-value pairs
 * Used in profile and settings pages
 */
export function InfoRow({ label, value, action, className }: InfoRowProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {action && <div>{action}</div>}
      </div>
      <div className="text-base">{value}</div>
    </div>
  );
}

