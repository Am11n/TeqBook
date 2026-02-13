"use client";

import { useState } from "react";
import { FeatureGate } from "@/components/feature-gate";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  exportBookingsToCSV,
  exportRevenueToCSV,
  exportEmployeeWorkloadToCSV,
} from "@/lib/services/export-service";
import { Download, FileSpreadsheet, Calendar, DollarSign, Users } from "lucide-react";

export default function ExportPage() {
  const { salon, isReady } = useCurrentSalon();
  const [exporting, setExporting] = useState<{
    bookings: boolean;
    revenue: boolean;
    workload: boolean;
  }>({
    bookings: false,
    revenue: false,
    workload: false,
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExportBookings = async () => {
    if (!salon?.id || !isReady) return;

    setExporting((prev) => ({ ...prev, bookings: true }));

    const { success, error } = await exportBookingsToCSV(salon.id);

    setExporting((prev) => ({ ...prev, bookings: false }));

    if (success) {
      setMessage({ type: "success", text: "Bookings CSV file has been downloaded" });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: "error", text: error || "Failed to export bookings" });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleExportRevenue = async () => {
    if (!salon?.id || !isReady) return;

    setExporting((prev) => ({ ...prev, revenue: true }));

    const { success, error } = await exportRevenueToCSV(salon.id);

    setExporting((prev) => ({ ...prev, revenue: false }));

    if (success) {
      setMessage({ type: "success", text: "Revenue CSV file has been downloaded" });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: "error", text: error || "Failed to export revenue" });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleExportWorkload = async () => {
    if (!salon?.id || !isReady) return;

    setExporting((prev) => ({ ...prev, workload: true }));

    const { success, error } = await exportEmployeeWorkloadToCSV(salon.id);

    setExporting((prev) => ({ ...prev, workload: false }));

    if (success) {
      setMessage({ type: "success", text: "Employee workload CSV file has been downloaded" });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: "error", text: error || "Failed to export employee workload" });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <FeatureGate feature="EXPORTS">
    <DashboardShell>
      <PageHeader
        title="Export Data"
        description="Export your salon data to CSV files for accounting and analysis"
      />

      {/* Toast Message */}
      {message && (
        <div
          className={`mb-4 rounded-lg border p-4 ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Bookings Export */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Bookings Export</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Export all bookings with customer, employee, service, and timing information.
                Includes booking ID, status, dates, and notes.
              </p>
            </div>
            <Button
              onClick={handleExportBookings}
              disabled={!isReady || !salon?.id || exporting.bookings}
            >
              {exporting.bookings ? (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Bookings
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Revenue Export */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Revenue Export</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Export monthly revenue data with booking counts. Shows revenue breakdown by month
                for accounting and financial analysis.
              </p>
            </div>
            <Button
              onClick={handleExportRevenue}
              disabled={!isReady || !salon?.id || exporting.revenue}
            >
              {exporting.revenue ? (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Revenue
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Employee Workload Export */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Employee Workload Export</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Export employee workload statistics including booking counts and total hours worked.
                Useful for payroll and performance analysis.
              </p>
            </div>
            <Button
              onClick={handleExportWorkload}
              disabled={!isReady || !salon?.id || exporting.workload}
            >
              {exporting.workload ? (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Workload
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
    </FeatureGate>
  );
}

