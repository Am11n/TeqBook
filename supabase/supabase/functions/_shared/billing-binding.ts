export type BillingBindingInput = {
  requestedCustomerId?: string | null;
  requestedSubscriptionId?: string | null;
  salonBillingCustomerId?: string | null;
  salonBillingSubscriptionId?: string | null;
  stripeSubscriptionCustomerId?: string | null;
};

export function validateBillingBinding(input: BillingBindingInput): string | null {
  if (input.requestedCustomerId) {
    if (!input.salonBillingCustomerId) return "Salon has no billing customer binding";
    if (input.requestedCustomerId !== input.salonBillingCustomerId) {
      return "Customer binding mismatch for salon";
    }
  }

  if (input.requestedSubscriptionId) {
    if (!input.salonBillingSubscriptionId) return "Salon has no billing subscription binding";
    if (input.requestedSubscriptionId !== input.salonBillingSubscriptionId) {
      return "Subscription binding mismatch for salon";
    }
  }

  if (input.stripeSubscriptionCustomerId && input.salonBillingCustomerId) {
    if (input.stripeSubscriptionCustomerId !== input.salonBillingCustomerId) {
      return "Stripe subscription/customer does not match salon binding";
    }
  }

  return null;
}
