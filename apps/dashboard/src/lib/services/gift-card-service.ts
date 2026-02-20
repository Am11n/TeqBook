import {
  getGiftCards,
  getGiftCardByCode,
  createGiftCard as createGiftCardRepo,
  redeemGiftCard as redeemGiftCardRepo,
  deactivateGiftCard as deactivateGiftCardRepo,
  type GiftCard,
} from "@/lib/repositories/gift-cards";

export type { GiftCard };

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function listGiftCards(salonId: string) {
  return getGiftCards(salonId);
}

export async function lookupByCode(salonId: string, code: string) {
  return getGiftCardByCode(salonId, code);
}

export async function createGiftCard(input: {
  salonId: string;
  valueCents: number;
  recipientName?: string;
  recipientEmail?: string;
  purchasedByCustomerId?: string;
  expiresAt?: string;
}) {
  if (input.valueCents <= 0) return { data: null, error: "Value must be positive" };

  const code = generateCode();
  return createGiftCardRepo({
    salon_id: input.salonId,
    code,
    initial_value_cents: input.valueCents,
    purchased_by_customer_id: input.purchasedByCustomerId ?? null,
    recipient_name: input.recipientName ?? null,
    recipient_email: input.recipientEmail ?? null,
    expires_at: input.expiresAt ?? null,
  });
}

export async function redeem(salonId: string, giftCardId: string, amountCents: number) {
  if (amountCents <= 0) return { data: null, error: "Amount must be positive" };
  return redeemGiftCardRepo(salonId, giftCardId, amountCents);
}

export async function deactivate(salonId: string, giftCardId: string) {
  return deactivateGiftCardRepo(salonId, giftCardId);
}
