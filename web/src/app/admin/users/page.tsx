"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAllUsersForAdmin } from "@/lib/services/admin-service";
import type { AdminUser } from "@/lib/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";

export default function AdminUsersPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) {
      router.push("/dashboard");
      return;
    }

    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin, contextLoading, router]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: usersError } = await getAllUsersForAdmin();

      if (usersError) {
        setError(usersError);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading || loading) {
    return (
      <AdminShell>
        <PageLayout title="Users" description="Manage all users">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </PageLayout>
      </AdminShell>
    );
  }

  if (!isSuperAdmin) {
    return (
      <AdminShell>
        <PageLayout title="Access Denied" description="You must be a super admin to access this page">
          <p className="text-sm text-destructive">You do not have permission to access this page.</p>
        </PageLayout>
      </AdminShell>
    );
  }

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Users"
          description="View and manage all users in the system"
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.is_superadmin ? (
                            <Badge variant="default">Super Admin</Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.salon_name || "-"}</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}

