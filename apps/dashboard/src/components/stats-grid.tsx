import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatsGridProps = {
  children: ReactNode;
  className?: string;
};

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        // 1 kolonne mobil, 2 på små skjermer, 3 på md+
        "grid-cols-1 xs:grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}


