"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { Crown, Zap, Building2, CreditCard, X, CheckCircle2 } from "lucide-react";
import { getAddonsForSalon } from "@/lib/repositories/addons";
import type { Addon } from "@/lib/repositories/addons";
import type { PlanType } from "@/lib/types";
import { 
  createStripeCustomer, 
  createStripeSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  getPaymentMethodSetupIntent
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

// Payment Form Component
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onCancel,
  mode = "payment"
}: { 
  clientSecret: string; 
  onSuccess: () => void;
  onCancel: () => void;
  mode?: "payment" | "setup";
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

    if (mode === "setup") {
      // For setup intents (payment method updates)
      const { error: confirmError } = await stripe.confirmSetup({
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
        onSuccess();
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

export default function BillingSettingsPage() {
  const { locale } = useLocale();
  const { salon, isReady, refreshSalon, user } = useCurrentSalon();
  const [currentPlan, setCurrentPlan] = useState<PlanType>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Plan selection dialog
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  // Payment form state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormType, setPaymentFormType] = useState<"subscription" | "payment_method">("subscription");
  
  // Cancel subscription dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].settings;

  useEffect(() => {
    async function loadData() {
      if (isReady && salon?.id) {
        setLoading(true);
        
        // Read plan from salon
        const plan = (salon.plan || "starter") as PlanType;
        setCurrentPlan(plan);

        // Load addons
        const { data: addonsData, error: addonsError } = await getAddonsForSalon(salon.id);
        if (!addonsError && addonsData) {
          setAddons(addonsData);
        }

        setLoading(false);
      }
    }
    loadData();
  }, [isReady, salon]);

  const plans = [
    {
      id: "starter" as PlanType,
      name: t.planStarter || "Starter",
      price: "$25",
      icon: Zap,
      features: [
        "Online booking and calendar",
        "Customer list and service management",
        "Pay-in-salon flow",
        "WhatsApp support",
        "One additional language pack",
        "SMS reminders at cost price",
      ],
      limits: {
        employees: 2,
        languages: 2,
      },
    },
    {
      id: "pro" as PlanType,
      name: t.planPro || "Pro",
      price: "$50",
      icon: Crown,
      features: [
        "Includes everything in Starter, plus:",
        "Fully multilingual interface",
        "Advanced reports on revenue and capacity",
        "Automatic reminders and notifications",
        "Shift planning and staff scheduling",
        "Lightweight inventory for products",
        "Branded booking page",
      ],
      limits: {
        employees: 5,
        languages: 5,
      },
    },
    {
      id: "business" as PlanType,
      name: t.planBusiness || "Business",
      price: "$75",
      icon: Building2,
      features: [
        "Includes everything in Pro, plus:",
        "Roles and access control",
        "Deeper statistics and export",
        "Priority support",
      ],
      limits: {
        employees: null, // unlimited
        languages: null, // unlimited
      },
    },
  ];

  // Get addon display data
  const addonDisplay = [
    {
      id: "extra_languages",
      name: "Extra Languages",
      description: "Add support for additional languages on your public booking page",
      price: "$10/month per language",
      type: "extra_languages" as const,
    },
    {
      id: "extra_staff",
      name: "Extra Staff Members",
      description: "Add additional staff members beyond your plan limit",
      price: "$5/month per staff",
      type: "extra_staff" as const,
    },
  ].map((addon) => {
    const dbAddon = addons.find((a) => a.type === addon.type);
    return {
      ...addon,
      active: !!dbAddon,
      quantity: dbAddon?.qty || 0,
    };
  });

  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];
  const hasSubscription = !!salon?.billing_subscription_id;
  const hasCustomer = !!salon?.billing_customer_id;

  // Handle plan change
  const handleChangePlan = async () => {
    if (!salon?.id) return;
    
    setActionLoading(true);
    setError(null);

    // If no customer, create one first
    if (!hasCustomer) {
      let userEmail = "test@example.com";
      if (user?.email) {
        userEmail = user.email;
      } else if (salon?.name) {
        userEmail = `${salon.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@example.com`;
      }

      const { data: customerData, error: customerError } = await createStripeCustomer(
        salon.id,
        userEmail,
        salon.name || "Salon"
      );

      if (customerError || !customerData) {
        setError(customerError || "Failed to create customer");
        setActionLoading(false);
        return;
      }

      await refreshSalon();
    }

    // If no subscription, create one
    if (!hasSubscription && salon?.billing_customer_id) {
      const { data: subscriptionData, error: subscriptionError } = await createStripeSubscription(
        salon.id,
        salon.billing_customer_id,
        selectedPlan || "starter"
      );

      if (subscriptionError || !subscriptionData) {
        setError(subscriptionError || "Failed to create subscription");
        setActionLoading(false);
        return;
      }

      // If we got a client_secret, show payment form
      if (subscriptionData.client_secret) {
        setClientSecret(subscriptionData.client_secret);
        setPaymentFormType("subscription");
        setShowPaymentForm(true);
        setShowPlanDialog(false);
      } else {
        await refreshSalon();
        setShowPlanDialog(false);
      }
    } else if (hasSubscription && salon?.billing_subscription_id && selectedPlan) {
      // Update existing subscription
      const { data: updateData, error: updateError } = await updateSubscriptionPlan(
        salon.id,
        salon.billing_subscription_id,
        selectedPlan
      );

      if (updateError || !updateData) {
        setError(updateError || "Failed to update plan");
        setActionLoading(false);
        return;
      }

      await refreshSalon();
      setShowPlanDialog(false);
    }

    setActionLoading(false);
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setClientSecret(null);
    await refreshSalon();
  };

  // Handle cancel subscription
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
      return;
    }

    await refreshSalon();
    setShowCancelDialog(false);
    setActionLoading(false);
  };

  // Handle update payment method
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
      return;
    }

    setClientSecret(data.client_secret);
    setPaymentFormType("payment_method");
    setShowPaymentForm(true);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {/* Current Plan */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t.billingTitle || "Billing & Subscription"}</h3>
              <p className="text-sm text-muted-foreground">
                {t.billingDescription || "Manage your subscription plan and add-ons"}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {activePlan.name}
            </Badge>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <activePlan.icon className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">{activePlan.name}</p>
                <p className="text-sm text-muted-foreground">{activePlan.price} / month</p>
              </div>
              {hasSubscription && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            
            {/* Subscription Status */}
            {hasSubscription && salon?.current_period_end && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date:</span>
                  <span className="font-medium">
                    {new Date(salon.current_period_end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subscription ID:</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {salon.billing_subscription_id?.substring(0, 20)}...
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Plan limits:</span>
                <span className="font-medium">
                  {activePlan.limits.employees === null
                    ? "Unlimited employees"
                    : `${activePlan.limits.employees} employees`}
                  {", "}
                  {activePlan.limits.languages === null
                    ? "unlimited languages"
                    : `${activePlan.limits.languages} languages`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPlanDialog(true)}
              disabled={actionLoading}
            >
              {hasSubscription ? "Change Plan" : "Subscribe"}
            </Button>
            
            {hasSubscription && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleUpdatePaymentMethod}
                  disabled={actionLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(true)}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </Card>

        {/* Add-ons */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Add-ons</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enhance your plan with additional features
          </p>

          <div className="space-y-4">
            {addonDisplay.map((addon) => (
              <div
                key={addon.id}
                className="border rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{addon.name}</h4>
                    {addon.active && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                  <p className="text-sm font-medium">{addon.price}</p>
                  {addon.quantity > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current quantity: {addon.quantity}
                    </p>
                  )}
                </div>
                <Button variant={addon.active ? "outline" : "default"} size="sm" disabled>
                  {addon.active ? "Manage" : "Add"}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Billing History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Billing History</h3>
          <p className="text-sm text-muted-foreground">
            Invoice history will appear here when billing is fully implemented
          </p>
        </Card>

        {/* Plan Selection Dialog */}
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Plan</DialogTitle>
              <DialogDescription>
                Choose a subscription plan that fits your needs
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <plan.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.price} / month</p>
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleChangePlan} 
                disabled={!selectedPlan || actionLoading}
              >
                {actionLoading ? "Processing..." : hasSubscription ? "Change Plan" : "Subscribe"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Form Dialog */}
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {paymentFormType === "subscription" ? "Confirm Payment" : "Update Payment Method"}
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
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentForm
                  clientSecret={clientSecret}
                  mode={paymentFormType === "subscription" ? "payment" : "setup"}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setShowPaymentForm(false);
                    setClientSecret(null);
                  }}
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Your subscription will remain active until the end of the current billing period. 
                You will continue to have access to all features until {salon?.current_period_end 
                  ? new Date(salon.current_period_end).toLocaleDateString()
                  : "the end of your billing period"}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
