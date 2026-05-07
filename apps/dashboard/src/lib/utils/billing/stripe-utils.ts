/**
 * Stripe utility functions
 */

import { loadStripe } from "@stripe/stripe-js";

export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

let stripePromiseCache: ReturnType<typeof loadStripe> | null = null;

// Never fallback to placeholder key. Placeholder causes Stripe 401 at runtime.
export function getStripePromise() {
  if (!stripePublishableKey) return null;
  if (!stripePromiseCache) {
    stripePromiseCache = loadStripe(stripePublishableKey);
  }
  return stripePromiseCache;
}

