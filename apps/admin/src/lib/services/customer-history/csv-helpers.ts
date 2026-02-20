import type { CustomerHistoryExportRow } from "./customer-booking-history-service";

export function buildCsvRows(
  bookings: Array<{
    start_time: string; service_name?: string | null;
    employee_name?: string | null; status: string;
    service_price_cents?: number | null; notes?: string | null;
  }>
): CustomerHistoryExportRow[] {
  return bookings.map((b) => {
    const date = new Date(b.start_time);
    return {
      "Booking Date": date.toLocaleDateString(),
      "Time": date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      "Service": b.service_name || "-",
      "Employee": b.employee_name || "-",
      "Status": b.status,
      "Price": b.service_price_cents ? `${(b.service_price_cents / 100).toFixed(2)}` : "-",
      "Notes": b.notes || "",
    };
  });
}

export function rowsToCsv(rows: CustomerHistoryExportRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]) as (keyof CustomerHistoryExportRow)[];
  const headerRow = headers.map((h) => `"${h}"`).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

export function formatDate(dateString: string, locale = "nb-NO"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}
