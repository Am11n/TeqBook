"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { getAllSalonsForAdmin, getAllUsersForAdmin } from "@/lib/services/admin-service";
import type { AdminSalon, AdminUser } from "@/lib/services/admin-service";
import { Badge } from "@/components/ui/badge";

type Salon = AdminSalon;
type User = AdminUser;

export default function AdminPage() {
  const { locale } = useLocale();
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const t = translations[locale].admin;

  const [salons, setSalons] = useState<Salon[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not superadmin
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
      // Load all salons and users using admin service
      const [salonsResult, usersResult] = await Promise.all([
        getAllSalonsForAdmin(),
        getAllUsersForAdmin(),
      ]);

      if (salonsResult.error) {
        setError(salonsResult.error);
        setLoading(false);
        return;
      }

      if (usersResult.error) {
        setError(usersResult.error);
        setLoading(false);
        return;
      }

      setSalons(salonsResult.data || []);
      setUsers(usersResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loadError);
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading || loading) {
    return (
      <DashboardShell>
        <PageHeader title={t.title} description={t.description} />
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!isSuperAdmin) {
    return (
      <DashboardShell>
        <PageHeader title={t.title} description={t.description} />
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{t.mustBeSuperAdmin}</p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title={t.title} description={t.description} />
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />
      
      <div className="mt-6 space-y-6">
        {/* Salons Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t.salonsTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.salonsDescription}</p>
          </CardHeader>
          <CardContent>
            {salons.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.emptySalons}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.colSalonName}</TableHead>
                    <TableHead>{t.colSalonType}</TableHead>
                    <TableHead>{t.colOwner}</TableHead>
                    <TableHead>{t.colCreatedAt}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salons.map((salon) => (
                    <TableRow key={salon.id}>
                      <TableCell className="font-medium">{salon.name}</TableCell>
                      <TableCell>{salon.salon_type || "-"}</TableCell>
                      <TableCell>{salon.owner_email || "-"}</TableCell>
                      <TableCell>
                        {new Date(salon.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t.usersTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.usersDescription}</p>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.emptyUsers}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.colUserEmail}</TableHead>
                    <TableHead>{t.colIsSuperAdmin}</TableHead>
                    <TableHead>{t.colSalon}</TableHead>
                    <TableHead>{t.colCreatedAt}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.is_superadmin ? (
                          <Badge variant="default">{t.yes}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.no}</Badge>
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
      </div>
    </DashboardShell>
  );
}

