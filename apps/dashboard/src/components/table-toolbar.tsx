import { type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type TableToolbarProps = {
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** Optional search value (controlled) */
  searchValue?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Slot for filter chips or other filter UI */
  filters?: ReactNode;
};

export function TableToolbar({
  title,
  children,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Sok...",
  filters,
}: TableToolbarProps) {
  return (
    <div className="space-y-3 border-b pb-3 mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {title ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
          ) : null}
          {onSearchChange !== undefined && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
              />
            </div>
          )}
          {children}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {filters && <div>{filters}</div>}
    </div>
  );
}
