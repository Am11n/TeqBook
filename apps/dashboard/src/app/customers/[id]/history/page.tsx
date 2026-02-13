"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import {
  getCustomerHistory,
  exportCustomerHistoryToCSV,
  formatDate,
  type CustomerHistoryData,
} from "@/lib/services/customer-history-service";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { CustomerBookingHistoryItem } from "@/lib/repositories/bookings";
import { ArrowLeft, Download, Calendar, User, DollarSign, Clock } from "lucide-react";

// Status badge colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-gray-100 text-gray-800",
  scheduled: "bg-purple-100 text-purple-800",
};

export default function CustomerHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const { salon, isReady } = useCurrentSalon();
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  const { hasFeature, loading: featuresLoading } = useFeatures();

  const [historyData, setHistoryData] = useState<CustomerHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Load customer history
  const loadHistory = useCallback(async () => {
    if (!salon?.id || !customerId) return;

    setLoading(true);
    setError(null);

    const options = {
      page,
      pageSize,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };

    const { data, error: loadError } = await getCustomerHistory(
      salon.id,
      customerId,
      options
    );

    if (loadError) {
      setError(loadError);
      setLoading(false);
      return;
    }

    setHistoryData(data);
    setLoading(false);
  }, [salon?.id, customerId, page, pageSize, statusFilter]);

  useEffect(() => {
    if (!isReady || !salon?.id) return;
    loadHistory();
  }, [isReady, salon?.id, loadHistory]);

  // Handle CSV export
  async function handleExport() {
    if (!salon?.id || !customerId) return;

    setExporting(true);
    setError(null);

    const { csvContent, filename, error: exportError } = await exportCustomerHistoryToCSV(
      salon.id,
      customerId,
      { status: statusFilter !== "all" ? statusFilter : undefined }
    );

    if (exportError) {
      setError(exportError);
      setExporting(false);
      return;
    }

    if (csvContent && filename) {
      // Download the CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setExporting(false);
  }

  // Check if feature is available
  const hasAccess = hasFeature("CUSTOMER_HISTORY");

  if (!featuresLoading && !hasAccess) {
    return (
      <PageLayout
        title="Customer Booking History"
        description="View detailed booking history for this customer"
        showCard={false}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-amber-100 p-4">
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Business Plan Feature</h2>
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            Customer booking history is available on the Business plan. Upgrade to view detailed
            booking history, statistics, and export data for your customers.
          </p>
          <Button onClick={() => router.push("/settings/billing")}>
            Upgrade Plan
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title={historyData?.customer?.full_name || "Customer History"}
        description="Booking history and statistics"
        showCard={false}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push("/customers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-4"
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading history...</div>
          </div>
        ) : historyData ? (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{historyData.customer.full_name}</h2>
                  <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {historyData.customer.email && <div>{historyData.customer.email}</div>}
                    {historyData.customer.phone && <div>{historyData.customer.phone}</div>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting || historyData.stats.total_bookings === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Calendar className="h-5 w-5" />}
                label="Total Visits"
                value={historyData.stats.completed_bookings.toString()}
                subtext={`${historyData.stats.total_bookings} total bookings`}
              />
              <StatCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Total Spent"
                value={fmtPrice(historyData.stats.total_spent_cents)}
                subtext={historyData.stats.favorite_service ? `Favorite: ${historyData.stats.favorite_service}` : undefined}
              />
              <StatCard
                icon={<User className="h-5 w-5" />}
                label="Favorite Employee"
                value={historyData.stats.favorite_employee || "-"}
                subtext={historyData.stats.cancelled_bookings > 0 ? `${historyData.stats.cancelled_bookings} cancelled` : undefined}
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label="Last Visit"
                value={historyData.stats.last_visit ? formatDate(historyData.stats.last_visit, locale) : "-"}
                subtext={historyData.stats.first_visit ? `First: ${formatDate(historyData.stats.first_visit, locale)}` : undefined}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No-show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Booking History Table */}
            <div className="rounded-xl border bg-card shadow-sm">
              {historyData.bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                <>
                  {/* Mobile view */}
                  <div className="space-y-3 p-4 md:hidden">
                    {historyData.bookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} locale={locale} fmtPrice={fmtPrice} />
                    ))}
                  </div>

                  {/* Desktop view */}
                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData.bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">
                                {formatDate(booking.start_time, locale)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(booking.start_time).toLocaleTimeString(locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </TableCell>
                            <TableCell>{booking.service_name || "-"}</TableCell>
                            <TableCell>{booking.employee_name || "-"}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || "bg-gray-100"}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {booking.service_price_cents
                                ? fmtPrice(booking.service_price_cents)
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {historyData.total > pageSize && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <div className="text-sm text-muted-foreground">
                        Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, historyData.total)} of {historyData.total}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={(page + 1) * pageSize >= historyData.total}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null}
      </PageLayout>
    </ErrorBoundary>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
          {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
        </div>
      </div>
    </div>
  );
}

// Mobile Booking Card Component
function BookingCard({
  booking,
  locale,
  fmtPrice,
}: {
  booking: CustomerBookingHistoryItem;
  locale: string;
  fmtPrice: (cents: number) => string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{booking.service_name || "Unknown service"}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDate(booking.start_time, locale)} at{" "}
            {new Date(booking.start_time).toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {booking.employee_name && (
            <div className="mt-1 text-xs text-muted-foreground">
              with {booking.employee_name}
            </div>
          )}
        </div>
        <div className="text-right">
          <Badge className={statusColors[booking.status] || "bg-gray-100"}>
            {booking.status}
          </Badge>
          {booking.service_price_cents && (
            <div className="mt-1 text-sm font-medium">
              {fmtPrice(booking.service_price_cents)}
            </div>
          )}
        </div>
      </div>
      {booking.notes && (
        <div className="mt-2 text-xs text-muted-foreground">{booking.notes}</div>
      )}
    </div>
  );
}
