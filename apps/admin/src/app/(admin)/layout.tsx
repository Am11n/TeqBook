"use client";

import { ReactNode, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useRouter } from "next/navigation";

/**
 * Admin Layout (route group)
 *
 * Middleware now enforces auth/superadmin at server boundary.
 * This layout keeps a client-side guard only as UX fallback.
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

