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
import { supabase } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";

type Salon = {
  id: string;
  name: string;
  salon_type: string | null;
  created_at: string;
  owner_email?: string;
};

type User = {
  id: string;
  email: string;
  created_at: string;
  is_superadmin: boolean;
  salon_name?: string;
};

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
      // Load all salons
      const { data: salonsData, error: salonsError } = await supabase
        .from("salons")
        .select("id, name, salon_type, created_at")
        .order("created_at", { ascending: false });

      if (salonsError) throw salonsError;

      // Load all profiles first (to get all user_ids)
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id, salon_id, is_superadmin");

      // Load profiles for salons (to get owner user_ids)
      const salonIds = salonsData?.map((s) => s.id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("salon_id, user_id")
        .in("salon_id", salonIds);

      // Get all unique user IDs from both sources
      const allUserIds = [
        ...new Set([
          ...(profilesData?.map((p) => p.user_id) || []),
          ...(allProfiles?.map((p) => p.user_id) || []),
        ]),
      ].filter((id): id is string => !!id); // Filter out any null/undefined values

      // Get user emails and created_at using RPC function
      let emailMap = new Map<string, string>();
      let createdAtMap = new Map<string, string>();
      
      if (allUserIds.length > 0) {
        try {
          const { data: userEmailsData, error: emailsError } = await supabase.rpc(
            "get_user_emails",
            { user_ids: allUserIds }
          );

          if (emailsError) {
            console.error("Error fetching user emails:", emailsError);
            console.error("User IDs attempted:", allUserIds);
            // Continue without emails if RPC fails
          } else if (userEmailsData && Array.isArray(userEmailsData)) {
            console.log("User emails fetched:", userEmailsData);
            userEmailsData.forEach((item: { user_id: string; email: string; created_at: string }) => {
              if (item.user_id && item.email) {
                emailMap.set(item.user_id, item.email);
              }
              if (item.user_id && item.created_at) {
                createdAtMap.set(item.user_id, item.created_at);
              }
            });
          } else {
            console.warn("No user emails data returned from RPC");
          }
        } catch (err) {
          console.error("Exception calling get_user_emails:", err);
        }
      } else {
        console.warn("No user IDs found to fetch emails for");
      }

      // Map salons with owner emails
      const salonsWithOwners: Salon[] = (salonsData || []).map((salon) => {
        const profile = profilesData?.find((p) => p.salon_id === salon.id);
        const ownerEmail = profile?.user_id
          ? emailMap.get(profile.user_id) || profile.user_id
          : undefined;
        return { ...salon, owner_email: ownerEmail };
      });

      setSalons(salonsWithOwners);

      // Map profiles to users with emails and created_at
      const usersWithProfiles: User[] = (allProfiles || []).map((profile) => {
        const salon = salonsData?.find((s) => s.id === profile.salon_id);
        const email = emailMap.get(profile.user_id) || profile.user_id;
        const created_at = createdAtMap.get(profile.user_id) || "";
        return {
          id: profile.user_id,
          email: email,
          created_at: created_at,
          is_superadmin: profile.is_superadmin ?? false,
          salon_name: salon?.name,
        };
      });

      setUsers(usersWithProfiles);
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

