import { supabase } from "@/lib/supabase-client";
import {
  createImportBatch,
  updateImportBatch,
  getImportHistory,
  type ImportBatch,
} from "@/lib/repositories/import-batches";
import { logInfo, logError, logWarn } from "@/lib/services/logger";

export type { ImportBatch };

export type ImportError = { row: number; field: string; error: string };

export type ValidatedRow = {
  rowIndex: number;
  data: Record<string, unknown>;
  errors: ImportError[];
};

const CHUNK_SIZE = 200;

// ─── Validation ────────────────────────────────────────

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
  // If it looks like it's already in major units (has decimal or < 1000 and is a typical price)
  if (cleaned.includes(".") || num < 10000) {
    return Math.round(num * 100);
  }
  return Math.round(num); // Already in cents
}

function parseDateTime(val: string): string | null {
  // Try ISO 8601 first
  const iso = new Date(val);
  if (!isNaN(iso.getTime())) return iso.toISOString();

  // Try DD/MM/YYYY HH:mm or DD.MM.YYYY HH:mm
  const patterns = [
    /^(\d{1,2})[./](\d{1,2})[./](\d{4})\s+(\d{1,2}):(\d{2})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/,
  ];

  for (const pat of patterns) {
    const m = val.match(pat);
    if (m) {
      const [, a, b, c, hour, min] = m;
      // Determine if it's DD/MM/YYYY or YYYY-MM-DD
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
        case "duration_minutes":
          const dur = parseInt(rawVal, 10);
          if (isNaN(dur) || dur <= 0) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Duration must be a positive integer" });
          } else {
            mapped[tbField] = dur;
          }
          break;
        case "price_cents":
          const cents = parsePriceCents(rawVal);
          if (cents === null || cents < 0) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Invalid price" });
          } else {
            mapped[tbField] = cents;
          }
          break;
        case "start_time":
        case "end_time":
          const dt = parseDateTime(rawVal);
          if (!dt) {
            rowErrors.push({ row: i + 1, field: tbField, error: "Could not parse date/time" });
          } else {
            mapped[tbField] = dt;
          }
          break;
        default:
          mapped[tbField] = rawVal;
      }
    }

    // Check required fields per type
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

// ─── Execute Import ────────────────────────────────────

export async function executeImport(
  salonId: string,
  importType: string,
  validRows: ValidatedRow[],
  mapping: Record<string, string>,
  fileName?: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ batch: ImportBatch | null; error: string | null }> {
  if (validRows.length === 0) return { batch: null, error: "No valid rows to import" };

  // Create batch record
  const { data: batch, error: batchErr } = await createImportBatch({
    salon_id: salonId,
    import_type: importType,
    file_name: fileName,
    total_rows: validRows.length,
    column_mapping: mapping,
  });

  if (batchErr || !batch) return { batch: null, error: batchErr ?? "Failed to create batch" };

  // Update status to processing
  await updateImportBatch(batch.id, salonId, { status: "processing" });

  let successCount = 0;
  let failedCount = 0;
  const errorLog: ImportError[] = [];

  // Process in chunks
  for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
    const chunk = validRows.slice(i, i + CHUNK_SIZE);

    try {
      const { successes, failures } = await insertChunk(salonId, importType, chunk, batch.id);
      successCount += successes;
      failedCount += failures.length;
      errorLog.push(...failures);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chunk insert failed";
      failedCount += chunk.length;
      for (const row of chunk) {
        errorLog.push({ row: row.rowIndex + 1, field: "*", error: msg });
      }
    }

    onProgress?.(Math.min(i + CHUNK_SIZE, validRows.length), validRows.length);
  }

  // Update batch with results
  const finalStatus = failedCount === validRows.length ? "failed" : "completed";
  await updateImportBatch(batch.id, salonId, {
    status: finalStatus,
    success_count: successCount,
    failed_count: failedCount,
    error_log: errorLog,
    completed_at: new Date().toISOString(),
  });

  logInfo("Import completed", {
    salonId,
    batchId: batch.id,
    importType,
    total: validRows.length,
    success: successCount,
    failed: failedCount,
  });

  // Re-fetch to get updated values
  const { data: updatedBatch } = await import("@/lib/repositories/import-batches").then(
    (m) => m.getImportBatch(batch.id, salonId)
  );

  return { batch: updatedBatch, error: null };
}

async function insertChunk(
  salonId: string,
  importType: string,
  rows: ValidatedRow[],
  batchId: string
): Promise<{ successes: number; failures: ImportError[] }> {
  const failures: ImportError[] = [];
  let successes = 0;

  switch (importType) {
    case "customers": {
      const records = rows.map((r) => ({
        salon_id: salonId,
        full_name: r.data.full_name as string,
        email: (r.data.email as string) || null,
        phone: (r.data.phone as string) || null,
        notes: (r.data.notes as string) || null,
        gdpr_consent: true,
        import_batch_id: batchId,
      }));

      const { error } = await supabase.from("customers").insert(records);
      if (error) {
        failures.push(...rows.map((r) => ({ row: r.rowIndex + 1, field: "*", error: error.message })));
      } else {
        successes = rows.length;
      }
      break;
    }
    case "services": {
      const records = rows.map((r) => ({
        salon_id: salonId,
        name: r.data.name as string,
        duration_minutes: r.data.duration_minutes as number,
        price_cents: (r.data.price_cents as number) ?? 0,
        category: (r.data.category as string) || "other",
        prep_minutes: 0,
        cleanup_minutes: 0,
        import_batch_id: batchId,
      }));

      const { error } = await supabase.from("services").insert(records);
      if (error) {
        failures.push(...rows.map((r) => ({ row: r.rowIndex + 1, field: "*", error: error.message })));
      } else {
        successes = rows.length;
      }
      break;
    }
    case "employees": {
      const records = rows.map((r) => ({
        salon_id: salonId,
        full_name: r.data.full_name as string,
        email: (r.data.email as string) || null,
        role: (r.data.role as string) || "staff",
        import_batch_id: batchId,
      }));

      const { error } = await supabase.from("employees").insert(records);
      if (error) {
        failures.push(...rows.map((r) => ({ row: r.rowIndex + 1, field: "*", error: error.message })));
      } else {
        successes = rows.length;
      }
      break;
    }
    case "bookings": {
      // For bookings, we need to resolve customer/service/employee by name
      for (const row of rows) {
        try {
          // Find or skip customer
          let customerId: string | null = null;
          if (row.data.customer_name) {
            const { data: custData } = await supabase
              .from("customers")
              .select("id")
              .eq("salon_id", salonId)
              .ilike("full_name", row.data.customer_name as string)
              .limit(1);
            customerId = custData?.[0]?.id ?? null;
          }

          // Find or skip service
          let serviceId: string | null = null;
          if (row.data.service_name) {
            const { data: svcData } = await supabase
              .from("services")
              .select("id")
              .eq("salon_id", salonId)
              .ilike("name", row.data.service_name as string)
              .limit(1);
            serviceId = svcData?.[0]?.id ?? null;
          }

          // Find or skip employee
          let employeeId: string | null = null;
          if (row.data.employee_name) {
            const { data: empData } = await supabase
              .from("employees")
              .select("id")
              .eq("salon_id", salonId)
              .ilike("full_name", row.data.employee_name as string)
              .limit(1);
            employeeId = empData?.[0]?.id ?? null;
          }

          const startTime = row.data.start_time as string;
          const endTime = (row.data.end_time as string) || new Date(new Date(startTime).getTime() + 60 * 60000).toISOString();

          const { error } = await supabase.from("bookings").insert({
            salon_id: salonId,
            customer_id: customerId,
            service_id: serviceId,
            employee_id: employeeId,
            start_time: startTime,
            end_time: endTime,
            status: (row.data.status as string) || "completed",
            is_walk_in: false,
            is_imported: true,
            import_batch_id: batchId,
          });

          if (error) {
            failures.push({ row: row.rowIndex + 1, field: "*", error: error.message });
          } else {
            successes++;
          }
        } catch (err) {
          failures.push({ row: row.rowIndex + 1, field: "*", error: err instanceof Error ? err.message : "Unknown" });
        }
      }
      break;
    }
  }

  return { successes, failures };
}

// ─── Rollback ──────────────────────────────────────────

export async function rollbackImport(
  salonId: string,
  batchId: string
): Promise<{ error: string | null }> {
  try {
    // Check batch age (allow rollback within 7 days)
    const { data: batch } = await import("@/lib/repositories/import-batches").then(
      (m) => m.getImportBatch(batchId, salonId)
    );

    if (!batch) return { error: "Import batch not found" };
    if (batch.status === "rolled_back") return { error: "Already rolled back" };

    const createdAt = new Date(batch.created_at);
    const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return { error: "Rollback window expired (7 days)" };

    // Delete all records with this import_batch_id
    const table = batch.import_type === "bookings" ? "bookings"
      : batch.import_type === "customers" ? "customers"
      : batch.import_type === "services" ? "services"
      : batch.import_type === "employees" ? "employees"
      : null;

    if (!table) return { error: "Unknown import type" };

    const { error: deleteErr } = await supabase
      .from(table)
      .delete()
      .eq("import_batch_id", batchId)
      .eq("salon_id", salonId);

    if (deleteErr) return { error: deleteErr.message };

    await updateImportBatch(batchId, salonId, { status: "rolled_back" });

    logInfo("Import rolled back", { salonId, batchId, table });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getHistory(salonId: string) {
  return getImportHistory(salonId);
}
