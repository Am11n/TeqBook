export type PlanId = "starter" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  bestFor: string;
  teamSize: string;
  highlighted?: boolean;
  badge?: string;
  order: number;
};

export type FeatureCategory = {
  id: string;
  label: string;
  order: number;
};

export type PricingFeature = {
  id: string;
  category: string;
  label: string;
  order: number;
  values: Record<PlanId, boolean | number | string>;
};

export const PRICING = {
  plans: [
    {
      id: "starter" as PlanId,
      name: "TeqBook Starter",
      price: "$25",
      period: "/month",
      description: "Everything you need to start taking bookings online.",
      bestFor: "Best for 1–2 staff",
      teamSize: "1–2 staff",
      order: 1,
    },
    {
      id: "pro" as PlanId,
      name: "TeqBook Pro",
      price: "$50",
      period: "/month",
      description: "Fewer no-shows, clear scheduling, and better revenue visibility.",
      bestFor: "Best for growing salons",
      teamSize: "3–6 staff",
      highlighted: true,
      badge: "Most popular",
      order: 2,
    },
    {
      id: "business" as PlanId,
      name: "TeqBook Business",
      price: "$75",
      period: "/month",
      description: "Full control with roles, reporting, and multi-location support.",
      bestFor: "Best for multi-location salons",
      teamSize: "6+ staff",
      order: 3,
    },
  ] satisfies Plan[],

  categories: [
    { id: "booking", label: "Booking & Calendar", order: 1 },
    { id: "staff", label: "Staff & Operations", order: 2 },
    { id: "notifications", label: "Notifications", order: 3 },
    { id: "reporting", label: "Reporting & Data", order: 4 },
    { id: "products", label: "Products & Payments", order: 5 },
    { id: "branding", label: "Branding & Language", order: 6 },
    { id: "support", label: "Support", order: 7 },
  ] satisfies FeatureCategory[],

  features: [
    // Booking & Calendar
    { id: "bookings", category: "booking", label: "Online booking", order: 1, values: { starter: true, pro: true, business: true } },
    { id: "calendar", category: "booking", label: "Calendar view", order: 2, values: { starter: true, pro: true, business: true } },
    { id: "customer-list", category: "booking", label: "Customer list & service management", order: 3, values: { starter: true, pro: true, business: true } },
    { id: "pay-in-salon", category: "booking", label: "Pay-in-salon flow", order: 4, values: { starter: true, pro: true, business: true } },

    // Staff & Operations
    { id: "shifts", category: "staff", label: "Shift planning & staff scheduling", order: 1, values: { starter: false, pro: true, business: true } },
    { id: "roles", category: "staff", label: "Roles & access control (owner, manager, staff)", order: 2, values: { starter: false, pro: false, business: true } },

    // Notifications
    { id: "sms", category: "notifications", label: "SMS reminders", order: 1, values: { starter: "At cost", pro: true, business: true } },
    { id: "email", category: "notifications", label: "Email notifications", order: 2, values: { starter: false, pro: true, business: true } },
    { id: "whatsapp", category: "notifications", label: "WhatsApp support", order: 3, values: { starter: true, pro: true, business: true } },

    // Reporting & Data
    { id: "reports", category: "reporting", label: "Advanced reports (revenue & capacity)", order: 1, values: { starter: false, pro: true, business: true } },
    { id: "exports", category: "reporting", label: "Data export for accounting", order: 2, values: { starter: false, pro: false, business: true } },
    { id: "customer-history", category: "reporting", label: "Full customer booking history", order: 3, values: { starter: false, pro: false, business: true } },

    // Products & Payments
    { id: "inventory", category: "products", label: "Lightweight product inventory", order: 1, values: { starter: false, pro: true, business: true } },

    // Branding & Language
    { id: "multilingual", category: "branding", label: "Languages", order: 1, values: { starter: 2, pro: 5, business: "Unlimited" } },
    { id: "branding", category: "branding", label: "Branded booking page (logo & colors)", order: 2, values: { starter: false, pro: true, business: true } },

    // Support
    { id: "support", category: "support", label: "Priority support", order: 1, values: { starter: false, pro: false, business: true } },
  ] satisfies PricingFeature[],

  addons: [
    {
      id: "multilingual-booking",
      title: "Multilingual booking page",
      description: "$10/month — Let clients book in Somali, Tigrinya, Urdu, Vietnamese, and more.",
      recommendedWith: "Common with Pro",
    },
    {
      id: "extra-staff",
      title: "Extra staff member",
      description: "$5/month per additional staff — Scale your team without big jumps in pricing.",
      recommendedWith: "Common with Business",
    },
  ],

  whyPro: [
    { text: "Fewer no-shows", description: "SMS & email reminders keep your calendar full.", icon: "calendar-check" },
    { text: "Clear staff scheduling", description: "Shifts, availability, and capacity at a glance.", icon: "users" },
    { text: "Better revenue visibility", description: "Reports that show what's working and what's not.", icon: "trending-up" },
  ],

  trustSignals: [
    { text: "14-day free trial", icon: "shield" },
    { text: "No credit card required", icon: "card" },
    { text: "Cancel anytime", icon: "x" },
    { text: "EU-hosted & secure", icon: "lock" },
  ],
} as const;

export function getTopFeaturesForPlan(planId: PlanId, limit = 7): string[] {
  return PRICING.features
    .filter((f) => {
      const v = f.values[planId];
      return v === true || (typeof v === "number" && v > 0) || typeof v === "string";
    })
    .sort((a, b) => {
      const catA = PRICING.categories.find((c) => c.id === a.category)?.order ?? 99;
      const catB = PRICING.categories.find((c) => c.id === b.category)?.order ?? 99;
      return catA !== catB ? catA - catB : a.order - b.order;
    })
    .slice(0, limit)
    .map((f) => {
      const v = f.values[planId];
      if (typeof v === "number") return `${f.label} (${v})`;
      if (typeof v === "string" && v !== "true") return `${f.label}: ${v}`;
      return f.label;
    });
}
