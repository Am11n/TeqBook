"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle } from "lucide-react";

type ImportRow = {
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  gdpr_consent: boolean;
  status: "create" | "skip" | "update" | "error";
  reason?: string;
};

type ImportStep = "upload" | "preview" | "importing" | "done";

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

interface ImportCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    rows: { full_name: string; email?: string | null; phone?: string | null; notes?: string | null; gdpr_consent: boolean }[],
    updateExisting: boolean,
  ) => Promise<{ created: number; skipped: number; updated: number; errors: number }>;
  translations?: ImportCustomersDialogTranslations;
}

const defaultTranslations: ImportCustomersDialogTranslations = {
  title: "Import customers from CSV",
  description: "Upload a CSV file with columns: name, email, phone, notes.",
  dragDrop: "Drag and drop a CSV file, or click to select a file.",
  selectFile: "Select file",
  willCreate: "will be created",
  errors: "errors",
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

function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-()]/g, "");
  if (/^\d{8}$/.test(cleaned)) {
    cleaned = "+47" + cleaned;
  }
  return cleaned;
}

function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function mapColumns(raw: Record<string, string>[], missingNameLabel: string): ImportRow[] {
  return raw.map((row) => {
    const name =
      row["name"] || row["full_name"] || row["navn"] || row["fullt navn"] || "";
    const email = row["email"] || row["e-post"] || row["epost"] || "";
    const phone =
      row["phone"] || row["telefon"] || row["mobil"] || row["tlf"] || "";
    const notes = row["notes"] || row["notater"] || row["merknad"] || "";

    if (!name.trim()) {
      return {
        full_name: name,
        email: null,
        phone: null,
        notes: null,
        gdpr_consent: false,
        status: "error" as const,
        reason: missingNameLabel,
      };
    }

    return {
      full_name: name.trim(),
      email: email ? normalizeEmail(email) : null,
      phone: phone ? normalizePhone(phone) : null,
      notes: notes.trim() || null,
      gdpr_consent: false,
      status: "create" as const,
    };
  });
}

export function ImportCustomersDialog({
  open,
  onOpenChange,
  onImport,
  translations,
}: ImportCustomersDialogProps) {
  const t = { ...defaultTranslations, ...translations };
  const [step, setStep] = useState<ImportStep>("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    updated: number;
    errors: number;
  } | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const raw = parseCsv(text);
        const mapped = mapColumns(raw, t.missingName);
        setRows(mapped);
        setStep("preview");
      };
      reader.readAsText(file);
    },
    [t.missingName],
  );

  const handleImport = async () => {
    setStep("importing");
    const validRows = rows
      .filter((r) => r.status !== "error")
      .map((r) => ({
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        notes: r.notes,
        gdpr_consent: r.gdpr_consent,
      }));

    const res = await onImport(validRows, updateExisting);
    setResult(res);
    setStep("done");
  };

  const handleClose = () => {
    setStep("upload");
    setRows([]);
    setResult(null);
    setUpdateExisting(false);
    onOpenChange(false);
  };

  const createCount = rows.filter((r) => r.status === "create").length;
  const errorCount = rows.filter((r) => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="py-8 text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t.dragDrop}</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" asChild>
                <span>{t.selectFile}</span>
              </Button>
            </label>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                {createCount} {t.willCreate}
              </Badge>
              {errorCount > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  {errorCount} {t.errors}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="update-existing"
                type="checkbox"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="update-existing" className="text-sm">
                {t.updateExisting}
              </Label>
            </div>

            <div className="max-h-[40vh] overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {t.statusCol}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {t.nameCol}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {t.emailCol}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {t.phoneCol}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">
                        {row.status === "create" && (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 text-[10px]"
                          >
                            {t.creating}
                          </Badge>
                        )}
                        {row.status === "error" && (
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200 text-[10px]"
                          >
                            {row.reason}
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">{row.full_name || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.email || "-"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.phone || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {t.cancel}
              </Button>
              <Button onClick={handleImport} disabled={createCount === 0}>
                {t.import} {createCount} {t.customers}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "importing" && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3 animate-pulse" />
            <p className="text-sm">{t.importing}</p>
          </div>
        )}

        {step === "done" && result && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium">{t.done}</p>
            <div className="flex justify-center gap-3 text-sm">
              {result.created > 0 && (
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-200"
                >
                  {result.created} {t.created}
                </Badge>
              )}
              {result.skipped > 0 && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-200"
                >
                  {result.skipped} {t.skipped}
                </Badge>
              )}
              {result.updated > 0 && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  {result.updated} {t.updated}
                </Badge>
              )}
              {result.errors > 0 && (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-200"
                >
                  {result.errors} {t.errors}
                </Badge>
              )}
            </div>
            <DialogFooter className="mt-4 justify-center">
              <Button onClick={handleClose}>{t.close}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
