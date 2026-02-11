import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  UserCircle,
  BookOpen,
  Settings,
  Shield,
  TrendingUp,
  Package,
  FileCheck,
  Headset,
  MessageSquare,
} from "lucide-react";
import { translations } from "@/i18n/translations";
import {
  canAccessSettings,
  canManageEmployees,
  canManageServices,
  canViewReports,
  canManageShifts,
} from "@/lib/utils/access-control";
import type { AppLocale } from "@/i18n/translations";

export interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UseDashboardMenuItemsOptions {
  appLocale: AppLocale;
  userRole: string | null;
  isReady: boolean;
  isSuperAdmin: boolean;
  mounted: boolean;
  featuresLoading: boolean;
  features: string[];
}

export function useDashboardMenuItems({
  appLocale,
  userRole,
  isReady,
  isSuperAdmin,
  mounted,
  featuresLoading,
  features,
}: UseDashboardMenuItemsOptions) {
  const pathname = usePathname();
  const texts = translations[appLocale].dashboard;

  const overviewItems = useMemo<MenuItem[]>(
    () => [{ href: "/", label: texts.overview, icon: LayoutDashboard }],
    [texts.overview]
  );

  const operationsItems = useMemo<MenuItem[]>(
    () => [
      { href: "/calendar", label: texts.calendar, icon: Calendar },
      { href: "/bookings", label: texts.bookings, icon: BookOpen },
    ],
    [texts.calendar, texts.bookings]
  );

  const managementItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [
      ...(canManageEmployees(userRole)
        ? [{ href: "/employees", label: texts.employees, icon: Users }]
        : []),
      ...(canManageServices(userRole)
        ? [{ href: "/services", label: texts.services, icon: Scissors }]
        : []),
      { href: "/customers", label: texts.customers, icon: UserCircle }, // All roles can view customers
    ];

    // Only add feature-based items after features are loaded (not loading) and mounted
    // Use features array directly instead of hasFeature() to avoid function call overhead
    if (mounted && !featuresLoading && features.length > 0) {
      const hasInventory = features.includes("INVENTORY");
      const hasShifts = features.includes("SHIFTS");
      const hasReports = features.includes("ADVANCED_REPORTS");

      if (canManageServices(userRole) && hasInventory) {
        items.push({ href: "/products", label: "Products", icon: Package });
      }
      if (canManageShifts(userRole) && hasShifts) {
        items.push({ href: "/shifts", label: texts.shifts, icon: Clock });
      }
      if (canViewReports(userRole) && hasReports) {
        items.push({ href: "/reports", label: "Reports", icon: TrendingUp });
      }
    }

    return items;
  }, [
    mounted,
    featuresLoading,
    features,
    userRole,
    texts.employees,
    texts.services,
    texts.customers,
    texts.shifts,
  ]);

  const complianceItems = useMemo<MenuItem[]>(() => {
    // Personalliste: synlig for alle innloggede (owner, manager, staff, superadmin) – lovpålagt dokumentasjon
    if (!isReady) return [];
    return [{ href: "/personalliste", label: texts.personalliste, icon: FileCheck }];
  }, [isReady, texts.personalliste]);

  const systemItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    // Feedback is visible to all logged-in roles
    if (isReady) {
      items.push({
        href: "/feedback",
        label: texts.feedback ?? "Feedback",
        icon: MessageSquare,
      });
    }
    // Support is visible to all logged-in roles
    if (isReady) {
      items.push({
        href: "/support",
        label: texts.support ?? "Support",
        icon: Headset,
      });
    }
    if (canAccessSettings(userRole)) {
      items.push({
        href: "/settings/general",
        label: translations[appLocale].settings.title,
        icon: Settings,
      });
    }
    // Only show admin link if not already on admin pages
    if (isSuperAdmin && !pathname.startsWith("/admin")) {
      items.push({
        href: "/admin",
        label: translations[appLocale].admin.title,
        icon: Shield,
      });
    }
    return items;
  }, [userRole, isSuperAdmin, isReady, pathname, appLocale, translations, texts.feedback, texts.support]);

  return {
    overviewItems,
    operationsItems,
    managementItems,
    complianceItems,
    systemItems,
  };
}

