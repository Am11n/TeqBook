import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PricingPageClient from "./page-client";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Pricing | TeqBook",
    description:
      "Simple, transparent pricing for salons of all sizes. Start with Starter, upgrade anytime. No hidden fees.",
    path: "/pricing",
  });
}

export default function PricingPage() {
  return <PricingPageClient />;
}
