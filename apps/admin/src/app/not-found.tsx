import Link from "next/link";
import Image from "next/image";
import { Shield, Home } from "lucide-react";
import { FAVICON_PATH } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          <h1 className="text-2xl font-semibold text-slate-900">Siden ble ikke funnet (404)</h1>
          <p className="text-slate-600 leading-relaxed">
            Adressen du prøvde å åpne finnes ikke eller du har ikke tilgang.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-sm font-medium text-amber-900 mb-1">Hva kan du gjøre?</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Gå tilbake og prøv en annen side</li>
            <li>Kontakt eieren av TeqBook-kontoen din hvis du mener du skal ha tilgang</li>
            <li>Ved tekniske problemer: ta kontakt med den som har gitt deg tilgang til Admin-panelet</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="secondary">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Til Admin-forsiden
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              <Shield className="mr-2 h-4 w-4" />
              Logg inn på nytt
            </Link>
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Er du salong-/bedriftseier og trenger hjelp? Kontakt TeqBook support.
        </p>
      </div>
    </div>
  );
}
