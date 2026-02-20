import { format } from "date-fns";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_COLORS,
  TYPE_LABELS,
  PRIORITY_COLORS,
  type FeedbackEntry,
} from "./types";

export function FeedbackRow({
  entry,
  onClick,
}: {
  entry: FeedbackEntry;
  onClick: () => void;
}) {
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
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {entry.description ?? "No description"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ""}`}
        >
          {STATUS_LABELS[entry.status] ?? entry.status}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority] ?? ""}`}
        >
          {entry.priority}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {format(new Date(entry.created_at), "dd.MM.yyyy")}
      </span>
    </button>
  );
}
