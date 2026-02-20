import {
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  TrendingUp,
  FileText,
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
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/salons", label: "Salons", icon: Building2 },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
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
  if (best === "/admin" && pathname !== "/admin") {
    const nonRoot = allHrefs.filter(
      (h) => h !== "/admin" && (pathname === h || pathname.startsWith(h + "/")),
    );
    if (nonRoot.length > 0) best = nonRoot.reduce((a, b) => (a.length >= b.length ? a : b));
  }
  return best;
}
