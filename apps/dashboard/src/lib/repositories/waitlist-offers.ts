import { supabase } from "@/lib/supabase-client";

export type WaitlistOfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled"
  | "notification_failed";

export type WaitlistOffer = {
  id: string;
  salon_id: string;
  waitlist_entry_id: string;
  service_id: string;
  employee_id: string;
  slot_date: string;
  slot_start: string;
  slot_end: string | null;
  token_hash: string;
  token_expires_at: string;
  status: WaitlistOfferStatus;
  attempt_no: number;
  reminder_sent_at: string | null;
  responded_at: string | null;
  booking_id: string | null;
  response_channel: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type WaitlistPolicy = {
  claim_expiry_minutes: number;
  reminder_after_minutes: number;
  cooldown_minutes: number;
  passive_decline_threshold: number;
  passive_cooldown_minutes: number;
  auto_notify_on_reactivation: boolean;
};

export async function resolveWaitlistPolicy(
  salonId: string,
  serviceId: string
): Promise<{ data: WaitlistPolicy | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("resolve_waitlist_policy", {
      p_salon_id: salonId,
      p_service_id: serviceId,
    });
    if (error) return { data: null, error: error.message };
    if (!data || data.length === 0) return { data: null, error: null };
    return { data: data[0] as WaitlistPolicy, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createWaitlistOffer(input: {
  salon_id: string;
  waitlist_entry_id: string;
  service_id: string;
  employee_id: string;
  slot_date: string;
  slot_start: string;
  slot_end?: string | null;
  token_hash: string;
  token_expires_at: string;
  attempt_no?: number;
}): Promise<{ data: WaitlistOffer | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("waitlist_offers")
      .insert({
        salon_id: input.salon_id,
        waitlist_entry_id: input.waitlist_entry_id,
        service_id: input.service_id,
        employee_id: input.employee_id,
        slot_date: input.slot_date,
        slot_start: input.slot_start,
        slot_end: input.slot_end ?? null,
        token_hash: input.token_hash,
        token_expires_at: input.token_expires_at,
        attempt_no: input.attempt_no ?? 1,
      })
      .select("*")
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as WaitlistOffer, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getPendingOfferForSlot(input: {
  salonId: string;
  employeeId: string;
  slotStart: string;
}): Promise<{ data: WaitlistOffer | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("waitlist_offers")
      .select("*")
      .eq("salon_id", input.salonId)
      .eq("employee_id", input.employeeId)
      .eq("slot_start", input.slotStart)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: (data as WaitlistOffer) ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markOfferNotificationFailure(
  offerId: string,
  message: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist_offers")
      .update({
        status: "notification_failed",
        last_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId);
    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
