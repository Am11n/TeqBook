"use client";

import dynamic from "next/dynamic";

// SSR enabled so crawlers get full HTML for SEO (metadata + JSON-LD are in layout)
const LandingPage = dynamic(() => import("./landing/page"), {
  ssr: true,
});

export default function Page() {
  return <LandingPage />;
}
