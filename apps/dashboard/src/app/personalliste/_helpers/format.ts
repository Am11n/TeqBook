export function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function formatTime(iso: string | null): string {
  if (!iso) return "–";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "–";
  try {
    const d = new Date(iso);
    return d.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
