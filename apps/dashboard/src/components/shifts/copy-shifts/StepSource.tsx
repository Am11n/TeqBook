import { Building2, ChevronRight } from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import type { CopyShiftsTranslations } from "./types";

interface StepSourceProps {
  employees: { id: string; full_name: string }[];
  employeeStats: Map<string, { hours: number; days: number }>;
  locale: string;
  t: CopyShiftsTranslations;
  onSelect: (type: "employee" | "openingHours", employeeId?: string) => void;
}

export function StepSource({ employees, employeeStats, locale, t, onSelect }: StepSourceProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSelect("openingHours")}
        className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{t.copyFromOpeningHours}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t.copyFromEmployee}</span>
        </div>
      </div>

      {employees.map((emp, empIndex) => {
        const accent = getEmployeeAccentFullByIndex(empIndex);
        const stats = employeeStats.get(emp.id);
        const hasShifts = stats && stats.hours > 0;

        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelect("employee", emp.id)}
            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring ${
              !hasShifts ? "opacity-60" : ""
            }`}
          >
            <div className={`h-3 w-3 rounded-full shrink-0 ${accent.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{emp.full_name}</p>
              {hasShifts ? (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {stats.hours}t &middot; {stats.days} {t.daysWorking}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">{t.copyNoShiftsHint}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
