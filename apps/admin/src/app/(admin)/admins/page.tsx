"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { UserCheck, Plus } from "lucide-react";
import { format } from "date-fns";

type AdminUser = {
  user_id: string;
  email: string;
  is_superadmin: boolean;
  admin_role: string | null;
  created_at: string;
};

const ROLE_COLORS: Record<string, string> = {
  full_admin: "bg-purple-50 text-purple-700",
  support_admin: "bg-blue-50 text-blue-700",
  billing_admin: "bg-emerald-50 text-emerald-700",
  security_admin: "bg-red-50 text-red-700",
  read_only_auditor: "bg-muted text-muted-foreground",
};

const ADMIN_ROLES = ["full_admin", "support_admin", "billing_admin", "security_admin", "read_only_auditor"] as const;

const columns: ColumnDef<AdminUser>[] = [
  { id: "email", header: "Email", cell: (r) => <span className="font-medium">{r.email}</span>, sticky: true, hideable: false },
  { id: "is_superadmin", header: "Super Admin", cell: (r) => r.is_superadmin ? <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Yes</Badge> : <Badge variant="secondary">No</Badge> },
  { id: "admin_role", header: "Admin Role", cell: (r) => r.admin_role ? <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r.admin_role] ?? ""}`}>{r.admin_role.replace(/_/g, " ")}</span> : "-", sortable: true },
  { id: "created_at", header: "Joined", cell: (r) => format(new Date(r.created_at), "MMM d, yyyy"), sortable: true },
];

export default function AdminsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // Use RPC to join profiles + auth.users (email lives on auth.users, not profiles)
      const { data, error: e } = await supabase.rpc("get_users_paginated", {
        filters: { is_superadmin: "true" } as unknown as Record<string, unknown>,
        sort_col: "created_at",
        sort_dir: "desc",
        lim: 100,
        off: 0,
      });
      if (e) { setError(e.message); return; }

      // Also get admin_role from profiles (not in the RPC)
      const rows = (data ?? []) as Array<{
        user_id: string; email: string; is_superadmin: boolean;
        user_created_at: string;
      }>;
      const userIds = rows.map((r) => r.user_id);
      const { data: roleData } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, admin_role").in("user_id", userIds)
        : { data: [] };
      const roleMap = new Map((roleData ?? []).map((r: { user_id: string; admin_role: string | null }) => [r.user_id, r.admin_role]));

      setAdmins(rows.map((r) => ({
        user_id: r.user_id,
        email: r.email,
        is_superadmin: r.is_superadmin,
        admin_role: roleMap.get(r.user_id) ?? null,
        created_at: r.user_created_at,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadAdmins();
  }, [isSuperAdmin, contextLoading, router, loadAdmins]);

  async function setAdminRole(userId: string, role: string | null) {
    const { error: e } = await supabase.from("profiles").update({ admin_role: role }).eq("user_id", userId);
    if (e) setError(e.message);
    else loadAdmins();
  }

  const rowActions: RowAction<AdminUser>[] = ADMIN_ROLES.map((role) => ({
    label: `Set: ${role.replace(/_/g, " ")}`,
    onClick: (u) => setAdminRole(u.user_id, role),
  }));

  rowActions.push({
    label: "Remove admin role",
    onClick: (u) => setAdminRole(u.user_id, null),
    separator: true,
  });

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Admins"
          description="Manage admin users and their roles"
          breadcrumbs={<span>Users & Access / Admins</span>}
          actions={<Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Admin</Button>}
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* RBAC explanation */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-6">
            {ADMIN_ROLES.map((role) => (
              <div key={role} className={`p-3 rounded-lg border text-center ${ROLE_COLORS[role]}`}>
                <p className="text-xs font-medium capitalize">{role.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={admins}
            totalCount={admins.length}
            rowKey={(r) => r.user_id}
            page={0}
            pageSize={50}
            onPageChange={() => {}}
            rowActions={rowActions}
            loading={loading}
            emptyMessage="No admin users"
            storageKey="admins"
          />
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
