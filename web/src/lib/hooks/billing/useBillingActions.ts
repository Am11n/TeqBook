import { useState } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  createStripeCustomer,
  createStripeSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  getPaymentMethodSetupIntent,
} from "@/lib/services/billing-service";
import type { PlanType } from "@/lib/types";

export function useBillingActions() {
  const { salon, refreshSalon, user } = useCurrentSalon();
  
  return {
    salon,
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = !!salon?.billing_subscription_id;
  const hasCustomer = !!salon?.billing_customer_id;

  const handleChangePlan = async (selectedPlan: PlanType) => {
    if (!salon?.id) return;

    setActionLoading(true);
    setError(null);

    // If no customer, create one first
    if (!hasCustomer) {
      let userEmail = "test@example.com";
      if (user?.email) {
        userEmail = user.email;
      } else if (salon?.name) {
        userEmail = `${salon.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}@example.com`;
      }

      const { data: customerData, error: customerError } = await createStripeCustomer(
        salon.id,
        userEmail,
        salon.name || "Salon"
      );

      if (customerError || !customerData) {
        setError(customerError || "Failed to create customer");
        setActionLoading(false);
        return { success: false, clientSecret: null };
      }

      await refreshSalon();
    }

    // If no subscription, create one
    if (!hasSubscription && salon?.billing_customer_id) {
      const { data: subscriptionData, error: subscriptionError } = await createStripeSubscription(
        salon.id,
        salon.billing_customer_id,
        selectedPlan
      );

      if (subscriptionError || !subscriptionData) {
        setError(subscriptionError || "Failed to create subscription");
        setActionLoading(false);
        return { success: false, clientSecret: null };
      }

      // If we got a client_secret, return it to show payment form
      if (subscriptionData.client_secret) {
        setActionLoading(false);
        return { success: true, clientSecret: subscriptionData.client_secret };
      } else {
        await refreshSalon();
        setActionLoading(false);
        return { success: true, clientSecret: null };
      }
    } else if (hasSubscription && salon?.billing_subscription_id && selectedPlan) {
      // Update existing subscription
      const { data: updateData, error: updateError } = await updateSubscriptionPlan(
        salon.id,
        salon.billing_subscription_id,
        selectedPlan
      );

      if (updateError || !updateData) {
        // Check if error is about incomplete subscription
        const errorMessage = updateError || "Failed to update plan";
        if (errorMessage.includes("incomplete")) {
          setError(
            "Cannot change plan while payment is pending. Please complete your payment first, or cancel this subscription and create a new one with the desired plan."
          );
        } else {
          setError(errorMessage);
        }
        setActionLoading(false);
        return { success: false, clientSecret: null };
      }

      await refreshSalon();
      setActionLoading(false);
      return { success: true, clientSecret: null };
    }

    setActionLoading(false);
    return { success: false, clientSecret: null };
  };

  const handleCancelSubscription = async () => {
    if (!salon?.id || !salon?.billing_subscription_id) return;

    setActionLoading(true);
    setError(null);

    const { data, error: cancelError } = await cancelSubscription(
      salon.id,
      salon.billing_subscription_id
    );

    if (cancelError || !data) {
      setError(cancelError || "Failed to cancel subscription");
      setActionLoading(false);
      return false;
    }

    await refreshSalon();
    setActionLoading(false);
    return true;
  };

  const handleUpdatePaymentMethod = async () => {
    if (!salon?.id || !salon?.billing_customer_id) return;

    setActionLoading(true);
    setError(null);

    const { data, error: setupError } = await getPaymentMethodSetupIntent(
      salon.id,
      salon.billing_customer_id
    );

    if (setupError || !data) {
      setError(setupError || "Failed to create setup intent");
      setActionLoading(false);
      return null;
    }

    setActionLoading(false);
    return data.client_secret;
  };

    actionLoading,
    error,
    setError,
    hasSubscription,
    hasCustomer,
    handleChangePlan,
    handleCancelSubscription,
    handleUpdatePaymentMethod,
  };
}

