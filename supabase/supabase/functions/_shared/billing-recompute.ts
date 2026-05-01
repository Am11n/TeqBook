import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function invokeRecomputeProductAccessState(
  supabase: SupabaseClient,
  salonId: string,
  context: string,
): Promise<void> {
  const { error } = await supabase.rpc("recompute_product_access_state", { p_salon_id: salonId });
  if (error) {
    console.error("recompute_product_access_state failed", {
      context,
      salonId,
      message: error.message,
    });
  }
}

export async function markBillingInconsistent(
  supabase: SupabaseClient,
  salonId: string,
  reason: string,
): Promise<void> {
  const trimmed = reason.slice(0, 2000);
  const { error: uerr } = await supabase
    .from("salons")
    .update({ billing_inconsistent_reason: trimmed })
    .eq("id", salonId);
  if (uerr) {
    console.error("markBillingInconsistent: update failed", { salonId, uerr });
    return;
  }
  console.warn("billing_inconsistent_marked", { salon_id: salonId, reason: trimmed });
  await invokeRecomputeProductAccessState(supabase, salonId, "markBillingInconsistent");
}
