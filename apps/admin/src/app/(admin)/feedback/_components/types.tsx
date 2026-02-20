import { format } from "date-fns";
import type { ColumnDef } from "@/components/shared/data-table";

export type FeedbackEntry = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  votes: number;
  salon_id: string | null;
  user_id: string | null;
  admin_owner_id: string | null;
  metadata: Record<string, unknown> | null;
  changelog_entry_id: string | null;
  resolved_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedbackComment = {
  id: string;
  feedback_id: string;
  author_user_id: string;
  author_role: string;
  message: string;
  is_internal: boolean;
  attachments: { path: string; name: string; size: number }[];
  created_at: string;
};

export type ChangelogEntry = {
  id: string;
  title: string;
  version: string | null;
};

export const TYPE_COLORS: Record<string, string> = {
  feature_request: "bg-blue-50 text-blue-700",
  bug_report: "bg-red-50 text-red-700",
  improvement: "bg-amber-50 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  planned: "bg-purple-50 text-purple-700",
  in_progress: "bg-amber-50 text-amber-700",
  delivered: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

export const STATUSES = ["new", "planned", "in_progress", "delivered", "rejected"] as const;

export const columns: ColumnDef<FeedbackEntry>[] = [
  {
    id: "title",
    header: "Title",
    cell: (r) => <span className="font-medium">{r.title}</span>,
    sticky: true,
    hideable: false,
  },
  {
    id: "type",
    header: "Type",
    cell: (r) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[r.type]}`}>
        {r.type.replace(/_/g, " ")}
      </span>
    ),
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (r) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
        {r.status.replace(/_/g, " ")}
      </span>
    ),
    sortable: true,
  },
  {
    id: "priority",
    header: "Priority",
    cell: (r) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[r.priority]}`}>
        {r.priority}
      </span>
    ),
    sortable: true,
  },
  {
    id: "votes",
    header: "Votes",
    cell: (r) => r.votes,
    sortable: true,
  },
  {
    id: "created_at",
    header: "Created",
    cell: (r) => format(new Date(r.created_at), "MMM d, yyyy"),
    sortable: true,
  },
];
