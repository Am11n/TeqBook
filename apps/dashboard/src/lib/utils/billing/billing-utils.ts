import { Crown, Zap, Building2 } from "lucide-react";
import type { PlanType } from "@/lib/types";
import type { Addon } from "@/lib/repositories/addons";
import type { TranslationNamespaces } from "@/i18n/types";

type PlanFeatureSettings = Pick<
  TranslationNamespaces["settings"],
  | "planStarter"
  | "planPro"
  | "planBusiness"
  | "billingPlanStarterFeature1"
  | "billingPlanStarterFeature2"
  | "billingPlanStarterFeature3"
  | "billingPlanStarterFeature4"
  | "billingPlanStarterFeature5"
  | "billingPlanStarterFeature6"
  | "billingPlanProFeature1"
  | "billingPlanProFeature2"
  | "billingPlanProFeature3"
  | "billingPlanProFeature4"
  | "billingPlanProFeature5"
  | "billingPlanProFeature6"
  | "billingPlanProFeature7"
  | "billingPlanBusinessFeature1"
  | "billingPlanBusinessFeature2"
  | "billingPlanBusinessFeature3"
  | "billingPlanBusinessFeature4"
>;

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  limits: {
    employees: number | null;
    languages: number | null;
  };
}

export interface AddonDisplay {
  id: string;
  name: string;
  description: string;
  price: string;
  type: "extra_languages" | "extra_staff";
  active: boolean;
  quantity: number;
}

const PLAN_FEATURE_DEFAULTS: Record<keyof PlanFeatureSettings, string> = {
  planStarter: "Starter",
  planPro: "Pro",
  planBusiness: "Business",
  billingPlanStarterFeature1: "Online booking and calendar",
  billingPlanStarterFeature2: "Customer list and service management",
  billingPlanStarterFeature3: "Pay-in-salon flow",
  billingPlanStarterFeature4: "WhatsApp communication (salon & customer)",
  billingPlanStarterFeature5: "One additional language pack",
  billingPlanStarterFeature6: "SMS reminders at cost price",
  billingPlanProFeature1: "Includes everything in Starter, plus:",
  billingPlanProFeature2: "Fully multilingual interface",
  billingPlanProFeature3: "Advanced reports on revenue and capacity",
  billingPlanProFeature4: "Automatic reminders and notifications",
  billingPlanProFeature5: "Shift planning and staff scheduling",
  billingPlanProFeature6: "Lightweight inventory for products",
  billingPlanProFeature7: "Branded booking page",
  billingPlanBusinessFeature1: "Includes everything in Pro, plus:",
  billingPlanBusinessFeature2: "Roles and access control",
  billingPlanBusinessFeature3: "Deeper statistics and export",
  billingPlanBusinessFeature4: "Priority support",
};

function planString<K extends keyof PlanFeatureSettings>(
  translations: Partial<PlanFeatureSettings>,
  key: K,
): string {
  const v = translations[key];
  return (typeof v === "string" && v.trim() !== "" ? v : PLAN_FEATURE_DEFAULTS[key]) as string;
}

/**
 * Get plans configuration (names and feature bullets from settings i18n).
 */
export function getPlans(translations: Partial<PlanFeatureSettings>): Plan[] {
  return [
    {
      id: "starter" as PlanType,
      name: planString(translations, "planStarter"),
      price: "$25",
      icon: Zap,
      features: [
        planString(translations, "billingPlanStarterFeature1"),
        planString(translations, "billingPlanStarterFeature2"),
        planString(translations, "billingPlanStarterFeature3"),
        planString(translations, "billingPlanStarterFeature4"),
        planString(translations, "billingPlanStarterFeature5"),
        planString(translations, "billingPlanStarterFeature6"),
      ],
      limits: {
        employees: 2,
        languages: 2,
      },
    },
    {
      id: "pro" as PlanType,
      name: planString(translations, "planPro"),
      price: "$50",
      icon: Crown,
      features: [
        planString(translations, "billingPlanProFeature1"),
        planString(translations, "billingPlanProFeature2"),
        planString(translations, "billingPlanProFeature3"),
        planString(translations, "billingPlanProFeature4"),
        planString(translations, "billingPlanProFeature5"),
        planString(translations, "billingPlanProFeature6"),
        planString(translations, "billingPlanProFeature7"),
      ],
      limits: {
        employees: 5,
        languages: 5,
      },
    },
    {
      id: "business" as PlanType,
      name: planString(translations, "planBusiness"),
      price: "$75",
      icon: Building2,
      features: [
        planString(translations, "billingPlanBusinessFeature1"),
        planString(translations, "billingPlanBusinessFeature2"),
        planString(translations, "billingPlanBusinessFeature3"),
        planString(translations, "billingPlanBusinessFeature4"),
      ],
      limits: {
        employees: null, // unlimited
        languages: null, // unlimited
      },
    },
  ];
}

/**
 * Get addon display data
 */
export function getAddonDisplay(addons: Addon[]): AddonDisplay[] {
  const addonConfig = [
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
  ];

  return addonConfig.map((addon) => {
    const dbAddon = addons.find((a) => a.type === addon.type);
    return {
      ...addon,
      active: !!dbAddon,
      quantity: dbAddon?.qty || 0,
    };
  });
}

