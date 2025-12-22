"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
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
      router.push("/dashboard");
      return;
    }

    if (isSuperAdmin) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.error("Error loading salons:", salonsResult.error);
        // Continue with empty salons array instead of showing error
        setSalons([]);
      } else {
        setSalons(salonsResult.data || []);
      }

      if (usersResult.error) {
        console.error("Error loading users:", usersResult.error);
        // Continue with empty users array instead of showing error
        setUsers([]);
      } else {
        setUsers(usersResult.data || []);
      }
    } catch (err) {
      console.error("Error in loadData:", err);
      // Don't set error state - just log it and continue with empty data
      setSalons([]);
      setUsers([]);
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
                    <TableHead>Plan</TableHead>
                    <TableHead>{t.colSalonType}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>{t.colOwner}</TableHead>
                    <TableHead>{t.colCreatedAt}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salons.map((salon) => (
                    <TableRow key={salon.id}>
                      <TableCell className="font-medium">{salon.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {salon.plan || "starter"}
                        </Badge>
                      </TableCell>
                      <TableCell>{salon.salon_type || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={salon.is_public ? "default" : "secondary"}
                        >
                          {salon.is_public ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setSelectedSalon(salon);
                            const { data: stats } = await getSalonUsageStats(salon.id);
                            if (stats) {
                              setUsageStats(stats);
                            }
                            const { data: addons } = await getAddonsForSalon(salon.id);
                            setSalonAddons(
                              addons?.map((a) => ({ type: a.type, qty: a.qty })) || []
                            );
                            setShowStatsDialog(true);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>{salon.owner_email || "-"}</TableCell>
                      <TableCell>
                        {new Date(salon.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSalon(salon);
                                setShowPlanDialog(true);
                              }}
                            >
                              Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Are you sure you want to ${
                                      salon.is_public ? "deactivate" : "activate"
                                    } this salon?`
                                  )
                                ) {
                                  const { error: updateError } = await setSalonActive(
                                    salon.id,
                                    !salon.is_public
                                  );
                                  if (updateError) {
                                    setError(updateError);
                                  } else {
                                    await loadData();
                                  }
                                }
                              }}
                            >
                              {salon.is_public ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
    </DashboardShell>
  );
}

