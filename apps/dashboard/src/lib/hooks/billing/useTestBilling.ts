"use client";

import { useState } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  createStripeCustomer,
  createStripeSubscription,
  updateSubscriptionPlan,
} from "@/lib/services/billing-service";

export function useTestBilling() {
  const { salon, user, refreshSalon } = useCurrentSalon();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    subscription_id?: string;
    plan?: string;
    customer_id?: string;
    email?: string;
    current_period_end?: string;
    status?: string;
    client_secret?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleCreateCustomer = async () => {
    if (!salon?.id) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Get user email from user object, or generate a valid email from salon name
    let userEmail = "test@example.com";

    if (user?.email) {
      userEmail = user.email;
    } else if (salon?.name) {
      // Generate a valid email from salon name
      userEmail = `${salon.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}@example.com`;
    }

    const { data, error: err } = await createStripeCustomer(
      salon.id,
      userEmail,
      salon.name || "Test Salon"
    );

    if (err) {
      setError(err);
    } else {
      setResult(data);
      // Refresh salon data to get updated billing_customer_id
      await refreshSalon();
    }

    setLoading(false);
  };

  const handleCreateSubscription = async () => {
    if (!salon?.id || !salon?.billing_customer_id) {
      setError("Du må opprette customer først");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: err } = await createStripeSubscription(
      salon.id,
      salon.billing_customer_id,
      "starter" // eller "pro" eller "business"
    );

    if (err) {
      setError(err);
    } else {
      setResult(data);

      // If we got a client_secret, show payment form
      if (data?.client_secret) {
        setClientSecret(data.client_secret);
        setShowPaymentForm(true);
      } else {
        // No payment needed, refresh salon data
        await refreshSalon();
      }
    }

    setLoading(false);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    await refreshSalon();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const handleUpdatePlan = async () => {
    if (!salon?.id || !salon?.billing_subscription_id) {
      setError("Du må ha en subscription først");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Oppgrader til neste plan
    const currentPlan = salon.plan || "starter";
    const nextPlan = currentPlan === "starter" ? "pro" : "business";

    const { data, error: err } = await updateSubscriptionPlan(
      salon.id,
      salon.billing_subscription_id,
      nextPlan
    );

    if (err) {
      setError(err);
    } else {
      setResult(data);
      await refreshSalon();
    }

    setLoading(false);
  };

  return {
    loading,
    result,
    error,
    clientSecret,
    showPaymentForm,
    setError,
    handleCreateCustomer,
    handleCreateSubscription,
    handlePaymentSuccess,
    handlePaymentCancel,
    handleUpdatePlan,
  };
}

