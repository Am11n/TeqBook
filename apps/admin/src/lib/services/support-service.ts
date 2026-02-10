// =====================================================
// Support Case Service
// =====================================================
// CRUD operations for support cases (admin operations center)

import { supabase } from "@/lib/supabase-client";

export type SupportCase = {
  id: string;
  salon_id: string | null;
  salon_name: string | null;
  user_id: string | null;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  assignee_email: string | null;
  metadata: Record<string, unknown> | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  total_count: number;
};

export type SupportCaseFilters = {
  type?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
};

/**
 * Get paginated support cases list
 */
export async function getSupportCases(
  filters: SupportCaseFilters = {},
  limit = 25,
  offset = 0
): Promise<{ data: SupportCase[] | null; total: number; error: string | null }> {
  try {
    const filterJson: Record<string, string> = {};
    if (filters.type) filterJson.type = filters.type;
    if (filters.status) filterJson.status = filters.status;
    if (filters.priority) filterJson.priority = filters.priority;
    if (filters.assignee_id) filterJson.assignee_id = filters.assignee_id;

    const { data, error } = await supabase.rpc("get_support_cases_list", {
      filters: filterJson,
      lim: limit,
      off: offset,
    });

    if (error) return { data: null, total: 0, error: error.message };

    const cases = (data as SupportCase[]) || [];
    const total = cases.length > 0 ? cases[0].total_count : 0;
    return { data: cases, total, error: null };
  } catch (err) {
    return { data: null, total: 0, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Create a manual support case
 */
export async function createSupportCase(input: {
  salon_id?: string;
  user_id?: string;
  type?: string;
  priority?: string;
  title: string;
  description?: string;
}): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("support_cases").insert({
      salon_id: input.salon_id || null,
      user_id: input.user_id || null,
      type: input.type || "manual",
      priority: input.priority || "medium",
      title: input.title,
      description: input.description || null,
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Update support case status
 */
export async function updateCaseStatus(
  caseId: string,
  status: string
): Promise<{ error: string | null }> {
  try {
    const update: Record<string, unknown> = { status };
    if (status === "resolved") update.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("support_cases").update(update).eq("id", caseId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Assign a support case
 */
export async function assignCase(
  caseId: string,
  assigneeId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("support_cases")
      .update({ assignee_id: assigneeId, status: "in_progress" })
      .eq("id", caseId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
