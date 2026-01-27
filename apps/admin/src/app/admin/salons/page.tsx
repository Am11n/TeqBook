"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getAllSalonsForAdmin,
  updateSalonPlan,
  setSalonActive,
  getSalonUsageStats,
} from "@/lib/services/admin-service";
import type { AdminSalon } from "@/lib/services/admin-service";
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
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";

export default function AdminSalonsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<AdminSalon | null>(null);
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
      const { data, error: salonsError } = await getAllSalonsForAdmin();

      if (salonsError) {
        setError(salonsError);
        setSalons([]);
      } else {
        setSalons(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }

  if (contextLoading || loading) {
    return (
      <AdminShell>
        <PageLayout title="Salons" description="Manage all salons">
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
          title="Salons"
          description="Manage and monitor all salons in the system"
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
              <CardTitle>All Salons</CardTitle>
            </CardHeader>
            <CardContent>
              {salons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No salons found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salon Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created</TableHead>
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

