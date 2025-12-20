"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { Crown, Zap, Building2 } from "lucide-react";

type PlanType = "starter" | "pro" | "business" | null;

export default function BillingSettingsPage() {
  const { locale } = useLocale();
  const { salon, isReady } = useCurrentSalon();
  const [currentPlan, setCurrentPlan] = useState<PlanType>(null);
  const [loading, setLoading] = useState(true);

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
    if (isReady && salon) {
      // TODO: Read plan from salon.plan when database field is added
      // For now, default to starter
      setCurrentPlan("starter");
      setLoading(false);
    }
  }, [isReady, salon]);

  const plans = [
    {
      id: "starter",
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
      id: "pro",
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
      id: "business",
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

  const addons = [
    {
      id: "multilingual",
      name: "Multilingual Booking Page",
      description: "Add support for additional languages on your public booking page",
      price: "$10/month",
      active: false, // TODO: Check from addons table
    },
    {
      id: "extra_staff",
      name: "Extra Staff Members",
      description: "Add additional staff members beyond your plan limit",
      price: "$5/month per staff",
      active: false, // TODO: Check from addons table
      quantity: 0, // TODO: Read from addons table
    },
  ];

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

  const activePlan = plans.find((p) => p.id === currentPlan) || plans[0];

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
            <div>
              <p className="font-semibold">{activePlan.name}</p>
              <p className="text-sm text-muted-foreground">{activePlan.price} / month</p>
            </div>
          </div>
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

        <div className="mt-4">
          <Button variant="outline" disabled>
            Change Plan
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Plan changes will be available when billing is fully implemented
          </p>
        </div>
      </Card>

      {/* Add-ons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Add-ons</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enhance your plan with additional features
        </p>

        <div className="space-y-4">
          {addons.map((addon) => (
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
                {addon.id === "extra_staff" && addon.quantity !== undefined && addon.quantity > 0 && (
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

        <p className="text-xs text-muted-foreground mt-4">
          Add-ons management will be available when billing is fully implemented
        </p>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Billing History</h3>
        <p className="text-sm text-muted-foreground">
          Invoice history will appear here when billing is fully implemented
        </p>
      </Card>
    </div>
  );
}
