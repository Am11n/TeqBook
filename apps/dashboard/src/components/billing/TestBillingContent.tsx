"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestBillingStatus } from "./TestBillingStatus";
import { TestBillingPaymentForm } from "./TestBillingPaymentForm";
import type { Salon } from "@/lib/types";

interface TestBillingContentProps {
  salon: Salon;
  loading: boolean;
  error: string | null;
  result: {
    subscription_id?: string;
    plan?: string;
    customer_id?: string;
    email?: string;
    current_period_end?: string;
    status?: string;
    client_secret?: string;
  } | null;
  clientSecret: string | null;
  showPaymentForm: boolean;
  onCreateCustomer: () => void;
  onCreateSubscription: () => void;
  onUpdatePlan: () => void;
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

export function TestBillingContent({
  salon,
  loading,
  error,
  result,
  clientSecret,
  showPaymentForm,
  onCreateCustomer,
  onCreateSubscription,
  onUpdatePlan,
  onPaymentSuccess,
  onPaymentCancel,
}: TestBillingContentProps) {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Stripe Billing</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Test Stripe-integrasjonen. Sørg for at du er i Stripe Test Mode.
        </p>

        <TestBillingStatus salon={salon} />

        <div className="space-y-3">
          <Button
            onClick={onCreateCustomer}
            disabled={loading || !!salon?.billing_customer_id}
            className="w-full"
          >
            {loading ? "Loading..." : "1. Opprett Stripe Customer"}
          </Button>

          <Button
            onClick={onCreateSubscription}
            disabled={loading || !salon?.billing_customer_id || !!salon?.billing_subscription_id}
            className="w-full"
            variant="outline"
          >
            {loading ? "Loading..." : "2. Opprett Subscription (Starter)"}
          </Button>

          <Button
            onClick={onUpdatePlan}
            disabled={loading || !salon?.billing_subscription_id}
            className="w-full"
            variant="outline"
          >
            {loading
              ? "Loading..."
              : `3. Oppgrader til ${salon?.plan === "starter" ? "Pro" : "Business"}`}
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
          <TestBillingPaymentForm
            clientSecret={clientSecret}
            onSuccess={onPaymentSuccess}
            onCancel={onPaymentCancel}
          />
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
              <li>
                Bruk test card: 4242 4242 4242 4242 (hvilket som helst fremtidig exp date, hvilket
                som helst CVC)
              </li>
              <li>Test webhook ved å sende test event fra Stripe Dashboard</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

