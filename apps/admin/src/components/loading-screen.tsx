"use client";

import Image from "next/image";
import { FAVICON_PATH } from "@/lib/constants";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Image
            src={FAVICON_PATH}
            alt="TeqBook Logo"
            width={80}
            height={80}
            priority
            className="animate-zoom-in-out"
          />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-loading-bar bg-primary" />
        </div>
      </div>
    </div>
  );
}

