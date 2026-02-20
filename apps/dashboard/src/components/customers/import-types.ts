export type ImportRow = {
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  gdpr_consent: boolean;
  status: "create" | "skip" | "update" | "error";
  reason?: string;
};

export type ImportStep = "upload" | "preview" | "importing" | "done";

export interface ImportCustomersDialogTranslations {
  title: string;
  description: string;
  dragDrop: string;
  selectFile: string;
  willCreate: string;
  errors: string;
  updateExisting: string;
  statusCol: string;
  nameCol: string;
  emailCol: string;
  phoneCol: string;
  creating: string;
  errorBadge: string;
  cancel: string;
  import: string;
  customers: string;
  importing: string;
  done: string;
  created: string;
  skipped: string;
  updated: string;
  close: string;
  missingName: string;
}

export const defaultTranslations: ImportCustomersDialogTranslations = {
  title: "Import customers from CSV",
  description: "Upload a CSV file with columns: name, email, phone, notes.",
  dragDrop: "Drag and drop a CSV file, or click to select a file.",
  selectFile: "Select file",
  willCreate: "Will be created",
  errors: "Errors",
  updateExisting: "Update existing customers (match on phone/email)",
  statusCol: "Status",
  nameCol: "Name",
  emailCol: "Email",
  phoneCol: "Phone",
  creating: "Will create",
  errorBadge: "Error",
  cancel: "Cancel",
  import: "Import",
  customers: "customers",
  importing: "Importing...",
  done: "Import complete",
  created: "created",
  skipped: "skipped",
  updated: "updated",
  close: "Close",
  missingName: "Missing name",
};

export function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-()]/g, "");
  if (/^\d{8}$/.test(cleaned)) cleaned = "+47" + cleaned;
  return cleaned;
}

export function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

export function mapColumns(raw: Record<string, string>[], missingNameLabel: string): ImportRow[] {
  return raw.map((row) => {
    const name = row["name"] || row["full_name"] || row["navn"] || row["fullt navn"] || "";
    const email = row["email"] || row["e-post"] || row["epost"] || "";
    const phone = row["phone"] || row["telefon"] || row["mobil"] || row["tlf"] || "";
    const notes = row["notes"] || row["notater"] || row["merknad"] || "";
    if (!name.trim()) {
      return { full_name: name, email: null, phone: null, notes: null, gdpr_consent: false, status: "error" as const, reason: missingNameLabel };
    }
    return { full_name: name.trim(), email: email ? normalizeEmail(email) : null, phone: phone ? normalizePhone(phone) : null, notes: notes.trim() || null, gdpr_consent: false, status: "create" as const };
  });
}
