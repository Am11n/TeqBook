import { logInfo, logError, logWarn } from "@/lib/services/logger";

export type ImportError = { row: number; field: string; error: string };

export type ValidatedRow = {
  rowIndex: number;
  data: Record<string, unknown>;
  errors: ImportError[];
};

function validateEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function validatePhone(val: string): boolean {
  return /^[+\d\s()-]+$/.test(val) && val.replace(/\D/g, "").length >= 6;
}

function parsePriceCents(val: string): number | null {
  const cleaned = val.replace(/[^0-9.,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (cleaned.includes(".") || num < 10000) {
    return Math.round(num * 100);
  }
  return Math.round(num);
}

function parseDateTime(val: string): string | null {
  const iso = new Date(val);
  if (!isNaN(iso.getTime())) return iso.toISOString();

  const patterns = [
    /^(\d{1,2})[./](\d{1,2})[./](\d{4})\s+(\d{1,2}):(\d{2})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/,
  ];

  for (const pat of patterns) {
    const m = val.match(pat);
    if (m) {
      const [, a, b, c, hour, min] = m;
      let year: number, month: number, day: number;
      if (parseInt(a) > 31) {
        year = parseInt(a);
        month = parseInt(b);
        day = parseInt(c);
      } else {
        day = parseInt(a);
        month = parseInt(b);
        year = parseInt(c);
      }
      const d = new Date(year, month - 1, day, parseInt(hour), parseInt(min));
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }

  return null;
}

export function validateImportRows(
  importType: string,
  rows: Record<string, string>[],
  mapping: Record<string, string>
): { valid: ValidatedRow[]; errors: ValidatedRow[] } {
  const valid: ValidatedRow[] = [];
  const errors: ValidatedRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mapped: Record<string, unknown> = {};
    const rowErrors: ImportError[] = [];

    for (const [csvCol, tbField] of Object.entries(mapping)) {
      const rawVal = (row[csvCol] ?? "").trim();
      if (!rawVal) continue;

      switch (tbField) {
        case "full_name":
        case "name":
        case "customer_name":
        case "service_name":
        case "employee_name":
        case "notes":
        case "category":
        case "role":
        case "status":
          mapped[tbField] = rawVal;
          break;
        case "email":
          if (rawVal && !validateEmail(rawVal)) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Invalid email format" });
          } else {
            mapped[tbField] = rawVal || null;
          }
          break;
        case "phone":
          if (rawVal && !validatePhone(rawVal)) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Invalid phone format" });
          } else {
            mapped[tbField] = rawVal || null;
          }
          break;
        case "duration_minutes": {
          const dur = parseInt(rawVal, 10);
          if (isNaN(dur) || dur <= 0) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Duration must be a positive integer" });
          } else {
            mapped[tbField] = dur;
          }
          break;
        }
        case "price_cents": {
          const cents = parsePriceCents(rawVal);
          if (cents === null || cents < 0) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Invalid price" });
          } else {
            mapped[tbField] = cents;
          }
          break;
        }
        case "start_time":
        case "end_time": {
          const dt = parseDateTime(rawVal);
          if (!dt) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Could not parse date/time" });
          } else {
            mapped[tbField] = dt;
          }
          break;
        }
        default:
          mapped[tbField] = rawVal;
      }
    }

    if (importType === "customers" && !mapped.full_name) {
      rowErrors.push({ row: i + 1, field: "full_name", error: "Name is required" });
    }
    if (importType === "services") {
      if (!mapped.name) rowErrors.push({ row: i + 1, field: "name", error: "Service name is required" });
      if (!mapped.duration_minutes) rowErrors.push({ row: i + 1, field: "duration_minutes", error: "Duration is required" });
      if (mapped.price_cents === undefined) rowErrors.push({ row: i + 1, field: "price_cents", error: "Price is required" });
    }
    if (importType === "employees" && !mapped.full_name) {
      rowErrors.push({ row: i + 1, field: "full_name", error: "Name is required" });
    }
    if (importType === "bookings" && !mapped.start_time) {
      rowErrors.push({ row: i + 1, field: "start_time", error: "Start time is required" });
    }

    const result: ValidatedRow = { rowIndex: i, data: mapped, errors: rowErrors };
    if (rowErrors.length > 0) {
      errors.push(result);
    } else {
      valid.push(result);
    }
  }

  return { valid, errors };
}
