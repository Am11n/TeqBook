/**
 * Stripe utility functions
 */

import { loadStripe } from "@stripe/stripe-js";

export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Never fallback to placeholder key. Placeholder causes Stripe 401 at runtime.
export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

