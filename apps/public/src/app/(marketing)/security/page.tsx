import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SecurityPageClient from "./page-client";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Security & Data Protection | TeqBook",
    description:
      "How TeqBook protects your salon data with secure hosting, access control, encryption and backups.",
    path: "/security",
  });
}

export default function SecurityPage() {
  return <SecurityPageClient />;
}
