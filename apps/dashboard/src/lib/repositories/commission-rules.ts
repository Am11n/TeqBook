import { supabase } from "@/lib/supabase-client";

export type CommissionRule = {
  id: string;
  salon_id: string;
  employee_id: string | null;
  commission_type: "percentage" | "fixed_per_booking";
  rate: number;
  applies_to: "services" | "products" | "both";
  is_active: boolean;
  created_at: string;
  employee?: { full_name: string } | null;
};

export async function getCommissionRules(
  salonId: string
): Promise<{ data: CommissionRule[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("commission_rules")
      .select("*, employee:employees(full_name)")
      .eq("salon_id", salonId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as CommissionRule[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function upsertCommissionRule(input: {
  salon_id: string;
  employee_id?: string | null;
  commission_type: "percentage" | "fixed_per_booking";
  rate: number;
  applies_to: "services" | "products" | "both";
}): Promise<{ data: CommissionRule | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("commission_rules")
      .upsert(
        {
          salon_id: input.salon_id,
          employee_id: input.employee_id ?? null,
          commission_type: input.commission_type,
          rate: input.rate,
          applies_to: input.applies_to,
          is_active: true,
        },
        { onConflict: "salon_id, employee_id" }
      )
      .select("*")
      .single();

    if (error) {
      // If upsert fails (no unique constraint), just insert
      const { data: insertData, error: insertError } = await supabase
        .from("commission_rules")
        .insert({
          salon_id: input.salon_id,
          employee_id: input.employee_id ?? null,
          commission_type: input.commission_type,
          rate: input.rate,
          applies_to: input.applies_to,
        })
        .select("*")
        .single();

      if (insertError) return { data: null, error: insertError.message };
      return { data: insertData as CommissionRule, error: null };
    }

    return { data: data as CommissionRule, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteCommissionRule(
  salonId: string,
  ruleId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("commission_rules")
      .update({ is_active: false })
      .eq("id", ruleId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getRuleForEmployee(
  salonId: string,
  employeeId: string
): Promise<{ data: CommissionRule | null; error: string | null }> {
  try {
    // First try employee-specific rule
    const { data: specific, error: specErr } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("salon_id", salonId)
      .eq("employee_id", employeeId)
      .eq("is_active", true)
      .maybeSingle();

    if (specErr) return { data: null, error: specErr.message };
    if (specific) return { data: specific as CommissionRule, error: null };

    // Fall back to salon-wide default (employee_id IS NULL)
    const { data: defaultRule, error: defErr } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("salon_id", salonId)
      .is("employee_id", null)
      .eq("is_active", true)
      .maybeSingle();

    if (defErr) return { data: null, error: defErr.message };
    return { data: defaultRule as CommissionRule | null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
