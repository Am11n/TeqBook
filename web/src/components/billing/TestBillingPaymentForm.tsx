"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/utils/billing/stripe-utils";

interface TestBillingPaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
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
      {error && <p className="text-sm text-destructive">{error}</p>}
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

export function TestBillingPaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
}: TestBillingPaymentFormProps) {
  return (
    <Card className="mt-4 p-6">
      <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Complete your subscription by adding a payment method. Use test card:{" "}
        <strong>4242 4242 4242 4242</strong> (any future exp date, any CVC)
      </p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </Card>
  );
}

