"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export type PaymentFormSuccessDetails = {
  setupIntentId?: string;
};

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (details?: PaymentFormSuccessDetails) => void;
  onCancel: () => void;
  mode?: "payment" | "setup";
}

export function PaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
  mode = "payment",
}: PaymentFormProps) {
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

    if (mode === "setup") {
      // For setup intents (payment method updates)
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Setup failed");
        setProcessing(false);
      } else {
        onSuccess(
          setupIntent?.id ? { setupIntentId: setupIntent.id } : undefined
        );
      }
    } else {
      // For payment intents (subscriptions)
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onLoadError={() => {
          setError("Could not load card form. Please refresh and try again.");
        }}
      />
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

