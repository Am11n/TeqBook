"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCurrentSalon } from "@/components/salon-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Admin Layout
 * 
 * This layout ensures that admin pages are NOT wrapped in DashboardShell.
 * Admin pages should only use AdminShell, not DashboardShell.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useCurrentSalon();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're sure the user is not a superadmin
    if (!loading && !isSuperAdmin && pathname.startsWith("/admin")) {
      router.push("/dashboard");
    }
  }, [isSuperAdmin, loading, pathname, router]);

  // Don't render anything if not superadmin (will redirect)
  if (!loading && !isSuperAdmin) {
    return null;
  }

  // Just pass through children - AdminShell is used in each page
  return <>{children}</>;
}

