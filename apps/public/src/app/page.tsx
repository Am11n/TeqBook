"use client";

import dynamic from "next/dynamic";

// Dynamically import landing page to avoid chunk loading issues
const LandingPage = dynamic(() => import("./landing/page"), {
  ssr: false,
});

export default function Page() {
  return <LandingPage />;
}
