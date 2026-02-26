"use client";

import dynamic from "next/dynamic";

export const MobileNavClient = dynamic(
  () => import("./MobileNav").then((mod) => mod.MobileNav),
  { ssr: false },
);
