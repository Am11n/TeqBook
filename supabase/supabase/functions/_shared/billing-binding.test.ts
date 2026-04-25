import { validateBillingBinding } from "./billing-binding.ts";

Deno.test("accepts matching customer and subscription bindings", () => {
  const result = validateBillingBinding({
    requestedCustomerId: "cus_123",
    requestedSubscriptionId: "sub_123",
    salonBillingCustomerId: "cus_123",
    salonBillingSubscriptionId: "sub_123",
    stripeSubscriptionCustomerId: "cus_123",
  });
  if (result !== null) throw new Error(`Expected null but got ${result}`);
});

Deno.test("rejects mismatched customer binding", () => {
  const result = validateBillingBinding({
    requestedCustomerId: "cus_a",
    salonBillingCustomerId: "cus_b",
  });
  if (result !== "Customer binding mismatch for salon") {
    throw new Error(`Unexpected result: ${result}`);
  }
});

Deno.test("rejects mismatched subscription binding", () => {
  const result = validateBillingBinding({
    requestedSubscriptionId: "sub_a",
    salonBillingSubscriptionId: "sub_b",
  });
  if (result !== "Subscription binding mismatch for salon") {
    throw new Error(`Unexpected result: ${result}`);
  }
});

Deno.test("rejects stripe customer mismatch against salon binding", () => {
  const result = validateBillingBinding({
    stripeSubscriptionCustomerId: "cus_a",
    salonBillingCustomerId: "cus_b",
  });
  if (result !== "Stripe subscription/customer does not match salon binding") {
    throw new Error(`Unexpected result: ${result}`);
  }
});
