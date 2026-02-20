import { Bug, Lightbulb, Sparkles, HelpCircle } from "lucide-react";

export type FeedbackEntry = {
  id: string;
  salon_id: string | null;
  user_id: string | null;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  votes: number;
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

export type FilterTab = "all" | "new" | "active" | "done";

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  planned: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-muted text-muted-foreground border-border",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  planned: "Planned",
  in_progress: "In progress",
  delivered: "Delivered",
  rejected: "Rejected",
};

export const TYPE_COLORS: Record<string, string> = {
  bug_report: "bg-red-50 text-red-700",
  feature_request: "bg-blue-50 text-blue-700",
  improvement: "bg-amber-50 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

export const TYPE_LABELS: Record<string, string> = {
  bug_report: "Bug report",
  feature_request: "Feature request",
  improvement: "Improvement",
  other: "Other",
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

export const FEEDBACK_TYPES = [
  { value: "bug_report", label: "Report a bug", icon: Bug },
  { value: "feature_request", label: "Request a feature", icon: Lightbulb },
  { value: "improvement", label: "Suggest improvement", icon: Sparkles },
  { value: "other", label: "Other", icon: HelpCircle },
] as const;

export function captureMetadata(locale: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  return {
    page_url: window.location.pathname,
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale,
    screen: `${window.screen.width}x${window.screen.height}`,
  };
}
