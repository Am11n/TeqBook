"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { STATUS_COLORS, TYPE_COLORS, PRIORITY_COLORS, type FeedbackEntry } from "./types";
import {
  labelFeedbackType,
  labelFeedbackStatus,
  labelFeedbackPriority,
} from "@/app/help/_helpers/help-dashboard-labels";

export function FeedbackRow({
  entry,
  onClick,
}: {
  entry: FeedbackEntry;
  onClick: () => void;
}) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const d = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{entry.title}</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${TYPE_COLORS[entry.type] ?? ""}`}
          >
            {labelFeedbackType(d, entry.type)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {entry.description ?? d.supportCaseNoDescription}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ""}`}
        >
          {labelFeedbackStatus(d, entry.status)}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority] ?? ""}`}
        >
          {labelFeedbackPriority(d, entry.priority)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {format(new Date(entry.created_at), "dd.MM.yyyy")}
      </span>
    </button>
  );
}
