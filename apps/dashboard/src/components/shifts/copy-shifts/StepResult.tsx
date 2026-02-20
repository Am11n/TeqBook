import { Check } from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import type { ApplyResult } from "@/lib/hooks/shifts/useCopyShifts";
import type { CopyShiftsTranslations } from "./types";

interface StepResultProps {
  result: ApplyResult;
  employees: { id: string; full_name: string }[];
  t: CopyShiftsTranslations;
}

export function StepResult({ result, employees, t }: StepResultProps) {
  const targetsWithCreated = result.perTarget.filter((r) => r.created > 0);

  return (
    <div className="space-y-4 py-2">
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-sm font-medium">
          {t.copyResultToast
            .replace("{count}", String(result.created))
            .replace("{targets}", String(targetsWithCreated.length))}
        </p>
        {result.skipped > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {t.copyResultSkipped.replace("{count}", String(result.skipped))}
          </p>
        )}
      </div>

      {result.perTarget.length > 0 && (
        <div className="space-y-1">
          {result.perTarget.map((r) => {
            const emp = employees.find((e) => e.id === r.employeeId);
            const empIndex = employees.findIndex((e) => e.id === r.employeeId);
            const accent = getEmployeeAccentFullByIndex(empIndex >= 0 ? empIndex : 0);

            return (
              <div key={r.employeeId} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${accent.dot}`} />
                <span className="flex-1 min-w-0 truncate">{emp?.full_name ?? r.employeeId}</span>
                {r.error ? (
                  <span className="text-xs text-destructive">{r.error}</span>
                ) : (
                  <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">+{r.created}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive space-y-1">
          {result.errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}
