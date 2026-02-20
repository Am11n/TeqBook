import {
  LayoutDashboard, HeartPulse, Inbox, AlertTriangle,
  Building2, GitBranch, CreditCard, Puzzle,
  Users, UserCheck,
  FileText, ShieldCheck, Database,
  TrendingUp, BarChart3, ToggleRight,
  MessageSquare,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/system-health", label: "System Health", icon: HeartPulse },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/support", label: "Support Inbox", icon: Inbox },
      { href: "/incidents", label: "Incidents", icon: AlertTriangle },
    ],
  },
  {
    label: "Tenants",
    items: [
      { href: "/salons", label: "Salons", icon: Building2 },
      { href: "/onboarding", label: "Onboarding", icon: GitBranch },
      { href: "/plans", label: "Plans & Billing", icon: CreditCard },
      { href: "/plan-features", label: "Plan Features", icon: Puzzle },
    ],
  },
  {
    label: "Users & Access",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/admins", label: "Admins", icon: UserCheck },
    ],
  },
  {
    label: "Security",
    items: [
      { href: "/audit-logs", label: "Audit Logs", icon: FileText },
      { href: "/security-events", label: "Security Events", icon: ShieldCheck },
      { href: "/data-tools", label: "Data Tools", icon: Database },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/analytics", label: "Metrics", icon: TrendingUp },
      { href: "/analytics/cohorts", label: "Cohorts", icon: BarChart3 },
      { href: "/feature-flags", label: "Feature Flags", icon: ToggleRight },
    ],
  },
  {
    label: "Product",
    items: [
      { href: "/changelog", label: "Changelog", icon: GitBranch },
      { href: "/feedback", label: "Feedback", icon: MessageSquare },
    ],
  },
];

export function computeActiveHref(pathname: string): string | null {
  const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
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
