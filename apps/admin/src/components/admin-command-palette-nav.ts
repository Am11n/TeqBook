import {
  Building2, Users, TrendingUp, LayoutDashboard, Shield, Inbox,
  FileText, Flag, HeartPulse, MessageSquare, Megaphone, Settings,
} from "lucide-react";

export type SearchResult = {
  id: string;
  type: "navigation" | "salon" | "user" | "action";
  label: string;
  metadata?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navigationItems: SearchResult[] = [
  { id: "nav-dashboard", type: "navigation", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "nav-salons", type: "navigation", label: "Salons", href: "/salons", icon: Building2 },
  { id: "nav-users", type: "navigation", label: "Users", href: "/users", icon: Users },
  { id: "nav-analytics", type: "navigation", label: "Metrics", href: "/analytics", icon: TrendingUp },
  { id: "nav-support", type: "navigation", label: "Support Inbox", href: "/support", icon: Inbox },
  { id: "nav-audit", type: "navigation", label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { id: "nav-health", type: "navigation", label: "System Health", href: "/system-health", icon: HeartPulse },
  { id: "nav-incidents", type: "navigation", label: "Incidents", href: "/incidents", icon: Shield },
  { id: "nav-security", type: "navigation", label: "Security Events", href: "/security-events", icon: Shield },
  { id: "nav-flags", type: "navigation", label: "Feature Flags", href: "/feature-flags", icon: Flag },
  { id: "nav-changelog", type: "navigation", label: "Changelog", href: "/changelog", icon: Megaphone },
  { id: "nav-feedback", type: "navigation", label: "Feedback", href: "/feedback", icon: MessageSquare },
  { id: "nav-onboarding", type: "navigation", label: "Onboarding", href: "/onboarding", icon: Settings },
  { id: "nav-plans", type: "navigation", label: "Plans & Billing", href: "/plans", icon: Settings },
  { id: "nav-admins", type: "navigation", label: "Admins", href: "/admins", icon: Shield },
  { id: "nav-cohorts", type: "navigation", label: "Cohorts", href: "/analytics/cohorts", icon: TrendingUp },
];

export const actionItems: SearchResult[] = [
  { id: "action-create-case", type: "action", label: "Create Support Case", href: "/support", icon: Inbox, metadata: "Action" },
  { id: "action-invite-user", type: "action", label: "Invite User", href: "/users", icon: Users, metadata: "Action" },
  { id: "action-create-salon", type: "action", label: "Create Salon", href: "/salons", icon: Building2, metadata: "Action" },
  { id: "action-add-flag", type: "action", label: "Add Feature Flag", href: "/feature-flags", icon: Flag, metadata: "Action" },
  { id: "action-export", type: "action", label: "Export Report", href: "/analytics", icon: TrendingUp, metadata: "Action" },
];

export const GROUP_LABELS: Record<string, string> = {
  navigation: "Pages",
  salon: "Salons",
  user: "Users",
  action: "Actions",
};
