import {
  Building2, Users, TrendingUp, LayoutDashboard, Shield, Inbox,
  FileText, Flag, HeartPulse, MessageSquare, Megaphone, Settings,
  User,
} from "lucide-react";
import type { AdminConsoleMessages } from "@/i18n/admin-console";

export type SearchResult = {
  id: string;
  type: "navigation" | "salon" | "user" | "action";
  label: string;
  metadata?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function buildAdminCommandPaletteNav(cmd: AdminConsoleMessages["commandPalette"]): {
  navigationItems: SearchResult[];
  actionItems: SearchResult[];
  groupLabel(type: SearchResult["type"]): string;
} {
  const navigationItems: SearchResult[] = [
    { id: "nav-dashboard", type: "navigation", label: cmd.navDashboard, href: "/", icon: LayoutDashboard },
    { id: "nav-salons", type: "navigation", label: cmd.navSalons, href: "/salons", icon: Building2 },
    { id: "nav-users", type: "navigation", label: cmd.navUsers, href: "/users", icon: Users },
    { id: "nav-analytics", type: "navigation", label: cmd.navMetrics, href: "/analytics", icon: TrendingUp },
    { id: "nav-support", type: "navigation", label: cmd.navSupport, href: "/support", icon: Inbox },
    { id: "nav-audit", type: "navigation", label: cmd.navAudit, href: "/audit-logs", icon: FileText },
    { id: "nav-health", type: "navigation", label: cmd.navHealth, href: "/system-health", icon: HeartPulse },
    { id: "nav-incidents", type: "navigation", label: cmd.navIncidents, href: "/incidents", icon: Shield },
    { id: "nav-security", type: "navigation", label: cmd.navSecurity, href: "/security-events", icon: Shield },
    { id: "nav-flags", type: "navigation", label: cmd.navFlags, href: "/feature-flags", icon: Flag },
    { id: "nav-changelog", type: "navigation", label: cmd.navChangelog, href: "/changelog", icon: Megaphone },
    { id: "nav-feedback", type: "navigation", label: cmd.navFeedback, href: "/feedback", icon: MessageSquare },
    { id: "nav-onboarding", type: "navigation", label: cmd.navOnboarding, href: "/onboarding", icon: Settings },
    { id: "nav-plans", type: "navigation", label: cmd.navPlans, href: "/plans", icon: Settings },
    { id: "nav-admins", type: "navigation", label: cmd.navAdmins, href: "/admins", icon: Shield },
    { id: "nav-cohorts", type: "navigation", label: cmd.navCohorts, href: "/analytics/cohorts", icon: TrendingUp },
  ];

  const actionItems: SearchResult[] = [
    { id: "action-create-case", type: "action", label: cmd.actionCreateCase, href: "/support", icon: Inbox, metadata: cmd.actionMeta },
    { id: "action-invite-user", type: "action", label: cmd.actionInviteUser, href: "/users", icon: Users, metadata: cmd.actionMeta },
    { id: "action-create-salon", type: "action", label: cmd.actionCreateSalon, href: "/salons", icon: Building2, metadata: cmd.actionMeta },
    { id: "action-add-flag", type: "action", label: cmd.actionAddFlag, href: "/feature-flags", icon: Flag, metadata: cmd.actionMeta },
    { id: "action-export", type: "action", label: cmd.actionExport, href: "/analytics", icon: TrendingUp, metadata: cmd.actionMeta },
  ];

  function groupLabel(type: SearchResult["type"]): string {
    if (type === "navigation") return cmd.groupNavigation;
    if (type === "salon") return cmd.groupSalons;
    if (type === "user") return cmd.groupUsers;
    return cmd.groupActions;
  }

  return { navigationItems, actionItems, groupLabel };
}

export { User };
