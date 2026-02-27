"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import {
  getCustomerHistory,
  exportCustomerHistoryToCSV,
  type CustomerHistoryData,
} from "@/lib/services/customer-history-service";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { normalizeLocale } from "@/i18n/normalizeLocale";

export function useCustomerHistory() {
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

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadHistory = useCallback(async () => {
    if (!salon?.id || !customerId) return;

    setLoading(true);
    setError(null);

    const options = {
      page,
      pageSize,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };

    const { data, error: loadError } = await getCustomerHistory(salon.id, customerId, options);

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

  const hasAccess = hasFeature("CUSTOMER_HISTORY");

  return {
    router,
    locale,
    fmtPrice,
    historyData,
    loading,
    error,
    setError,
    exporting,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    handleExport,
    hasAccess,
    featuresLoading,
  };
}
