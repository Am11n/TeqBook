import { supabase } from "@/lib/supabase-client";

export type NoShowPolicy = {
  id: string;
  salon_id: string;
  max_strikes: number;
  auto_block: boolean;
  warning_threshold: number;
  reset_after_days: number | null;
};

export async function getNoShowPolicy(
  salonId: string
): Promise<{ data: NoShowPolicy | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("no_show_policies")
      .select("id, salon_id, max_strikes, auto_block, warning_threshold, reset_after_days")
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as NoShowPolicy | null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function upsertNoShowPolicy(
  salonId: string,
  policy: {
    max_strikes: number;
    auto_block: boolean;
    warning_threshold: number;
    reset_after_days: number | null;
  }
): Promise<{ data: NoShowPolicy | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("no_show_policies")
      .upsert(
        {
          salon_id: salonId,
          max_strikes: policy.max_strikes,
          auto_block: policy.auto_block,
          warning_threshold: policy.warning_threshold,
          reset_after_days: policy.reset_after_days,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "salon_id" }
      )
      .select("id, salon_id, max_strikes, auto_block, warning_threshold, reset_after_days")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as NoShowPolicy, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function incrementNoShowCount(
  salonId: string,
  customerId: string
): Promise<{ newCount: number; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("increment_customer_field", {
      p_salon_id: salonId,
      p_customer_id: customerId,
      p_field: "no_show_count",
    });

    if (error) {
      // Fallback: manual increment if RPC doesn't exist
      const { data: customer, error: fetchErr } = await supabase
        .from("customers")
        .select("no_show_count")
        .eq("id", customerId)
        .eq("salon_id", salonId)
        .single();

      if (fetchErr) return { newCount: 0, error: fetchErr.message };

      const newCount = (customer?.no_show_count ?? 0) + 1;
      const { error: updateErr } = await supabase
        .from("customers")
        .update({ no_show_count: newCount })
        .eq("id", customerId)
        .eq("salon_id", salonId);

      if (updateErr) return { newCount: 0, error: updateErr.message };
      return { newCount, error: null };
    }

    return { newCount: typeof data === "number" ? data : 0, error: null };
  } catch (err) {
    return { newCount: 0, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function blockCustomer(
  salonId: string,
  customerId: string,
  reason: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("customers")
      .update({
        is_blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function unblockCustomer(
  salonId: string,
  customerId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("customers")
      .update({
        is_blocked: false,
        blocked_reason: null,
        blocked_at: null,
        no_show_count: 0,
      })
      .eq("id", customerId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getCustomerNoShowInfo(
  salonId: string,
  customerId: string
): Promise<{ data: { no_show_count: number; is_blocked: boolean; blocked_reason: string | null } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("no_show_count, is_blocked, blocked_reason")
      .eq("id", customerId)
      .eq("salon_id", salonId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
