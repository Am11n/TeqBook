export function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => `"${h}"`).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (value instanceof Date) return `"${value.toISOString()}"`;
        if (typeof value === "object") return `"${JSON.stringify(value)}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

export function downloadCSV(csvContent: string, filename: string): void {
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

export function formatDateForExport(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try { return new Date(dateStr).toISOString().split("T")[0]; }
  catch { return dateStr; }
}
