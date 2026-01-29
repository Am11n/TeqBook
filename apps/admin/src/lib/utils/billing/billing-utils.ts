import { Crown, Zap, Building2 } from "lucide-react";
import type { PlanType } from "@/lib/types";
import type { Addon } from "@/lib/repositories/addons";

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

/**
 * Get plans configuration
 */
export function getPlans(translations: {
  planStarter?: string;
  planPro?: string;
  planBusiness?: string;
}): Plan[] {
  return [
    {
      id: "starter" as PlanType,
      name: translations.planStarter || "Starter",
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
      name: translations.planPro || "Pro",
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
      name: translations.planBusiness || "Business",
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

