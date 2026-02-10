"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAllSalonsForAdmin, getAllUsersForAdmin } from "@/lib/services/admin-service";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { TrendingUp, Users, Building2, Calendar, DollarSign } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalSalons: number;
    activeSalons: number;
    totalUsers: number;
    totalBookings: number;
    planDistribution: {
      starter: number;
      pro: number;
      business: number;
    };
  } | null>(null);

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
      const [salonsResult, usersResult] = await Promise.all([
        getAllSalonsForAdmin(),
        getAllUsersForAdmin(),
      ]);

      if (salonsResult.error || usersResult.error) {
        setError(salonsResult.error || usersResult.error || "Failed to load data");
        return;
      }

      const salons = salonsResult.data || [];
      const users = usersResult.data || [];

      // Calculate plan distribution
      const planDistribution = {
        starter: salons.filter((s) => s.plan === "starter" || !s.plan).length,
        pro: salons.filter((s) => s.plan === "pro").length,
        business: salons.filter((s) => s.plan === "business").length,
      };

      // Calculate total bookings (sum from all salons)
      const totalBookings = salons.reduce((sum, salon) => {
        return sum + (salon.booking_count || 0);
      }, 0);

      setStats({
        totalSalons: salons.length,
        activeSalons: salons.filter((s) => s.is_public).length,
        totalUsers: users.length,
        totalBookings,
        planDistribution,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading || loading) {
    return (
      <AdminShell>
        <PageLayout title="Analytics" description="System-wide analytics and insights">
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
          title="Analytics"
          description="System-wide analytics and insights"
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSalons}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeSalons} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all salons
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Salons</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSalons}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSalons > 0
                      ? `${Math.round((stats.activeSalons / stats.totalSalons) * 100)}% of total`
                      : "0%"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Starter</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.planDistribution.starter} salons
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalSalons > 0
                              ? (stats.planDistribution.starter / stats.totalSalons) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pro</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.planDistribution.pro} salons
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalSalons > 0
                              ? (stats.planDistribution.pro / stats.totalSalons) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Business</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.planDistribution.business} salons
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalSalons > 0
                              ? (stats.planDistribution.business / stats.totalSalons) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}

