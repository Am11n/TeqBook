import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  type SupportCase,
} from "./types";

export function CaseRow({
  supportCase,
  onClick,
}: {
  supportCase: SupportCase;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{supportCase.title}</span>
          {supportCase.category && (
            <Badge variant="outline" className="text-xs shrink-0">
              {supportCase.category.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {supportCase.description ?? "No description"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[supportCase.status] ?? ""}`}
        >
          {STATUS_LABELS[supportCase.status] ?? supportCase.status}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[supportCase.priority] ?? ""}`}
        >
          {supportCase.priority}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {format(new Date(supportCase.created_at), "dd.MM.yyyy")}
      </span>
    </button>
  );
}
