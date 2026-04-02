import {
  LayoutDashboard, HeartPulse, Inbox, AlertTriangle,
  Building2, GitBranch, CreditCard, Puzzle,
  Users, UserCheck,
  FileText, ShieldCheck, Database,
  TrendingUp, BarChart3, ToggleRight,
  MessageSquare, Megaphone,
} from "lucide-react";
import type { AdminConsoleMessages } from "@/i18n/admin-console";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export function buildAdminNavSections(nav: AdminConsoleMessages["nav"]): NavSection[] {
  return [
    {
      label: nav.sectionOverview,
      items: [
        { href: "/", label: nav.itemDashboard, icon: LayoutDashboard },
        { href: "/system-health", label: nav.itemSystemHealth, icon: HeartPulse },
      ],
    },
    {
      label: nav.sectionOperations,
      items: [
        { href: "/support", label: nav.itemSupportInbox, icon: Inbox },
        { href: "/incidents", label: nav.itemIncidents, icon: AlertTriangle },
      ],
    },
    {
      label: nav.sectionTenants,
      items: [
        { href: "/salons", label: nav.itemSalons, icon: Building2 },
        { href: "/onboarding", label: nav.itemOnboarding, icon: GitBranch },
        { href: "/plans", label: nav.itemPlansBilling, icon: CreditCard },
        { href: "/plan-features", label: nav.itemPlanFeatures, icon: Puzzle },
      ],
    },
    {
      label: nav.sectionUsersAccess,
      items: [
        { href: "/users", label: nav.itemUsers, icon: Users },
        { href: "/admins", label: nav.itemAdmins, icon: UserCheck },
      ],
    },
    {
      label: nav.sectionSecurity,
      items: [
        { href: "/audit-logs", label: nav.itemAuditLogs, icon: FileText },
        { href: "/security-events", label: nav.itemSecurityEvents, icon: ShieldCheck },
        { href: "/data-tools", label: nav.itemDataTools, icon: Database },
      ],
    },
    {
      label: nav.sectionAnalytics,
      items: [
        { href: "/analytics", label: nav.itemMetrics, icon: TrendingUp },
        { href: "/analytics/cohorts", label: nav.itemCohorts, icon: BarChart3 },
        { href: "/feature-flags", label: nav.itemFeatureFlags, icon: ToggleRight },
      ],
    },
    {
      label: nav.sectionProduct,
      items: [
        { href: "/announcements", label: nav.itemAnnouncements, icon: Megaphone },
        { href: "/changelog", label: nav.itemChangelog, icon: GitBranch },
        { href: "/feedback", label: nav.itemFeedback, icon: MessageSquare },
      ],
    },
  ];
}

export function computeActiveHref(pathname: string, sections: NavSection[]): string | null {
  const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
  let best: string | null = null;
  for (const href of allHrefs) {
    if (pathname === href || pathname.startsWith(href + "/")) {
      if (!best || href.length > best.length) best = href;
    }
  }
  if (best === "/" && pathname !== "/") {
    const nonRoot = allHrefs.filter(
      (h) => h !== "/" && (pathname === h || pathname.startsWith(h + "/")),
    );
    if (nonRoot.length > 0) best = nonRoot.reduce((a, b) => (a.length >= b.length ? a : b));
  }
  return best;
}
