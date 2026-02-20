import { supabase } from "@/lib/supabase-client";

export type ImportBatch = {
  id: string;
  salon_id: string;
  import_type: "customers" | "services" | "employees" | "bookings";
  file_name: string | null;
  total_rows: number;
  success_count: number;
  failed_count: number;
  error_log: Array<{ row: number; field: string; error: string }>;
  column_mapping: Record<string, string> | null;
  status: "pending" | "processing" | "completed" | "failed" | "rolled_back";
  created_at: string;
  completed_at: string | null;
};

export async function createImportBatch(input: {
  salon_id: string;
  import_type: string;
  file_name?: string;
  total_rows: number;
  column_mapping?: Record<string, string>;
}): Promise<{ data: ImportBatch | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("import_batches")
      .insert({
        salon_id: input.salon_id,
        import_type: input.import_type,
        file_name: input.file_name ?? null,
        total_rows: input.total_rows,
        column_mapping: input.column_mapping ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as ImportBatch, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateImportBatch(
  batchId: string,
  salonId: string,
  updates: Partial<Pick<ImportBatch, "status" | "success_count" | "failed_count" | "error_log" | "completed_at">>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("import_batches")
      .update(updates)
      .eq("id", batchId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getImportHistory(
  salonId: string
): Promise<{ data: ImportBatch[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("import_batches")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as ImportBatch[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getImportBatch(
  batchId: string,
  salonId: string
): Promise<{ data: ImportBatch | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("import_batches")
      .select("*")
      .eq("id", batchId)
      .eq("salon_id", salonId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as ImportBatch, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
