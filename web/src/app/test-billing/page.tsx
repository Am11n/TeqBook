"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSalon } from "@/components/salon-provider";
import { 
  createStripeCustomer, 
  createStripeSubscription,
  updateSubscriptionPlan 
} from "@/lib/services/billing-service";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

// Payment confirmation component
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onCancel 
}: { 
  clientSecret: string; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment form error");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? "Processing..." : "Confirm Payment"}
        </Button>
      </div>
    </form>
  );
}

export default function TestBillingPage() {
  const { salon, isReady, loading: contextLoading, error: contextError, refreshSalon, user } = useCurrentSalon();
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
      userEmail = `${salon.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@example.com`;
    }
    
    const { data, error: err } = await createStripeCustomer(
      salon.id,
      userEmail, // Use a valid email format
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

  // Debug info
  useEffect(() => {
    console.log("Test Billing Page State:", {
      isReady,
      contextLoading,
      hasSalon: !!salon,
      salonId: salon?.id,
      contextError,
    });
  }, [isReady, contextLoading, salon, contextError]);

  if (contextLoading) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <p>Loading salon data...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we load your salon information.
          </p>
        </Card>
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <p className="text-destructive font-medium">Error loading salon data</p>
          <p className="text-sm text-muted-foreground mt-2">{contextError}</p>
          <Button onClick={() => refreshSalon()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <p>Waiting for salon data...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Status: {salon ? "Salon found, but not ready yet" : "No salon found"}
          </p>
          <Button onClick={() => refreshSalon()} className="mt-4">
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <p className="text-destructive font-medium">No salon found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure you are logged in and have a salon associated with your account.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            If you haven&apos;t completed onboarding, please do that first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Stripe Billing</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Test Stripe-integrasjonen. Sørg for at du er i Stripe Test Mode.
        </p>
        
        <div className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Salon ID:</p>
            <p className="text-xs text-muted-foreground font-mono">{salon?.id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Customer ID:</p>
            <p className="text-xs text-muted-foreground font-mono">
              {salon?.billing_customer_id || "Ikke opprettet"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Subscription ID:</p>
            <p className="text-xs text-muted-foreground font-mono">
              {salon?.billing_subscription_id || "Ikke opprettet"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Plan:</p>
            <p className="text-xs text-muted-foreground">
              {salon?.plan || "Ingen plan"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Period End:</p>
            <p className="text-xs text-muted-foreground">
              {salon?.current_period_end 
                ? new Date(salon.current_period_end).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleCreateCustomer} 
            disabled={loading || !!salon?.billing_customer_id}
            className="w-full"
          >
            {loading ? "Loading..." : "1. Opprett Stripe Customer"}
          </Button>

          <Button 
            onClick={handleCreateSubscription} 
            disabled={loading || !salon?.billing_customer_id || !!salon?.billing_subscription_id}
            className="w-full"
            variant="outline"
          >
            {loading ? "Loading..." : "2. Opprett Subscription (Starter)"}
          </Button>

          <Button 
            onClick={handleUpdatePlan} 
            disabled={loading || !salon?.billing_subscription_id}
            className="w-full"
            variant="outline"
          >
            {loading ? "Loading..." : `3. Oppgrader til ${salon?.plan === "starter" ? "Pro" : "Business"}`}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-xs text-destructive mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Sjekk Supabase Edge Functions logs for mer detaljer.
            </p>
          </div>
        )}

        {/* Payment Form */}
        {showPaymentForm && clientSecret && (
          <Card className="mt-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your subscription by adding a payment method. Use test card: <strong>4242 4242 4242 4242</strong> (any future exp date, any CVC)
            </p>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </Card>
        )}

        {result && !showPaymentForm && (
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm font-medium mb-2">Result:</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {!showPaymentForm && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-2">Neste Steg</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Etter å ha opprettet subscription, vil betalingsskjemaet vises automatisk</li>
              <li>Bruk test card: 4242 4242 4242 4242 (hvilket som helst fremtidig exp date, hvilket som helst CVC)</li>
              <li>Test webhook ved å sende test event fra Stripe Dashboard</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

