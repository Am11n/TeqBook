"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { formatPrice } from "@/lib/utils/services/services-utils";
import {
  calculateCommissionReport,
  listRules,
  saveRule,
  deleteRule,
  type EmployeeCommissionReport,
  type CommissionRule,
} from "@/lib/services/commission-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";

export default function CommissionsPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  // Date range: default to current month
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(endOfMonth);
  const [reports, setReports] = useState<EmployeeCommissionReport[]>([]);
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rule editing
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [ruleEmployeeId, setRuleEmployeeId] = useState<string>("");
  const [ruleType, setRuleType] = useState<"percentage" | "fixed_per_booking">("percentage");
  const [ruleRate, setRuleRate] = useState("");
  const [ruleAppliesTo, setRuleAppliesTo] = useState<"services" | "products" | "both">("services");
  const [savingRule, setSavingRule] = useState(false);

  const loadData = async () => {
    if (!salon?.id) return;
    setLoading(true);
    const [reportRes, rulesRes, empRes] = await Promise.all([
      calculateCommissionReport(salon.id, startDate + "T00:00:00Z", endDate + "T23:59:59Z"),
      listRules(salon.id),
      getEmployeesForCurrentSalon(salon.id),
    ]);
    setReports(reportRes.data ?? []);
    setRules(rulesRes.data ?? []);
    setEmployees((empRes.data ?? []).filter((e) => e.is_active).map((e) => ({ id: e.id, full_name: e.full_name })));
    if (reportRes.error) setError(reportRes.error);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [salon?.id, startDate, endDate]);

  const handleSaveRule = async () => {
    if (!salon?.id) return;
    setSavingRule(true);
    const rate = parseFloat(ruleRate);
    if (isNaN(rate)) {
      setError("Invalid rate");
      setSavingRule(false);
      return;
    }

    const { error } = await saveRule({
      salonId: salon.id,
      employeeId: ruleEmployeeId || null,
      commissionType: ruleType,
      rate,
      appliesTo: ruleAppliesTo,
    });

    setSavingRule(false);
    if (error) {
      setError(error);
      return;
    }
    setShowRuleDialog(false);
    await loadData();
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!salon?.id) return;
    await deleteRule(salon.id, ruleId);
    await loadData();
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const header = "Employee,Bookings,Revenue,Commission,Net to Salon\n";
    const rows = reports.map((r) =>
      `"${r.employeeName}",${r.bookingsCount},${(r.revenueGeneratedCents / 100).toFixed(2)},${(r.commissionEarnedCents / 100).toFixed(2)},${(r.netToSalonCents / 100).toFixed(2)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = reports.reduce(
    (acc, r) => ({
      bookings: acc.bookings + r.bookingsCount,
      revenue: acc.revenue + r.revenueGeneratedCents,
      commission: acc.commission + r.commissionEarnedCents,
      net: acc.net + r.netToSalonCents,
    }),
    { bookings: 0, revenue: 0, commission: 0, net: 0 }
  );

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

      <div className="flex items-center justify-end gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={() => setShowRuleDialog(true)}>
          Manage Rules
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={reports.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

        {/* Date range */}
        <div className="flex items-center gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 h-8 rounded-md border bg-background px-2 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 h-8 rounded-md border bg-background px-2 text-xs"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Calculating commissions...</p>
          ) : reports.length === 0 ? (
            <EmptyState title="No completed bookings" description="No completed bookings found in this date range." />
          ) : (
            <>
              {/* Summary */}
              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
                <div className="text-xs">
                  <span className="text-muted-foreground">Total Bookings</span>
                  <p className="text-sm font-semibold">{totals.bookings}</p>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <p className="text-sm font-semibold">{fmtPrice(totals.revenue)}</p>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Total Commission</span>
                  <p className="text-sm font-semibold">{fmtPrice(totals.commission)}</p>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Net to Salon</span>
                  <p className="text-sm font-semibold">{fmtPrice(totals.net)}</p>
                </div>
              </div>

              {/* Per-employee table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 text-left font-medium">Employee</th>
                    <th className="py-2 text-right font-medium">Bookings</th>
                    <th className="py-2 text-right font-medium">Revenue</th>
                    <th className="py-2 text-right font-medium">Commission</th>
                    <th className="py-2 text-right font-medium">Net</th>
                    <th className="py-2 text-right font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.employeeId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{r.employeeName}</td>
                      <td className="py-2 text-right">{r.bookingsCount}</td>
                      <td className="py-2 text-right">{fmtPrice(r.revenueGeneratedCents)}</td>
                      <td className="py-2 text-right">{fmtPrice(r.commissionEarnedCents)}</td>
                      <td className="py-2 text-right">{fmtPrice(r.netToSalonCents)}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {r.rule
                          ? r.rule.commission_type === "percentage"
                            ? `${(r.rule.rate * 100).toFixed(0)}%`
                            : `${fmtPrice(r.rule.rate)}/booking`
                          : "No rule"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Active rules summary */}
        {rules.length > 0 && (
          <div className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Commission Rules</h3>
            <div className="divide-y">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-2 text-xs">
                  <span>{rule.employee?.full_name ?? "Salon default"}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {rule.commission_type === "percentage"
                        ? `${(rule.rate * 100).toFixed(0)}%`
                        : `${fmtPrice(rule.rate)}/booking`}
                      {" "}on {rule.applies_to}
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-600" onClick={() => handleDeleteRule(rule.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rule Dialog */}
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Commission Rule</DialogTitle>
              <DialogDescription>Set commission rate for an employee or salon default.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Employee</label>
                <select
                  value={ruleEmployeeId}
                  onChange={(e) => setRuleEmployeeId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  <option value="">Salon default (all employees)</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Type</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as "percentage" | "fixed_per_booking")}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  <option value="percentage">Percentage of revenue</option>
                  <option value="fixed_per_booking">Fixed amount per booking</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">
                  {ruleType === "percentage" ? "Rate (decimal, e.g. 0.30 = 30%)" : `Amount per booking (${salonCurrency} in cents)`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ruleRate}
                  onChange={(e) => setRuleRate(e.target.value)}
                  placeholder={ruleType === "percentage" ? "0.30" : "5000"}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Applies to</label>
                <select
                  value={ruleAppliesTo}
                  onChange={(e) => setRuleAppliesTo(e.target.value as "services" | "products" | "both")}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  <option value="services">Services only</option>
                  <option value="products">Products only</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveRule} disabled={savingRule || !ruleRate.trim()}>
                {savingRule ? "Saving..." : "Save Rule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </ErrorBoundary>
  );
}
