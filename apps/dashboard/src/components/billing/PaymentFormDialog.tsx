"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

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
        {clientSecret && (
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

