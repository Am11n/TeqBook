export type SupportCase = {
  id: string;
  salon_id: string;
  user_id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  category: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CaseMessage = {
  id: string;
  case_id: string;
  sender_id: string;
  body: string;
  is_internal: boolean;
  attachments: { path: string; name: string; size: number }[];
  created_at: string;
};

export type FilterTab = "all" | "open" | "waiting" | "closed";

export const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_on_salon: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground border-border",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_salon: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

export const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "booking_issue", label: "Booking issue" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "account_issue", label: "Account issue" },
  { value: "feature_request", label: "Feature request" },
  { value: "other", label: "Other" },
];
