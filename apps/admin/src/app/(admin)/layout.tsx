"use client";

import { ReactNode, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useRouter } from "next/navigation";

/**
 * Admin Layout (route group)
 *
 * Auth guard for all admin pages. Redirects to /login if the user is not a superadmin.
 * Admin pages use AdminShell individually for their layout chrome.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useCurrentSalon();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSuperAdmin) {
      router.push("/login");
    }
  }, [isSuperAdmin, loading, router]);

  // Don't render anything if not superadmin (will redirect)
  if (!loading && !isSuperAdmin) {
    return null;
  }

  // Just pass through children - AdminShell is used in each page
  return <>{children}</>;
}

