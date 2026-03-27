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

export type UpdatePaymentMethodSetupResult = {
  clientSecret: string;
  setupIntentId: string;
};

export function useBillingActions() {
  const { salon, refreshSalon, user } = useCurrentSalon();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = !!salon?.billing_subscription_id;
  const hasCustomer = !!salon?.billing_customer_id;

  const isInvalidSubscriptionStateError = (message: string) => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("incomplete") ||
      normalized.includes("incomplete_expired") ||
      normalized.includes("cannot update incomplete subscription") ||
      normalized.includes("canceled") ||
      normalized.includes("a canceled subscription") ||
      normalized.includes("cancel_at_period_end") ||
      normalized.includes("scheduled for cancellation")
    );
  };

  const handleChangePlan = async (selectedPlan: PlanType): Promise<{ success: boolean; clientSecret: string | null }> => {
    if (!salon?.id) {
      return { success: false, clientSecret: null };
    }

    setActionLoading(true);
    setError(null);

    let currentCustomerId = salon.billing_customer_id || null;
    let currentSubscriptionId = salon.billing_subscription_id || null;

    // If no customer, create one first
    if (!currentCustomerId) {
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

      currentCustomerId = customerData.customer_id;
      await refreshSalon();
    }

    // If no subscription, create one
    if (!currentSubscriptionId && currentCustomerId) {
      const { data: subscriptionData, error: subscriptionError } = await createStripeSubscription(
        salon.id,
        currentCustomerId,
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
    } else if (currentSubscriptionId && selectedPlan) {
      // Update existing subscription
      const { data: updateData, error: updateError } = await updateSubscriptionPlan(
        salon.id,
        currentSubscriptionId,
        selectedPlan
      );

      if (updateError || !updateData) {
        const errorMessage = updateError || "Failed to update plan";
        if (isInvalidSubscriptionStateError(errorMessage)) {
          if (!currentCustomerId) {
            setError("Cannot create subscription: missing customer ID");
            setActionLoading(false);
            return { success: false, clientSecret: null };
          }

          const { data: subscriptionData, error: subscriptionError } = await createStripeSubscription(
            salon.id,
            currentCustomerId,
            selectedPlan
          );

          if (subscriptionError || !subscriptionData) {
            setError(
              subscriptionError || 
              "Your previous subscription is no longer valid. Failed to create a new subscription. Please try again."
            );
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
      // Check if subscription is already canceled or in invalid state
      const errorMessage = cancelError || "Failed to cancel subscription";
      
      if (
        errorMessage.includes("canceled") ||
        errorMessage.includes("A canceled subscription") ||
        errorMessage.includes("incomplete_expired")
      ) {
        // Subscription is already canceled or expired, just refresh to clear it from UI
        console.log("Subscription is already canceled or expired, refreshing salon data");
        await refreshSalon();
        setActionLoading(false);
        return true;
      }
      
      setError(cancelError || "Failed to cancel subscription");
      setActionLoading(false);
      return false;
    }

    // After cancellation, refresh salon to get updated current_period_end
    await refreshSalon();
    setActionLoading(false);
    return true;
  };

  const handleUpdatePaymentMethod = async (): Promise<UpdatePaymentMethodSetupResult | null> => {
    if (!salon?.id || !salon?.billing_customer_id) return null;

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
    return {
      clientSecret: data.client_secret,
      setupIntentId: data.setup_intent_id,
    };
  };

  return {
    salon,
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

