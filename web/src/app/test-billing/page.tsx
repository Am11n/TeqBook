"use client";

import { useCurrentSalon } from "@/components/salon-provider";
import { useTestBilling } from "@/lib/hooks/billing/useTestBilling";
import { TestBillingContent } from "@/components/billing/TestBillingContent";
import { TestBillingLoading } from "@/components/billing/TestBillingLoading";

export default function TestBillingPage() {
  const {
    salon,
    isReady,
    loading: contextLoading,
    error: contextError,
    refreshSalon,
  } = useCurrentSalon();

  const {
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
  } = useTestBilling();

  if (contextLoading) {
    return (
      <TestBillingLoading
        message="Loading salon data..."
        subMessage="Please wait while we load your salon information."
      />
    );
  }

  if (contextError) {
    return (
      <TestBillingLoading
        message="Error loading salon data"
        subMessage={contextError}
        onRetry={() => refreshSalon()}
        retryLabel="Retry"
      />
    );
  }

  if (!isReady) {
    return (
      <TestBillingLoading
        message="Waiting for salon data..."
        subMessage={`Status: ${salon ? "Salon found, but not ready yet" : "No salon found"}`}
        onRetry={() => refreshSalon()}
      />
    );
  }

  if (!salon) {
    return (
      <TestBillingLoading
        message="No salon found"
        subMessage="Make sure you are logged in and have a salon associated with your account. If you haven't completed onboarding, please do that first."
      />
    );
  }

  return (
    <TestBillingContent
      salon={salon}
      loading={loading}
      error={error}
      result={result}
      clientSecret={clientSecret}
      showPaymentForm={showPaymentForm}
      onCreateCustomer={handleCreateCustomer}
      onCreateSubscription={handleCreateSubscription}
      onUpdatePlan={handleUpdatePlan}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentCancel={handlePaymentCancel}
    />
  );
}

