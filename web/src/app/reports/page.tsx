"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getTotalBookingsForSalon,
  getRevenueByMonthForSalon,
  getBookingsPerServiceForSalon,
  getCapacityUtilisationForSalon,
  type ReportsFilters,
} from "@/lib/services/reports-service";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import { getActiveServicesForSalon } from "@/lib/services/services-service";
import { Calendar, TrendingUp, Clock, DollarSign, Filter, X } from "lucide-react";
import type { Employee, Service } from "@/lib/types";

export default function ReportsPage() {
  const { salon, isReady } = useCurrentSalon();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<ReportsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Stats data
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [capacityUtilisation, setCapacityUtilisation] = useState<number>(0);
  const [averageBookingDuration, setAverageBookingDuration] = useState<number>(0);
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; revenue_cents: number; booking_count: number }[]>([]);
  const [bookingsPerService, setBookingsPerService] = useState<{ service_id: string; service_name: string; booking_count: number; revenue_cents: number }[]>([]);

  // Load employees and services for filters
  useEffect(() => {
    async function loadFilterData() {
      if (!salon?.id || !isReady) return;

      const [employeesResult, servicesResult] = await Promise.all([
        getEmployeesForSalon(salon.id),
        getActiveServicesForSalon(salon.id),
      ]);

      if (employeesResult.data) {
        setEmployees(employeesResult.data);
      }
      if (servicesResult.data) {
        setServices(servicesResult.data);
      }
    }

    loadFilterData();
  }, [salon?.id, isReady]);

  useEffect(() => {
    async function loadReports() {
      if (!salon?.id || !isReady) return;

      setLoading(true);
      setError(null);

      try {
        // Load all stats in parallel with filters
        const [bookingsResult, revenueResult, capacityResult, bookingsPerServiceResult] = await Promise.all([
          getTotalBookingsForSalon(salon.id, filters),
          getRevenueByMonthForSalon(salon.id, filters),
          getCapacityUtilisationForSalon(salon.id, filters),
          getBookingsPerServiceForSalon(salon.id, filters),
        ]);

        if (bookingsResult.error) {
          setError(bookingsResult.error);
          return;
        }

        if (revenueResult.error) {
          setError(revenueResult.error);
          return;
        }

        if (capacityResult.error) {
          setError(capacityResult.error);
          return;
        }

        if (bookingsPerServiceResult.error) {
          setError(bookingsPerServiceResult.error);
          return;
        }

        // Set total bookings
        setTotalBookings(bookingsResult.data?.total_count || 0);

        // Set revenue data
        const revenueData = revenueResult.data || [];
        setRevenueByMonth(revenueData);
        const totalRevenueCents = revenueData.reduce((sum, month) => sum + month.revenue_cents, 0);
        setTotalRevenue(totalRevenueCents);

        // Set capacity utilisation
        setCapacityUtilisation(capacityResult.data?.utilisation_percentage || 0);
        setAverageBookingDuration(capacityResult.data?.average_booking_duration_minutes || 0);

        // Set bookings per service
        setBookingsPerService(bookingsPerServiceResult.data || []);
      } catch (err) {
        console.error("Error loading reports:", err);
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [salon?.id, isReady, filters]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
  };

  const hasActiveFilters = filters.status || filters.startDate || filters.endDate || filters.employeeId || filters.serviceId;

  const clearFilters = () => {
    setFilters({});
  };

  const setDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    setFilters({
      ...filters,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  if (!isReady) {
    return (
      <DashboardShell>
        <PageHeader title="Reports" description="Analytics and insights" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Reports & Analytics" description="View insights and performance metrics" />

      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Filters */}
      <Card className="mt-6 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Quick date ranges */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Quick Range</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(7)}
                  className="text-xs"
                >
                  7d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(30)}
                  className="text-xs"
                >
                  30d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(90)}
                  className="text-xs"
                >
                  90d
                </Button>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-xs font-medium text-muted-foreground">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate ? new Date(filters.startDate).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-xs font-medium text-muted-foreground">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate ? new Date(filters.endDate).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <select
                id="status"
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value || null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <label htmlFor="service" className="text-xs font-medium text-muted-foreground">
                Service
              </label>
              <select
                id="service"
                value={filters.serviceId || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    serviceId: e.target.value || null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">All Services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee */}
            <div className="space-y-2">
              <label htmlFor="employee" className="text-xs font-medium text-muted-foreground">
                Employee
              </label>
              <select
                id="employee"
                value={filters.employeeId || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    employeeId: e.target.value || null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold mt-2">{totalBookings.toLocaleString()}</p>
                  {/* Sparkline chart */}
                  {revenueByMonth.length > 0 && (
                    <div className="h-8 w-full mt-2 flex items-end gap-0.5">
                      {revenueByMonth.slice(-7).map((data, index) => {
                        const maxBookings = Math.max(
                          ...revenueByMonth.slice(-7).map((d) => d.booking_count),
                          1
                        );
                        const height = (data.booking_count / maxBookings) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-primary/20 rounded-t transition-all duration-300 hover:bg-primary/40"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`${data.booking_count} bookings`}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ml-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-2" />
              ) : (
                <>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
                  {/* Sparkline chart */}
                  {revenueByMonth.length > 0 && (
                    <div className="h-8 w-full mt-2 flex items-end gap-0.5">
                      {revenueByMonth.slice(-7).map((data, index) => {
                        const maxRevenue = Math.max(
                          ...revenueByMonth.slice(-7).map((d) => d.revenue_cents),
                          1
                        );
                        const height = (data.revenue_cents / maxRevenue) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-green-500/20 rounded-t transition-all duration-300 hover:bg-green-500/40"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={formatCurrency(data.revenue_cents)}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center ml-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Capacity Utilisation */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Capacity Utilisation</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{capacityUtilisation.toFixed(1)}%</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Average Duration */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Booking Duration</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{formatDuration(averageBookingDuration)}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : revenueByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No revenue data available</p>
          ) : (
            <div className="h-64 w-full rounded-lg bg-muted/50 border border-border flex items-end justify-between gap-1 px-2 py-2">
              {revenueByMonth.map((data, index) => {
                const maxRevenue = Math.max(
                  ...revenueByMonth.map((d) => d.revenue_cents),
                  1
                );
                const height = (data.revenue_cents / maxRevenue) * 100;
                const monthLabel = new Date(data.month).toLocaleDateString("en-US", {
                  month: "short",
                });

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 h-full justify-end gap-1 group relative"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-green-600 to-green-500 opacity-80 hover:opacity-100 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "8px" }}
                      title={`${monthLabel}: ${formatCurrency(data.revenue_cents)}`}
                    />
                    <span className="text-[10px] text-muted-foreground">{monthLabel}</span>
                    <span className="text-[10px] font-medium text-foreground">
                      {formatCurrency(data.revenue_cents).replace("NOK", "").trim()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Bookings per Service Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bookings per Service</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : bookingsPerService.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No booking data available</p>
          ) : (
            <div className="space-y-3">
              {bookingsPerService.slice(0, 8).map((service) => {
                const maxBookings = Math.max(
                  ...bookingsPerService.map((s) => s.booking_count),
                  1
                );
                const width = (service.booking_count / maxBookings) * 100;

                return (
                  <div key={service.service_id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1">{service.service_name}</span>
                      <span className="text-muted-foreground ml-2">
                        {service.booking_count} bookings
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Revenue: {formatCurrency(service.revenue_cents)}
                    </div>
                  </div>
                );
              })}
              {bookingsPerService.length > 8 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{bookingsPerService.length - 8} more services
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Capacity Utilisation Chart */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Capacity Utilisation</h3>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilisation</span>
              <span className="text-2xl font-bold">{capacityUtilisation.toFixed(1)}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityUtilisation >= 80
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : capacityUtilisation >= 50
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                }`}
                style={{ width: `${Math.min(capacityUtilisation, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Hours Booked</p>
                <p className="font-semibold">
                  {capacityUtilisation > 0
                    ? ((capacityUtilisation / 100) * (totalBookings * averageBookingDuration) / 60).toFixed(1)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Bookings</p>
                <p className="font-semibold">{totalBookings}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Duration</p>
                <p className="font-semibold">{formatDuration(averageBookingDuration)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}

