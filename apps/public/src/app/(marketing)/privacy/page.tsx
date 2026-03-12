import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PrivacyPageClient from "./page-client";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Privacy Policy | TeqBook",
    description:
      "Learn how TeqBook collects, uses and protects personal data across our website and salon platform.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
