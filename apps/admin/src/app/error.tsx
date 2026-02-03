"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, RefreshCw } from "lucide-react";
import { FAVICON_PATH } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin app error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src={FAVICON_PATH}
            alt="TeqBook"
            width={64}
            height={64}
            className="drop-shadow-sm"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-slate-600" />
          <span className="text-xl font-semibold text-slate-800">TeqBook Admin</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Noe gikk galt</h1>
          <p className="text-slate-600 leading-relaxed">
            Det oppstod en feil. Du kan prøve på nytt eller kontakte den som har ansvar for TeqBook i din bedrift.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-sm font-medium text-amber-900 mb-1">Hva kan du gjøre?</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Klikk «Prøv på nytt» for å laste siden på nytt</li>
            <li>Logg ut og logg inn igjen</li>
            <li>Kontakt TeqBook-eieren eller support hvis feilen vedvarer</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="secondary">
            <RefreshCw className="mr-2 h-4 w-4" />
            Prøv på nytt
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Shield className="mr-2 h-4 w-4" />
              Til Admin-forsiden
            </Link>
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Ved vedvarende problemer: kontakt den som har gitt deg tilgang til Admin-panelet eller TeqBook support.
        </p>
      </div>
    </div>
  );
}
