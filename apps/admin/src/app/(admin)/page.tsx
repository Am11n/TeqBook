"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import {
  getAllSalonsForAdmin,
  getAllUsersForAdmin,
  updateSalonPlan,
  setSalonActive,
  getSalonUsageStats,
} from "@/lib/services/admin-service";
import type { AdminSalon, AdminUser } from "@/lib/services/admin-service";
import { getAddonsForSalon } from "@/lib/repositories/addons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/services/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, TrendingUp, Users, Calendar, Scissors, UserCircle } from "lucide-react";

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
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [usageStats, setUsageStats] = useState<{
    employee_count: number;
    booking_count: number;
    booking_count_30d: number;
    customer_count: number;
    service_count: number;
  } | null>(null);
  const [salonAddons, setSalonAddons] = useState<Array<{ type: string; qty: number }>>([]);

  useEffect(() => {
    // Redirect if not superadmin
    if (!contextLoading && !isSuperAdmin) {
      router.push("/login");
      // Note: with basePath="/admin" in production, this navigates to /admin/login
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

      // Handle errors gracefully - don't crash if one fails
      if (salonsResult.error) {
        logError("Error loading salons", salonsResult.error);
        // Continue with empty salons array instead of showing error
        setSalons([]);
      } else {
        setSalons(salonsResult.data || []);
      }

      if (usersResult.error) {
        logError("Error loading users", usersResult.error);
        // Continue with empty users array instead of showing error
        setUsers([]);
      } else {
        setUsers(usersResult.data || []);
      }
    } catch (err) {
      logError("Error in loadData", err);
      // Don't set error state - just log it and continue with empty data
      setSalons([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading || loading) {
    return (
      <AdminShell>
        <PageLayout title="Admin Dashboard" description="Loading...">
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        </PageLayout>
      </AdminShell>
    );
  }

  if (!isSuperAdmin) {
    return (
      <AdminShell>
        <PageLayout title="Access Denied" description="You must be a super admin">
          <p className="text-sm text-destructive">{t.mustBeSuperAdmin}</p>
        </PageLayout>
      </AdminShell>
    );
  }

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Admin Dashboard"
          description="Overview of all salons and users in the system"
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salons.length}</div>
                <p className="text-xs text-muted-foreground">
                  {salons.filter((s) => s.is_public).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all salons
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Salons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salons.filter((s) => s.is_public).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salons.length > 0
                    ? `${Math.round((salons.filter((s) => s.is_public).length / salons.length) * 100)}% of total`
                    : "0%"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.is_superadmin).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  System administrators
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Link href="/salons">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Manage Salons</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View and manage all salons, change plans, and view statistics
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/users">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View all users and their roles across the system
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base">Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    System-wide analytics and insights
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

      {/* Plan Change Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan for {selectedSalon?.name}</DialogTitle>
            <DialogDescription>
              Select a new plan for this salon. This will immediately update their plan limits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(["starter", "pro", "business"] as const).map((plan) => (
              <Button
                key={plan}
                variant={selectedSalon?.plan === plan ? "default" : "outline"}
                className="w-full justify-start"
                onClick={async () => {
                  if (!selectedSalon?.id) return;
                  const { error: updateError } = await updateSalonPlan(
                    selectedSalon.id,
                    plan
                  );
                  if (updateError) {
                    setError(updateError);
                  } else {
                    await loadData();
                    setShowPlanDialog(false);
                  }
                }}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Usage Statistics - {selectedSalon?.name}</DialogTitle>
            <DialogDescription>
              Current usage and statistics for this salon
            </DialogDescription>
          </DialogHeader>
          {usageStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Employees</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.employee_count}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Bookings</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.booking_count}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bookings (30d)</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.booking_count_30d}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Customers</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.customer_count}</p>
                </div>
                <div className="p-3 border rounded-lg col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Services</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.service_count}</p>
                </div>
              </div>
              {salonAddons.length > 0 && (
                <div className="p-3 border rounded-lg">
                  <span className="text-sm font-medium mb-2 block">Add-ons</span>
                  <div className="space-y-1">
                    {salonAddons.map((addon, idx) => (
                      <div key={idx} className="text-sm">
                        {addon.type === "extra_staff" ? "Extra Staff" : "Extra Languages"}:{" "}
                        {addon.qty}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PageLayout>
    </AdminShell>
    </ErrorBoundary>
  );
}

