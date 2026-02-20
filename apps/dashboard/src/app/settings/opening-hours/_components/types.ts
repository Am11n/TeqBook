export type DayForm = {
  day_of_week: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
  breakLabel: string;
};

export type ClosureRow = {
  id: string;
  salon_id: string;
  closed_date: string;
  reason: string | null;
};

export const DEFAULT_DAYS: DayForm[] = [
  { day_of_week: 0, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 1, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 2, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 3, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 4, isOpen: true, openTime: "09:00", closeTime: "17:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 5, isOpen: false, openTime: "10:00", closeTime: "15:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
  { day_of_week: 6, isOpen: false, openTime: "10:00", closeTime: "15:00", hasBreak: false, breakStart: "", breakEnd: "", breakLabel: "" },
];

export function validateDay(day: DayForm): string | null {
  if (!day.isOpen) return null;
  if (!day.openTime || !day.closeTime) return "Open and close times are required.";
  if (day.openTime === "00:00" && day.closeTime === "00:00") return "Both times cannot be 00:00.";
  if (day.closeTime <= day.openTime) return "Close time must be after open time.";
  if (day.hasBreak) {
    if (!day.breakStart || !day.breakEnd) return "Break start and end times are required.";
    if (day.breakEnd <= day.breakStart) return "Break end must be after break start.";
    if (day.breakStart < day.openTime || day.breakEnd > day.closeTime) return "Break must be within opening hours.";
  }
  return null;
}

export function getClosureSuggestions(): { label: string; date: string }[] {
  const year = new Date().getFullYear();
  return [
    { label: "17. mai", date: `${year}-05-17` },
    { label: "24. dec", date: `${year}-12-24` },
    { label: "25. dec", date: `${year}-12-25` },
    { label: "1. jan", date: `${year + 1}-01-01` },
  ].filter((s) => new Date(s.date) >= new Date());
}
