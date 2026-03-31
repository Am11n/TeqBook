"use client";

import { useMemo } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/services/customer-history-service";
import { ArrowLeft, Download, Calendar, User, DollarSign, Clock } from "lucide-react";
import { useCustomerHistory } from "./_components/useCustomerHistory";
import { StatCard } from "./_components/StatCard";
import { BookingCard, statusColors } from "./_components/BookingCard";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";

export default function CustomerHistoryPage() {
  const { locale: appLocaleRaw } = useLocale();
  const appLocale = normalizeLocale(appLocaleRaw);
  const t = useMemo(
    () => resolveNamespace("customers", translations[appLocale].customers),
    [appLocale],
  );
  const d = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );
  const {
    router, locale, fmtPrice, historyData, loading, error, setError,
    exporting, statusFilter, setStatusFilter, page, setPage, pageSize,
    handleExport, hasAccess, featuresLoading,
  } = useCustomerHistory();

  if (!featuresLoading && !hasAccess) {
    return (
      <PageLayout title={t.customerHistoryTitle} description={t.customerHistoryDescription} showCard={false}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-amber-100 p-4">
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">{t.customerHistoryFeatureTitle}</h2>
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            {t.customerHistoryFeatureDescription}
          </p>
          <Button onClick={() => router.push("/settings/billing")}>{t.customerHistoryUpgradePlan}</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title={historyData?.customer?.full_name || t.customerHistoryTitle}
        description={t.customerHistoryDescription}
        showCard={false}
      >
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t.customerHistoryBackToCustomers}
        </Button>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">{t.customerHistoryLoading}</div>
          </div>
        ) : historyData ? (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{historyData.customer.full_name}</h2>
                  <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {historyData.customer.email && <div>{historyData.customer.email}</div>}
                    {historyData.customer.phone && <div>{historyData.customer.phone}</div>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || historyData.stats.total_bookings === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? t.customerHistoryExporting : t.customerHistoryExportCsv}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Calendar className="h-5 w-5" />} label={t.customerHistoryTotalVisits} value={historyData.stats.completed_bookings.toString()} subtext={`${historyData.stats.total_bookings} ${t.customerHistoryTotalBookingsSuffix}`} />
              <StatCard icon={<DollarSign className="h-5 w-5" />} label={t.customerHistoryTotalSpent} value={fmtPrice(historyData.stats.total_spent_cents)} subtext={historyData.stats.favorite_service ? `${t.customerHistoryFavoritePrefix} ${historyData.stats.favorite_service}` : undefined} />
              <StatCard icon={<User className="h-5 w-5" />} label={t.customerHistoryFavoriteEmployee} value={historyData.stats.favorite_employee || "-"} subtext={historyData.stats.cancelled_bookings > 0 ? `${historyData.stats.cancelled_bookings} ${t.customerHistoryCancelledSuffix}` : undefined} />
              <StatCard icon={<Clock className="h-5 w-5" />} label={t.customerHistoryLastVisit} value={historyData.stats.last_visit ? formatDate(historyData.stats.last_visit, locale) : "-"} subtext={historyData.stats.first_visit ? `${t.customerHistoryFirstPrefix} ${formatDate(historyData.stats.first_visit, locale)}` : undefined} />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.customerHistoryStatus}</span>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder={t.customerHistoryAllStatuses} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.customerHistoryAllStatuses}</SelectItem>
                    <SelectItem value="completed">{d.reportsCompleted}</SelectItem>
                    <SelectItem value="confirmed">{d.reportsConfirmed}</SelectItem>
                    <SelectItem value="pending">{d.reportsPending}</SelectItem>
                    <SelectItem value="cancelled">{d.reportsCancelled}</SelectItem>
                    <SelectItem value="no-show">{d.reportsNoShow}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
              {historyData.bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t.customerHistoryNoBookingsFound}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 p-4 md:hidden">
                    {historyData.bookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} locale={locale} fmtPrice={fmtPrice} />
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.customerHistoryDate}</TableHead>
                          <TableHead>{t.customerHistoryService}</TableHead>
                          <TableHead>{t.customerHistoryEmployee}</TableHead>
                          <TableHead>{t.customerHistoryStatusLabel}</TableHead>
                          <TableHead className="text-right">{t.customerHistoryPrice}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData.bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">{formatDate(booking.start_time, locale)}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(booking.start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </TableCell>
                            <TableCell>{booking.service_name || "-"}</TableCell>
                            <TableCell>{booking.employee_name || "-"}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || "bg-gray-100"}>{booking.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {booking.service_price_cents ? fmtPrice(booking.service_price_cents) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {historyData.total > pageSize && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <div className="text-sm text-muted-foreground">
                        {t.customerHistoryShowing} {page * pageSize + 1}-{Math.min((page + 1) * pageSize, historyData.total)} {t.customerHistoryOf} {historyData.total}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>{t.customerHistoryPrevious}</Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * pageSize >= historyData.total}>{t.customerHistoryNext}</Button>
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
