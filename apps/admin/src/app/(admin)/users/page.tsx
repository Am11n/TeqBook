"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { ListPage, type PageState } from "@teqbook/page";
import { ErrorBoundary } from "@teqbook/feedback";
import { DataTable, type ColumnDef, type RowAction } from "@teqbook/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EntityLink } from "@/components/shared/entity-link";
import { NotesPanel, type AdminNote, type NoteTag } from "@/components/shared/notes-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Building2, FileText, LogOut } from "lucide-react";
import { format } from "date-fns";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  salon_name: string | null;
  salon_id: string | null;
  is_superadmin: boolean;
  last_sign_in: string | null;
  created_at: string;
  total_count: number;
};
const PAGE_SIZE = 10;

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700",
  salon_owner: "bg-blue-50 text-blue-700",
  staff: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<UserRow>[] = [
  { id: "email", header: "Email", cell: (r) => (
    <div>
      <span className="font-medium block">{r.email}</span>
      {r.name && <span className="text-xs text-muted-foreground">{r.name}</span>}
    </div>
  ), sticky: true, hideable: false },
  { id: "role", header: "Role", cell: (r) => (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r.role] ?? ""}`}>{r.is_superadmin ? "Super Admin" : r.role?.replace(/_/g, " ") ?? "user"}</span>
  ), sortable: true },
  { id: "salon_name", header: "Salon", cell: (r) => r.salon_name ?? "-" },
  { id: "last_sign_in", header: "Last Login", cell: (r) => r.last_sign_in ? format(new Date(r.last_sign_in), "dd.MM.yyyy, HH:mm") : "Never", sortable: true },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "dd.MM.yyyy, HH:mm"), sortable: true },
];

export default function AdminUsersPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; created_at: string }>>([]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (search) filters.search = search;
      const { data, error: rpcError } = await supabase.rpc("get_users_paginated", {
        filters, sort_col: sortBy, sort_dir: sortDir, lim: PAGE_SIZE, off: page * PAGE_SIZE,
      });
      if (rpcError) { setError(rpcError.message); return; }
      const rows: UserRow[] = ((data as Array<Record<string, unknown>>) ?? []).map((d) => ({
        id: (d.user_id as string) ?? (d.id as string),
        email: d.email as string,
        name: (d.name as string) ?? null,
        role: (d.is_superadmin as boolean) ? "super_admin" : (d.role as string) ?? "user",
        salon_name: (d.salon_name as string) ?? null,
        salon_id: (d.salon_id as string) ?? null,
        is_superadmin: (d.is_superadmin as boolean) ?? false,
        last_sign_in: (d.last_sign_in_at as string) ?? (d.last_sign_in as string) ?? null,
        created_at: (d.user_created_at as string) ?? (d.created_at as string),
        total_count: (d.total_count as number) ?? 0,
      }));
      setUsers(rows);
      setTotal(rows.length > 0 ? rows[0].total_count : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortDir]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadUsers();
  }, [isSuperAdmin, contextLoading, router, loadUsers]);

  const loadNotes = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc("get_admin_notes", { p_entity_type: "user", p_entity_id: userId });
    if (data) setNotes(data as AdminNote[]);
  }, []);

  const handleRowClick = useCallback(async (user: UserRow) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    setRecentActivity([]);
    loadNotes(user.id);
    const { data: activityData } = await supabase
      .from("security_audit_log").select("id, action, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
    if (activityData) setRecentActivity(activityData);
  }, [loadNotes]);

  const handleCreateNote = useCallback(async (content: string, tags: NoteTag[]) => {
    if (!selectedUser) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_notes").insert({ entity_type: "user", entity_id: selectedUser.id, author_id: user.id, content, tags });
    loadNotes(selectedUser.id);
  }, [selectedUser, loadNotes]);

  const rowActions: RowAction<UserRow>[] = [
    { label: "View Audit Trail", onClick: (u) => router.push(`/audit-logs?user=${u.id}`) },
    { label: "Force Logout", onClick: async (u) => { console.log("Force logout", u.id); }, separator: true },
  ];

  const bulkActions = [
    { label: "Export Selected", onClick: (ids: string[]) => { console.log("Export users", ids); } },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  const pageState: PageState = loading
    ? { status: "loading" }
    : error
      ? { status: "error", message: error, retry: loadUsers }
      : users.length === 0
        ? { status: "empty", title: "No users found" }
        : { status: "ready" };

  return (
    <ErrorBoundary>
      <AdminShell>
        <ListPage
          title="Users"
          description="Manage platform users and access"
          actions={[{ label: "Invite User", onClick: () => {}, priority: "primary" }]}
          state={pageState}
        >
          <DataTable
            columns={columns}
            data={users}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder="Search users..."
            sortColumn={sortBy}
            sortDirection={sortDir}
            onSortChange={(col, dir) => { setSortBy(col); setSortDir(dir); }}
            rowActions={rowActions}
            bulkActions={bulkActions}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No users found"
            storageKey="users-pro"
          />
        </ListPage>

        <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selectedUser?.email ?? "User"} description={selectedUser?.role ?? ""}>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selectedUser.email}</div>
                <div><span className="text-muted-foreground">Role:</span> <Badge variant="outline">{selectedUser.is_superadmin ? "Super Admin" : selectedUser.role}</Badge></div>
                <div><span className="text-muted-foreground">Salon:</span> {selectedUser.salon_id ? <EntityLink type="salon" id={selectedUser.salon_id} label={selectedUser.salon_name} /> : <span className="text-muted-foreground">None</span>}</div>
                <div><span className="text-muted-foreground">Created:</span> {format(new Date(selectedUser.created_at), "PPP")}</div>
                <div><span className="text-muted-foreground">Last login:</span> {selectedUser.last_sign_in ? format(new Date(selectedUser.last_sign_in), "PPpp") : "Never"}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.salon_id && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/salons?highlight=${selectedUser.salon_id}`)}><Building2 className="h-3 w-3" /> View Salon</Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/audit-logs?user=${selectedUser.id}`)}><FileText className="h-3 w-3" /> Audit Trail</Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => { console.log("Force logout", selectedUser.id); }}><LogOut className="h-3 w-3" /> Force Logout</Button>
                </div>
              </div>
              {recentActivity.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Activity</p>
                  <div className="space-y-1.5">
                    {recentActivity.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded border">
                        <span className="font-medium">{a.action}</span>
                        <span className="text-muted-foreground">{format(new Date(a.created_at), "MMM d, HH:mm")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <NotesPanel entityType="user" entityId={selectedUser.id} notes={notes} onCreateNote={handleCreateNote} />
            </div>
          )}
        </DetailDrawer>
      </AdminShell>
    </ErrorBoundary>
  );
}
