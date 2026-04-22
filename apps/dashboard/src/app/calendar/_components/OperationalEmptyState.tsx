import type { ScheduleSegment } from "@/lib/types";
import { useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";

interface OperationalEmptyStateProps {
  segments: ScheduleSegment[];
}

export function OperationalEmptyState({ segments }: OperationalEmptyStateProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = useMemo(
    () => resolveNamespace("calendar", translations[appLocale].calendar),
    [appLocale],
  );

  const isClosed =
    segments.length === 0 ||
    segments.every((s) => s.segment_type === "closed");

  if (isClosed) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t.noEmployeesTitle}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t.noEmployeesDescription}
        </p>
      </div>
    );
  }

  const workingMinutes = segments
    .filter((s) => s.segment_type === "working")
    .reduce((sum, s) => {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time).getTime();
      return sum + (end - start) / 60000;
    }, 0);

  const bookedMinutes = segments
    .filter((s) => s.segment_type === "booking")
    .reduce((sum, s) => {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time).getTime();
      return sum + (end - start) / 60000;
    }, 0);

  const openHours = Math.max(0, (workingMinutes - bookedMinutes) / 60);
  const capacityPct =
    workingMinutes > 0
      ? Math.round(((workingMinutes - bookedMinutes) / workingMinutes) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm font-medium text-foreground">
        {capacityPct}%
      </p>
      {openHours > 0 && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {openHours.toFixed(1)}h
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {t.toolbarNewShort}{" "}
        <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          N
        </kbd>
        {" · "}
        <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </p>
    </div>
  );
}
