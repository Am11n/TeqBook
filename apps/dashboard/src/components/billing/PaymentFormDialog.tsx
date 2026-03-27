"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./PaymentForm";
import { stripePromise, stripePublishableKey } from "@/lib/utils/billing/stripe-utils";

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  paymentFormType: "subscription" | "payment_method";
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  clientSecret,
  paymentFormType,
  onSuccess,
  onCancel,
}: PaymentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {paymentFormType === "subscription"
              ? "Confirm Payment"
              : "Update Payment Method"}
          </DialogTitle>
          <DialogDescription>
            {paymentFormType === "subscription"
              ? "Complete your subscription by adding a payment method. Use test card: 4242 4242 4242 4242"
              : "Update your payment method for future billing"}
          </DialogDescription>
        </DialogHeader>
        {!stripePublishableKey && (
          <p className="text-sm text-destructive">
            Stripe publishable key is missing. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for dashboard env.
          </p>
        )}
        {clientSecret && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <PaymentForm
              clientSecret={clientSecret}
              mode={paymentFormType === "subscription" ? "payment" : "setup"}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

