import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import TermsPageClient from "./page-client";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Terms of Service | TeqBook",
    description:
      "Read the terms that govern your use of TeqBook, including subscriptions, billing and acceptable use.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return <TermsPageClient />;
}
