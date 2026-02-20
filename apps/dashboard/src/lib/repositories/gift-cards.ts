import { supabase } from "@/lib/supabase-client";

export type GiftCard = {
  id: string;
  salon_id: string;
  code: string;
  initial_value_cents: number;
  remaining_value_cents: number;
  purchased_by_customer_id: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getGiftCards(
  salonId: string
): Promise<{ data: GiftCard[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as GiftCard[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getGiftCardByCode(
  salonId: string,
  code: string
): Promise<{ data: GiftCard | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("salon_id", salonId)
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as GiftCard | null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createGiftCard(input: {
  salon_id: string;
  code: string;
  initial_value_cents: number;
  purchased_by_customer_id?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  expires_at?: string | null;
}): Promise<{ data: GiftCard | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("gift_cards")
      .insert({
        salon_id: input.salon_id,
        code: input.code.toUpperCase(),
        initial_value_cents: input.initial_value_cents,
        remaining_value_cents: input.initial_value_cents,
        purchased_by_customer_id: input.purchased_by_customer_id ?? null,
        recipient_name: input.recipient_name ?? null,
        recipient_email: input.recipient_email ?? null,
        expires_at: input.expires_at ?? null,
      })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as GiftCard, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function redeemGiftCard(
  salonId: string,
  giftCardId: string,
  amountCents: number
): Promise<{ data: GiftCard | null; error: string | null }> {
  try {
    // Get current balance
    const { data: card, error: fetchErr } = await supabase
      .from("gift_cards")
      .select("remaining_value_cents, is_active, expires_at")
      .eq("id", giftCardId)
      .eq("salon_id", salonId)
      .single();

    if (fetchErr || !card) return { data: null, error: fetchErr?.message ?? "Gift card not found" };
    if (!card.is_active) return { data: null, error: "Gift card is deactivated" };
    if (card.expires_at && new Date(card.expires_at) < new Date()) return { data: null, error: "Gift card has expired" };
    if (card.remaining_value_cents < amountCents) return { data: null, error: "Insufficient balance" };

    const newBalance = card.remaining_value_cents - amountCents;
    const { data, error } = await supabase
      .from("gift_cards")
      .update({ remaining_value_cents: newBalance })
      .eq("id", giftCardId)
      .eq("salon_id", salonId)
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as GiftCard, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deactivateGiftCard(
  salonId: string,
  giftCardId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("gift_cards")
      .update({ is_active: false })
      .eq("id", giftCardId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
